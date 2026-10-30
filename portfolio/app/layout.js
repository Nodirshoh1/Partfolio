import './globals.css';
const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const metadata = { metadataBase: new URL(url), title: 'Нодиршох Косимов — графический дизайнер, Душанбе',
  description: 'Портфолио графического дизайнера из Душанбе: графический дизайн, брендинг, соцсети, motion и 3D.',
  icons: { icon: '/icon.svg' }, openGraph: { title: 'Нодиршох Косимов — графический дизайнер', description: 'Графический дизайн, брендинг, соцсети, motion и 3D.', type: 'website', locale: 'ru_RU', images: ['/og.png'] } };
export default function Root({ children }) { return <html lang="ru"><body>{children}</body></html>; }
