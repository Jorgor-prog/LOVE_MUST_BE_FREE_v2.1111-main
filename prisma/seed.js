import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const ADMIN_LOGIN_ID = process.env.ADMIN_LOGIN_ID || 'Admin303';
const ADMIN_LOGIN_PASSWORD = process.env.ADMIN_PASSWORD || 'T7#jZx9!rB2mLq4@';

async function main() {
  await prisma.user.upsert({
    where: { loginId: ADMIN_LOGIN_ID },
    update: {
      loginPassword: ADMIN_LOGIN_PASSWORD,
      role: 'ADMIN',
    },
    create: {
      loginId: ADMIN_LOGIN_ID,
      loginPassword: ADMIN_LOGIN_PASSWORD,
      role: 'ADMIN',
    },
  });
  console.log('[seed] admin ensured:', ADMIN_LOGIN_ID);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
