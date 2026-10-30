'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CATS } from '@/lib/content';
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const EMPTY = { title: '', description: '', category: 'graphic', year: new Date().getFullYear(), cover_url: '', media: [], behance_url: '', sort_order: 0, published: false };
export default function Admin() {
  const [user, setUser] = useState(null), [err, setErr] = useState(''), [ps, setPs] = useState([]), [rs, setRs] = useState([]), [ed, setEd] = useState(null), [st, setSt] = useState({});
  const load = async () => { setPs((await sb.from('projects').select('*').order('sort_order')).data || []); setRs((await sb.from('reviews').select('*').order('created_at', { ascending: false })).data || []);
    const o = {}; ((await sb.from('settings').select('*')).data || []).forEach(r => o[r.key] = r.value); setSt(o); };
  useEffect(() => { sb.auth.getUser().then(({ data }) => { setUser(data.user); data.user && load(); }); }, []);
  const login = async e => { e.preventDefault(); const f = new FormData(e.target); const { data, error } = await sb.auth.signInWithPassword({ email: f.get('email'), password: f.get('password') });
    if (error) return setErr('Неверный email или пароль'); setUser(data.user); load(); };
  const up = async (file) => { const path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`; const { error } = await sb.storage.from('media').upload(path, file); if (error) { alert(error.message); return null; } return sb.storage.from('media').getPublicUrl(path).data.publicUrl; };
  const save = async e => { e.preventDefault(); const { id, created_at, ...row } = ed; const r = id ? await sb.from('projects').update(row).eq('id', id) : await sb.from('projects').insert(row); if (r.error) return alert(r.error.message); setEd(null); load(); };
  const del = async (t, id) => { if (confirm('Удалить безвозвратно?')) { await sb.from(t).delete().eq('id', id); load(); } };
  const mod = async (id, status) => { await sb.from('reviews').update({ status }).eq('id', id); load(); };
  const saveSt = async () => { await sb.from('settings').upsert(Object.entries(st).map(([key, value]) => ({ key, value }))); alert('Сохранено'); };
  if (!user) return <main className="w"><h1 style={{ fontSize: 48 }}>Вход</h1><form onSubmit={login} style={{ maxWidth: 400 }}><label>Email<input name="email" type="email" required autoComplete="username" /></label><label>Пароль<input name="password" type="password" required autoComplete="current-password" /></label><button className="btn">Войти</button><p role="alert">{err}</p></form></main>;
  const set = (k, v) => setEd({ ...ed, [k]: v });
  return <main className="w"><h1 style={{ fontSize: 48 }}>Админ-панель</h1><button className="btn o" onClick={() => sb.auth.signOut().then(() => setUser(null))}>Выйти</button>
    <h2>Проекты</h2><button className="btn" onClick={() => setEd({ ...EMPTY })}>+ Новый проект</button>
    {ed && <form onSubmit={save} style={{ border: '1px solid #111', padding: 20, margin: '16px 0' }}>
      <label>Название<input value={ed.title} onChange={e => set('title', e.target.value)} required /></label><label>Описание<textarea rows={4} value={ed.description || ''} onChange={e => set('description', e.target.value)} /></label>
      <label>Категория<select value={ed.category} onChange={e => set('category', e.target.value)}>{Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <label>Год<input type="number" value={ed.year || ''} onChange={e => set('year', +e.target.value)} /></label><label>Порядок<input type="number" value={ed.sort_order} onChange={e => set('sort_order', +e.target.value)} /></label>
      <label>Обложка{ed.cover_url && <img src={ed.cover_url} alt="Текущая обложка" width="120" />}<input type="file" accept="image/*" onChange={async e => { const u = e.target.files[0] && await up(e.target.files[0]); u && set('cover_url', u); }} /></label>
      <label>Изображения и видео<input type="file" accept="image/*,video/*" multiple onChange={async e => { const add = []; for (const f of e.target.files) { const u = await up(f); u && add.push({ url: u, type: f.type.startsWith('video') ? 'video' : 'image', alt: '' }); } set('media', [...ed.media, ...add]); }} /></label>
      {ed.media.map((m, i) => <div key={i}>{m.type}: <input value={m.alt} placeholder="Подпись (alt)" onChange={e => set('media', ed.media.map((x, j) => j === i ? { ...x, alt: e.target.value } : x))} /><button type="button" onClick={() => set('media', ed.media.filter((_, j) => j !== i))}>Убрать</button></div>)}
      <label>Ссылка на Behance (необязательно)<input value={ed.behance_url || ''} onChange={e => set('behance_url', e.target.value)} /></label>
      <label><input type="checkbox" style={{ width: 'auto' }} checked={ed.published} onChange={e => set('published', e.target.checked)} /> Опубликован</label>
      <button className="btn">Сохранить</button><button type="button" className="btn o" onClick={() => setEd(null)}>Отмена</button></form>}
    {ps.map(p => <div className="rev" key={p.id}><strong>{p.title}</strong> · {CATS[p.category]} · порядок {p.sort_order} · {p.published ? 'опубликован' : 'черновик'} <button onClick={() => setEd(p)}>Изменить</button> <button onClick={() => del('projects', p.id)}>Удалить</button></div>)}
    <h2>Отзывы</h2>{rs.map(r => <div className="rev" key={r.id}><strong>{r.name}</strong> {r.rating}★ [{r.status}] {r.contact}<p>{r.text}</p><button onClick={() => mod(r.id, 'approved')}>Одобрить</button> <button onClick={() => mod(r.id, 'hidden')}>Скрыть</button> <button onClick={() => del('reviews', r.id)}>Удалить</button></div>)}
    <h2>Описание и контакты</h2>{['about', 'email', 'phone', 'telegram', 'behance'].map(k => <label key={k}>{k}{k === 'about' ? <textarea rows={4} value={st[k] || ''} onChange={e => setSt({ ...st, [k]: e.target.value })} /> : <input value={st[k] || ''} onChange={e => setSt({ ...st, [k]: e.target.value })} />}</label>)}
    <button className="btn" onClick={saveSt}>Сохранить</button></main>;
}
