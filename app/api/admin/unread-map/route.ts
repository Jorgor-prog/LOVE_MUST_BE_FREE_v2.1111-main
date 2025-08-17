import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(){
  const me = await getSessionUser();
  if(!me || me.role !== 'ADMIN') return NextResponse.json({});

  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    select: { id: true }
  });

  const map: Record<number, boolean> = {};
  for (const u of users){
    const last = await prisma.message.findFirst({
      where: { OR: [ { fromId: u.id, toId: me.id }, { fromId: me.id, toId: u.id } ] },
      orderBy: { id: 'desc' },
      select: { fromId: true }
    });
    map[u.id] = !!last && last.fromId === u.id; // true — последним писал пользователь
  }
  return NextResponse.json({ map });
}
