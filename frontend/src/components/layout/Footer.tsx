import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-beige-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('common.appName')}</h3>
            <p className="text-beige-400 text-sm">{t('footer.description')}</p>
          </div>
          <div>
            <h4 className="font-medium mb-4">{t('footer.platform')}</h4>
            <ul className="space-y-2 text-sm text-beige-400">
              <li>
                <Link to="/assets" className="hover:text-white transition-colors">
                  {t('nav.browseAssets')}
                </Link>
              </li>
              <li>
                <Link to="/matches" className="hover:text-white transition-colors">
                  {t('nav.aiMatching')}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  {t('nav.howItWorks')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">{t('footer.categories')}</h4>
            <ul className="space-y-2 text-sm text-beige-400">
              <li>
                <Link to="/assets?category=real-estate" className="hover:text-white transition-colors">
                  {t('footer.real-estate')}
                </Link>
              </li>
              <li>
                <Link to="/assets?category=land-agro" className="hover:text-white transition-colors">
                  {t('footer.land-agro')}
                </Link>
              </li>
              <li>
                <Link to="/assets?category=livestock" className="hover:text-white transition-colors">
                  {t('footer.livestock')}
                </Link>
              </li>
              <li>
                <Link to="/assets?category=auto-equipment" className="hover:text-white transition-colors">
                  {t('footer.auto-equipment')}
                </Link>
              </li>
              <li>
                <Link to="/assets?category=mining-metals" className="hover:text-white transition-colors">
                  {t('footer.mining-metals')}
                </Link>
              </li>
              <li>
                <Link to="/assets?category=business-industry" className="hover:text-white transition-colors">
                  {t('footer.business-industry')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2 text-sm text-beige-400">
              <li><span className="hover:text-white transition-colors">{t('footer.about')}</span></li>
              <li><span className="hover:text-white transition-colors">{t('footer.terms')}</span></li>
              <li><span className="hover:text-white transition-colors">{t('footer.privacy')}</span></li>
              <li><span className="hover:text-white transition-colors">{t('footer.contact')}</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-beige-800 text-center text-sm text-beige-400">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
