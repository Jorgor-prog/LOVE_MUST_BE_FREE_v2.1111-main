import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
  const me = await getSessionUser();
  if(!me) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const admin = await prisma.user.findFirst({ where:{ role:'ADMIN' } });
  if(!admin) return NextResponse.json({ messages: [] });

  const { searchParams } = new URL(req.url);
  const headOnly = searchParams.get('head') === '1';

  if(headOnly){
    const last = await prisma.message.findFirst({
      where: { OR: [ { fromId: me.id, toId: admin.id }, { fromId: admin.id, toId: me.id } ] },
      orderBy: { id:'desc' },
      select: { id:true, fromId:true }
    });
    const fromRole = last?.fromId === admin.id ? 'ADMIN' : (last ? 'USER' : null);
    return NextResponse.json({ latest: last ? { id:last.id, fromRole } : null });
  }

  const messages = await prisma.message.findMany({
    where: { OR: [ { fromId: me.id, toId: admin.id }, { fromId: admin.id, toId: me.id } ] },
    orderBy: { id:'asc' },
    select: { id:true, fromId:true, toId:true, text:true, createdAt:true }
  });

  return NextResponse.json({ messages });
}
