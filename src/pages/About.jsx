import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Clock, FileText, Award, UserCheck, ChevronDown } from 'lucide-react';

const steps = [
  { title: 'Create', desc: 'Quickly fill in Bill To / Ship To and line items.', icon: FileText },
  { title: 'Customize', desc: 'Switch templates and preview before exporting.', icon: Award },
  { title: 'Send', desc: 'Generate PDF and share with clients instantly.', icon: UserCheck }
];

const faqs = [
  { q: 'Where is my data stored?', a: 'Your data is stored locally in your browser (localStorage). It does not leave your device unless you export or share the generated file.' },
  { q: 'Can I customize templates?', a: 'Templates are prebuilt for now. You can switch between templates and future versions may include deeper styling controls.' },
  { q: 'Are generated PDFs secure?', a: 'PDFs are generated client-side. Security depends on how you share the file (email, secure drive, etc.).' }
];

const FeatureCard = ({ title, children, icon: Icon }) => (
  <div className="bg-card hover:shadow-elegant transition-smooth p-5 rounded-lg"> 
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground mt-1">{children}</div>
      </div>
    </div>
  </div>
);

const About = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-xl bg-gradient-to-br from-card to-background p-8 shadow-elegant">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">PayFlow — simple invoices & receipts</h1>
              <p className="mt-4 text-muted-foreground max-w-xl">Create professional invoices and receipts in seconds. Select a template, fill your customer and item details and export a PDF — no server-side storage required.</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => navigate('/invoice')} className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold">Create Invoice</button>
                <button onClick={() => navigate('/receipt')} className="px-4 py-2 rounded-md border border-border text-muted-foreground">Open Receipt</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FeatureCard title="Editable Templates" icon={FileText}>Multiple modern templates with live preview and print-optimized output.</FeatureCard>
              <FeatureCard title="PDF Export" icon={Award}>Client-ready PDFs generated in the browser with no back-end.</FeatureCard>
              <FeatureCard title="Auto Calculations" icon={Clock}>Automatic tax, totals and currency handling for fast invoice creation.</FeatureCard>
              <FeatureCard title="Privacy-first" icon={UserCheck}>All data remains in your browser unless you choose to export or share it.</FeatureCard>
            </div>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold text-center">How it works</h2>
        <p className="text-center text-muted-foreground mt-2">A focused 3-step flow to create, customize and send invoices fast.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.title} className="p-6 bg-card rounded-lg hover:translate-y-1 transition-smooth">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-primary/10 text-primary flex items-center justify-center">
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-sm text-muted-foreground">{s.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold">Tips & Best Practices</h3>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-primary mt-1" /> <span>Save drafts locally to avoid losing progress.</span></li>
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-primary mt-1" /> <span>Use clear line item descriptions for better client communication.</span></li>
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-primary mt-1" /> <span>Verify tax and currency before exporting the final PDF.</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Frequently asked questions</h3>
            <div className="mt-4 space-y-3">
              {faqs.map((f, idx) => (
                <div key={f.q} className="border border-border rounded-lg overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full text-left p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{f.q}</div>
                    </div>
                    <ChevronDown className={`h-5 w-5 transform transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`px-4 pb-4 transition-all ${openFaq === idx ? 'max-h-40' : 'max-h-0'} overflow-hidden text-muted-foreground`}>{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="rounded-lg bg-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-semibold">Ready to create your first invoice?</div>
            <div className="text-sm text-muted-foreground">Start from a template and generate a PDF in seconds.</div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/invoice')} className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold">Create Invoice</button>
            <button onClick={() => navigate('/premium')} className="px-4 py-2 rounded-md border border-border text-muted-foreground">View Pricing</button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
