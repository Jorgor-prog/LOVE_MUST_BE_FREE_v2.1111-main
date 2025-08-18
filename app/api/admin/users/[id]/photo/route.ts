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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const me = await getMe(req);
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error:'Unauthorized' },{ status:401 });
  const id = Number(params.id||'0'); if(!Number.isFinite(id)) return NextResponse.json({ error:'Bad id' },{ status:400 });

  const form = await req.formData().catch(()=>null);
  const file = form?.get('photo') as File | null;
  if(!file) return NextResponse.json({ error:'No file' },{ status:400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const b64 = buf.toString('base64');
  const mime = file.type || 'image/png';
  const dataUrl = `data:${mime};base64,${b64}`;

  try{
    await prisma.profile.upsert({
      where:{ userId:id },
      update:{ photoUrl: dataUrl },
      create:{ userId:id, photoUrl: dataUrl }
    });
  }catch{
    return NextResponse.json({ error:'MISSING_TABLES' },{ status:409 });
  }

  return NextResponse.json({ ok:true });
}
