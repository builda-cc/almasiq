import { Link } from 'react-router-dom';
import { UserPlus, FileText, Sparkles, ArrowRightLeft, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create an account',
    body: 'Register with your name, email, and phone to start exchanging.',
  },
  {
    icon: FileText,
    title: 'Publish your asset',
    body: 'List an apartment, house, land, vehicle, or commercial property and set what you want in return.',
  },
  {
    icon: Sparkles,
    title: 'Get AI matches',
    body: 'Our engine scores every possible exchange on value, preference, location, and liquidity.',
  },
  {
    icon: ArrowRightLeft,
    title: 'Propose an exchange',
    body: 'Send a proposal with one of your assets. The owner can accept, reject, or negotiate.',
  },
  {
    icon: CheckCircle,
    title: 'Complete the deal',
    body: 'Once both sides agree, mark the exchange completed and update your portfolio.',
  },
];

export function HowItWorks() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900">How It Works</h1>
      <p className="mt-2 text-slate-500">
        Exchange assets without selling them first — powered by AI matching.
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
          Ready to find your next exchange?
        </p>
        <Link
          to="/assets"
          className="mt-3 inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
        >
          Browse Assets
        </Link>
      </div>
    </div>
  );
}
