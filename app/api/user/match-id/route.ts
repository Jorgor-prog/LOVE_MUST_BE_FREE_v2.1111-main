import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req:Request){
  const me = await getSessionUser();
  if(!me) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
  const { idOnSite } = await req.json().catch(()=>({}));

  if(!idOnSite) return NextResponse.json({ ok:false });

  const user = await prisma.user.findFirst({
    where:{ id: me.id },
    select:{
      profile: { select:{ idOnSite:true, nameOnSite:true, residence:true, photoUrl:true } }
    }
  });

  const ok = (user?.profile?.idOnSite || '') === String(idOnSite || '');
  if(!ok) return NextResponse.json({ ok:false });

  return NextResponse.json({ ok:true, user: { profile: user?.profile } });
}
