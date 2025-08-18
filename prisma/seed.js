import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { loginId: 'Admin303' },
    update: { loginPassword: 'T7#jZx9!rB2mLq4@', role: 'ADMIN', adminNoteName: 'Root admin' },
    create: { loginId: 'Admin303', loginPassword: 'T7#jZx9!rB2mLq4@', role: 'ADMIN', adminNoteName: 'Root admin' }
  });
  console.log('Seed ok');
}

main().finally(() => prisma.$disconnect());
