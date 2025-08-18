import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest){
  const me = await getUserFromRequest(req);
  if(!me) return NextResponse.json({error:'Unauthorized'},{status:401});

  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get('id')||0);
  const head = searchParams.get('head')==='1';

  if(me.role==='ADMIN'){
    if(!userId) return NextResponse.json({messages:[]});
    if(head){
      const latest = await prisma.message.findFirst({
        where:{ OR:[{fromId:userId,toId:me.id},{fromId:me.id,toId:userId}] },
        orderBy:{ id:'desc' }, select:{ id:true }
      });
      return NextResponse.json({ latest: latest || null });
    }
    const messages = await prisma.message.findMany({
      where:{ OR:[{fromId:userId,toId:me.id},{fromId:me.id,toId:userId}] },
      orderBy:{ id:'asc' }
    });
    return NextResponse.json({ messages });
  }

  // USER
  const admin = await prisma.user.findFirst({ where:{ role:'ADMIN' }, select:{ id:true }});
  if(!admin) return NextResponse.json({ messages:[] });
  if(head){
    const latest = await prisma.message.findFirst({
      where:{ OR:[{fromId:me.id,toId:admin.id},{fromId:admin.id,toId:me.id}] },
      orderBy:{ id:'desc' }, select:{ id:true }
    });
    return NextResponse.json({ latest: latest || null });
  }
  const messages = await prisma.message.findMany({
    where:{ OR:[{fromId:me.id,toId:admin.id},{fromId:admin.id,toId:me.id}] },
    orderBy:{ id:'asc' }
  });
  return NextResponse.json({ messages });
}
