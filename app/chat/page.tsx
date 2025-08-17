'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useRef, useState } from 'react';
import UserTopBar from '@/components/UserTopBar';
import useAntiScreenshot from '@/components/useAntiScreenshot';

type Msg = { id:number; fromId:number; toId:number; text:string; createdAt:string };
type Me  = { id:number; role:'USER'|'ADMIN' };

export default function UserChatPage(){
  const [me, setMe] = useState<Me|null>(null);
  const [adminId, setAdminId] = useState<number>(0);
  const [list, setList] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const boxRef = useRef<HTMLDivElement|null>(null);
  const lastIdRef = useRef<number>(0);

  const blurred = useAntiScreenshot(6000);

  useEffect(()=>{
    (async()=>{
      const r = await fetch('/api/me', { cache:'no-store' }).then(x=>x.json()).catch(()=>null);
      const u = r?.user;
      if(!u){ window.location.href = '/login'; return; }
      if(u.role === 'ADMIN'){ window.location.href = '/admin'; return; }
      setMe({ id:u.id, role:'USER' });
    })();
  },[]);

  async function loadAdmin(){
    const j = await fetch('/api/chat/admin-id', { cache:'no-store' }).then(x=>x.json()).catch(()=>null);
    const id = Number(j?.id || 0);
    setAdminId(id);
    return id;
  }

  function scrollBottom(){ if(boxRef.current){ boxRef.current.scrollTop = boxRef.current.scrollHeight + 1000; } }

  async function loadFull(){
    const j = await fetch('/api/chat/thread-user', { cache:'no-store' }).then(x=>x.json()).catch(()=>null);
    const msgs: Msg[] = j?.messages || [];
    setList(msgs);
    lastIdRef.current = msgs.length ? msgs[msgs.length-1].id : 0;
    setTimeout(scrollBottom, 0);
  }

  async function loadHead(){
    const j = await fetch('/api/chat/thread-user?head=1', { cache:'no-store' }).then(x=>x.json()).catch(()=>null);
    const latest = j?.latest;
    if(latest && latest.id && latest.id !== lastIdRef.current){ await loadFull(); }
  }

  useEffect(()=>{ (async()=>{ await loadAdmin(); await loadFull(); })(); },[]);
  useEffect(()=>{ const id = setInterval(loadHead, 3500); return ()=>clearInterval(id); },[]);

  async function send(){
    if(!adminId || !text.trim()) return;
    await fetch('/api/chat/send', {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ toId: adminId, text: text.trim() })
    }).catch(()=>{});
    setText('');
    await loadFull();
  }

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)'}}>
      <UserTopBar compact/>
      <div style={{maxWidth:900, margin:'20px auto',
                   background:'rgba(17,24,39,0.8)', border:'1px solid #1f2937',
                   borderRadius:12, padding:12, color:'#e5e7eb'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
          <div style={{fontWeight:700}}>Support chat</div>
          <button className="btn" onClick={()=>window.history.back()}
                  style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Back</button>
        </div>

        <div ref={boxRef}
             style={{
               maxHeight:420, overflow:'auto', padding:8,
               background:'#0b1220', border:'1px solid #1f2937',
               borderRadius:8,
               filter: blurred ? 'blur(10px)' : 'none',
               transition:'filter .3s ease'
             }}>
          {list.map(m=>(
            <div key={m.id}
                 style={{display:'flex', justifyContent: m.fromId===me?.id ? 'flex-end':'flex-start', margin:'6px 0'}}>
              <div style={{
                maxWidth:'78%', padding:'8px 10px', borderRadius:10,
                background: m.fromId===me?.id ? '#0ea5e9' : '#1f2937',
                color: m.fromId===me?.id ? '#0b1220' : '#e5e7eb'
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div style={{display:'flex', gap:8, marginTop:8}}>
          <input className="input" value={text} onChange={e=>setText(e.target.value)} placeholder="Write a message…"
                 style={{flex:1, background:'#0b1220', border:'1px solid #1f2937',
                         color:'#e5e7eb', borderRadius:8, padding:'10px'}} />
          <button className="btn" onClick={send} style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Send</button>
        </div>
      </div>
    </div>
  );
}
