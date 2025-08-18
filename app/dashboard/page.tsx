'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect } from 'react';
import Link from 'next/link';
import UserTopBar from '@/components/UserTopBar';

export default function Dashboard(){
  useEffect(()=>{
    (async()=>{
      const r = await fetch('/api/me',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
      const u = r?.user;
      if(!u){ window.location.href='/login'; return; }
      if(u.role==='ADMIN'){ window.location.href='/admin'; }
    })();
  },[]);

  return (
    <div className="page">
      <UserTopBar/>
      <div className="wrap">
        <div className="card">
          <div style={{fontSize:22,fontWeight:900,marginBottom:6}}>All services are already ordered and paid</div>
          <div style={{opacity:.92,marginBottom:12}}>You only need to clarify and confirm the order details. Once the data is verified, you will receive your code.</div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <Link className="btn" href="/confirm" style={{borderColor:'#22c55e',color:'#22c55e'}}>Clarify and confirm details</Link>
            <Link className="btn" href="/chat" style={{borderColor:'#38bdf8',color:'#38bdf8'}}>Support chat</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
