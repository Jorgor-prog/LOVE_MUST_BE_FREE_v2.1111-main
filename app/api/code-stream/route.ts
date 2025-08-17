import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';

function sleep(ms:number){ return new Promise(res=>setTimeout(res, ms)); }

export async function GET() {
  const me = await getSessionUser();
  if(!me) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  // Убедимся, что есть конфиг
  let cfg = await prisma.codeConfig.upsert({
    where: { userId: me.id },
    update: {},
    create: { userId: me.id, code:'', emitIntervalSec:22, paused:false, cursor:0, lastStep:6 }
  });

  let text = cfg.code || '';
  let cursor = cfg.cursor || 0;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      async function send(type:string, value:any){
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({type, value})}\n\n`));
      }

      // помечаем шаг
      await prisma.codeConfig.update({ where:{ userId: me.id }, data:{ lastStep:6 } });

      try{
        while (true) {
          // каждый тик берем свежие настройки
          cfg = await prisma.codeConfig.findUnique({ where: { userId: me.id } }) as any;
          if (!cfg) break;

          if (cfg.paused) break;

          // если код изменился — подхватываем
          if ((cfg.code || '') !== text) {
            text = cfg.code || '';
          }

          // синхронизируем курсор, но не откатываем назад
          cursor = Math.max(cursor, cfg.cursor || 0);

          if (cursor >= text.length) break;

          const ch = text[cursor];
          await send('char', ch);

          cursor += 1;
          await prisma.codeConfig.update({ where:{ userId: me.id }, data:{ cursor } });

          const intervalMs = Math.max(1000, (cfg.emitIntervalSec || 22) * 1000);
          await sleep(intervalMs);
        }
      } finally {
        await send('done', true);
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  });
}
