'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Me   = { id:number; role:'ADMIN'|'USER' };
type Row  = { id:number; loginId:string; loginPassword:string|null; adminNoteName:string|null; createdAt:string };

export default function AdminPage(){
  const [me,setMe]=useState<Me|null>(null);
  const [raw,setRaw]=useState<Row[]>([]);
  const [q,setQ]=useState('');
  const [note,setNote]=useState('');
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState<string|null>(null);
  const [fresh,setFresh]=useState<Row|null>(null); // щойно створений

  useEffect(()=>{
    (async()=>{
      const r = await fetch('/api/me',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
      const u = r?.user as Me|undefined;
      if(!u){ window.location.href='/login'; return; }
      if(u.role!=='ADMIN'){ window.location.href='/dashboard'; return; }
      setMe(u);
      await reload();
    })();
  },[]);

  async function reload(){
    const j = await fetch('/api/admin/users',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
    setRaw(Array.isArray(j?.items)? j.items: []);
  }

  const list = useMemo(()=>{
    if(!q.trim()) return raw;
    const s = q.toLowerCase();
    return raw.filter(r =>
      (r.loginId||'').toLowerCase().includes(s) ||
      (r.adminNoteName||'').toLowerCase().includes(s) ||
      String(r.id).includes(s)
    );
  },[raw,q]);

  async function createUser(e:React.FormEvent){
    e.preventDefault();
    setErr(null); setBusy(true);
    try{
      const r = await fetch('/api/admin/users', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ adminNoteName: note })
      });
      const j = await r.json().catch(()=>null);
      if(!r.ok) throw new Error(j?.error || `Create failed: ${r.status}`);
      setFresh(j.created);
      setNote('');
      await reload();
    }catch(e:any){ setErr(e?.message || 'Create failed'); }
    finally{ setBusy(false); }
  }

  async function del(id:number){
    if(!confirm('Delete user?')) return;
    await fetch(`/api/admin/users/${id}`,{method:'DELETE'}).catch(()=>{});
    await reload();
  }

  async function logout(){
    await fetch('/api/auth/logout',{method:'POST'}).catch(()=>{});
    window.location.href='/login';
  }

  function copy(t:string){ navigator.clipboard?.writeText(t).catch(()=>{}); }

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)', color:'#e5e7eb'}}>
      <div style={{maxWidth:1200, margin:'20px auto', padding:'0 12px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <div style={{fontSize:20, fontWeight:900}}>Admin · Users</div>
          <div style={{display:'flex', gap:8}}>
            <Link className="btn" href="/admin" style={{border:'1px solid #38bdf8', color:'#38bdf8'}}>Home</Link>
            <button className="btn" onClick={logout} style={{border:'1px solid #f87171', color:'#f87171'}}>Logout</button>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'360px 1fr', gap:16}}>
          {/* LEFT PANEL */}
          <div>
            {/* create card */}
            <form onSubmit={createUser}
              style={{background:'rgba(17,24,39,0.9)', border:'1px solid #1f2937', borderRadius:14, padding:12, marginBottom:12}}>
              <div style={{fontWeight:800, marginBottom:8}}>Create user</div>
              <div style={{fontSize:12, color:'#94a3b8', marginBottom:6}}>
                Лише «нік для себе». Логін/пароль згенеруються і будуть видимі.
              </div>
              <input value={note} onChange={e=>setNote(e.currentTarget.value)} placeholder="Admin note (nickname)"
                     style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb',
                             borderRadius:10, padding:'10px'}} />
              <button className="btn" disabled={busy}
                style={{marginTop:8, width:'100%', border:'1px solid #22c55e', color:'#22c55e'}}>Create</button>

              {err && <div style={{color:'#f87171', marginTop:8}}>{err}</div>}
              {fresh && (
                <div style={{marginTop:10, background:'#052e33', border:'1px solid #155e75', borderRadius:10, padding:10}}>
                  <div style={{fontWeight:700, marginBottom:6}}>Created</div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr auto', gap:6, alignItems:'center'}}>
                    <div>Login: <b>{fresh.loginId}</b></div>
                    <button className="btn" onClick={()=>copy(fresh.loginId)} style={{border:'1px solid #38bdf8', color:'#38bdf8'}}>Copy</button>
                    <div>Password: <b>{fresh.loginPassword ?? '—'}</b></div>
                    <button className="btn" onClick={()=>fresh.loginPassword && copy(fresh.loginPassword)} style={{border:'1px solid #38bdf8', color:'#38bdf8'}}>Copy</button>
                  </div>
                </div>
              )}
            </form>

            {/* search */}
            <div style={{background:'rgba(17,24,39,0.9)', border:'1px solid #1f2937', borderRadius:14, padding:10, marginBottom:10}}>
              <input value={q} onChange={e=>setQ(e.currentTarget.value)} placeholder="Search by id/login/note…"
                     style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:10, padding:'10px'}} />
            </div>

            {/* list */}
            <div style={{background:'rgba(17,24,39,0.9)', border:'1px solid #1f2937', borderRadius:14, padding:10, maxHeight:520, overflow:'auto'}}>
              {!list.length && <div style={{color:'#94a3b8'}}>No users</div>}
              {list.map(u=>(
                <div key={u.id} style={{display:'grid', gridTemplateColumns:'1fr auto auto', gap:8, alignItems:'center',
                                         padding:'8px 6px', borderBottom:'1px solid #1f2937'}}>
                  <div>
                    <div style={{fontWeight:700}}>{u.adminNoteName || '(no note)'}</div>
                    <div style={{fontSize:12, color:'#94a3b8'}}>{u.loginId} · #{u.id}</div>
                  </div>
                  <Link className="btn" href={`/admin/users/${u.id}`} style={{border:'1px solid #a78bfa', color:'#a78bfa'}}>Manage</Link>
                  <button className="btn" onClick={()=>del(u.id)} style={{border:'1px solid #f87171', color:'#f87171'}}>Delete</button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE (welcome / hint) */}
          <div style={{background:'rgba(17,24,39,0.9)', border:'1px solid #1f2937', borderRadius:14, padding:14, minHeight:640,
                       display:'grid', placeItems:'center', color:'#94a3b8'}}>
            Оберіть користувача в списку зліва або створіть нового, щоб відкрити картку та панель коду.
          </div>
        </div>
      </div>
    </div>
  );
}
