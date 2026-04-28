import { useState } from 'react';
import { ChevronRight, Building2, TrendingUp, Brain, CheckCircle } from 'lucide-react';
import { PSYCHOMETRIC_QUESTIONS } from '../engine/scoringEngine';

const STEPS = ['welcome', 'business', 'finance', 'alternative', 'psychometric', 'calculating'];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    // Business
    businessName: '', ownerName: '', businessType: '', businessAgeYears: '',
    isRegistered: false, hasFixedLocation: false, employeeCount: '', hasLicenses: false,
    // Finance
    monthlyRevenue: '', monthlyExpenses: '', hasBankAccount: false,
    savingsMonths: '', debtToRevenueRatio: '0',
    // Alternative
    hasWebsite: false, hasSocialMedia: false, hasGoogleBusiness: false,
    usesDigitalPayments: false, regularCustomers: '', hasRegularSuppliers: false,
    recordKeepingLevel: 'none',
    // Psychometric answers
    psychAnswers: [],
  });
  const [quizIndex, setQuizIndex] = useState(0);

  const update = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const nextStep = () => {
    if (step === STEPS.length - 2) {
      setStep(STEPS.length - 1);
      setTimeout(() => onComplete(formData), 2200);
    } else {
      setStep(s => s + 1);
    }
  };

  const answerQuiz = (val) => {
    const q = PSYCHOMETRIC_QUESTIONS[quizIndex];
    const updated = [...formData.psychAnswers.filter(a => a.questionId !== q.id), { questionId: q.id, value: val + 1 }];
    update('psychAnswers', updated);
    if (quizIndex < PSYCHOMETRIC_QUESTIONS.length - 1) {
      setQuizIndex(i => i + 1);
    } else {
      nextStep();
    }
  };

  // ── Welcome ──
  if (step === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-600 to-teal-800 text-white px-6 text-center">
      <div className="mb-8 animate-fade-in-up">
        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
          <TrendingUp size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-3">MSME Credit Ready AI</h1>
        <p className="text-teal-100 text-lg mb-2">Your AI-Powered Path to Bankability</p>
        <p className="text-teal-200 text-sm max-w-sm mx-auto">
          Get your free credit readiness score in under 3 minutes and a personalised action plan from your AI coach.
        </p>
      </div>
      <div className="w-full max-w-sm space-y-3 mb-10 text-left">
        {[['📊', 'Multi-pillar Credit Score', '4 dimensions beyond bank statements'],
          ['🤖', 'AI Credit Coach', 'Personalised guidance from Aria'],
          ['📋', 'Action Plan', 'Step-by-step path to loan readiness']].map(([icon, title, sub]) => (
          <div key={title} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
            <span className="text-2xl">{icon}</span>
            <div><p className="font-semibold text-sm">{title}</p><p className="text-teal-200 text-xs">{sub}</p></div>
          </div>
        ))}
      </div>
      <button onClick={nextStep}
        className="w-full max-w-sm bg-white text-teal-700 font-bold py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-transform">
        Get My Free Score →
      </button>
      <p className="text-teal-300 text-xs mt-4">🔒 Your data stays private and secure</p>
    </div>
  );

  // ── Business Info ──
  if (step === 1) return (
    <StepWrapper title="Your Business" subtitle="Tell us about your business" icon={<Building2 size={22} />} step={1} total={4} onNext={nextStep}>
      <Field label="Business Name" required>
        <input className="input-field" placeholder="e.g. Mama Ngina Groceries" value={formData.businessName} onChange={e => update('businessName', e.target.value)} />
      </Field>
      <Field label="Your Name" required>
        <input className="input-field" placeholder="Full name" value={formData.ownerName} onChange={e => update('ownerName', e.target.value)} />
      </Field>
      <Field label="Business Type">
        <select className="input-field" value={formData.businessType} onChange={e => update('businessType', e.target.value)}>
          <option value="">Select type…</option>
          {['Retail / Shop','Food & Beverage','Agriculture','Manufacturing','Services','Transport','Technology','Other'].map(t => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="How old is your business?">
        <select className="input-field" value={formData.businessAgeYears} onChange={e => update('businessAgeYears', e.target.value)}>
          <option value="">Select…</option>
          <option value="0.5">Less than 1 year</option>
          <option value="1">1–2 years</option>
          <option value="3">3–4 years</option>
          <option value="5">5–9 years</option>
          <option value="10">10+ years</option>
        </select>
      </Field>
      <Field label="Number of employees (including yourself)">
        <select className="input-field" value={formData.employeeCount} onChange={e => update('employeeCount', e.target.value)}>
          <option value="">Select…</option>
          <option value="1">Just me</option>
          <option value="2">2–4</option>
          <option value="5">5–9</option>
          <option value="10">10–24</option>
          <option value="25">25+</option>
        </select>
      </Field>
      <div className="space-y-2">
        {[['isRegistered', 'My business is formally registered'],
          ['hasFixedLocation', 'I have a fixed business location'],
          ['hasLicenses', 'I have required licenses/permits']].map(([key, label]) => (
          <Toggle key={key} label={label} checked={formData[key]} onChange={v => update(key, v)} />
        ))}
      </div>
    </StepWrapper>
  );

  // ── Finance ──
  if (step === 2) return (
    <StepWrapper title="Financial Picture" subtitle="Approximate figures are fine" icon={<TrendingUp size={22} />} step={2} total={4} onNext={nextStep}>
      <Field label="Estimated monthly revenue (USD)">
        <select className="input-field" value={formData.monthlyRevenue} onChange={e => update('monthlyRevenue', e.target.value)}>
          <option value="">Select range…</option>
          <option value="500">Under $1,000</option>
          <option value="2500">$1,000 – $5,000</option>
          <option value="7500">$5,000 – $10,000</option>
          <option value="25000">$10,000 – $50,000</option>
          <option value="75000">$50,000+</option>
        </select>
      </Field>
      <Field label="Estimated monthly expenses">
        <select className="input-field" value={formData.monthlyExpenses} onChange={e => update('monthlyExpenses', e.target.value)}>
          <option value="">Select range…</option>
          <option value="300">Under $500</option>
          <option value="1500">$500 – $3,000</option>
          <option value="5000">$3,000 – $8,000</option>
          <option value="15000">$8,000 – $30,000</option>
          <option value="40000">$30,000+</option>
        </select>
      </Field>
      <Field label="Emergency savings (months of expenses)">
        <select className="input-field" value={formData.savingsMonths} onChange={e => update('savingsMonths', e.target.value)}>
          <option value="">Select…</option>
          <option value="0">None</option>
          <option value="1">About 1 month</option>
          <option value="2">About 2 months</option>
          <option value="3">3 or more months</option>
        </select>
      </Field>
      <Field label="Current debt vs monthly revenue">
        <select className="input-field" value={formData.debtToRevenueRatio} onChange={e => update('debtToRevenueRatio', e.target.value)}>
          <option value="0">No debt</option>
          <option value="0.1">Less than 10% of monthly revenue</option>
          <option value="0.2">10–20%</option>
          <option value="0.35">20–50%</option>
          <option value="0.6">More than 50%</option>
        </select>
      </Field>
      <Toggle label="I have a formal business bank account" checked={formData.hasBankAccount} onChange={v => update('hasBankAccount', v)} />
    </StepWrapper>
  );

  // ── Alternative Data ──
  if (step === 3) return (
    <StepWrapper title="Digital & Operations" subtitle="This helps us build a fuller picture" icon={<CheckCircle size={22} />} step={3} total={4} onNext={nextStep}>
      <Field label="How do you keep business records?">
        <select className="input-field" value={formData.recordKeepingLevel} onChange={e => update('recordKeepingLevel', e.target.value)}>
          <option value="none">No records</option>
          <option value="manual">Written/manual records</option>
          <option value="digital">Spreadsheets or accounting software</option>
        </select>
      </Field>
      <Field label="Approximate number of regular customers">
        <select className="input-field" value={formData.regularCustomers} onChange={e => update('regularCustomers', e.target.value)}>
          <option value="0">None</option>
          <option value="1">1–5</option>
          <option value="3">5–20</option>
          <option value="5">20+</option>
        </select>
      </Field>
      <div className="space-y-2 pt-1">
        {[['hasWebsite','I have a business website'],
          ['hasSocialMedia','I have social media pages'],
          ['hasGoogleBusiness','I have a Google Business profile'],
          ['usesDigitalPayments','I accept mobile money / digital payments'],
          ['hasRegularSuppliers','I have regular, established suppliers']].map(([key, label]) => (
          <Toggle key={key} label={label} checked={formData[key]} onChange={v => update(key, v)} />
        ))}
      </div>
    </StepWrapper>
  );

  // ── Psychometric ──
  if (step === 4) {
    const q = PSYCHOMETRIC_QUESTIONS[quizIndex];
    const progress = ((quizIndex) / PSYCHOMETRIC_QUESTIONS.length) * 100;
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col px-5 py-8">
      <div className="w-full flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Brain size={20} className="text-indigo-600" />
            <span className="font-semibold text-slate-700">Mindset Assessment</span>
            <span className="ml-auto text-sm text-slate-400">{quizIndex + 1}/{PSYCHOMETRIC_QUESTIONS.length}</span>
          </div>
          <div className="bg-slate-200 rounded-full h-2 mb-8">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 flex-1">
            <p className="text-slate-800 font-semibold text-lg mb-6 leading-relaxed">{q.text}</p>
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => answerQuiz(i)}
                  className="w-full text-left px-4 py-3 rounded-xl border-2 border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-sm font-medium text-slate-700 active:scale-98">
                  <span className="inline-block w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold text-center leading-6 mr-3">{i + 1}</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <p className="text-center text-slate-400 text-xs">There are no right or wrong answers — be honest for the most accurate score</p>
        </div>
      </div>
    );
  }

  // ── Calculating ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 to-teal-800 flex flex-col items-center justify-center text-white px-6">
      <div className="text-center">
        <div className="w-24 h-24 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-3">Calculating Your Score</h2>
        <p className="text-teal-200">Aria is analysing your profile across 4 pillars…</p>
        <div className="mt-8 space-y-2 text-sm text-teal-200">
          {['Analysing financial health…','Checking operational stability…','Scanning alternative data…','Building your action plan…'].map((msg, i) => (
            <p key={i} className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-teal-300 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
              {msg}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Reusable sub-components ──
function StepWrapper({ title, subtitle, icon, step, total, onNext, children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">{icon}</div>
          <div>
            <h2 className="font-bold text-slate-800">{title}</h2>
            <p className="text-slate-500 text-xs">{subtitle}</p>
          </div>
          <span className="ml-auto text-xs text-slate-400">Step {step}/{total}</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? 'bg-teal-500' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto px-5 py-5 space-y-4 w-full">
        {children}
      </div>
      <div className="px-5 py-4 bg-white border-t border-slate-100 w-full">
        <button onClick={onNext} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors active:scale-98">
          Continue <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${checked ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'}`}>
      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${checked ? 'bg-teal-500' : 'bg-slate-200'}`}>
        {checked && <CheckCircle size={14} className="text-white" />}
      </div>
      <span className={`text-sm font-medium ${checked ? 'text-teal-700' : 'text-slate-600'}`}>{label}</span>
    </button>
  );
}
