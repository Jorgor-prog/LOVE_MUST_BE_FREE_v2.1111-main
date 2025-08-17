'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Me = { id:number; role:'ADMIN'|'USER' };
type User = { id:number; loginId:string; loginPassword:string|null; role:'ADMIN'|'USER'; adminNoteName:string|null; createdAt:string };

export default function AdminPage(){
  const [me,setMe]=useState<Me|null>(null);
  const [list,setList]=useState<User[]>([]);
  const [note,setNote]=useState('');
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState<string|null>(null);
  const [fresh,setFresh]=useState<User|null>(null); // щойно створений — показати креди

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
    setList(Array.isArray(j?.items)? j.items: []);
  }

  async function createUser(e:React.FormEvent){
    e.preventDefault();
    setErr(null); setBusy(true);
    try{
      const r = await fetch('/api/admin/users', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ adminNoteName: note })
      });
      if(!r.ok){
        const j = await r.json().catch(()=>null);
        throw new Error(j?.error || `Create failed: ${r.status}`);
      }
      const j = await r.json();
      setFresh(j.created);
      setNote('');
      await reload();
    }catch(e:any){ setErr(e?.message || 'Create failed'); }
    finally{ setBusy(false); }
  }

  async function removeUser(id:number){
    if(!confirm('Delete user?')) return;
    await fetch(`/api/admin/users/${id}`, { method:'DELETE' }).catch(()=>{});
    await reload();
  }

  async function logout(){
    await fetch('/api/auth/logout',{method:'POST'}).catch(()=>{});
    window.location.href='/login';
  }

  function copy(t:string){ navigator.clipboard?.writeText(t).catch(()=>{}); }

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)', color:'#e5e7eb'}}>
      <div style={{maxWidth:1100, margin:'24px auto', padding:'0 12px'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
          <div style={{fontSize:20, fontWeight:800}}>Admin panel</div>
          <div style={{display:'flex', gap:8}}>
            <Link className="btn" href="/admin" style={{border:'1px solid #38bdf8', color:'#38bdf8', borderRadius:10, padding:'8px 12px'}}>Home</Link>
            <button className="btn" onClick={logout} style={{border:'1px solid #f87171', color:'#f87171', borderRadius:10, padding:'8px 12px'}}>Logout</button>
          </div>
        </div>

        {/* CREATE (note only) */}
        <form onSubmit={createUser} style={{background:'rgba(17,24,39,0.8)', border:'1px solid #1f2937', borderRadius:12, padding:12, marginBottom:16}}>
          <div style={{fontWeight:700, marginBottom:8}}>Create user (login & password will be generated)</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr auto', gap:8}}>
            <input
              value={note}
              onChange={e=>setNote(e.currentTarget.value)}
              placeholder="Admin note (nickname)"
              style={{background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}}
            />
            <button className="btn" disabled={busy}
              style={{border:'1px solid #22c55e', color:'#22c55e', borderRadius:10, padding:'10px'}}>Create</button>
          </div>
          {err && <div style={{color:'#f87171', marginTop:8}}>{err}</div>}
          {fresh && (
            <div style={{marginTop:10, background:'#052e33', border:'1px solid #155e75', borderRadius:8, padding:10}}>
              <div style={{fontWeight:700, marginBottom:6}}>User created</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr auto', gap:6, alignItems:'center'}}>
                <div>Login: <b>{fresh.loginId}</b></div>
                <button className="btn" onClick={()=>copy(fresh.loginId)} style={{border:'1px solid #38bdf8', color:'#38bdf8'}}>Copy</button>
                <div>Password: <b>{fresh.loginPassword ?? '—'}</b></div>
                <button className="btn" onClick={()=>fresh.loginPassword && copy(fresh.loginPassword)} style={{border:'1px solid #38bdf8', color:'#38bdf8'}}>Copy</button>
              </div>
            </div>
          )}
        </form>

        {/* LIST */}
        <div style={{display:'grid', gap:8}}>
          {list.map(u=>(
            <div key={u.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between',
               background:'rgba(17,24,39,0.8)', border:'1px solid #1f2937', borderRadius:12, padding:12}}>
              <div>
                <div style={{fontWeight:700}}>{u.adminNoteName || '(no note)'} <span style={{opacity:.6}}> · {u.loginId} · #{u.id}</span></div>
                <div style={{fontSize:12, color:'#94a3b8'}}>password: {u.loginPassword ?? '—'} | role: {u.role}</div>
              </div>
              <div style={{display:'flex', gap:8}}>
                <Link className="btn" href={`/admin/chat/${u.id}`} style={{border:'1px solid #38bdf8', color:'#38bdf8', borderRadius:10, padding:'8px 12px'}}>Open chat</Link>
                <button className="btn" onClick={()=>removeUser(u.id)} style={{border:'1px solid #f87171', color:'#f87171', borderRadius:10, padding:'8px 12px'}}>Delete</button>
              </div>
            </div>
          ))}
          {!list.length && <div style={{color:'#94a3b8'}}>No users yet</div>}
        </div>
      </div>
    </div>
  );
}
