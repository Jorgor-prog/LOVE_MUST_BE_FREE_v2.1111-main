import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

// утилита генерации логина/пароля
function genLogin() {
  const n = Math.floor(10000 + Math.random() * 90000);
  return `user${n}`;
}
function genPassword() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '#$%!@?';
  const pick = (s:string)=>s[Math.floor(Math.random()*s.length)];
  let p = '';
  for (let i=0;i<4;i++) p+=pick(letters);
  for (let i=0;i<3;i++) p+=pick(digits);
  for (let i=0;i<2;i++) p+=pick(symbols);
  return p.split('').sort(()=>Math.random()-0.5).join('');
}

// GET /api/admin/users — список без админа
export async function GET() {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    orderBy: { id: 'desc' },
    select: {
      id: true, loginId: true, loginPassword: true, adminNoteName: true,
      isOnline: true, updatedAt: true,
      profile: { select: { nameOnSite: true, idOnSite: true, residence: true, photoUrl: true } },
      codeConfig: { select: { code: true, emitIntervalSec: true, paused: true } }
    }
  });
  // фронт ожидает поле password
  const shaped = users.map(u => ({ ...u, password: u.loginPassword ?? null }));
  return NextResponse.json({ users: shaped });
}

// POST /api/admin/users — создать
export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const adminNoteName = String(body?.adminNoteName ?? '');

  const loginId = genLogin();
  const password = genPassword();

  const user = await prisma.user.create({
    data: {
      role: 'USER',
      loginId,
      loginPassword: password, // показываемый пароль
      adminNoteName,
      profile: { create: {} },
      codeConfig: { create: {} }
    },
    include: {
      profile: true,
      codeConfig: true
    }
  });

  return NextResponse.json({
    user: {
      id: user.id,
      loginId: user.loginId,
      password,                           // для алерта на фронте
      adminNoteName: user.adminNoteName,
      profile: user.profile,
      codeConfig: user.codeConfig,
      isOnline: user.isOnline,
      updatedAt: user.updatedAt
    }
  });
}
