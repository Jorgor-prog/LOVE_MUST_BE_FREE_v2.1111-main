'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LoginPage(){
  const [loginId,setLoginId]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');

  useEffect(()=>{
    (async()=>{
      const r = await fetch('/api/me',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
      const u = r?.user;
      if(!u) return;
      if(u.role==='ADMIN'){ window.location.href='/admin'; return; }
      window.location.href='/dashboard';
    })();
  },[]);

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setErr('');
    const r = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({loginId,password})}).then(x=>x.json()).catch(()=>null);
    if(!r?.ok){ setErr(r?.error||'Login failed'); return; }
    if(r.user?.role==='ADMIN'){ window.location.href='/admin'; return; }
    window.location.href='/dashboard';
  }

  return (
    <div className="page">
      <div className="logo-back"><Image src="/images/Logo_3.webp" alt="logo" width={520} height={520} style={{opacity:.85, objectFit:'contain'}}/></div>
      <div className="center">
        <div className="form-shell">
          <form onSubmit={submit} className="card" style={{width:420,maxWidth:'92vw'}}>
            <div style={{fontSize:22,fontWeight:900,marginBottom:10,textAlign:'center'}}>Sign in</div>
            <div style={{display:'grid',gap:10}}>
              <div>
                <div style={{fontSize:12,opacity:.8,marginBottom:4}}>Your login</div>
                <input className="input" value={loginId} onChange={e=>setLoginId(e.target.value)} placeholder="Your login"/>
              </div>
              <div>
                <div style={{fontSize:12,opacity:.8,marginBottom:4}}>Your password</div>
                <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password"/>
              </div>
              {err && <div style={{background:'#1f2937',border:'1px solid #334155',borderRadius:10,padding:8,color:'#fca5a5'}}>{err}</div>}
              <button className="btn btn-primary" type="submit">Enter</button>
            </div>
            <div style={{display:'grid',placeItems:'center',marginTop:14}}>
              <Image src="/images/Logo_3.webp" alt="logo" width={220} height={220} style={{objectFit:'contain',opacity:.95}}/>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
