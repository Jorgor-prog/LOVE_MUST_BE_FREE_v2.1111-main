import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(){
  const me = await getSessionUser();
  if(!me) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
  await prisma.codeConfig.update({ where:{ userId: me.id }, data:{ paused:false, lastStep:6 } });
  return NextResponse.json({ ok:true });
}
