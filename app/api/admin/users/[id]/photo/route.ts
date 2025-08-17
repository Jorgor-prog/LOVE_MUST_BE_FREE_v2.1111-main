import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';

const MAX_BYTES = 300 * 1024;
const ALLOWED = new Set(['image/jpeg','image/jpg','image/webp','image/png']);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: 'Unsupported type' }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Too large' }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,` + buf.toString('base64');

  await prisma.profile.upsert({
    where: { userId: Number(params.id) },
    update: { photoUrl: base64 },
    create: { userId: Number(params.id), photoUrl: base64 }
  });

  return NextResponse.json({ ok: true, photoUrl: base64 });
}
