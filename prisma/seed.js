import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const adminLogin = process.env.ADMIN_LOGIN || "Admin303";
  const adminPassword = process.env.ADMIN_PASSWORD || "T7#jZx9!rB2mLq4@";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { loginId: adminLogin },
    update: { role: "ADMIN", passwordHash, loginPassword: null },
    create: { loginId: adminLogin, role: "ADMIN", passwordHash, loginPassword: null }
  });
  console.log("Admin ensured:", adminLogin);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
