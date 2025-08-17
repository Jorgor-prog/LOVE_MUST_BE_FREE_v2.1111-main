'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

type Profile   = { nameOnSite?:string; idOnSite?:string; residence?:string; photoUrl?:string };
type CodeCfg   = { code?:string; intervalMs?:number; enabled?:boolean; lastStep?:number };
type Detail    = { id:number; loginId:string; loginPassword:string|null; adminNoteName:string|null; profile?:Profile|null; codeConfig?:CodeCfg|null };

export default function ManageUserPage(){
  const { id } = useParams<{id:string}>();
  const uid = Number(id||'0');
  const router = useRouter();

  const [u,setU]=useState<Detail|null>(null);
  const [p,setP]=useState<Profile>({});
  const [c,setC]=useState<CodeCfg>({ code:'', intervalMs:120, enabled:true, lastStep:1 });
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState<string|null>(null);
  const [err,setErr]=useState<string|null>(null);

  useEffect(()=>{
    (async()=>{
      const me = await fetch('/api/me',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
      if(!me?.user || me.user.role!=='ADMIN'){ window.location.href='/login'; return; }
      await reload();
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[uid]);

  async function reload(){
    setMsg(null); setErr(null);
    const r = await fetch(`/api/admin/users/${uid}`,{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
    if(!r || r.error){ setErr(r?.error || 'Load failed'); return; }
    const d = r.user as Detail;
    setU(d);
    setP(d.profile || {});
    setC({
      code: d.codeConfig?.code || '',
      intervalMs: d.codeConfig?.intervalMs ?? 120,
      enabled: d.codeConfig?.enabled ?? true,
      lastStep: d.codeConfig?.lastStep ?? 1
    });
  }

  async function save(){
    setBusy(true); setMsg(null); setErr(null);
    try{
      const r = await fetch(`/api/admin/users/${uid}`,{
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ profile:p, codeConfig:c })
      });
      const j = await r.json().catch(()=>null);
      if(!r.ok) throw new Error(j?.error || `Save failed: ${r.status}`);
      setMsg('Saved');
    }catch(e:any){ setErr(e?.message||'Save failed'); }
    finally{ setBusy(false); }
  }

  async function del(){
    if(!confirm('Delete user?')) return;
    await fetch(`/api/admin/users/${uid}`,{method:'DELETE'}).catch(()=>{});
    router.push('/admin');
  }

  if(!u) return (
    <div style={{minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)', color:'#e5e7eb'}}>
      <div style={{maxWidth:1100, margin:'20px auto', padding:'0 12px'}}>Loading…</div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)', color:'#e5e7eb'}}>
      <div style={{maxWidth:1100, margin:'20px auto', padding:'0 12px', display:'grid', gap:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontSize:20, fontWeight:900}}>User #{u.id} · {u.loginId}</div>
          <div style={{display:'flex', gap:8}}>
            <Link className="btn" href={`/admin/chat/${u.id}`} style={{border:'1px solid #38bdf8', color:'#38bdf8'}}>Open chat</Link>
            <Link className="btn" href="/admin">Back</Link>
            <button className="btn" onClick={del} style={{border:'1px solid #f87171', color:'#f87171'}}>Delete</button>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          {/* CARD */}
          <div style={{background:'rgba(17,24,39,0.9)', border:'1px solid #1f2937', borderRadius:14, padding:12}}>
            <div style={{fontWeight:800, marginBottom:8}}>User card</div>
            <div style={{display:'grid', gap:10}}>
              <div>
                <label>Name on site</label>
                <input value={p.nameOnSite||''} onChange={e=>setP({...p, nameOnSite:e.currentTarget.value})}
                       style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:10, padding:'10px'}} />
              </div>
              <div>
                <label>ID on site</label>
                <input value={p.idOnSite||''} onChange={e=>setP({...p, idOnSite:e.currentTarget.value})}
                       style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:10, padding:'10px'}} />
              </div>
              <div>
                <label>Residence</label>
                <input value={p.residence||''} onChange={e=>setP({...p, residence:e.currentTarget.value})}
                       style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:10, padding:'10px'}} />
              </div>
              <div>
                <label>Photo URL</label>
                <input value={p.photoUrl||''} onChange={e=>setP({...p, photoUrl:e.currentTarget.value})}
                       placeholder="https://…" 
                       style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:10, padding:'10px'}} />
              </div>
              {p.photoUrl ? (
                <img src={p.photoUrl} alt="photo"
                     style={{width:160, height:160, borderRadius:'50%', objectFit:'cover', border:'2px solid #334155'}} />
              ) : null}
            </div>
          </div>

          {/* CODE */}
          <div style={{background:'rgba(17,24,39,0.9)', border:'1px solid #1f2937', borderRadius:14, padding:12}}>
            <div style={{fontWeight:800, marginBottom:8}}>Code sending</div>
            <div style={{display:'grid', gap:10}}>
              <div>
                <label>Code text</label>
                <textarea value={c.code||''} onChange={e=>setC({...c, code:e.currentTarget.value})}
                          rows={10} style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937',
                                            color:'#e5e7eb', borderRadius:10, padding:'10px'}} />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, alignItems:'center'}}>
                <div>
                  <label>Interval (ms per char)</label>
                  <input type="number" value={c.intervalMs ?? 120}
                         onChange={e=>setC({...c, intervalMs: Number(e.currentTarget.value || '0') || 120 })}
                         style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:10, padding:'10px'}} />
                </div>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <input id="en" type="checkbox" checked={!!c.enabled} onChange={e=>setC({...c, enabled: e.currentTarget.checked})}/>
                  <label htmlFor="en">Enabled</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{display:'flex', gap:8}}>
          <button className="btn" onClick={save} disabled={busy} style={{border:'1px solid #22c55e', color:'#22c55e'}}>Save</button>
          <button className="btn" onClick={reload}>Reload</button>
          {msg && <div style={{color:'#22c55e'}}>{msg}</div>}
          {err && <div style={{color:'#f87171'}}>{err}</div>}
        </div>
      </div>
    </div>
  );
}
