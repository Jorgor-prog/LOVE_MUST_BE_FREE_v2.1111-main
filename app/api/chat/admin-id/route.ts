import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(){
  try{
    const admin = await prisma.user.findFirst({ where:{ role:'ADMIN' }, select:{ id:true } });
    return NextResponse.json({ id: admin?.id || 0 });
  }catch(e){
    return NextResponse.json({ id: 0 });
  }
}
