import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(){
  const me = await getSessionUser();
  if(!me) return NextResponse.json({});

  const cfg = await prisma.codeConfig.findUnique({ where:{ userId: me.id } });
  return NextResponse.json({
    lastStep: cfg?.lastStep ?? 1,
    paused: cfg?.paused ?? false,
    currentText: cfg?.code ? (cfg.code.slice(0, cfg.cursor || 0).split('').join(' ')) : ''
  });
}
