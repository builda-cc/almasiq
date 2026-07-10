import { useTranslation } from 'react-i18next';
import { ListPlus, Sparkles, Handshake } from 'lucide-react';

const STEP_ICONS = [ListPlus, Sparkles, Handshake] as const;

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    { title: t('home.step1Title'), body: t('home.step1Body') },
    { title: t('home.step2Title'), body: t('home.step2Body') },
    { title: t('home.step3Title'), body: t('home.step3Body') },
  ];

  return (
    <section className="bg-beige-50 border-y border-beige-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-beige-900">
            {t('home.howTitle')}
          </h2>
          <p className="mt-1 text-sm text-beige-500">{t('home.howSubtitle')}</p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex items-center justify-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-600 text-white shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs font-semibold text-gold-600">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-beige-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-beige-600 max-w-xs mx-auto">
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
