import crypto from 'crypto';
import { sbAdminServer } from '@/lib/sb';
export async function guard(req, kind, body) {
  if (body.website) return { ok: false, status: 200 }; // honeypot: боты заполняют скрытое поле — молча игнорируем
  const ip = (req.headers.get('x-forwarded-for') || 'x').split(',')[0].trim();
  const h = crypto.createHash('sha256').update(ip + process.env.IP_SALT).digest('hex');
  const db = sbAdminServer();
  const since = new Date(Date.now() - 3600e3).toISOString();
  const { count } = await db.from('submissions').select('*', { count: 'exact', head: true }).eq('ip_hash', h).eq('kind', kind).gte('created_at', since);
  if (count >= 3) return { ok: false, status: 429 };
  await db.from('submissions').insert({ ip_hash: h, kind });
  return { ok: true, db };
}
