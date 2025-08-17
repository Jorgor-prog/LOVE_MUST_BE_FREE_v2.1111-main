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
      const localStarted = typeof window!=='undefined' && localStorage.getItem('code_started')==='1';
      if (lastStep >= 6 || localStarted) window.location.href = '/confirm';
      else window.location.href = '/dashboard';
    }catch(e:any){
      setErr(e?.message || 'Network error');
      setBusy(false);
    }
  }

  return (
    <div style={{
      minHeight:'100svh',
      position:'relative',
      display:'grid',
      placeItems:'center',
      backgroundImage:'url(/images/Background_1.webp)',
      backgroundSize:'cover',
      backgroundPosition:'center',
      overflow:'hidden',
      padding:'min(5vh,28px) 12px'
    }}>
      {/* ЛОГО ПОЗАДУ, АДАПТИВНО */}
      <div style={{
        position:'absolute', inset:0, display:'grid', placeItems:'center',
        pointerEvents:'none', zIndex:0, opacity:.95
      }}>
        <Image src="/images/Logo_3.webp" alt="logo" width={520} height={520}
               style={{ width:'min(80vw,520px)', height:'auto' }} priority/>
      </div>

      {/* ФОРМА */}
      <form onSubmit={submit}
        style={{
          width:'min(94vw,460px)',
          background:'rgba(10,14,23,0.72)',
          border:'1px solid #1f2937',
          borderRadius:16,
          padding:'16px 14px',
          backdropFilter:'blur(8px)',
          color:'#e5e7eb',
          boxShadow:'0 16px 40px rgba(0,0,0,.45)',
          position:'relative', zIndex:1
        }}>
        <div style={{fontSize:20, fontWeight:800, marginBottom:10, textAlign:'center'}}>Sign in</div>

        <label style={{fontSize:12, color:'#94a3b8'}}>Your login</label>
        <input
          value={loginId}
          onChange={e=>setLogin(e.currentTarget.value)}
          placeholder="Your login"
          autoComplete="username"
          style={{
            width:'100%', marginTop:6, marginBottom:10,
            background:'#0b1220', border:'1px solid #1f2937',
            color:'#e5e7eb', borderRadius:10, padding:'12px'
          }} />

        <label style={{fontSize:12, color:'#94a3b8'}}>Your password</label>
        <input type="password"
          value={password}
          onChange={e=>setPass(e.currentTarget.value)}
          placeholder="Your password"
          autoComplete="current-password"
          style={{
            width:'100%', marginTop:6,
            background:'#0b1220', border:'1px solid #1f2937',
            color:'#e5e7eb', borderRadius:10, padding:'12px'
          }} />

        {err && <div style={{color:'#f87171', marginTop:10}}>{err}</div>}

        <button className="btn" disabled={busy}
          style={{ marginTop:14, width:'100%',
            border:'1px solid #38bdf8', color:'#38bdf8',
            borderRadius:12, padding:'10px', fontWeight:700 }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
