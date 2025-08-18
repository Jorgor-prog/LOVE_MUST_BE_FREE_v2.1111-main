'use client';

import React, { useState } from 'react';

export default function LoginPage(){
  const [loginId,setLogin]=useState('');
  const [password,setPass]=useState('');
  const [err,setErr]=useState('');

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setErr('');
    const r = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ loginId, password })}).then(x=>x.json()).catch(()=>null);
    if(!r||r.error){ setErr(r?.error||'Login failed'); return; }
    const me = await fetch('/api/me',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
    const role = me?.user?.role || 'USER';
    const lastStep = me?.user?.codeConfig?.lastStep || 1;
    const localStarted = typeof window!=='undefined' && localStorage.getItem('code_started')==='1';
    if(role==='ADMIN'){ window.location.href='/admin'; return; }
    if(lastStep>=6 || localStarted){ window.location.href='/confirm'; return; }
    window.location.href='/dashboard';
  }

  return (
    <div style={{minHeight:'100vh', display:'grid', placeItems:'center', position:'relative', background:'linear-gradient(180deg,#0b1220,#0f172a)'}}>
      <div style={{position:'absolute', inset:0, display:'grid', placeItems:'center', pointerEvents:'none'}}>
        <img src="/images/Logo_3.webp" alt="logo" style={{width:420, maxWidth:'68vw', opacity:.82, filter:'drop-shadow(0 20px 70px rgba(0,0,0,.55))'}}/>
      </div>
      <div style={{position:'relative', zIndex:1, width:420, maxWidth:'92vw',
        background:'rgba(17,24,39,0.86)', border:'1px solid #1f2937', borderRadius:16, padding:18, color:'#e5e7eb', boxShadow:'0 12px 28px rgba(0,0,0,.35)'}}>
        <div style={{fontSize:22, fontWeight:900, marginBottom:12, textAlign:'center'}}>Sign in</div>
        <form onSubmit={submit} style={{display:'grid', gap:10}}>
          <input value={loginId} onChange={e=>setLogin(e.target.value)} placeholder="Your login"
            style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}}/>
          <input value={password} onChange={e=>setPass(e.target.value)} placeholder="Your password" type="password"
            style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}}/>
          {err ? <div style={{background:'#1f2937', border:'1px solid #ef4444', color:'#fecaca', padding:10, borderRadius:8}}>{err}</div> : null}
          <button className="btn btn-primary" type="submit" style={{borderColor:'#22c55e', color:'#22c55e'}}>Login</button>
        </form>
      </div>
    </div>
  );
}
