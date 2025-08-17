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
        method:'POST',
        headers:{'Content-Type':'application/json'},
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
      display:'grid',
      gridTemplateRows:'1fr auto',
      alignItems:'center',
      justifyItems:'center',
      gap:24,
      backgroundImage:'url(/images/Background_1.webp)',
      backgroundSize:'cover',
      backgroundPosition:'center',
      padding:'28px 12px'
    }}>
      <form onSubmit={submit}
        style={{
          width:'min(92vw,420px)',
          background:'rgba(10,14,23,0.68)',
          border:'1px solid #1f2937',
          borderRadius:16,
          padding:18,
          backdropFilter:'blur(8px)',
          color:'#e5e7eb',
          boxShadow:'0 16px 40px rgba(0,0,0,.45)'
        }}>
        <div style={{fontSize:20, fontWeight:800, marginBottom:12, textAlign:'center'}}>Sign in</div>

        <label style={{fontSize:12, color:'#94a3b8'}}>Login</label>
        <input className="input"
               value={loginId}
               onChange={e=>setLogin(e.target.value)}
               placeholder="Admin303"
               style={{
                 width:'100%', marginTop:6, marginBottom:10,
                 background:'#0b1220', border:'1px solid #1f2937',
                 color:'#e5e7eb', borderRadius:10, padding:'12px'
               }} />

        <label style={{fontSize:12, color:'#94a3b8'}}>Password</label>
        <input className="input" type="password"
               value={password}
               onChange={e=>setPass(e.target.value)}
               placeholder="••••••••••"
               style={{
                 width:'100%', marginTop:6,
                 background:'#0b1220', border:'1px solid #1f2937',
                 color:'#e5e7eb', borderRadius:10, padding:'12px'
               }} />

        {err && <div style={{color:'#f87171', marginTop:10}}>{err}</div>}

        <button className="btn" disabled={busy}
          style={{
            marginTop:14, width:'100%',
            border:'1px solid #38bdf8', color:'#38bdf8',
            borderRadius:12, padding:'10px', fontWeight:700
          }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div style={{display:'grid', placeItems:'center', paddingBottom:10}}>
        <Image
          src="/images/Logo_3.webp"
          alt="logo"
          width={560}
          height={560}
          style={{ width:'min(85vw,560px)', height:'auto' }}
          priority
        />
      </div>
    </div>
  );
}
