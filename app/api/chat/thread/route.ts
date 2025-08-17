import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request){
  const me = await getSessionUser();
  if(!me) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const { searchParams } = new URL(req.url);
  const peerId = Number(searchParams.get('peerId') || '0');
  if(!peerId) return NextResponse.json({ messages: [] });

  const messages = await prisma.message.findMany({
    where: { OR: [ { fromId: me.id, toId: peerId }, { fromId: peerId, toId: me.id } ] },
    orderBy: { id:'asc' },
    select: { id:true, fromId:true, toId:true, text:true, createdAt:true }
  });
  return NextResponse.json({ messages });
}
