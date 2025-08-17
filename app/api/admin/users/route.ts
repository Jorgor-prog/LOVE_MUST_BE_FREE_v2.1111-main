import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// універсальна перевірка адміна (під різні реалізації auth)
async function getMe(req: Request): Promise<{ id:number; role:'ADMIN'|'USER'}|null> {
  try {
    const mod: any = await import('@/lib/auth');
    if (typeof mod.getUserFromRequest === 'function') return await mod.getUserFromRequest(req);
    if (typeof mod.getSessionUser   === 'function')   return await mod.getSessionUser(req);
    if (typeof mod.getUser          === 'function')    return await mod.getUser(req);
  } catch {}
  return null;
}

// ---- GET /api/admin/users  --------------------------------------------------
export async function GET(req: Request) {
  const me = await getMe(req);
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error:'Unauthorized' },{ status:401 });

  const items = await prisma.user.findMany({
    orderBy: { id: 'desc' },
    select: {
      id: true,
      loginId: true,
      loginPassword: true,
      role: true,
      adminNoteName: true,
      createdAt: true,
    }
  });

  return NextResponse.json({ items });
}

// ---- POST /api/admin/users  (тільки adminNoteName; логін/пароль генеруємо) --
export async function POST(req: Request) {
  const me = await getMe(req);
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error:'Unauthorized' },{ status:401 });

  const body = await req.json().catch(()=>null) as { adminNoteName?: string } | null;
  const note = (body?.adminNoteName || '').trim();

  // helpers
  function randomDigits(n:number){ return Array.from({length:n},()=>Math.floor(Math.random()*10)).join(''); }
  function randomPassword(len=14){
    const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const sym = '!@#$%^&*';
    let s = '';
    for(let i=0;i<len-2;i++) s += abc[Math.floor(Math.random()*abc.length)];
    s += sym[Math.floor(Math.random()*sym.length)];
    s += '9';
    return s;
  }

  // генеруємо у форматі uXXXXXX (унікальність гарантуємо)
  let loginId = '';
  for (let i=0;i<10;i++){
    const cand = 'u' + randomDigits(6);
    const exists = await prisma.user.findUnique({ where: { loginId: cand } }).catch(()=>null);
    if (!exists) { loginId = cand; break; }
  }
  if (!loginId) return NextResponse.json({ error:'Could not generate login' },{ status:500 });

  const loginPassword = randomPassword(14);

  const created = await prisma.user.create({
    data: {
      loginId,
      loginPassword,
      role: 'USER',
      adminNoteName: note || null
      // passwordHash: null  // якщо захочеш хешувати — додамо потім
    },
    select: {
      id: true, loginId: true, loginPassword: true, role: true, adminNoteName: true, createdAt:true
    }
  });

  return NextResponse.json({ created });
}
