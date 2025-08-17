import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const me = await getSessionUser();
  if (me) {
    await prisma.user.update({ where: { id: me.id }, data: { isOnline: true } });
  }
  return NextResponse.json({ ok: true });
}
