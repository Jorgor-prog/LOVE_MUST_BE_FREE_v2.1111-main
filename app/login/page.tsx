'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Image from 'next/image';

export default function LoginPage(){
  const [loginId, setLogin] = useState('');
  const [password, setPass] = useState('');
  const [err, setErr] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent){
    e.preventDefault();
    setErr(null); setBusy(true);
    try{
      const r = await fetch('/api/auth/login', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ loginId, password })
      });
      if(!r.ok){
        const j = await r.json().catch(()=>null);
        setErr(j?.error || `Login failed: ${r.status}`); setBusy(false); return;
      }
      const me = await fetch('/api/me', { cache:'no-store' }).then(x=>x.json()).catch(()=>null);
      const role = me?.user?.role;
      if(role === 'ADMIN'){ window.location.href = '/admin'; return; }
      const lastStep = me?.user?.codeConfig?.lastStep || 1;
      if (lastStep >= 6) window.location.href = '/confirm';
      else window.location.href = '/dashboard';
    }catch(e:any){
      setErr(e?.message || 'Network error');
      setBusy(false);
    }
  }

  return (
    <div style={{
      minHeight:'100vh',
      display:'flex',
      flexDirection:'column',
      justifyContent:'center',
      alignItems:'center',
      gap:16,
      backgroundImage:'url(/images/Background_1.webp)',
      backgroundSize:'cover',
      backgroundPosition:'center'
    }}>
      <Image src="/images/Logo_3.webp" alt="logo" width={320} height={320} style={{width:'min(70vw,320px)', height:'auto'}}/>
      <form onSubmit={submit} style={{
        background:'rgba(17,24,39,0.88)', border:'1px solid #1f2937', borderRadius:12, padding:16, width:'min(92vw,360px)', color:'#e5e7eb', boxShadow:'0 12px 28px rgba(0,0,0,.35)'
      }}>
        <label>Login</label>
        <input className="input" value={loginId} onChange={e=>setLogin(e.target.value)} />
        <label style={{marginTop:8}}>Password</label>
        <input className="input" type="password" value={password} onChange={e=>setPass(e.target.value)} />
        {err && <div style={{color:'#f87171', marginTop:8}}>{err}</div>}
        <button className="btn" disabled={busy} style={{marginTop:12, width:'100%'}}>Sign in</button>
      </form>
    </div>
  );
}
