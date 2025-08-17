import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

function okRes(id:number, role:'ADMIN'|'USER') {
  const res = NextResponse.json({ ok: true, user: { id, role } });
  res.cookies.set('sid', `${id}|${role}`, {
    httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60*60*24*30
  });
  return res;
}

export async function POST(req: Request) {
  try {
    const { loginId, password } = await req.json();
    if (!loginId || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.ADMIN_USER;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (ADMIN_EMAIL && ADMIN_PASSWORD && String(loginId) === String(ADMIN_EMAIL) && String(password) === String(ADMIN_PASSWORD)) {
      let admin = await prisma.user.findFirst({ where: { loginId: ADMIN_EMAIL, role: 'ADMIN' } });
      if (!admin) {
        admin = await prisma.user.create({
          data: { loginId: ADMIN_EMAIL, role: 'ADMIN', loginPassword: ADMIN_PASSWORD }
        });
      }
      return okRes(admin.id, 'ADMIN');
    }

    const user = await prisma.user.findUnique({ where: { loginId }, include: { profile: true, codeConfig: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    let passOk = false;
    if (user.passwordHash) passOk = await bcrypt.compare(String(password), user.passwordHash);
    else if (user.loginPassword) passOk = String(password) === String(user.loginPassword);

    if (!passOk) return NextResponse.json({ error: 'Invalid login or password' }, { status: 401 });

    return okRes(user.id, user.role as 'ADMIN'|'USER');
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
