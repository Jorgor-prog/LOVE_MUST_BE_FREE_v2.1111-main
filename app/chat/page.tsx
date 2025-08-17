
  async function loadAdmin(){
    const j = await fetch('/api/chat/admin-id', { cache:'no-store' }).then(x=>x.json()).catch(()=>null);

    const raw = (j && (j.id ?? j.adminId)) as any;
    const id = Number(raw || 0);
    setAdminId(Number.isFinite(id) ? id : 0);
    return Number.isFinite(id) ? id : 0;
  }


  async function send(){
    const to = adminId || (await loadAdmin());
    if(!to || !text.trim()) return;
    const payload = { toId: to, text: text.trim() };
    const r = await fetch('/api/chat/send', {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    }).catch(()=>null);
    if(!r || !r.ok){

    }
    setText('');
    await loadFull();
  }

        <div style={{display:'flex', gap:8, marginTop:8}}>
          <input
            value={text}
            onChange={e=>setText(e.currentTarget.value)}
            placeholder="Write a message…"
            style={{flex:1, background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}} />
          <button className="btn" onClick={send} style={{border:'1px solid #38bdf8', color:'#38bdf8'}}>Send</button>
        </div>

