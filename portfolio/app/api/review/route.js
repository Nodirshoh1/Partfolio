import { guard } from '../_guard';
export async function POST(req) {
  const b = await req.json(); const name = (b.name||'').trim().slice(0,80), text = (b.text||'').trim().slice(0,1500), rating = +b.rating;
  if (!name || text.length < 10 || !(rating >= 1 && rating <= 5)) return Response.json({ error: 'Проверьте поля' }, { status: 400 });
  const g = await guard(req, 'review', b); if (!g.ok) return Response.json({ ok: g.status === 200 }, { status: g.status });
  await g.db.from('reviews').insert({ name, text, rating, contact: (b.contact||'').slice(0,120) || null, status: 'pending' });
  return Response.json({ ok: true });
}
