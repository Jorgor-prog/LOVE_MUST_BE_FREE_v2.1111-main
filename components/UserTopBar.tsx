'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

export default function UserTopBar({ compact=false }:{compact?:boolean}){
  const [hasUnread, setHasUnread] = useState(false);
  const [homeHref, setHomeHref] = useState('/dashboard');

  useEffect(()=>{
    const pickHome = async ()=>{
      try{
        const r = await fetch('/api/me', { cache:'no-store' });
        const j = await r.json();
        const lastStep = j?.user?.codeConfig?.lastStep || 1;
        const localStarted = typeof window!=='undefined' && localStorage.getItem('code_started')==='1';
        setHomeHref((lastStep>=6 || localStarted) ? '/confirm' : '/dashboard');
      }catch{}
    };
    pickHome();
  },[]);

  useEffect(()=>{
    const tick = async ()=>{
      try{
        const r = await fetch('/api/chat/inbox', { cache:'no-store' });
        const j = await r.json();
        const latestId = j?.latestId || 0;
        if (typeof window !== 'undefined') {
          const k = 'inbox_last_seen';
          const onChat = window.location.pathname === '/chat';
          const seen = Number(localStorage.getItem(k) || '0');
          if (onChat && latestId) localStorage.setItem(k, String(latestId));
          setHasUnread(latestId > Number(localStorage.getItem(k) || seen || 0));
        }
      }catch{}
    };
    tick();
    const id = setInterval(tick, 4000);
    return ()=>clearInterval(id);
  },[]);

  async function logout(){
    try{ await fetch('/api/auth/logout',{method:'POST'}); }catch{}
    window.location.href='/login';
  }

  return (
    <div style={{position:'sticky', top:0, zIndex:20, background:'rgba(10,14,23,0.62)', backdropFilter:'blur(6px)', borderBottom:'1px solid #1f2937'}}>
      <div style={{maxWidth:1100, margin:'0 auto', padding: compact ? '8px 12px' : '12px 12px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <Image src="/images/Logo_3.webp" alt="logo" width={40} height={40} style={{objectFit:'contain'}}/>
          <span style={{fontWeight:800, color:'#e5e7eb'}}>LOVE MUST BE FREE</span>
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <Link className="btn" href={homeHref}>Back</Link>
          <Link className="btn" href={homeHref}>Home</Link>
          <Link className="btn" href="/reviews">Reviews</Link>
          <Link className="btn" href="/about">About</Link>
          <Link className="btn" href="/chat" style={{position:'relative', borderColor:'#38bdf8', color:'#38bdf8'}}>
            Chat
            {hasUnread && <span style={{position:'absolute', top:-4, right:-6, width:10, height:10, borderRadius:'50%', background:'#ef4444', boxShadow:'0 0 0 2px rgba(10,14,23,0.62)'}}/>}
          </Link>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
}
