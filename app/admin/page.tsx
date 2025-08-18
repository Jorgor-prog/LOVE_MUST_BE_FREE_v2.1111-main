'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Row = { id:number; loginId:string; adminNoteName?:string|null; role:'USER'|'ADMIN'; };
type UnreadMap = Record<string, number>;

export default function AdminHome(){
  const [me,setMe]=useState<{id:number;role:'ADMIN'|'USER'}|null>(null);
  const [list,setList]=useState<Row[]>([]);
  const [unread,setUnread]=useState<UnreadMap>({});
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    (async()=>{
      const j = await fetch('/api/me',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
      if(!j?.user){ window.location.href='/login'; return; }
      if(j.user.role!=='ADMIN'){ window.location.href='/dashboard'; return; }
      setMe(j.user);
      await load();
    })();
  },[]);

  async function load(){
    const r = await fetch('/api/admin/users',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
    setList((r?.items||[]).filter((u:Row)=>u.role!=='ADMIN'));
    const m = await fetch('/api/admin/unread-map',{cache:'no-store'}).then(x=>x.json()).catch(()=>({}));
    setUnread(m||{});
  }

  async function addUser(){
    if(busy) return;
    setBusy(true);
    const r = await fetch('/api/admin/users',{method:'POST'}).then(x=>x.json()).catch(()=>null);
    setBusy(false);
    if(r?.ok){
      await load();
      alert(`Login: ${r.loginId}\nPassword: ${r.password}\nUser ID: ${r.id}`);
    }
  }

  async function delUser(id:number){
    if(!confirm('Delete this user?')) return;
    await fetch(`/api/admin/users/${id}`,{method:'DELETE'}).catch(()=>{});
    await load();
  }

  return (
    <div className="page">
      <div className="wrap">
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div style={{fontSize:20,fontWeight:800}}>Admin panel</div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn" onClick={addUser} disabled={busy} style={{borderColor:'#22c55e',color:'#22c55e'}}>{busy?'Creating…':'Create user'}</button>
              <button className="btn" onClick={async()=>{await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/login';}}>Logout</button>
            </div>
          </div>
          <div style={{display:'grid',gap:8}}>
            {list.map(u=>(
              <div key={u.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',border:'1px solid #1f2937',borderRadius:10,padding:'10px 12px',background:'#0b1220'}}>
                <div style={{display:'flex',gap:10,alignItems:'center'}}>
                  <div style={{fontWeight:700}}>{u.adminNoteName || u.loginId}</div>
                  {!!unread[u.id]?.valueOf && !!(unread as any)[u.id] && <span style={{fontSize:12,background:'#ef4444',padding:'2px 6px',borderRadius:999}}>new</span>}
                </div>
                <div style={{display:'flex',gap:8}}>
                  <Link className="btn" href={`/admin/users/${u.id}`}>Open</Link>
                  <Link className="btn" href={`/admin/chat/${u.id}`} style={{borderColor:'#38bdf8',color:'#38bdf8'}}>Chat</Link>
                  <button className="btn" onClick={()=>delUser(u.id)} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>
                </div>
              </div>
            ))}
            {!list.length && <div style={{opacity:.7}}>No users</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
