import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function getMe(req: Request): Promise<{ id:number; role:'ADMIN'|'USER'}|null> {
  try {
    const mod: any = await import('@/lib/auth');
    if (typeof mod.getUserFromRequest === 'function') return await mod.getUserFromRequest(req);
    if (typeof mod.getSessionUser   === 'function')   return await mod.getSessionUser(req);
    if (typeof mod.getUser          === 'function')    return await mod.getUser(req);
  } catch {}
  return null;
}

export async function GET(req: Request){
  const me = await getMe(req);
  if(!me || me.role!=='ADMIN') return NextResponse.json({ error:'Unauthorized' },{ status:401 });

  const msgs = await prisma.message.findMany({
    where:{ toId: me.id },
    select:{ id:true, fromId:true, createdAt:true },
    orderBy:{ createdAt:'desc' },
    take: 500
  });

  const map: Record<number, number> = {};
  for(const m of msgs){ if(!map[m.fromId]) map[m.fromId] = m.id; }
  const latest = msgs[0]?.id || 0;

  return NextResponse.json({ map, latest });
}
