'use client';
export const dynamic = 'force-dynamic';

import UserTopBar from '@/components/UserTopBar';
import Link from 'next/link';

const REVIEWS = [
  'Эти огурцы удивляют гармонией соли и хруста, будто повар слышал каждую мою мысль о балансе вкуса.',
  'Лёгкая кислинка, уверенная хрусткость и чистый вкус — идеальный спутник к простому ужину.',
  'Секрет этих огурцов в честности рецепта: ничего лишнего, всё на своём месте и с правильной мерой.',
  'Хрустят так, что хочется делиться банкой, но рука не поднимается — слишком уж хороши.',
  'Послевкусие чистое и яркое, как первый глоток холодной воды после жары. Прямо в точку.',
  'Это тот редкий случай, когда хочется брать вторую банку заранее, чтобы точно хватило всем.',
  'Сбалансированные, понятные и запоминающиеся — такие огурцы хочется рекомендовать без оговорок.'
];

export default function ReviewsPage(){
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
          <h2 style={{marginTop:0}}>Reviews</h2>
          <div style={{display:'grid', gap:12}}>
            {REVIEWS.map((t,i)=>(
              <div key={i} style={{background:'#0b1220', border:'1px solid #1f2937', borderRadius:10, padding:'12px 14px'}}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
