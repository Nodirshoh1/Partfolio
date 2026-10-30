import { guard } from '../_guard';
export async function POST(req) {
  const b = await req.json(); const name = (b.name||'').trim().slice(0,80), contact = (b.contact||'').trim().slice(0,120), message = (b.message||'').trim().slice(0,3000);
  if (!name || !contact || message.length < 10) return Response.json({ error: 'Проверьте поля' }, { status: 400 });
  const g = await guard(req, 'contact', b); if (!g.ok) return Response.json({ ok: g.status === 200 }, { status: g.status });
  await g.db.from('messages').insert({ name, contact, message, project_type: (b.project_type||'').slice(0,60) });
  return Response.json({ ok: true });
}
