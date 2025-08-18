import { prisma } from './prisma';

type Role = 'USER' | 'ADMIN';
type SafeUser = { id: number; role: Role } | null;

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
  const cookies = parseCookies(req.headers.get('cookie'));
  return await userByUidCookie(cookies);
}
