'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import UserTopBar from '@/components/UserTopBar';

type Row = { id:number; loginId:string; loginPassword?:string|null; adminNoteName?:string|null; createdAt:string };
type Created = { id:number; loginId:string; loginPassword:string; adminNoteName?:string|null };

export default function AdminPage(){
  const [rows,setRows]=useState<Row[]>([]);
  const [note,setNote]=useState('');
  const [created,setCreated]=useState<Created|null>(null);
  const [unreadMap,setUnreadMap]=useState<Record<number,number>>({});

  useEffect(()=>{
    (async()=>{
      const me = await fetch('/api/me',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
      if(!me?.user || me.user.role!=='ADMIN'){ window.location.href='/login'; return; }
      await reload();
    })();
  },[]);

  async function reload(){
    const j = await fetch('/api/admin/users',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
    const items:Row[] = j?.items||[];
    setRows(items);
  }

  useEffect(()=>{
    let t:any;
    const tick = async ()=>{
      const j = await fetch('/api/admin/unread-map',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
      const map:Record<number,number> = j?.map||{};
      setUnreadMap(map);
      t = setTimeout(tick, 4000);
    };
    tick();
    return ()=>{ if(t) clearTimeout(t); };
  },[]);

  async function createUser(){
    const r = await fetch('/api/admin/users',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ adminNoteName: note })}).then(x=>x.json()).catch(()=>null);
    if(r?.created){ setCreated(r.created); setNote(''); await reload(); }
  }

  function copyCreds(){
    if(!created) return;
    const text = `Login: ${created.loginId}\nPassword: ${created.loginPassword||''}`;
    navigator.clipboard.writeText(text).catch(()=>{});
  }

  const list = useMemo(()=>rows.sort((a,b)=>b.id-a.id),[rows]);

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)'}}>
      <UserTopBar />
      <div style={{maxWidth:1100, margin:'20px auto', padding:'0 12px', color:'#e5e7eb'}}>
        <div style={{display:'flex', gap:16, flexWrap:'wrap', alignItems:'flex-end'}}>
          <div style={{flex:'1 1 320px', background:'rgba(17,24,39,0.86)', border:'1px solid #1f2937', borderRadius:12, padding:12}}>
            <div style={{fontWeight:800, marginBottom:8}}>Create user</div>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Admin note (nickname)"
                   style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}}/>
            <div style={{marginTop:8}}><button className="btn" onClick={createUser} style={{borderColor:'#22c55e', color:'#22c55e'}}>Create</button></div>
          </div>
          {created && (
            <div style={{flex:'1 1 320px', background:'rgba(17,24,39,0.86)', border:'1px solid #1f2937', borderRadius:12, padding:12}}>
              <div style={{fontWeight:800, marginBottom:8}}>Credentials</div>
              <div>Login: {created.loginId}</div>
              <div>Password: {created.loginPassword}</div>
              <div style={{display:'flex', gap:8, marginTop:8}}>
                <button className="btn" type="button" onClick={copyCreds} style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Copy</button>
              </div>
            </div>
          )}
        </div>

        <div style={{marginTop:16}}>
          <div style={{background:'rgba(17,24,39,0.86)', border:'1px solid #1f2937', borderRadius:12}}>
            <div style={{display:'grid', gridTemplateColumns:'80px 1fr 160px 120px', gap:0, borderBottom:'1px solid #1f2937', padding:'10px 12px', color:'#94a3b8'}}>
              <div>ID</div><div>Login / Note</div><div>Created</div><div>Open</div>
            </div>
            {list.map(u=>(
              <div key={u.id} style={{display:'grid', gridTemplateColumns:'80px 1fr 160px 120px', gap:0, borderTop:'1px solid #1f2937', padding:'10px 12px', alignItems:'center'}}>
                <div>#{u.id}</div>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <span>{u.loginId}</span>
                  {unreadMap[u.id] ? <span style={{width:8, height:8, borderRadius:'50%', background:'#ef4444'}}/> : null}
                  {u.adminNoteName ? <span style={{opacity:.8, fontSize:12, marginLeft:6}}>({u.adminNoteName})</span> : null}
                </div>
                <div>{new Date(u.createdAt).toLocaleString()}</div>
                <div><Link className="btn" href={`/admin/users/${u.id}`} style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Open</Link></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
