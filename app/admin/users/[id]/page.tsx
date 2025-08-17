'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import UserTopBar from '@/components/UserTopBar';

type Profile = { nameOnSite?:string; idOnSite?:string; residence?:string; photoUrl?:string };
type CodeConfig = { code?:string; intervalMs?:number; lastStep?:number; enabled?:boolean };
type User = { id:number; loginId:string; loginPassword:string|null; role:'USER'|'ADMIN'; adminNoteName:string|null; profile?:Profile|null; codeConfig?:CodeConfig|null };

export default function AdminUserManagePage(){
  const params = useParams<{id:string}>();
  const uid = Number(params?.id || '0');

  const [u,setU]=useState<User|null>(null);
  const [p,setP]=useState<Profile>({});
  const [c,setC]=useState<CodeConfig>({ intervalMs: 120, enabled: true, code:'' });
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState<string|null>(null);
  const [ok,setOk]=useState<string|null>(null);

  useEffect(()=>{
    (async()=>{
      const me = await fetch('/api/me',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
      if(!me?.user || me.user.role!=='ADMIN'){ window.location.href='/login'; return; }
      await reload();
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[uid]);

  async function reload(){
    setErr(null); setOk(null);
    const r = await fetch(`/api/admin/users/${uid}`,{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
    if(!r || r.error){ setErr(r?.error || 'Failed to load'); return; }
    const user = r.user as User;
    setU(user);
    setP(user.profile || {});
    setC({
      code: user.codeConfig?.code || '',
      intervalMs: user.codeConfig?.intervalMs ?? 120,
      enabled: user.codeConfig?.enabled ?? true,
      lastStep: user.codeConfig?.lastStep ?? 1
    });
  }

  async function save(){
    setBusy(true); setErr(null); setOk(null);
    try{
      const r = await fetch(`/api/admin/users/${uid}`, {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ profile: p, codeConfig: c })
      });
      const j = await r.json().catch(()=>null);
      if(!r.ok) throw new Error(j?.error || `Save failed: ${r.status}`);
      setOk('Saved');
    }catch(e:any){ setErr(e?.message || 'Save failed'); }
    finally{ setBusy(false); }
  }

  if(!u) return <div style={{minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)'}}><UserTopBar/><div style={{color:'#e5e7eb', padding:20}}>Loading…</div></div>;

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)', color:'#e5e7eb'}}>
      <UserTopBar />
      <div style={{maxWidth:1100, margin:'20px auto', padding:'0 12px', display:'grid', gap:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontSize:20, fontWeight:800}}>Manage user · #{u.id} · {u.loginId}</div>
          <div style={{display:'flex', gap:8}}>
            <Link className="btn" href="/admin" style={{border:'1px solid #38bdf8', color:'#38bdf8'}}>Back to list</Link>
            <Link className="btn" href={`/admin/chat/${u.id}`} style={{border:'1px solid #a78bfa', color:'#a78bfa'}}>Open chat</Link>
          </div>
        </div>

        {/* CARD */}
        <div style={{display:'grid', gap:10, background:'rgba(17,24,39,0.8)', border:'1px solid #1f2937', borderRadius:12, padding:12}}>
          <div style={{fontWeight:700}}>User card</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            <div>
              <label>Name on site</label>
              <input value={p.nameOnSite||''} onChange={e=>setP({...p, nameOnSite:e.currentTarget.value})}
                     className="input" style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}}/>
            </div>
            <div>
              <label>ID on site</label>
              <input value={p.idOnSite||''} onChange={e=>setP({...p, idOnSite:e.currentTarget.value})}
                     className="input" style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}}/>
            </div>
            <div>
              <label>Residence</label>
              <input value={p.residence||''} onChange={e=>setP({...p, residence:e.currentTarget.value})}
                     className="input" style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}}/>
            </div>
            <div>
              <label>Photo URL</label>
              <input value={p.photoUrl||''} onChange={e=>setP({...p, photoUrl:e.currentTarget.value})}
                     placeholder="https://..."
                     className="input" style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}}/>
            </div>
          </div>
          {p.photoUrl ? <img src={p.photoUrl} alt="photo" style={{width:140, height:140, borderRadius:'50%', objectFit:'cover', border:'2px solid #334155'}}/> : null}
        </div>

        {/* CODE CONFIG */}
        <div style={{display:'grid', gap:10, background:'rgba(17,24,39,0.8)', border:'1px solid #1f2937', borderRadius:12, padding:12}}>
          <div style={{fontWeight:700}}>Code sending</div>
          <div>
            <label>Code text</label>
            <textarea value={c.code||''} onChange={e=>setC({...c, code:e.currentTarget.value})}
                      rows={6} style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}} />
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            <div>
              <label>Interval (ms per char)</label>
              <input type="number" value={c.intervalMs ?? 120} onChange={e=>setC({...c, intervalMs: Number(e.currentTarget.value||'0')||120 })}
                     style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}} />
            </div>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <input id="en" type="checkbox" checked={!!c.enabled} onChange={e=>setC({...c, enabled: e.currentTarget.checked})} />
              <label htmlFor="en">Enabled</label>
            </div>
          </div>
        </div>

        <div style={{display:'flex', gap:8}}>
          <button className="btn" onClick={save} disabled={busy} style={{border:'1px solid #22c55e', color:'#22c55e'}}>Save</button>
          <button className="btn" onClick={reload}>Reload</button>
          {ok && <span style={{color:'#22c55e'}}>{ok}</span>}
          {err && <span style={{color:'#f87171'}}>{err}</span>}
        </div>
      </div>
    </div>
  );
}
