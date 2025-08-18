'use client';
import React, { useEffect, useRef, useState } from 'react';

type Msg = { id:number; fromId:number; toId:number; text:string; createdAt:string };
type Me = { id:number; role:'USER'|'ADMIN' };

export default function AdminChatPage({ params }:{ params:{ id:string } }){
  const userId = Number(params.id);
  const [me,setMe]=useState<Me|null>(null);
  const [list,setList]=useState<Msg[]>([]);
  const [text,setText]=useState('');
  const boxRef = useRef<HTMLDivElement|null>(null);
  const lastIdRef = useRef<number>(0);

  useEffect(()=>{
    (async()=>{
      const r = await fetch('/api/me',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
      const u = r?.user;
      if(!u){ window.location.href='/login'; return; }
      if(u.role!=='ADMIN'){ window.location.href='/dashboard'; return; }
      setMe({id:u.id, role:'ADMIN'});
    })();
  },[]);

  function scrollBottom(){ if(boxRef.current){ boxRef.current.scrollTop = boxRef.current.scrollHeight + 1000; } }

  async function loadFull(){
    const j = await fetch(`/api/chat/thread?id=${userId}`,{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
    const msgs:Msg[] = j?.messages || [];
    setList(msgs);
    lastIdRef.current = msgs.length ? msgs[msgs.length-1].id : 0;
    setTimeout(scrollBottom,0);
  }
  async function loadHead(){
    const j = await fetch(`/api/chat/thread?id=${userId}&head=1`,{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
    const latest = j?.latest;
    if(latest && latest.id && latest.id!==lastIdRef.current){ await loadFull(); }
  }

  useEffect(()=>{ if(userId){ loadFull(); const id=setInterval(loadHead,3000); return()=>clearInterval(id); } },[userId]);

  async function send(){
    if(!text.trim()) return;
    await fetch('/api/chat/send',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ toId:userId, text:text.trim() }) }).catch(()=>{});
    setText(''); await loadFull();
  }

  return (
    <div className="bg-gradient" style={{minHeight:'100vh',padding:'18px 12px'}}>
      <div className="card" style={{margin:'0 auto',maxWidth:900}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div style={{fontWeight:800}}>Chat with user #{userId}</div>
          <a className="btn" href="/admin">Back</a>
        </div>
        <div ref={boxRef} style={{maxHeight:420,overflow:'auto',padding:8,background:'#0b1220',border:'1px solid #1f2937',borderRadius:8}}>
          {list.map(m=>(
            <div key={m.id} style={{display:'flex',justifyContent:m.fromId===me?.id?'flex-end':'flex-start',margin:'6px 0'}}>
              <div style={{maxWidth:'78%',padding:'8px 10px',borderRadius:10,background:m.fromId===me?.id?'#0ea5e9':'#1f2937',color:m.fromId===me?.id?'#0b1220':'#e5e7eb'}}>{m.text}</div>
            </div>
          ))}
        </div>
        <div className="row mt12">
          <input className="input" value={text} onChange={e=>setText(e.target.value)} placeholder="Write a message…" style={{flex:1}}/>
          <button className="btn" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}
