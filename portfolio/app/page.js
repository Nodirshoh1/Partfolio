import { sbPublic } from '@/lib/sb';
import { DEFAULTS, SKILLS, EXP, EDU, COURSES, PLACEHOLDERS } from '@/lib/content';
import { Works, ContactForm, ReviewForm } from './Client';
export const revalidate = 60;
export default async function Home() {
  const db = sbPublic(); let projects = [], reviews = [], S = { ...DEFAULTS };
  if (db) {
    projects = (await db.from('projects').select('*').eq('published', true).order('sort_order')).data || [];
    reviews = (await db.from('reviews').select('name,text,rating').eq('status', 'approved').order('created_at', { ascending: false })).data || [];
    ((await db.from('settings').select('*')).data || []).forEach(r => (S[r.key] = r.value));
  }
  const items = projects.length ? projects : PLACEHOLDERS.map(([title, category, description], i) => ({ id: 'ph' + i, title, category, description: description + ' (Временная заглушка: добавьте работу в админ-панели.)', media: [] }));
  const nav = [['works','Работы'],['about','Обо мне'],['reviews','Отзывы'],['contact','Контакты']];
  return <>
    <header className="w"><nav aria-label="Основная навигация"><strong>Н. Косимов</strong><div>{nav.map(([h, t]) => <a key={h} href={'#' + h}>{t}</a>)}<a href="/admin" className="mut">Вход</a></div></nav></header>
    <main className="w">
      <section><p className="mut">Душанбе · офис или удалённо</p><h1>Нодиршох<br />Косимов</h1><h2>Графический дизайнер</h2>
        <p style={{ maxWidth: 640 }}>{S.about}</p><a className="btn" href="#works">Смотреть работы</a><a className="btn o" href="#contact">Связаться</a>
        <div className="hero-img" role="img" aria-label="Место для главной работы или фото">Временная заглушка — главный визуал</div></section>
      <section id="works"><h2><span className="num">01</span>Работы</h2><Works items={items} />
        <p><a href={S.behance} target="_blank" rel="noopener noreferrer">Всё портфолио на Behance →</a></p></section>
      <section id="about"><h2><span className="num">02</span>Обо мне</h2><div className="two"><div>
        {EXP.map(([t, d, ps]) => <article key={t}><h3>{t}</h3><p className="mut">{d}</p><ul>{ps.map(p => <li key={p}>{p}</li>)}</ul></article>)}
        <h3>Образование</h3><ul>{EDU.map(e => <li key={e}>{e}</li>)}</ul><h3>Курсы и достижения</h3><ul>{COURSES.map(e => <li key={e}>{e}</li>)}</ul></div>
        <div><h3>Навыки</h3><p>Постеры, баннеры, логотипы, брендинг, презентации, упаковка, мокапы, соцсети; 2D motion, 3D camera и tracking, 3D-моделирование и анимация, модели для 3D-печати.</p>
        <ul>{SKILLS.map(([n, l]) => <li key={n}><strong>{n}</strong> — {l}</li>)}</ul><h3>Языки</h3><p>Таджикский и русский — родные, английский — A2.</p></div></div></section>
      <section id="reviews"><h2><span className="num">03</span>Отзывы</h2><div className="two"><div>
        {!reviews.length && <p className="mut">Пока нет опубликованных отзывов.</p>}
        {reviews.map((r, i) => <div className="rev" key={i}><strong>{r.name}</strong> <span aria-label={`Оценка ${r.rating} из 5`}>{'★'.repeat(r.rating)}</span><p>{r.text}</p></div>)}</div><ReviewForm /></div></section>
      <section id="contact"><h2><span className="num">04</span>Контакты</h2><div className="two"><ContactForm /><div>
        <p>Телефон: <a href={'tel:' + S.phone.replace(/\s/g, '')}>{S.phone}</a></p><p>Email: <a href={'mailto:' + S.email}>{S.email}</a></p><p>Telegram: <a href={'https://t.me/' + S.telegram}>@{S.telegram}</a></p>
        <a className="btn" href={'mailto:' + S.email}>Написать на email</a><a className="btn o" href={'https://t.me/' + S.telegram}>Telegram</a></div></div></section>
    </main><footer className="w mut">© {new Date().getFullYear()} Нодиршох Косимов</footer></>;
}
