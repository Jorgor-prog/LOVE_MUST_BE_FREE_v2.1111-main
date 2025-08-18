import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params:{id:string} }){
  const id = Number(params.id);
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if(!file) return NextResponse.json({ ok:false, error:'No file' },{status:400});
  const array = new Uint8Array(await file.arrayBuffer());
  const hash = createHash('sha1').update(array).digest('hex').slice(0,12);
  const ext = (file.name.split('.').pop()||'jpg').toLowerCase();
  const name = `u_${id}_${hash}.${ext}`;
  const buf = Buffer.from(array);
  const fs = await import('fs');
  const path = `./public/uploads/${name}`;
  await fs.promises.mkdir('./public/uploads',{recursive:true});
  await fs.promises.writeFile(path, buf);
  const url = `/uploads/${name}`;
  await prisma.profile.upsert({
    where:{ userId:id },
    update:{ photoUrl:url },
    create:{ userId:id, photoUrl:url }
  });
  return NextResponse.json({ ok:true, url });
}
