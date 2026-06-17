import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRightLeft, Globe, Users, Send, Sparkles, Languages } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-surface text-on-surface pt-20 pb-10 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-16">
          {/* Brand Identity Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-600 rounded-lg flex items-center justify-center text-white">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <span className="font-display text-headline-md font-bold text-gold-600 tracking-tight">
                {t('common.appName')}
              </span>
            </div>
            <p className="text-beige-600 max-w-sm leading-relaxed">{t('footer.description')}</p>
            <div className="flex gap-4 pt-2">
              {/* Social Icons */}
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-surface border border-silver-600/30 flex items-center justify-center text-silver-600 hover:bg-gold-600 hover:text-white transition-all duration-300"
              >
                <Globe className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-surface border border-silver-600/30 flex items-center justify-center text-silver-600 hover:bg-gold-600 hover:text-white transition-all duration-300"
              >
                <Users className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-surface border border-silver-600/30 flex items-center justify-center text-silver-600 hover:bg-gold-600 hover:text-white transition-all duration-300"
              >
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>
          {/* Navigation Links - Multi-column */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-gutter lg:ml-auto">
            {/* Platform Column */}
            <div className="space-y-6">
              <h4 className="font-display text-[18px] text-on-surface font-bold">
                {t('footer.platform')}
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link to="/assets" className="text-beige-600 hover:text-gold-600 transition-colors">
                    {t('nav.browseAssets')}
                  </Link>
                </li>
                <li>
                  <Link to="/matches" className="text-beige-600 hover:text-gold-600 transition-colors">
                    {t('nav.aiMatching')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/how-it-works"
                    className="text-beige-600 hover:text-gold-600 transition-colors"
                  >
                    {t('nav.howItWorks')}
                  </Link>
                </li>
              </ul>
            </div>
            {/* Categories Column */}
            <div className="space-y-6">
              <h4 className="font-display text-[18px] text-on-surface font-bold">
                {t('footer.categories')}
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/assets?category=real-estate"
                    className="text-beige-600 hover:text-gold-600 transition-colors"
                  >
                    {t('footer.real-estate')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/assets?category=land-agro"
                    className="text-beige-600 hover:text-gold-600 transition-colors"
                  >
                    {t('footer.land-agro')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/assets?category=livestock"
                    className="text-beige-600 hover:text-gold-600 transition-colors"
                  >
                    {t('footer.livestock')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/assets?category=auto-equipment"
                    className="text-beige-600 hover:text-gold-600 transition-colors"
                  >
                    {t('footer.auto-equipment')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/assets?category=mining-metals"
                    className="text-beige-600 hover:text-gold-600 transition-colors"
                  >
                    {t('footer.mining-metals')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/assets?category=business-industry"
                    className="text-beige-600 hover:text-gold-600 transition-colors"
                  >
                    {t('footer.business-industry')}
                  </Link>
                </li>
              </ul>
            </div>
            {/* Company Column */}
            <div className="space-y-6">
              <h4 className="font-display text-[18px] text-on-surface font-bold">
                {t('footer.company')}
              </h4>
              <ul className="space-y-4">
                <li>
                  <span className="text-beige-600 hover:text-gold-600 transition-colors cursor-pointer">
                    {t('footer.about')}
                  </span>
                </li>
                <li>
                  <span className="text-beige-600 hover:text-gold-600 transition-colors cursor-pointer">
                    {t('footer.terms')}
                  </span>
                </li>
                <li>
                  <span className="text-beige-600 hover:text-gold-600 transition-colors cursor-pointer">
                    {t('footer.privacy')}
                  </span>
                </li>
                <li>
                  <span className="text-beige-600 hover:text-gold-600 transition-colors cursor-pointer">
                    {t('footer.contact')}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Bottom Horizontal Banner / AI Insight */}
        <div className="bg-surface-container rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 border border-gold-600/10 shadow-glow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center text-gold-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="font-display text-[16px] text-on-surface mb-0.5">
                {t('footer.aiBannerTitle')}
              </p>
              <p className="text-beige-600 text-[14px]">{t('footer.aiBannerSubtitle')}</p>
            </div>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              placeholder={t('footer.emailPlaceholder')}
              className="flex-1 md:w-64 bg-surface border border-silver-600/20 focus:ring-2 focus:ring-gold-600 rounded-xl px-4 py-3 text-sm transition-all"
            />
            <button className="bg-gold-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gold-600/90 transition-colors whitespace-nowrap shadow-sm shadow-gold-600/20">
              {t('footer.subscribe')}
            </button>
          </div>
        </div>
        {/* Copyright and Legal */}
        <div className="pt-8 border-t border-beige-400/30 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-beige-600 text-[14px]">{t('footer.copyright')}</p>
          <div className="flex items-center gap-6 text-[14px] text-beige-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success-teal"></span>
              <span>{t('footer.systemStatus')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Languages className="w-[18px] h-[18px] text-silver-600" />
              <span>{t('footer.region')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
