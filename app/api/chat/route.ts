import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: Request) {
  const me = await getSessionUser();
  if(!me) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const body = await req.json().catch(()=>({}));
  const text = String(body?.text || '').slice(0, 2000);

  if(body?.toAdmin){
    const admin = await prisma.user.findFirst({ where:{ role:'ADMIN' } });
    if(!admin) return NextResponse.json({ error:'No admin' }, { status:400 });
    const msg = await prisma.message.create({ data: { fromId: me.id, toId: admin.id, text } });
    return NextResponse.json({ message: msg });
  }

  const toId = Number(body?.toId || 0);
  if(!toId || !text) return NextResponse.json({ error:'Bad request' }, { status:400 });
  const msg = await prisma.message.create({ data: { fromId: me.id, toId, text } });
  return NextResponse.json({ message: msg });
}
