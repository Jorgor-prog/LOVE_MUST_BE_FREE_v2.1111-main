'use client';

import { useEffect, useState, useRef } from 'react';

interface Message {
  id: number;
  from: 'user' | 'admin';
  text: string;
  createdAt: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/chat/thread', { cache: 'no-store' });
        const data = await res.json();
        setMessages(data || []);
      } catch (e) {
        console.error('Failed to load messages', e);
      }
    }
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      setInput('');
    } catch (e) {
      console.error('Failed to send message', e);
    }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh'}}>
      <div style={{flex:1,overflowY:'auto',padding:'16px',background:'#0f172a'}}>
        {messages.map((m) => (
          <div key={m.id} style={{marginBottom:10,textAlign:m.from==='user'?'right':'left'}}>
            <div style={{
              display:'inline-block',
              padding:'8px 12px',
              borderRadius:12,
              background:m.from==='user' ? '#38bdf8' : '#1f2937',
              color:'#fff',
              maxWidth:'70%',
              wordWrap:'break-word'
            }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>
      <div style={{display:'flex',borderTop:'1px solid #1f2937',padding:8,background:'#111827'}}>
        <input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          onKeyDown={(e)=>{ if(e.key==='Enter') sendMessage(); }}
          placeholder="Type your message..."
          style={{flex:1,padding:8,borderRadius:8,outline:'none',border:'1px solid #374151',background:'#1f2937',color:'#fff'}}
        />
        <button
          onClick={sendMessage}
          style={{marginLeft:8,padding:'8px 16px',borderRadius:8,background:'#38bdf8',color:'#0f172a',fontWeight:600}}
        >
          Send
        </button>
      </div>
    </div>
  );
}
