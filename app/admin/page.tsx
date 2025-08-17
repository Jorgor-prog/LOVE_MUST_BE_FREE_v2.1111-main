'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';

type Profile = { nameOnSite?:string; idOnSite?:string; residence?:string; photoUrl?:string };
type CodeCfg = { code?:string; emitIntervalSec?:number; paused?:boolean };
type UserLite = {
  id:number; loginId:string; loginPassword?:string|null; password?:string|null;
  adminNoteName?:string; profile?:Profile; codeConfig?:CodeCfg; isOnline?:boolean; updatedAt?:string
};

async function compressImage(file: File, maxBytes=200*1024): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const maxSide = 1280;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  let quality = 0.9; let blob: Blob | null = null;
  for (let i=0;i<6;i++){
    blob = await new Promise<Blob|null>(res=>canvas.toBlob(b=>res(b), 'image/webp', quality));
    if (blob && blob.size <= maxBytes) break;
    quality = Math.max(0.4, quality - 0.1);
  }
  return blob || (await new Promise<Blob|null>(res=>canvas.toBlob(b=>res(b), 'image/webp', 0.8)))!;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserLite[]>([]);
  const [selected, setSelected] = useState<UserLite | null>(null);
  const [internalName, setInternalName] = useState('');
  const [code, setCode] = useState('');
  const [emitInterval, setEmitInterval] = useState(22);
  const [paused, setPaused] = useState(false);

  function showToast(msg:string){ alert(msg); }

  useEffect(()=>{
    (async()=>{
      const me = await fetch('/api/me').then(x=>x.json()).catch(()=>null);
      if(!me?.user || me.user.role!=='ADMIN'){ window.location.href='/login'; return; }
      await load();
    })();
  },[]);

  async function openUser(id:number){
    const r = await fetch(`/api/admin/users/${id}`, { cache:'no-store' });
    if(!r.ok){ showToast(`Open failed: ${r.status}`); return; }
    const j = await r.json();
    const u = j?.user as UserLite;
    setSelected(u || null);
    setInternalName(u?.adminNoteName || '');
    setCode(u?.codeConfig?.code || '');
    setEmitInterval(u?.codeConfig?.emitIntervalSec ?? 22);
    setPaused(!!u?.codeConfig?.paused);
  }

  async function load(){
    const r = await fetch('/api/admin/users', { cache:'no-store' });
    if(!r.ok){ showToast(`Load failed: ${r.status}`); return; }
    const j = await r.json();
    setUsers(j?.users || []);
  }

  async function save(){
    if(!selected) return;
    const r = await fetch(`/api/admin/users/${selected.id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        adminNoteName: internalName,
        profile: { ...(selected.profile||{}), nameOnSite: selected.profile?.nameOnSite || '', idOnSite: selected.profile?.idOnSite || '', residence: selected.profile?.residence || '' },
        codeConfig: { code, emitIntervalSec: emitInterval, paused }
      })
    });
    if(!r.ok){ showToast(`Save failed: ${r.status}`); return; }
    await openUser(selected.id);
    showToast('Saved');
  }

  async function createUser(){
    const r = await fetch('/api/admin/users', { method:'POST' });
    if(!r.ok){ showToast(`Create failed: ${r.status}`); return; }
    const j = await r.json();
    await load();
    if(j?.user?.id) await openUser(j.user.id);
    if(j?.user?.loginId && j?.user?.password){
      showToast(`Login: ${j.user.loginId}\nPassword: ${j.user.password}\n⚠️ Збережи й передай користувачу`);
    }
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selected) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const blob = await compressImage(file, 200*1024);
    const fd = new FormData();
    fd.append('file', new File([blob], 'photo.webp', { type: 'image/webp' }));
    const r = await fetch(`/api/admin/users/${selected.id}/photo`, { method:'POST', body: fd });
    if(!r.ok){ showToast(`Photo failed: ${r.status}`); return; }
    await openUser(selected.id);
    showToast('Photo updated');
    e.currentTarget.value = '';
  }

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)', color:'#e5e7eb'}}>
      <div style={{maxWidth:1100, margin:'24px auto', padding:'0 12px'}}>
        <div style={{display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap'}}>
          <div style={{flex:'0 0 340px', background:'rgba(17,24,39,0.8)', border:'1px solid #1f2937', borderRadius:12, padding:12}}>
            <div style={{fontWeight:700, marginBottom:8}}>Users</div>
            <button className="btn" onClick={createUser} style={{marginBottom:10, borderColor:'#22c55e', color:'#22c55e'}}>Create</button>
            <div style={{display:'grid', gap:8, maxHeight:480, overflow:'auto'}}>
              {users.map(u=>(
                <button key={u.id} className="btn" onClick={()=>openUser(u.id)} style={{justifyContent:'flex-start'}}>
                  <span style={{opacity:.8, marginRight:8}}>#{u.id}</span> {u.loginId}
                </button>
              ))}
            </div>
          </div>

          <div style={{flex:'1 1 520px', background:'rgba(17,24,39,0.8)', border:'1px solid #1f2937', borderRadius:12, padding:12}}>
            {!selected ? <div>Select a user</div> : (
              <div style={{display:'grid', gap:10}}>
                <div style={{fontWeight:700, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span>User #{selected.id}</span>
                  <a className="btn" href={`/admin/chat/${selected.id}`} style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Открыть чат</a>
                </div>

                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                  <div>
                    <div style={{opacity:.8, marginBottom:6}}>Login</div>
                    <input className="input" readOnly value={selected.loginId || ''} />
                  </div>
                  <div>
                    <div style={{opacity:.8, marginBottom:6}}>Password</div>
                    <input className="input" readOnly value={selected.loginPassword || selected.password || ''} />
                  </div>
                </div>

                <label>Internal name
                  <input className="input" value={internalName} onChange={e=>setInternalName(e.target.value)} style={{width:'100%', marginTop:6}}/>
                </label>

                <div>
                  <div style={{opacity:.8, marginBottom:6}}>Profile photo</div>
                  <input type="file" accept="image/*" onChange={uploadPhoto}/>
                  {selected.profile?.photoUrl && (
                    <img src={selected.profile.photoUrl} alt="avatar" style={{marginTop:8, maxWidth:240, borderRadius:8}}/>
                  )}
                </div>

                <label>Code
                  <textarea className="input" value={code} onChange={e=>setCode(e.target.value)}
                            style={{width:'100%', marginTop:6, height:120}} />
                </label>

                <label>Emit interval (sec)
                  <input className="input" type="number" min={1} value={emitInterval}
                         onChange={e=>setEmitInterval(Math.max(1, Number(e.target.value||'1')))}
                         style={{width:160, marginLeft:8}}/>
                </label>

                <label style={{display:'flex', alignItems:'center', gap:8}}>
                  <input type="checkbox" checked={paused} onChange={e=>setPaused(e.target.checked)} />
                  Paused
                </label>

                <div>
                  <button className="btn" onClick={save} style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Save</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
