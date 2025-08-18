import { prisma } from './prisma';

const SID_COOKIES = ['sid', 'session', 'token'];
const UID_COOKIES = ['uid', 'userId'];

type Role = 'USER' | 'ADMIN';
export type SafeUser = { id: number; role: Role } | null;

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  cookieHeader.split(';').forEach(pair => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const k = pair.slice(0, idx).trim();
    const v = decodeURIComponent(pair.slice(idx + 1).trim());
    out[k] = v;
  });
  return out;
}

async function userByIdCookie(cookies: Record<string, string>): Promise<SafeUser> {
  for (const key of UID_COOKIES) {
    const v = cookies[key];
    if (v && /^\d+$/.test(v)) {
      const id = Number(v);
      const u = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
      if (u) return { id: u.id, role: u.role as Role };
    }
  }
  return null;
}

async function userBySessionCookie(cookies: Record<string, string>): Promise<SafeUser> {
  for (const key of SID_COOKIES) {
    const token = cookies[key];
    if (!token) continue;
    try {
      const sess = await prisma.session.findUnique({
        where: { token },
        select: { userId: true, user: { select: { id: true, role: true } } },
      } as any); 
      if (sess?.user) return { id: sess.user.id, role: sess.user.role as Role };
    } catch {
    }
  }
  return null;
}



export async function getUserFromRequest(req: Request): Promise<SafeUser> {
  const cookies = parseCookies(req.headers.get('cookie'));

  const bySid = await userBySessionCookie(cookies);
  if (bySid) return bySid;

  const byUid = await userByIdCookie(cookies);
  if (byUid) return byUid;

  return null;
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
