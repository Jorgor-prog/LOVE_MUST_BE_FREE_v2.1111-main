'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect } from 'react';
import Link from 'next/link';
import UserTopBar from '@/components/UserTopBar';

export default function Dashboard(){
  useEffect(()=>{
    (async()=>{
      const r = await fetch('/api/me', { cache:'no-store' }).then(x=>x.json()).catch(()=>null);
      const u = r?.user;
      if(!u){ window.location.href = '/login'; return; }
      if(u.role === 'ADMIN'){ window.location.href = '/admin'; }
    })();
  },[]);

  return (
    <div style={{
      minHeight:'100vh',
      backgroundImage:'url(/images/Background_1.webp)',
      backgroundSize:'cover', backgroundPosition:'center'
    }}>
      <UserTopBar />

      <div style={{maxWidth:1100, margin:'26px auto', padding:'0 12px', color:'#e5e7eb'}}>
        <div style={{
          background:'rgba(17,24,39,0.86)', border:'1px solid #1f2937',
          borderRadius:14, padding:'18px 16px', boxShadow:'0 12px 28px rgba(0,0,0,.35)'
        }}>
          <div style={{fontSize:22, fontWeight:900, marginBottom:6}}>
            All services are already ordered and paid
          </div>
          <div style={{opacity:.92, marginBottom:12}}>
            You only need to clarify and confirm the order details. Once the data is verified, you will receive your code.
          </div>

          <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
            <Link className="btn" href="/confirm" style={{borderColor:'#22c55e', color:'#22c55e'}}>Clarify and confirm details</Link>
            <Link className="btn" href="/chat" style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Support chat</Link>
            <Link className="btn" href="/about">About</Link>
            <Link className="btn" href="/reviews">Reviews</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
