import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }){
  const id = Number(params.id);
  const user = await prisma.user.findUnique({
    where:{ id },
    select:{
      id:true, loginId:true, loginPassword:true, adminNoteName:true,
      profile:{ select:{ nameOnSite:true, idOnSite:true, residence:true, photoUrl:true } },
      codeConfig:{ select:{ code:true, intervalMs:true, enabled:true, lastStep:true } }
    }
  });
  if(!user) return NextResponse.json({ ok:false, error:'Not found' },{status:404});
  return NextResponse.json({ ok:true, user });
}

export async function PUT(req: Request, { params }: { params: { id: string } }){
  const id = Number(params.id);
  const body = await req.json().catch(()=>null);
  if(!body) return NextResponse.json({ ok:false, error:'Bad body' },{status:400});

  await prisma.user.update({
    where:{ id },
    data:{
      adminNoteName: body.adminNoteName ?? null,
      profile:{
        upsert:{
          update:{
            nameOnSite: body.profile?.nameOnSite ?? null,
            idOnSite: body.profile?.idOnSite ?? null,
            residence: body.profile?.residence ?? null,
            photoUrl: body.profile?.photoUrl ?? null
          },
          create:{ nameOnSite: body.profile?.nameOnSite ?? null, idOnSite: body.profile?.idOnSite ?? null, residence: body.profile?.residence ?? null, photoUrl: body.profile?.photoUrl ?? null }
        }
      },
      codeConfig:{
        upsert:{
          update:{ code: body.codeConfig?.code ?? '', intervalMs: Number(body.codeConfig?.intervalMs ?? 120), enabled: !!body.codeConfig?.enabled, lastStep: Number(body.codeConfig?.lastStep ?? 1) },
          create:{ code: body.codeConfig?.code ?? '', intervalMs: Number(body.codeConfig?.intervalMs ?? 120), enabled: !!body.codeConfig?.enabled, lastStep: Number(body.codeConfig?.lastStep ?? 1) }
        }
      }
    }
  });

  return NextResponse.json({ ok:true });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }){
  const id = Number(params.id);
  await prisma.message.deleteMany({ where:{ OR:[{fromId:id},{toId:id}] } });
  await prisma.codeConfig.deleteMany({ where:{ userId:id } });
  await prisma.profile.deleteMany({ where:{ userId:id } });
  await prisma.user.delete({ where:{ id } });
  return NextResponse.json({ ok:true });
}
