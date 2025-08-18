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

function badId(idStr:string){
  const id = Number(idStr);
  return !Number.isFinite(id) ? null : id;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const me = await getMe(req);
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error:'Unauthorized' },{ status:401 });
  const id = badId(params.id); if (id===null) return NextResponse.json({ error:'Bad id' },{ status:400 });

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id:true, loginId:true, loginPassword:true, role:true, adminNoteName:true, createdAt:true,
      profile: { select: { nameOnSite:true, idOnSite:true, residence:true, photoUrl:true } },
      codeConfig: { select: { code:true, intervalMs:true, lastStep:true, enabled:true } }
    }
  });

  if(!user) return NextResponse.json({ error:'Not found' },{ status:404 });
  if(user.role !== 'USER') return NextResponse.json({ error:'Only USER can be managed here' },{ status:403 }); // <-- не даємо керувати адмінами

  return NextResponse.json({ user });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const me = await getMe(req);
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error:'Unauthorized' },{ status:401 });
  const id = badId(params.id); if (id===null) return NextResponse.json({ error:'Bad id' },{ status:400 });

  const who = await prisma.user.findUnique({ where:{ id }, select:{ role:true }});
  if(!who) return NextResponse.json({ error:'Not found' },{ status:404 });
  if(who.role !== 'USER') return NextResponse.json({ error:'Only USER can be edited' },{ status:403 });

  const body = await req.json().catch(()=>null) as {
    profile?: { nameOnSite?:string; idOnSite?:string; residence?:string; photoUrl?:string };
    codeConfig?: { code?:string; intervalMs?:number; enabled?:boolean };
  } | null;
  if(!body) return NextResponse.json({ error:'Bad body' },{ status:400 });

  if(body.profile){
    const p = body.profile;
    await prisma.profile.upsert({
      where: { userId: id },
      update: { nameOnSite: p.nameOnSite ?? null, idOnSite: p.idOnSite ?? null, residence: p.residence ?? null, photoUrl: p.photoUrl ?? null },
      create: { userId: id, nameOnSite: p.nameOnSite ?? null, idOnSite: p.idOnSite ?? null, residence: p.residence ?? null, photoUrl: p.photoUrl ?? null }
    });
  }
  if(body.codeConfig){
    const c = body.codeConfig;
    await prisma.codeConfig.upsert({
      where: { userId: id },
      update: { code: c.code ?? '', intervalMs: typeof c.intervalMs==='number'? c.intervalMs:120, enabled: c.enabled ?? true },
      create: { userId: id, code: c.code ?? '', intervalMs: typeof c.intervalMs==='number'? c.intervalMs:120, enabled: c.enabled ?? true, lastStep:1 }
    });
  }
  return NextResponse.json({ ok:true });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const me = await getMe(req);
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error:'Unauthorized' },{ status:401 });
  const id = badId(params.id); if (id===null) return NextResponse.json({ error:'Bad id' },{ status:400 });

  const who = await prisma.user.findUnique({ where:{ id }, select:{ role:true }});
  if(!who) return NextResponse.json({ error:'Not found' },{ status:404 });
  if(who.role !== 'USER') return NextResponse.json({ error:'Cannot delete ADMIN' },{ status:403 }); // <-- страховка

  await prisma.$transaction([
    prisma.message.deleteMany({ where:{ OR:[ { fromId:id }, { toId:id } ] } }),
    prisma.profile.deleteMany({ where:{ userId:id } }),
    prisma.codeConfig.deleteMany({ where:{ userId:id } }),
    prisma.user.delete({ where:{ id } }),
  ]);

  return NextResponse.json({ ok:true });
}
