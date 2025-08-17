import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function resolveMe(req: Request) {
  try {
    // Динамічно підхоплюємо будь-який наявний хелпер з lib/auth
    const mod: any = await import('@/lib/auth');
    if (typeof mod.getUserFromRequest === 'function') return await mod.getUserFromRequest(req);
    if (typeof mod.getSessionUser === 'function')   return await mod.getSessionUser(req);
    if (typeof mod.getUser === 'function')          return await mod.getUser(req);
    if (typeof mod.requireAdmin === 'function')     return await mod.requireAdmin(req); // може кидати — перехопимо нижче
  } catch (_) {}
  return null;
}

async function ensureAdmin(req: Request) {
  const me = await resolveMe(req);
  if (!me || me.role !== 'ADMIN') {
    return { ok: false as const, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { ok: true as const, me };
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const gate = await ensureAdmin(req);
  if (!gate.ok) return gate.res;

  const id = Number(params.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ user });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const gate = await ensureAdmin(req);
  if (!gate.ok) return gate.res;

  const id = Number(params.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await req.json().catch(() => ({} as any));
  const { loginId, password, role, profile } = body || {};

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        loginId: typeof loginId === 'string' ? loginId : undefined,
        password: typeof password === 'string' ? password : undefined, // ти просив зберігати «як є»
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
  const gate = await ensureAdmin(req);
  if (!gate.ok) return gate.res;

  const id = Number(params.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Delete failed' }, { status: 400 });
  }
}
