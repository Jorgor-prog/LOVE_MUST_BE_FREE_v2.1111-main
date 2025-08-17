import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function getSessionUser() {
  const cookie = (await cookies()).get('sid')?.value;
  if (!cookie) return null;
  const [idStr, role] = cookie.split('|');
  const id = Number(idStr);
  if (!id || !role) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { profile: true, codeConfig: true }
  });
  if (!user) return null;
  return user;
}
export async function setSessionCookie(userId: number, role: string) {
  const c = await cookies();
  c.set('sid', `${userId}|${role}`, { httpOnly: true, sameSite: 'lax', path: '/' });
}
export async function clearSessionCookie() {
  const c = await cookies();
  c.set('sid', '', { httpOnly: true, sameSite: 'lax', path: '/', expires: new Date(0) });
}
