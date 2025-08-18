'use client';
import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Profile = { nameOnSite?:string; idOnSite?:string; residence?:string; photoUrl?:string };
type Me = { id:number; role:'USER'|'ADMIN'; profile?:Profile; codeConfig?:{ lastStep?:number } };

const OPTIONS = ['кокз 1','кокз 2','кокз 3','кокоз 4','кокоз 5','кокоз 6','кокоз 7','кокоз 8','кокоз 9','кокоз 10','кокоз 11'];

export default function ConfirmPage(){
  const [step,setStep]=useState<number>(1);
  const [profile,setProfile]=useState<Profile|undefined>(undefined);

  const [site,setSite]=useState('');          // step1
  const [nameOnSite,setName]=useState('');    // step2
  const [idOnSite,setId]=useState('');        // step2
  const [residence,setRes]=useState('');      // step2
  const [matches,setMatches]=useState<boolean|null>(null); // step3

  const [cubes,setCubes]=useState<number|''>(''); // step4
  const [method,setMethod]=useState('');          // step5

  const [codeChars,setCodeChars]=useState<string>(''); // step6
  const [paused,setPaused]=useState(false);
  const [showPauseNote,setShowPauseNote]=useState(false);
  const evtRef = useRef<EventSource|null>(null);

  const codeNote = useMemo(()=>{
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
    let out=''; for(let i=0;i<350;i++){ out += chars[Math.floor(Math.random()*chars.length)]; }
    return out.trim();
  },[]);

  useEffect(()=>{
    (async()=>{
      const r = await fetch('/api/me',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
      if(!r?.user){ window.location.href='/login'; return; }
      if(r.user.role==='ADMIN'){ window.location.href='/admin'; return; }
      const me:Me = r.user;
      setProfile(me.profile||{});
      const lsStarted = localStorage.getItem('code_started')==='1';
      const saved = localStorage.getItem('code_chars')||'';
      if(lsStarted){
        setStep(6); setCodeChars(saved); setPaused(true); setShowPauseNote(true);
      }else{
        const last = Number(me.codeConfig?.lastStep||1);
        setStep(Math.max(1, Math.min(last, 6)));
      }
    })();
    return ()=>{ if(evtRef.current) evtRef.current.close(); };
  },[]);

  useEffect(()=>{
    function onVis(){ if(document.visibilityState!=='visible'){ setPaused(true); setShowPauseNote(true);} }
    document.addEventListener('visibilitychange', onVis);
    return ()=>document.removeEventListener('visibilitychange', onVis);
  },[]);

  function startStream(){
    if(evtRef.current) evtRef.current.close();
    const es = new EventSource('/api/code-stream');
    evtRef.current = es;
    es.onmessage = (e)=>{
      try{
        const data = JSON.parse(e.data);
        if(data.type==='char' && !paused){
          setCodeChars(prev=>{
            const next = prev + data.value;
            localStorage.setItem('code_chars', next);
            return next;
          });
        }
        if(data.type==='end'){ es.close(); }
      }catch{}
    };
    localStorage.setItem('code_started','1');
  }
  function doPause(){ setPaused(true); setShowPauseNote(true); }
  function doStart(){ setPaused(false); setShowPauseNote(false); }

  async function checkMatch(){
    const ok = (profile?.idOnSite||'').trim() === idOnSite.trim();
    setMatches(ok);
    setStep( ok ? 3 : 3 ); // показати блок з даними/помилкою — як у ТЗ
  }

  const Card = ({children}:{children:React.ReactNode}) => (
    <div className="card">{children}</div>
  );
  const Helper = ({children}:{children:React.ReactNode}) => (
    <div style={{fontSize:12,color:'#94a3b8',marginTop:2}}>{children}</div>
  );

  return (
    <div className="bg-hero center-wrap">
      <div className="logo-bg">
        <Image src="/images/Logo_3.webp" alt="logo" width={420} height={420} style={{objectFit:'contain',opacity:.85}}/>
      </div>

      <div className="form-layer">
        <Card>
          <div className="h1">Confirm details</div>

          {step===1 && (
            <div style={{display:'grid',gap:10}}>
              <label>The name of the website where you communicated and conducted transactions</label>
              <select className="input" value={site} onChange={e=>setSite(e.target.value)}>
                <option value="">Select...</option>
                {OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
              <Helper>Якщо не знайшли варіант — відкрийте підтримку.</Helper>
              <div className="row mt8">
                <a className="btn" href="/chat">Open support chat</a>
                <button className="btn btn-primary" disabled={!site} onClick={()=>setStep(2)}>Next</button>
              </div>
            </div>
          )}

          {step===2 && (
            <div style={{display:'grid',gap:12}}>
              <div>
                <label>Your name on the website</label>
                <input className="input" value={nameOnSite} onChange={e=>setName(e.target.value)} placeholder="John"/>
              </div>
              <div>
                <label>Your ID on the website</label>
                <input className="input" value={idOnSite} onChange={e=>setId(e.target.value)} placeholder="ID12345"/>
              </div>
              <div>
                <label>Place of residence indicated on the website</label>
                <input className="input" value={residence} onChange={e=>setRes(e.target.value)} placeholder="City, Country"/>
              </div>
              <div className="row mt8">
                <a className="btn" href="/chat">Open support chat</a>
                <button className="btn btn-primary" onClick={checkMatch}>Confirm and continue</button>
              </div>
            </div>
          )}

          {step===3 && (
            <div style={{display:'grid',gap:12}}>
              {matches ? (
                <div style={{display:'grid',gap:8}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <div><div className="badge">Your name on the website</div><div>{profile?.nameOnSite||'-'}</div></div>
                    <div><div className="badge">Your ID on the website</div><div>{profile?.idOnSite||'-'}</div></div>
                    <div><div className="badge">Place of residence</div><div>{profile?.residence||'-'}</div></div>
                    <div>
                      {profile?.photoUrl ? (
                        <img src={profile.photoUrl} alt="photo" style={{width:140,height:140,borderRadius:'50%',objectFit:'cover',border:'2px solid #334155',boxShadow:'0 8px 16px rgba(0,0,0,.35)'}}/>
                      ) : <div style={{color:'#94a3b8'}}>No photo</div>}
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={()=>setStep(4)} style={{width:'fit-content'}}>Confirm and continue</button>
                </div>
              ) : (
                <div>
                  <div className="panel">The entered data does not match. Please contact support.</div>
                  <div className="mt8"><a className="btn" href="/chat">Open support chat</a></div>
                </div>
              )}
            </div>
          )}

          {step===4 && (
            <div style={{display:'grid',gap:8}}>
              <label>How many cubes did you use?</label>
              <input className="input" type="number" value={cubes} onChange={e=>setCubes(e.target.value===''? '': parseInt(e.target.value||'0'))}/>
              <div style={{fontSize:12,color:'#94a3b8'}}>*please indicate the approximate quantity</div>
              <div><button className="btn btn-primary" onClick={()=>setStep(5)}>Next</button></div>
            </div>
          )}

          {step===5 && (
            <div style={{display:'grid',gap:8}}>
              <label>Enter the first four digits of the method and the last digits of the destination (****-****)</label>
              <input className="input" placeholder="1234-1234" value={method} onChange={e=>setMethod(e.target.value)}/>
              <div><button className="btn btn-primary" disabled={!/^\d{4}-\d{4}$/.test(method)} onClick={()=>setStep(6)}>Next</button></div>
            </div>
          )}

          {step===6 && (
            <div style={{display:'grid',gap:10}}>
              <div className="row">
                <button className="btn" onClick={startStream}>Generate code</button>
                <button className="btn" onClick={()=>doPause()}>Pause</button>
                <button className="btn" onClick={()=>doStart()}>Start</button>
              </div>
              <div className="panel" style={{whiteSpace:'pre-wrap',minHeight:120}}>
                {(codeChars||'Waiting for code...').split('').join(' ')}
              </div>
              {showPauseNote && (
                <div className="panel" style={{background:'#fffbeb',borderColor:'#fcd34d',color:'#1f2937'}}>The pause is set for a maximum of 32 hours, after which the code will become invalid</div>
              )}
              <div className="mt8">
                <div className="label">Additional text (350 chars)</div>
                <textarea className="textarea" readOnly value={codeNote}/>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
