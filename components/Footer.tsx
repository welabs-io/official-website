'use client';
import { NavLink } from './NavLink';
import { useT } from './LangProvider';
import { useSiteBrand } from './useSiteBrand';
import Link from './LangLink';
import { publicSlug } from '@/lib/public-slugs';

export function Footer() {
  const { t, lang } = useT();
  const brand = useSiteBrand();
  if (brand.company === 'Welabs') return <footer className="footer"><div className="container">
    <div className="footer-grid-main">
      <div className="footer-brand"><img src={brand.logo} alt="Welabs" className="logo-img" /><p className="footer-desc">{lang === 'en' ? 'We develop products connecting management, knowledge and automation.' : 'Desenvolvemos produtos que conectam gestão, conhecimento e automação.'}</p></div>
      <div className="footer-nav-col"><h4>{lang === 'en' ? 'Our products' : 'Nossos produtos'}</h4><ul>{[['flow','Flow'],['welabs-crm','CRM'],['erp',lang === 'en' ? 'Domain hub' : 'Hub de domínio'],['wekb','KB'],['channels','Channels'],['malupe',lang === 'en' ? 'Monitoring Ecosystem' : 'Ecossistema Monitoramento']].map(([slug,name]) => <li key={slug}><Link href={`/welabs/produtos/${publicSlug(slug)}`}>{name}</Link></li>)}</ul></div>
      <div className="footer-nav-col"><h4>Welabs</h4><ul><li><Link href={"/welabs/sobre"}>{lang === 'en' ? 'About Welabs' : 'A Welabs'}</Link></li><li><Link href={brand.collection}>{lang === 'en' ? 'Our ecosystem' : 'Nosso ecossistema'}</Link></li></ul></div>
      {/* Sister company: the Welabs site links back to Imagine */}
      <div className="footer-nav-col"><h4>Imagine Apps</h4><ul><li><Link href="/">{lang === 'en' ? 'Imagine home' : 'Início da Imagine'}</Link></li><li><Link href="/portfolio">{lang === 'en' ? 'Imagine portfolio' : 'Portfólio Imagine'}</Link></li></ul></div>
    </div>
    <div className="footer-bottom"><p>© 2026 Welabs. <span>{t('footer-rights')}</span></p></div>
  </div></footer>;
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid-main">
          <div className="footer-brand">
            <img src="/imagine-logo.svg" alt="Imagine Apps" className="logo-img" />
            <p className="footer-desc">{t('footer-desc')}</p>
          </div>
          <div className="footer-nav-col">
            <h4>{t('footer-nav-title')}</h4>
            <ul>
              <li><NavLink href="/">{t('footer-nav-home')}</NavLink></li>
              <li><NavLink href="/sobre">{t('footer-nav-about')}</NavLink></li>
              <li><NavLink href="/servicos">{t('footer-nav-services')}</NavLink></li>
              <li><NavLink href="/portfolio">{t('footer-nav-cases')}</NavLink></li>
            </ul>
          </div>
          {/* Sister company: the Imagine site links to Welabs */}
          <div className="footer-nav-col">
            <h4>Welabs</h4>
            <ul>
              <li><Link href="/welabs">{lang === 'en' ? 'About Welabs' : 'A Welabs'}</Link></li>
              <li><Link href="/welabs/produtos">{lang === 'en' ? 'Welabs products' : 'Produtos Welabs'}</Link></li>
            </ul>
          </div>
          <div className="footer-nav-col">
            <h4>{t('footer-contact-title')}</h4>
            <ul>
              <li><a href="mailto:contato@imagineapps.com.br">contato@imagineapps.com.br</a></li>
              <li><span>Av. Conselheiro Aguiar, 2738 - Sala 402</span></li>
              <li><span>Boa Viagem - Recife, PE</span></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Imagine Apps. CNPJ: 20.511.064/0001-64. <span>{t('footer-rights')}</span></p>
        </div>
      </div>
    </footer>
  );
}
