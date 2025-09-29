import { useState } from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    id: 'free',
    name: 'FREE',
    monthly: 0,
    features: [
      '5 customers',
      '5 invoices and estimates',
      'Premium deliveries (not included)',
      'Android and iOS apps'
    ]
  },
  {
    id: 'starter',
    name: 'STARTER',
    monthly: 9.99,
    features: [
      '30 customers',
      'Unlimited invoices and estimates',
      '36 premium deliveries',
      'Android and iOS apps',
      'Convert estimates to invoices'
    ]
  },
  {
    id: 'pro',
    name: 'PRO',
    monthly: 17.99,
    features: [
      'Unlimited customers',
      'Unlimited invoices and estimates',
      '120 premium deliveries',
      'Android and iOS apps',
      'Time tracking',
      'Recurring invoices'
    ]
  },
  {
    id: 'growth',
    name: 'GROWTH',
    monthly: 41.99,
    features: [
      'Unlimited customers',
      'Unlimited invoices and estimates',
      '360 premium deliveries',
      'Android and iOS apps',
      'Payment schedules',
      'Multiple trade names'
    ]
  }
];

const featuresLeft = [
  {
    title: 'Send invoices by post',
    desc: 'Forget about printing, stamps, envelopes and the post office. We take care of it all for you.'
  },
  { title: 'Send friendly payment reminders', desc: 'Make sure you get paid by scheduling automatic payment reminders.' },
  { title: 'Convert estimates to invoices', desc: 'Convert estimates to invoices with one click, and split estimates into multiple invoices.' },
  { title: 'Improve cash flow and reduce risk with payment schedules', desc: "Requesting a down payment is a great way to secure your customer's commitment to pay in full" },
  { title: 'Free 30-day trial (monthly plans only)', desc: 'Try this service out with a 30-day free trial, cancel at any time.' }
];

const featuresRight = [
  { title: 'Send e-invoices', desc: 'Send e-invoices to public sector or corporate customers.' },
  { title: 'Time tracking', desc: 'Save time by turning tracked hours into invoices with a single click.' },
  { title: 'Multiple trade names', desc: 'Add more than one trade name to your account.' },
  { title: 'Increase the size of your customer database', desc: 'Store more customers in your account as your business grows.' },
  { title: 'Frequent improvements', desc: 'All our plans include monthly product updates at no extra charge.' }
];

const Premium = () => {
  const navigate = useNavigate();
  const [billing, setBilling] = useState('yearly'); // 'yearly' or 'monthly'

  return (
    <main className="container mx-auto px-4 py-12">
      <section className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold">{billing === 'yearly' ? 'Save money with our yearly plans' : 'Get a 30-day free trial with our monthly plans'}</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {billing === 'yearly'
            ? 'Save up to 15% of the price when selecting our yearly plans or switch to our monthly plans to get 30-day free trial.'
            : 'Choose any plan to get a 30-day trial and pay only after the trial ends - you can cancel anytime. Switch to the yearly payment to get 15% off.'}
        </p>
      </section>

      <section className="mt-10">
       <div className="bg-background border border-border rounded-xl p-1 flex items-center gap-1">
  <button 
    onClick={() => setBilling('yearly')} 
    className={`flex-1 text-center py-3 px-4 rounded-lg transition-all duration-300 ${
      billing === 'yearly' 
        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg transform scale-105' 
        : 'text-muted-foreground bg-transparent hover:bg-gray-100'
    }`}
  >
    <span className="flex items-center justify-center gap-2">
      {billing === 'yearly' && (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      Pay yearly and save
    </span>
  </button>
  
  <button 
    onClick={() => setBilling('monthly')} 
    className={`flex-1 text-center py-3 px-4 rounded-lg transition-all duration-300 ${
      billing === 'monthly' 
        ? 'bg-gradient-to-r from-blue-500 to-indigo-900 text-white font-bold shadow-lg transform scale-105' 
        : 'text-muted-foreground bg-transparent hover:bg-gray-100'
    }`}
  >
    <span className="flex items-center justify-center gap-2">
      {billing === 'monthly' && (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      Pay monthly and get a free trial
    </span>
  </button>
</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {plans.map((p, idx) => (
            <div key={p.name} className={`rounded-lg border border-border p-6 bg-card ${idx === 2 ? 'relative' : ''}`}>
              {idx === 2 && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-secondary px-3 py-1 text-xs font-semibold rounded-b">MOST POPULAR</div>}
              <div className="text-sm font-semibold text-muted-foreground">{p.name}</div>
              <div className="mt-4 text-3xl font-extrabold text-foreground">{billing === 'monthly' ? `${p.monthly.toFixed(2)} €` : `${(p.monthly * 12 * 0.85).toFixed(2)} €`}</div>
              <div className="text-xs text-muted-foreground mt-1">Price per month*</div>

              {billing === 'yearly' && (
                <div className="mt-2 text-xs text-muted-foreground">{`${(p.monthly * 12).toFixed(2)} € paid once per year — now ${(p.monthly * 12 * 0.85).toFixed(2)} € (15% off)`}</div>
              )}

              <div className="mt-6">
                {billing === 'monthly' ? (
                  <button onClick={() => navigate('/account')} className="w-full py-2 rounded-full border border-primary text-primary font-semibold">Start free trial</button>
                ) : (
                  <button onClick={() => navigate('/account')} className="w-full py-2 rounded-full bg-primary text-primary-foreground font-semibold">Upgrade</button>
                )}
              </div>

              <ul className="mt-6 text-sm space-y-3 text-muted-foreground">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-primary mt-1" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold">Premium services</h3>
            <div className="mt-6 grid grid-cols-1 gap-6">
              {featuresLeft.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">📄</div>
                  <div>
                    <div className="font-medium">{f.title}</div>
                    <div className="text-sm text-muted-foreground">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mt-6 grid grid-cols-1 gap-6">
              {featuresRight.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">📦</div>
                  <div>
                    <div className="font-medium">{f.title}</div>
                    <div className="text-sm text-muted-foreground">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 text-xs text-muted-foreground">
        <p>*Prices excluding VAT. If your business is registered for VAT in the business domicile, you are not required to pay VAT on any services purchased from SwiftFacture. However, if not registered for VAT, you will be charged the Finnish rate of VAT (25.5%) on any services purchased from SwiftFacture.</p>
      </section>
    </main>
  );
};

export default Premium;
