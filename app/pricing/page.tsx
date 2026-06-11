import Link from 'next/link';
import VendleLogo from '@/app/ui/vendle-logo';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for getting started',
    features: [
      '10 products',
      '5% transaction fee',
      'Basic themes',
      'Email support'
    ],
    highlighted: false
  },
  {
    name: 'Pro',
    price: '₦1,500/month',
    description: 'For growing businesses',
    features: [
      '100 products',
      '3% transaction fee',
      'Premium themes',
      'Priority support',
      'Analytics dashboard'
    ],
    highlighted: true
  },
  {
    name: 'Business',
    price: '₦3,500/month',
    description: 'For established businesses',
    features: [
      '1,000 products',
      '2% transaction fee',
      'Exclusive themes',
      '24/7 priority support',
      'Analytics dashboard',
      'Advanced analytics',
      'Custom domain',
      'Team members',
      'No Vendle branding'
    ],
    highlighted: false
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <VendleLogo />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors">
              Sign in
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Choose the plan that fits your business. Upgrade or downgrade at any time.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              className={`relative rounded-3xl border p-8 transition-all ${
                plan.highlighted
                  ? 'border-emerald-600 bg-emerald-50 shadow-lg transform scale-105'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-slate-600 mb-6">{plan.description}</p>
              
              <div className="mb-8">
                <p className="text-4xl font-black text-slate-900">
                  {plan.price}
                </p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg 
                      className="h-5 w-5 text-emerald-600" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href="/signup"
                className={`w-full py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center ${
                  plan.highlighted
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}