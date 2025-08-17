import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

const LIMIT_PER_PAIR = 500;

export async function POST(req: Request){
  const me = await getSessionUser();
  if(!me) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const { toId, text } = await req.json();
  if(!toId || !text?.trim()) return NextResponse.json({ error:'Bad request' }, { status:400 });

  const msg = await prisma.message.create({
    data: { fromId: me.id, toId: Number(toId), text: String(text) }
  });

  // Тримминг старых сообщений для пары
  const pairWhere = { OR: [ { fromId: me.id, toId: Number(toId) }, { fromId: Number(toId), toId: me.id } ] };
  const total = await prisma.message.count({ where: pairWhere });
  if (total > LIMIT_PER_PAIR) {
    const toDeleteCount = total - LIMIT_PER_PAIR;
    const olds = await prisma.message.findMany({
      where: pairWhere,
      orderBy: { id: 'asc' },
      select: { id: true },
      take: toDeleteCount
    });
    if (olds.length) {
      await prisma.message.deleteMany({ where: { id: { in: olds.map(o => o.id) } } });
    }
  }

  return NextResponse.json({ message: msg });
}
