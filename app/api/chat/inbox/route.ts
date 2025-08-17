import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ latestId: 0 });

  // простой индикатор: последняя запись, где адресат = текущий пользователь
  const last = await prisma.message.findFirst({
    where: { toId: me.id },
    orderBy: { id: 'desc' },
    select: { id: true }
  });

  return NextResponse.json({ latestId: last?.id ?? 0 });
}
