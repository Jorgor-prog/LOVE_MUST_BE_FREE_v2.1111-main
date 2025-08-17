'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

export default function UserNav(){
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(()=>{
    const tick = () => fetch('/api/heartbeat', { method:'POST' }).catch(()=>{});
    tick(); const id = setInterval(tick, 30000); return ()=>clearInterval(id);
  },[]);

  useEffect(()=>{
    let stop=false;
    const check = async ()=>{
      try{
        const r = await fetch('/api/chat/inbox');
        const j = await r.json();
        const latestId = j?.latestId || 0;
        const lastSeen = Number(localStorage.getItem('chatLastSeenId')||'0');
        if(!stop) setHasUnread(latestId>lastSeen);
      }catch{}
    };
    check(); const id = setInterval(check, 15000); return ()=>{ stop=true; clearInterval(id); };
  },[]);

  async function exit(){ await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/login'; }

  return (
    <div style={{position:'sticky', top:0, zIndex:50, backdropFilter:'saturate(120%) blur(4px)', background:'rgba(17,24,39,0.6)', borderBottom:'1px solid rgba(31,41,55,0.8)'}}>
      <div className="nav" style={{padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div className="brand" style={{display:'flex',alignItems:'center',gap:10}}>
          <Image src="/images/Logo_2.webp" alt="logo" width={44} height={44} style={{borderRadius:'50%'}} />
          <span style={{fontWeight:700, letterSpacing:0.3}}>LOVE MUST BE FREE</span>
        </div>
        <div style={{display:'flex',gap:12, alignItems:'center'}}>
          <a className="btn" href="/chat" style={{position:'relative'}}>Chat{hasUnread && <span style={{position:'absolute', top:-3, right:-6, width:10, height:10, borderRadius:'50%', background:'#ef4444'}}/>}</a>
          <a className="btn" href="/about">About</a>
          <a className="btn" href="/reviews">Reviews</a>
          <button className="btn" onClick={exit}>EXIT</button>
        </div>
      </div>
      <style jsx global>{`a, a:visited, .btn:visited, .nav a:visited { color: inherit !important; opacity: 1 !important; }`}</style>
    </div>
  );
}
