'use client';

import Image from 'next/image';
import React, { useState } from 'react';

export default function LoginPage(){
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent){
    e.preventDefault();
    if(busy) return;
    setBusy(true);
    setErr('');
    try{
      const r = await fetch('/api/auth/login', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ loginId: login.trim(), password })
      });
      if(!r.ok){ setErr('Invalid credentials'); }
      else{
        const j = await r.json().catch(()=>null);
        const role = j?.user?.role;
        if(role === 'ADMIN') window.location.href = '/admin';
        else window.location.href = '/dashboard';
      }
    }catch{ setErr('Network error'); }
    finally{ setBusy(false); }
  }

  return (
    <div className="bg-hero center-wrap">
      <div className="logo-bg">
        <Image src="/images/Logo_3.webp" alt="logo" width={620} height={620} style={{objectFit:'contain', opacity:.95}} />
      </div>

      <div className="form-layer">
        <form onSubmit={submit} className="form-card">
          <div className="h1">Sign in</div>

          <div className="label">Your login</div>
          <input
            className="input"
            placeholder="Your login"
            value={login}
            onChange={(e)=>setLogin(e.target.value)}
            autoComplete="username"
            autoCapitalize="off"
            spellCheck={false}
          />

          <div className="label">Your password</div>
          <input
            className="input"
            placeholder="Your password"
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {err && <div className="panel mt12" style={{borderColor:'#ef4444', color:'#fecaca', background:'rgba(120,18,18,.25)'}}>{err}</div>}

          <div className="row mt12" style={{justifyContent:'center'}}>
            <button className="btn btn-primary" disabled={busy} type="submit">{busy? 'Wait…':'Sign in'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
