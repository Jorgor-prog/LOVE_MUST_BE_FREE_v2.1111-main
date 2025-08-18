import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(){
  const items = await prisma.user.findMany({
    select:{ id:true, loginId:true, adminNoteName:true, role:true },
    orderBy:{ id:'desc' }
  });
  return NextResponse.json({ items });
}

function gen(n:number){ const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnopqrstuvwxyz'; let s=''; for(let i=0;i<n;i++) s+=alphabet[Math.floor(Math.random()*alphabet.length)]; return s; }

export async function POST(){
  const loginId = `u_${Date.now().toString(36)}${gen(3)}`;
  const password = gen(12);
  const user = await prisma.user.create({
    data:{
      loginId,
      loginPassword: password,
      role:'USER',
      profile:{ create:{} },
      codeConfig:{ create:{ code:'', intervalMs:120, enabled:true, lastStep:1 } }
    },
    select:{ id:true, loginId:true }
  });
  return NextResponse.json({ ok:true, id:user.id, loginId:user.loginId, password });
}
