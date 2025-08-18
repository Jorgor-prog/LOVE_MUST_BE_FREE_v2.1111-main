import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(){
  const last = await prisma.message.groupBy({
    by:['fromId'],
    _max:{ id:true },
    where:{},
  });
  const map: Record<number, number> = {};
  last.forEach(r=>{ map[r.fromId]=r._max.id||0; });
  return NextResponse.json(map);
}
