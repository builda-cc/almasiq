import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { UserPlus, FileText, Sparkles, ArrowRightLeft, CheckCircle } from 'lucide-react';

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: UserPlus,
      title: t('howItWorks.step1Title'),
      body: t('howItWorks.step1Desc'),
    },
    {
      icon: FileText,
      title: t('howItWorks.step2Title'),
      body: t('howItWorks.step2Desc'),
    },
    {
      icon: Sparkles,
      title: t('howItWorks.step3Title'),
      body: t('howItWorks.step3Desc'),
    },
    {
      icon: ArrowRightLeft,
      title: t('howItWorks.step4Title'),
      body: t('howItWorks.step4Desc'),
    },
    {
      icon: CheckCircle,
      title: t('howItWorks.step5Title'),
      body: t('howItWorks.step5Desc'),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900">{t('howItWorks.title')}</h1>
      <p className="mt-2 text-slate-500">
        {t('howItWorks.subtitle')}
      </p>

      <div className="mt-10 space-y-6">
        {steps.map((step, idx) => (
          <div key={step.title} className="flex gap-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center relative">
              <step.icon className="w-6 h-6 text-emerald-600" />
              <span className="absolute -top-1 -left-1 w-5 h-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center">
                {idx + 1}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">{step.title}</h2>
              <p className="mt-1 text-slate-600">{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-emerald-50 rounded-xl p-6 text-center">
        <p className="font-medium text-slate-900">
          {t('howItWorks.ctaTitle')}
        </p>
        <Link
          to="/assets"
          className="mt-3 inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
        >
          {t('howItWorks.ctaButton')}
        </Link>
      </div>
    </div>
  );
}
