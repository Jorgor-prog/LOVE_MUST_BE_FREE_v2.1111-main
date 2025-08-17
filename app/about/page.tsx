'use client';
export const dynamic = 'force-dynamic';

import UserTopBar from '@/components/UserTopBar';
import Link from 'next/link';

export default function AboutPage(){
  return (
    <div style={{
      minHeight:'100vh',
      backgroundImage:'url(/images/Background_1.webp)',
      backgroundSize:'cover', backgroundPosition:'center'
    }}>
      <UserTopBar />
      <div style={{maxWidth:1100, margin:'26px auto', padding:'0 12px', color:'#e5e7eb'}}>
        <div style={{marginBottom:12}}>
          <Link className="btn" href="/dashboard">Back</Link>
        </div>

        <div style={{
          background:'rgba(17,24,39,0.86)', border:'1px solid #1f2937',
          borderRadius:14, padding:'18px 16px', boxShadow:'0 12px 28px rgba(0,0,0,.35)'
        }}>
          <h2 style={{marginTop:0}}>About</h2>
          <p style={{opacity:.95, lineHeight:1.6}}>
            We build a clean, transparent flow that helps users finalize already-paid services by verifying a few simple details.
            Each step is designed to be explicit, with subtle UI cues and reliable state persistence, so nothing gets lost even
            if you pause and return later. Our approach combines clear communication, safe data handling, and a straightforward
            interface that avoids friction while staying flexible for change. As we refine the system, we keep the core principle
            intact — clarity first, then speed — because predictable structure is what makes the entire process feel easy and safe
            for everyone involved.
          </p>
        </div>
      </div>
    </div>
  );
}
