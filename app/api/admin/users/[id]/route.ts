import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const me = await getUserFromRequest(req);
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const me = await getUserFromRequest(req);
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({} as any));
  const { loginId, password, role, profile } = body || {};

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        loginId: typeof loginId === 'string' ? loginId : undefined,
        password: typeof password === 'string' ? password : undefined, // ТУТ повертаємо «як є», бо тобі потрібно бачити пароль
        role: role === 'ADMIN' || role === 'USER' ? role : undefined,
        profile: profile
          ? {
              upsert: {
                create: {
                  nameOnSite: profile.nameOnSite ?? undefined,
                  idOnSite: profile.idOnSite ?? undefined,
                  residence: profile.residence ?? undefined,
                  photoUrl: profile.photoUrl ?? undefined,
                },
                update: {
                  nameOnSite: profile.nameOnSite ?? undefined,
                  idOnSite: profile.idOnSite ?? undefined,
                  residence: profile.residence ?? undefined,
                  photoUrl: profile.photoUrl ?? undefined,
                },
              },
            }
          : undefined,
      },
      include: { profile: true },
    });

    return NextResponse.json({ user: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const me = await getUserFromRequest(req);
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Delete failed' }, { status: 400 });
  }
}
