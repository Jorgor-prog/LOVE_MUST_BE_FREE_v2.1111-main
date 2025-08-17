import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const u = await getSessionUser();
    if (!u) return NextResponse.json({ user: null });

    // Отдаем безопасный срез юзера
    const user = {
      id: u.id,
      role: u.role,
      isOnline: u.isOnline,
      adminNoteName: u.adminNoteName || '',
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      profile: u.profile ? {
        nameOnSite: u.profile.nameOnSite || '',
        idOnSite: u.profile.idOnSite || '',
        residence: u.profile.residence || '',
        photoUrl: u.profile.photoUrl || null,
      } : null,
      codeConfig: u.codeConfig ? {
        code: u.codeConfig.code || '',
        emitIntervalSec: u.codeConfig.emitIntervalSec ?? 22,
        paused: !!u.codeConfig.paused,
        cursor: u.codeConfig.cursor ?? 0,
        lastStep: u.codeConfig.lastStep ?? 1,
      } : null
    };

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
