import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest){
  const me = await getUserFromRequest(req);
  if(!me || me.role!=='USER'){
    return new Response('Unauthorized',{status:401});
  }

  const ts = new TransformStream();
  const writer = ts.writable.getWriter();

  const enc = (obj:any)=>`data: ${JSON.stringify(obj)}\n\n`;
  const write = (obj:any)=>writer.write(new TextEncoder().encode(enc(obj)));

  const headers = {
    'Content-Type':'text/event-stream',
    'Cache-Control':'no-cache, no-transform',
    'Connection':'keep-alive',
  } as Record<string,string>;

  let i = 0;
  const code = (await prisma.codeConfig.findUnique({ where:{ userId: me.id } }))?.seed || 'ABCDEFG123456';
  const tick = setInterval(()=>{
    if(i>=code.length){
      write({type:'end'}); clearInterval(tick); writer.close(); return;
    }
    write({type:'char', value: code[i]}); i++;
  }, 120);

  return new Response(ts.readable,{ headers });
}
