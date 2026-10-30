'use client';
import { useState, useEffect } from 'react';
import { CATS } from '@/lib/content';
export function Works({ items }) {
  const [cat, setCat] = useState('all'), [open, setOpen] = useState(null);
  const list = items.filter(p => cat === 'all' || p.category === cat);
  useEffect(() => { const k = e => e.key === 'Escape' && setOpen(null); addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, []);
  return <>
    <div className="tabs" role="group" aria-label="Категории">{[['all','Все'], ...Object.entries(CATS)].map(([k, v]) => <button key={k} aria-pressed={cat === k} onClick={() => setCat(k)}>{v}</button>)}</div>
    {!list.length && <p className="mut">В этой категории пока нет работ.</p>}
    <div className="grid">{list.map(p => <button className="card" key={p.id} onClick={() => setOpen(p)} aria-label={`Открыть проект ${p.title}`}>
      <div className="im">{p.cover_url ? <img src={p.cover_url} alt={`Обложка проекта «${p.title}»`} loading="lazy" /> : <span className="mut">Временная заглушка — загрузите обложку</span>}</div>
      <h3>{p.title}</h3><span className="tag">{CATS[p.category]}</span> <span className="mut">{p.year || ''}</span></button>)}</div>
    {open && <div className="modal" role="dialog" aria-modal="true" aria-label={open.title} onClick={() => setOpen(null)}><div onClick={e => e.stopPropagation()}>
      <button className="btn o" autoFocus onClick={() => setOpen(null)}>Закрыть</button><h2>{open.title}</h2><p>{open.description}</p>
      {(open.media || []).map((m, i) => m.type === 'video' ? <video key={i} src={m.url} controls aria-label={m.alt || open.title} /> : <img key={i} src={m.url} alt={m.alt || `${open.title}, изображение ${i + 1}`} />)}
      {open.behance_url && <a className="btn" href={open.behance_url} target="_blank" rel="noopener noreferrer">Оригинал на Behance</a>}
    </div></div>}</>;
}
function useForm(url) {
  const [s, set] = useState('idle');
  const send = async e => { e.preventDefault(); set('busy'); const d = Object.fromEntries(new FormData(e.target));
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
    set(r.ok ? 'ok' : r.status === 429 ? 'limit' : 'err'); if (r.ok) e.target.reset(); };
  return [s, send];
}
const Msg = ({ s, ok }) => <p role="status" aria-live="polite">{s === 'ok' ? ok : s === 'limit' ? 'Слишком много отправок. Попробуйте позже.' : s === 'err' ? 'Не удалось отправить. Проверьте поля и повторите.' : ''}</p>;
export function ContactForm() {
  const [s, send] = useForm('/api/contact');
  return <form onSubmit={send}><input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <label>Имя<input name="name" required maxLength={80} /></label><label>Как связаться (email, Telegram, телефон)<input name="contact" required maxLength={120} /></label>
    <label>Тип проекта<select name="project_type"><option>Графический дизайн</option><option>Брендинг</option><option>Социальные сети</option><option>Motion / 3D</option><option>Другое</option></select></label>
    <label>Сообщение<textarea name="message" rows={5} required minLength={10} maxLength={3000} /></label>
    <button className="btn" disabled={s === 'busy'}>Отправить</button><Msg s={s} ok="Спасибо! Сообщение отправлено, я отвечу как можно скорее." /></form>;
}
export function ReviewForm() {
  const [s, send] = useForm('/api/review');
  return <form onSubmit={send}><input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <label>Имя<input name="name" required maxLength={80} /></label><label>Оценка<select name="rating" defaultValue="5">{[5,4,3,2,1].map(n => <option key={n}>{n}</option>)}</select></label>
    <label>Отзыв<textarea name="text" rows={4} required minLength={10} maxLength={1500} /></label><label>Ссылка или контакт (необязательно)<input name="contact" maxLength={120} /></label>
    <button className="btn" disabled={s === 'busy'}>Оставить отзыв</button><Msg s={s} ok="Спасибо! Отзыв появится на сайте после проверки." /></form>;
}
