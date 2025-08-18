'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';

type User = {
  id:number;
  loginId:string;
  loginPassword?:string|null;
  adminNoteName?:string|null;
  profile?:{ nameOnSite?:string|null; idOnSite?:string|null; residence?:string|null; photoUrl?:string|null };
  codeConfig?:{ code:string; intervalMs:number; enabled:boolean; lastStep:number };
};

export default function AdminUserCard({params}:{params:{id:string}}){
  const uid = Number(params.id);
  const [data,setData]=useState<User|null>(null);
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState('');

  useEffect(()=>{
    (async()=>{
      const j = await fetch('/api/me',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
      if(!j?.user || j.user.role!=='ADMIN'){ window.location.href='/login'; return; }
      await load();
    })();
  },[]);

  async function load(){
    const j = await fetch(`/api/admin/users/${uid}`,{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
    setData(j?.user||null);
  }

  function set<K extends keyof User>(k:K, v:any){ setData(d=> d ? ({...d, [k]:v}) as User : d); }
  function setProf<K extends keyof NonNullable<User['profile']>>(k:K, v:any){ setData(d=> d ? ({...d, profile:{...(d.profile||{}), [k]:v}} as User) : d); }
  function setCfg<K extends keyof NonNullable<User['codeConfig']>>(k:K, v:any){ setData(d=> d ? ({...d, codeConfig:{...(d.codeConfig||{code:'',intervalMs:120,enabled:true,lastStep:1}), [k]:v}} as User) : d); }

  async function save(){
    if(!data) return;
    setBusy(true);
    setMsg('');
    const r = await fetch(`/api/admin/users/${uid}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(x=>x.json()).catch(()=>null);
    setBusy(false);
    if(!r?.ok){ setMsg(r?.error||'Save failed'); return; }
    setMsg('Saved');
    await load();
  }

  async function uploadPhoto(file:File){
    const fd = new FormData();
    fd.append('file', file);
    await fetch(`/api/admin/users/${uid}/photo`,{method:'POST',body:fd}).catch(()=>{});
    await load();
  }

  if(!data) return <div className="page"><div className="wrap"><div className="card">Loading…</div></div></div>;

  return (
    <div className="page">
      <div className="wrap">
        <div className="card" style={{position:'relative'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div style={{fontSize:18,fontWeight:800}}>User #{data.id}</div>
            <div style={{display:'flex',gap:8}}>
              <a className="btn" href="/admin">Back</a>
              <a className="btn" href={`/admin/chat/${data.id}`} style={{borderColor:'#38bdf8',color:'#38bdf8'}}>Chat</a>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div style={{border:'1px solid #1f2937',borderRadius:12,padding:12,background:'#0b1220'}}>
              <div style={{fontWeight:700,marginBottom:8}}>Credentials</div>
              <div style={{display:'grid',gap:8}}>
                <div><div style={{fontSize:12,opacity:.8}}>Login</div><div>{data.loginId}</div></div>
                <div><div style={{fontSize:12,opacity:.8}}>Password</div><div>{data.loginPassword || '—'}</div></div>
                <div>
                  <div style={{fontSize:12,opacity:.8,marginBottom:4}}>Admin note name</div>
                  <input className="input" value={data.adminNoteName||''} onChange={e=>set('adminNoteName', e.target.value)}/>
                </div>
              </div>
            </div>

            <div style={{border:'1px solid #1f2937',borderRadius:12,padding:12,background:'#0b1220'}}>
              <div style={{fontWeight:700,marginBottom:8}}>Profile</div>
              <div style={{display:'grid',gap:8}}>
                <div><div style={{fontSize:12,opacity:.8}}>Name on site</div><input className="input" value={data.profile?.nameOnSite||''} onChange={e=>setProf('nameOnSite', e.target.value)}/></div>
                <div><div style={{fontSize:12,opacity:.8}}>ID on site</div><input className="input" value={data.profile?.idOnSite||''} onChange={e=>setProf('idOnSite', e.target.value)}/></div>
                <div><div style={{fontSize:12,opacity:.8}}>Residence</div><input className="input" value={data.profile?.residence||''} onChange={e=>setProf('residence', e.target.value)}/></div>
                <div style={{display:'flex',gap:10,alignItems:'center'}}>
                  {data.profile?.photoUrl ? <img src={data.profile.photoUrl} alt="photo" style={{width:64,height:64,borderRadius:'50%',objectFit:'cover'}}/> : <div style={{opacity:.7}}>No photo</div>}
                  <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadPhoto(f); }}/>
                </div>
              </div>
            </div>

            <div style={{gridColumn:'1 / -1', border:'1px solid #1f2937',borderRadius:12,padding:12,background:'#0b1220'}}>
              <div style={{fontWeight:700,marginBottom:8}}>Code</div>
              <div style={{display:'grid',gap:8}}>
                <textarea className="input" rows={4} value={data.codeConfig?.code||''} onChange={e=>setCfg('code', e.target.value)}/>
                <div style={{textAlign:'right',fontSize:12,opacity:.8}}>{(data.codeConfig?.code||'').length} chars</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                  <div>
                    <div style={{fontSize:12,opacity:.8,marginBottom:4}}>Interval, ms</div>
                    <input className="input" type="number" value={data.codeConfig?.intervalMs||120} onChange={e=>setCfg('intervalMs', parseInt(e.target.value||'0'))}/>
                  </div>
                  <div>
                    <div style={{fontSize:12,opacity:.8,marginBottom:4}}>Enabled</div>
                    <select className="input" value={String(data.codeConfig?.enabled??true)} onChange={e=>setCfg('enabled', e.target.value==='true')}>
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  </div>
                  <div>
                    <div style={{fontSize:12,opacity:.8,marginBottom:4}}>Last step</div>
                    <input className="input" type="number" value={data.codeConfig?.lastStep||1} onChange={e=>setCfg('lastStep', parseInt(e.target.value||'1'))}/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {msg && <div style={{marginTop:10, background:'#1f2937', border:'1px solid #334155', borderRadius:10, padding:10}}>{msg}</div>}
          <div style={{marginTop:12,display:'flex',gap:8,justifyContent:'flex-end'}}>
            <a className="btn" href={`/admin/chat/${data.id}`} style={{borderColor:'#38bdf8',color:'#38bdf8'}}>Open chat</a>
            <button className="btn btn-primary" disabled={busy} onClick={save}>{busy?'Saving…':'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
