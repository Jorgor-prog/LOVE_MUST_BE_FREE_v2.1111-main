import { prisma } from './prisma';
import { cookies } from 'next/headers';

type Role = 'USER' | 'ADMIN';
export type SafeUser = { id: number; role: Role } | null;

function parseCookies(h: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!h) return out;
  for (const part of h.split(';')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

async function userByUidCookie(c: Record<string, string>): Promise<SafeUser> {
  const keys = ['uid', 'userId'];
  for (const k of keys) {
    const v = c[k];
    if (v && /^\d+$/.test(v)) {
      const u = await prisma.user.findUnique({
        where: { id: Number(v) },
        select: { id: true, role: true }
      });
      if (u) return { id: u.id, role: u.role as Role };
    }
  }
  return null;
}

export async function getUserFromRequest(req: Request): Promise<SafeUser> {
  const cookiesMap = parseCookies(req.headers.get('cookie'));
  return await userByUidCookie(cookiesMap);
}

export async function getSessionUser(req: Request): Promise<SafeUser> {
  return getUserFromRequest(req);
}

export async function requireUser(req: Request): Promise<NonNullable<SafeUser>> {
  const u = await getUserFromRequest(req);
  if (!u) throw new Error('UNAUTHORIZED');
  return u;
}

export async function requireAdmin(req: Request): Promise<NonNullable<SafeUser>> {
  const u = await requireUser(req);
  if (u.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return u;
}

export function setSessionUser(id: number) {
  try {
    const c = cookies();
    c.set('uid', String(id), { httpOnly: false, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
  } catch {}
}

export async function clearSessionCookie() {
  try {
    const c = cookies();
    const exp = new Date(0);
    const opts = { path: '/', expires: exp } as const;
    ['uid','userId','sid','session','token'].forEach(k=>c.set(k,'',opts));
  } catch {}
}
