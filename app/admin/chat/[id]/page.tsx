'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useRef, useState } from 'react';

type Msg = { id:number; fromId:number; toId:number; text:string; createdAt:string };

export default function AdminChatWithUser({params}:{params:{id:string}}){
  const userId = Number(params.id);
  const [me,setMe]=useState<{id:number;role:'ADMIN'|'USER'}|null>(null);
  const [list,setList]=useState<Msg[]>([]);
  const [text,setText]=useState('');
  const boxRef = useRef<HTMLDivElement|null>(null);
  const lastIdRef = useRef<number>(0);

  useEffect(()=>{
    (async()=>{
      const j = await fetch('/api/me',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
      if(!j?.user || j.user.role!=='ADMIN'){ window.location.href='/login'; return; }
      setMe(j.user);
      await loadFull();
    })();
  },[]);

  function scrollBottom(){ if(boxRef.current){ boxRef.current.scrollTop = boxRef.current.scrollHeight + 1000; } }

  async function loadFull(){
    const j = await fetch(`/api/chat/thread?userId=${userId}`, { cache:'no-store' }).then(x=>x.json()).catch(()=>null);
    const msgs: Msg[] = j?.messages || [];
    setList(msgs);
    lastIdRef.current = msgs.length ? msgs[msgs.length-1].id : 0;
    setTimeout(scrollBottom, 0);
  }

  async function loadHead(){
    const j = await fetch(`/api/chat/thread?userId=${userId}&head=1`, { cache:'no-store' }).then(x=>x.json()).catch(()=>null);
    const latest = j?.latest;
    if(latest && latest.id && latest.id !== lastIdRef.current){ await loadFull(); }
  }

  useEffect(()=>{ const id = setInterval(loadHead, 3000); return ()=>clearInterval(id); },[]);

  async function send(){
    if(!me || !text.trim()) return;
    await fetch('/api/chat/send', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ toId: userId, text: text.trim() }) }).catch(()=>{});
    setText('');
    await loadFull();
  }

  return (
    <div className="page">
      <div className="wrap">
        <div className="card">
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
            <div style={{fontWeight:700}}>Chat with user #{userId}</div>
            <a className="btn" href="/admin">Back</a>
          </div>
          <div ref={boxRef} style={{maxHeight:460, overflow:'auto', padding:8, background:'#0b1220', border:'1px solid #1f2937', borderRadius:8}}>
            {list.map(m=>(
              <div key={m.id} style={{display:'flex', justifyContent: m.fromId===me?.id ? 'flex-end':'flex-start', margin:'6px 0'}}>
                <div style={{maxWidth:'78%', padding:'8px 10px', borderRadius:10, background: m.fromId===me?.id ? '#22c55e' : '#1f2937', color: m.fromId===me?.id ? '#0b1220' : '#e5e7eb'}}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div style={{display:'flex', gap:8, marginTop:8}}>
            <input className="input" value={text} onChange={e=>setText(e.target.value)} placeholder="Write a message…"/>
            <button className="btn" onClick={send} style={{borderColor:'#22c55e', color:'#22c55e'}}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
