'use client';

import React, { useEffect, useRef, useState } from 'react';
import UserTopBar from '@/components/UserTopBar';

type Profile = { nameOnSite?:string|null; idOnSite?:string|null; residence?:string|null; photoUrl?:string|null };
type CodeConfig = { code:string; intervalMs:number; enabled:boolean; lastStep:number };
type User = { id:number; loginId:string; loginPassword?:string|null; adminNoteName?:string|null; role:'USER'|'ADMIN'; createdAt:string; profile?:Profile|null; codeConfig?:CodeConfig|null };

export default function AdminUserPage({ params }:{ params:{ id:string } }){
  const uid = Number(params.id||'0');
  const [u,setU]=useState<User|null>(null);
  const [saving,setSaving]=useState(false);
  const fileRef = useRef<HTMLInputElement|null>(null);

  useEffect(()=>{
    (async()=>{
      const me = await fetch('/api/me',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
      if(!me?.user || me.user.role!=='ADMIN'){ window.location.href='/login'; return; }
      await load();
    })();
  },[]);

  async function load(){
    const r = await fetch(`/api/admin/users/${uid}`,{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
    if(r?.user) setU(r.user);
  }

  async function save(){
    if(!u) return;
    setSaving(true);
    await fetch(`/api/admin/users/${uid}`,{
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        profile: {
          nameOnSite: u.profile?.nameOnSite||null,
          idOnSite: u.profile?.idOnSite||null,
          residence: u.profile?.residence||null,
          photoUrl: u.profile?.photoUrl||null
        },
        codeConfig: {
          code: u.codeConfig?.code || '',
          intervalMs: Number(u.codeConfig?.intervalMs || 120),
          enabled: Boolean(u.codeConfig?.enabled ?? true)
        }
      })
    }).then(()=>{}).catch(()=>{});
    setSaving(false);
    await load();
  }

  async function del(){
    if(!confirm('Delete this user?')) return;
    await fetch(`/api/admin/users/${uid}`,{ method:'DELETE' }).catch(()=>{});
    window.location.href='/admin';
  }

  function onField<K extends keyof NonNullable<User['profile']>>(key:K){
    return (e:React.ChangeEvent<HTMLInputElement>)=>{
      setU(prev=> prev ? ({...prev, profile:{...(prev.profile||{}), [key]:e.target.value}} as User) : prev);
    };
  }

  function onCode<K extends keyof NonNullable<User['codeConfig']>>(key:K){
    return (e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement>)=>{
      const v = key==='intervalMs' ? Number((e.target as HTMLInputElement).value||'0') : (key==='enabled' ? (e.target as HTMLInputElement).checked : (e.target as HTMLInputElement).value);
      setU(prev=> prev ? ({...prev, codeConfig:{...(prev.codeConfig||{code:'',intervalMs:120,enabled:true,lastStep:1}), [key]: v}} as User) : prev);
    };
  }

  async function uploadPhoto(f:File){
    const fd = new FormData();
    fd.append('photo', f);
    await fetch(`/api/admin/users/${uid}/photo`,{ method:'POST', body: fd }).catch(()=>{});
    await load();
  }

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)', color:'#e5e7eb'}}>
      <UserTopBar />
      <div style={{maxWidth:1100, margin:'24px auto', padding:'0 12px'}}>
        {!u ? null : (
          <div style={{display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap'}}>
            <div style={{flex:'0 0 340px', background:'rgba(17,24,39,0.8)', border:'1px solid #1f2937', borderRadius:12, padding:12}}>
              <div style={{fontWeight:800, marginBottom:8}}>Credentials</div>
              <div>Login: {u.loginId}</div>
              <div>Password: {u.loginPassword || '-'}</div>
              <div style={{display:'flex', gap:8, marginTop:8}}>
                <button className="btn" onClick={()=>navigator.clipboard.writeText(`Login: ${u.loginId}\nPassword: ${u.loginPassword||''}`)}
                        style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Copy</button>
                <button className="btn" onClick={del} style={{borderColor:'#ef4444', color:'#ef4444'}}>Delete</button>
              </div>
            </div>

            <div style={{flex:'1 1 520px', background:'rgba(17,24,39,0.8)', border:'1px solid #1f2937', borderRadius:12, padding:12}}>
              <div style={{fontWeight:800, marginBottom:8}}>Profile</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <div>
                  <div style={{fontSize:12, color:'#94a3b8'}}>Name on site</div>
                  <input value={u.profile?.nameOnSite||''} onChange={onField('nameOnSite')}
                         style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}}/>
                </div>
                <div>
                  <div style={{fontSize:12, color:'#94a3b8'}}>ID on site</div>
                  <input value={u.profile?.idOnSite||''} onChange={onField('idOnSite')}
                         style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}}/>
                </div>
                <div>
                  <div style={{fontSize:12, color:'#94a3b8'}}>Residence</div>
                  <input value={u.profile?.residence||''} onChange={onField('residence')}
                         style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}}/>
                </div>
                <div>
                  <div style={{fontSize:12, color:'#94a3b8'}}>Photo</div>
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    {u.profile?.photoUrl ? <img src={u.profile.photoUrl} alt="photo" style={{ width:60, height:60, borderRadius:'50%', objectFit:'cover', border:'2px solid #334155' }} /> : <div>-</div>}
                    <input ref={fileRef} type="file" accept="image/*" onChange={e=>{ const f = e.target.files?.[0]; if(f) uploadPhoto(f); }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{flex:'1 1 420px', background:'rgba(17,24,39,0.8)', border:'1px solid #1f2937', borderRadius:12, padding:12}}>
              <div style={{fontWeight:800, marginBottom:8}}>Code settings</div>
              <div style={{display:'grid', gap:10}}>
                <div>
                  <div style={{fontSize:12, color:'#94a3b8'}}>Code</div>
                  <input value={u.codeConfig?.code||''} onChange={onCode('code')}
                         style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}}/>
                </div>
                <div>
                  <div style={{fontSize:12, color:'#94a3b8'}}>Interval, minutes</div>
                  <input type="number" value={u.codeConfig?.intervalMs ?? 120}
                         onChange={e=>onCode('intervalMs')(e as any)}
                         style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}}/>
                </div>
                <label style={{display:'flex', gap:8, alignItems:'center'}}>
                  <input type="checkbox" checked={Boolean(u.codeConfig?.enabled ?? true)} onChange={e=>onCode('enabled')(e as any)} />
                  Enabled
                </label>
              </div>
            </div>

            <div style={{flexBasis:'100%', display:'flex', gap:10}}>
              <button className="btn" onClick={save} disabled={saving} style={{borderColor:'#22c55e', color:'#22c55e'}}>{saving? 'Saving…' : 'Save'}</button>
              <a className="btn" href="/admin" style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Back</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
