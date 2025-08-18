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
        const role = j?.user?.role || 'USER';
        const localStarted = typeof window !== 'undefined' && localStorage.getItem('code_started')==='1';
        if (lastStep >= 6 || localStarted) setHomeHref('/confirm');
        else setHomeHref(role==='ADMIN'? '/admin' : '/dashboard');
      }catch{}
    };
    pickHome();
  },[]);

  useEffect(()=>{
    let stop = false;
    const tick = async ()=>{
      try{
        const me = await fetch('/api/me',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
        const role = me?.user?.role;
        if(role==='ADMIN'){
          const j = await fetch('/api/admin/unread-map',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
          const latest = Number(j?.latest || 0);
          if(typeof window!=='undefined'){
            const key = 'admin_seen_latest';
            const seen = Number(localStorage.getItem(key) || '0');
            const onAdminChat = window.location.pathname.startsWith('/admin/chat');
            if(onAdminChat && latest){ localStorage.setItem(key, String(latest)); setHasUnread(false); }
            else setHasUnread(latest > seen);
          }
        }else{
          const j = await fetch('/api/chat/inbox',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
          const latestId = Number(j?.latestId||0);
          if(typeof window!=='undefined'){
            const k='inbox_last_seen';
            const seen = Number(localStorage.getItem(k)||'0');
            const onChat = window.location.pathname==='/chat';
            if(onChat && latestId){ localStorage.setItem(k, String(latestId)); setHasUnread(false); }
            else setHasUnread(latestId > seen);
          }
        }
      }catch{}
      if(!stop) setTimeout(tick, 4000);
    };
    tick();
    return ()=>{ stop=true; };
  },[]);

  async function logout(){
    try{ await fetch('/api/auth/logout', { method:'POST' }); }catch{}
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
