/**
 * MSME Credit Readiness Scoring Engine
 * Multi-pillar weighted scoring algorithm
 */

// ─── Pillar Weights ────────────────────────────────────────────────────
export const PILLAR_WEIGHTS = {
  financial: 0.30,
  operational: 0.25,
  alternative: 0.25,
  psychometric: 0.20,
};

// ─── Financial Health Scoring ──────────────────────────────────────────
export function scoreFinancial(data) {
  let score = 0;
  const breakdown = [];

  // Monthly Revenue (max 30 pts)
  const rev = Number(data.monthlyRevenue) || 0;
  if (rev >= 500000) { score += 30; breakdown.push({ item: 'Monthly Revenue', pts: 30, note: 'Excellent revenue base' }); }
  else if (rev >= 200000) { score += 22; breakdown.push({ item: 'Monthly Revenue', pts: 22, note: 'Good revenue base' }); }
  else if (rev >= 50000) { score += 14; breakdown.push({ item: 'Monthly Revenue', pts: 14, note: 'Moderate revenue' }); }
  else if (rev >= 10000) { score += 7; breakdown.push({ item: 'Monthly Revenue', pts: 7, note: 'Low revenue – grow your top-line' }); }
  else { score += 2; breakdown.push({ item: 'Monthly Revenue', pts: 2, note: 'Very low revenue – critical gap' }); }

  // Expense Ratio (max 25 pts)
  const exp = Number(data.monthlyExpenses) || 0;
  const ratio = rev > 0 ? exp / rev : 1;
  if (ratio <= 0.5) { score += 25; breakdown.push({ item: 'Expense Ratio', pts: 25, note: 'Very healthy margins' }); }
  else if (ratio <= 0.65) { score += 18; breakdown.push({ item: 'Expense Ratio', pts: 18, note: 'Good cost control' }); }
  else if (ratio <= 0.80) { score += 10; breakdown.push({ item: 'Expense Ratio', pts: 10, note: 'High expenses – reduce costs' }); }
  else { score += 3; breakdown.push({ item: 'Expense Ratio', pts: 3, note: 'Expenses exceed 80% of revenue – urgent action needed' }); }

  // Has Bank Account (10 pts)
  if (data.hasBankAccount) { score += 10; breakdown.push({ item: 'Bank Account', pts: 10, note: 'Formal banking relationship' }); }
  else { breakdown.push({ item: 'Bank Account', pts: 0, note: 'Open a business bank account immediately' }); }

  // Savings / Emergency Fund (15 pts)
  const savMonths = Number(data.savingsMonths) || 0;
  if (savMonths >= 3) { score += 15; breakdown.push({ item: 'Emergency Fund', pts: 15, note: '3+ months runway – excellent' }); }
  else if (savMonths >= 1) { score += 8; breakdown.push({ item: 'Emergency Fund', pts: 8, note: 'Build to 3 months savings' }); }
  else { breakdown.push({ item: 'Emergency Fund', pts: 0, note: 'No savings buffer – high financial risk' }); }

  // Existing Debt (20 pts)
  const debtRatio = Number(data.debtToRevenueRatio) || 0;
  if (debtRatio === 0) { score += 20; breakdown.push({ item: 'Debt Level', pts: 20, note: 'Debt-free – very strong position' }); }
  else if (debtRatio <= 0.2) { score += 15; breakdown.push({ item: 'Debt Level', pts: 15, note: 'Manageable debt load' }); }
  else if (debtRatio <= 0.4) { score += 8; breakdown.push({ item: 'Debt Level', pts: 8, note: 'Moderate debt – prioritise repayment' }); }
  else { score += 2; breakdown.push({ item: 'Debt Level', pts: 2, note: 'High debt-to-revenue ratio – critical risk flag' }); }

  return { score: Math.min(score, 100), breakdown };
}

// ─── Operational Stability Scoring ────────────────────────────────────
export function scoreOperational(data) {
  let score = 0;
  const breakdown = [];

  // Business Age (max 30 pts)
  const age = Number(data.businessAgeYears) || 0;
  if (age >= 5) { score += 30; breakdown.push({ item: 'Business Age', pts: 30, note: '5+ years – proven durability' }); }
  else if (age >= 3) { score += 22; breakdown.push({ item: 'Business Age', pts: 22, note: '3-5 years – established' }); }
  else if (age >= 1) { score += 14; breakdown.push({ item: 'Business Age', pts: 14, note: '1-3 years – growing' }); }
  else { score += 5; breakdown.push({ item: 'Business Age', pts: 5, note: 'Under 1 year – nascent business' }); }

  // Registered / Formalized (25 pts)
  if (data.isRegistered) { score += 25; breakdown.push({ item: 'Business Registration', pts: 25, note: 'Formally registered business' }); }
  else { breakdown.push({ item: 'Business Registration', pts: 0, note: 'Register your business to unlock credit access' }); }

  // Fixed Location (20 pts)
  if (data.hasFixedLocation) { score += 20; breakdown.push({ item: 'Fixed Location', pts: 20, note: 'Stable business location' }); }
  else { score += 8; breakdown.push({ item: 'Fixed Location', pts: 8, note: 'Fixed location improves lender confidence' }); }

  // Employees (15 pts)
  const emp = Number(data.employeeCount) || 0;
  if (emp >= 10) { score += 15; breakdown.push({ item: 'Team Size', pts: 15, note: '10+ employees – scalable operation' }); }
  else if (emp >= 3) { score += 10; breakdown.push({ item: 'Team Size', pts: 10, note: 'Growing team' }); }
  else if (emp >= 1) { score += 5; breakdown.push({ item: 'Team Size', pts: 5, note: 'Small team – consider growth' }); }
  else { breakdown.push({ item: 'Team Size', pts: 0, note: 'Solo operator – team up to scale' }); }

  // Licenses / Permits (10 pts)
  if (data.hasLicenses) { score += 10; breakdown.push({ item: 'Licenses & Permits', pts: 10, note: 'Fully licensed operation' }); }
  else { breakdown.push({ item: 'Licenses & Permits', pts: 0, note: 'Obtain required business licenses' }); }

  return { score: Math.min(score, 100), breakdown };
}

// ─── Alternative Data Scoring ──────────────────────────────────────────
export function scoreAlternative(data) {
  let score = 0;
  const breakdown = [];

  // Digital Presence (max 25 pts)
  let digitalPts = 0;
  if (data.hasWebsite) { digitalPts += 10; }
  if (data.hasSocialMedia) { digitalPts += 8; }
  if (data.hasGoogleBusiness) { digitalPts += 7; }
  score += digitalPts;
  breakdown.push({ item: 'Digital Presence', pts: digitalPts, note: digitalPts >= 20 ? 'Strong online visibility' : 'Build your digital footprint' });

  // Mobile Money / Digital Payments (25 pts)
  if (data.usesDigitalPayments) { score += 25; breakdown.push({ item: 'Digital Payments', pts: 25, note: 'Digital transaction trail – excellent for lenders' }); }
  else { score += 5; breakdown.push({ item: 'Digital Payments', pts: 5, note: 'Adopt mobile money to build transaction history' }); }

  // Supplier / Customer Relationships (25 pts)
  const relScore = Math.min(Number(data.regularCustomers) || 0, 3) * 5 +
    (data.hasRegularSuppliers ? 10 : 0);
  score += Math.min(relScore, 25);
  breakdown.push({ item: 'Business Relationships', pts: Math.min(relScore, 25), note: 'Customer & supplier network strength' });

  // Record Keeping (25 pts)
  if (data.recordKeepingLevel === 'digital') { score += 25; breakdown.push({ item: 'Record Keeping', pts: 25, note: 'Digital records – loan-application ready' }); }
  else if (data.recordKeepingLevel === 'manual') { score += 12; breakdown.push({ item: 'Record Keeping', pts: 12, note: 'Upgrade to digital bookkeeping' }); }
  else { breakdown.push({ item: 'Record Keeping', pts: 0, note: 'Start keeping records immediately' }); }

  return { score: Math.min(score, 100), breakdown };
}

// ─── Psychometric Scoring ──────────────────────────────────────────────
export function scorePsychometric(answers) {
  // answers: array of {questionId, value (1-5)}
  if (!answers || answers.length === 0) return { score: 50, breakdown: [] };

  const total = answers.reduce((sum, a) => sum + (Number(a.value) || 3), 0);
  const maxPossible = answers.length * 5;
  const score = Math.round((total / maxPossible) * 100);

  return {
    score,
    breakdown: [{ item: 'Psychometric Assessment', pts: score, note: `${answers.length} questions answered` }],
  };
}

// ─── Composite Score Calculator ────────────────────────────────────────
export function calculateCreditScore(financialData, operationalData, alternativeData, psychometricAnswers) {
  const financial = scoreFinancial(financialData);
  const operational = scoreOperational(operationalData);
  const alternative = scoreAlternative(alternativeData);
  const psychometric = scorePsychometric(psychometricAnswers);

  const scoreTotal = Math.round(
    financial.score * PILLAR_WEIGHTS.financial +
    operational.score * PILLAR_WEIGHTS.operational +
    alternative.score * PILLAR_WEIGHTS.alternative +
    psychometric.score * PILLAR_WEIGHTS.psychometric
  );

  const pillars = {
    financial: { score: financial.score, label: 'Financial Health', weight: 30, breakdown: financial.breakdown, color: '#0d9488' },
    operational: { score: operational.score, label: 'Operational Stability', weight: 25, breakdown: operational.breakdown, color: '#6366f1' },
    alternative: { score: alternative.score, label: 'Alternative Data', weight: 25, breakdown: alternative.breakdown, color: '#f59e0b' },
    psychometric: { score: psychometric.score, label: 'Psychometric Profile', weight: 20, breakdown: psychometric.breakdown, color: '#ec4899' },
  };

  const band = scoreToBand(scoreTotal);

  return { scoreTotal, pillars, band };
}

export function scoreToBand(score) {
  if (score >= 75) return { label: 'Credit Ready', color: '#10b981', bg: '#d1fae5', emoji: '🟢', description: 'You have a strong credit profile. Apply for formal financing now.' };
  if (score >= 50) return { label: 'Approaching Ready', color: '#f59e0b', bg: '#fef3c7', emoji: '🟡', description: 'You\'re close. Address 1-2 key gaps to unlock formal credit.' };
  if (score >= 25) return { label: 'Building Foundation', color: '#f97316', bg: '#ffedd5', emoji: '🟠', description: 'Good start. Focus on financial records and business registration.' };
  return { label: 'Early Stage', color: '#ef4444', bg: '#fee2e2', emoji: '🔴', description: 'Focus on business fundamentals first. Your coach will guide you.' };
}

// ─── Gap Analysis ──────────────────────────────────────────────────────
export function analyzeGaps(pillars) {
  const gaps = [];
  Object.entries(pillars).forEach(([key, pillar]) => {
    pillar.breakdown.forEach(item => {
      if (item.pts < 10) {
        gaps.push({ pillar: pillar.label, item: item.item, note: item.note, priority: item.pts === 0 ? 'high' : 'medium' });
      }
    });
  });
  return gaps.sort((a, b) => (a.priority === 'high' ? -1 : 1));
}

// ─── Action Plan Generator ─────────────────────────────────────────────
export function generateActionPlan(pillars) {
  const gaps = analyzeGaps(pillars);
  const plan = [];

  const actionMap = {
    'Bank Account': { task: 'Open a formal business bank account', impact: '+10 pts', timeframe: '1 week', category: 'Financial' },
    'Emergency Fund': { task: 'Save 1 month of operating expenses as emergency fund', impact: '+8 pts', timeframe: '3 months', category: 'Financial' },
    'Debt Level': { task: 'Create a debt repayment schedule and pay down highest-interest loans', impact: '+6 pts', timeframe: '2 months', category: 'Financial' },
    'Business Registration': { task: 'Register your business with the relevant government authority', impact: '+25 pts', timeframe: '2 weeks', category: 'Operations' },
    'Licenses & Permits': { task: 'Obtain all required business licenses and operational permits', impact: '+10 pts', timeframe: '3 weeks', category: 'Operations' },
    'Digital Presence': { task: 'Create a free Google Business Profile and one social media page', impact: '+15 pts', timeframe: '1 week', category: 'Digital' },
    'Digital Payments': { task: 'Sign up for a mobile money or POS payment service', impact: '+20 pts', timeframe: '3 days', category: 'Digital' },
    'Record Keeping': { task: 'Start using a free accounting app (e.g., Wave, Zoho Books)', impact: '+12 pts', timeframe: '1 week', category: 'Operations' },
  };

  gaps.forEach((gap, index) => {
    const action = actionMap[gap.item];
    if (action) {
      plan.push({
        id: index + 1,
        ...action,
        reason: gap.note,
        status: 'pending',
        pillar: gap.pillar,
        priority: gap.priority,
      });
    }
  });

  return plan.slice(0, 8); // Top 8 actions
}

export const PSYCHOMETRIC_QUESTIONS = [
  { id: 'q1', text: 'When your business faces a financial setback, you…', options: ['Panic and consider closing', 'Feel worried but make a plan', 'Stay calm and adapt quickly', 'See it as a learning opportunity', 'Thrive under pressure'], category: 'resilience' },
  { id: 'q2', text: 'How often do you review your business finances?', options: ['Never', 'Once a year', 'Quarterly', 'Monthly', 'Weekly or more'], category: 'financial_discipline' },
  { id: 'q3', text: 'If you received a $10,000 loan tomorrow, you would…', options: ['Spend it on personal needs', 'Spend it on business without a plan', 'Invest in equipment after planning', 'Invest strategically in highest-ROI areas', 'Invest and create a detailed repayment schedule'], category: 'risk_management' },
  { id: 'q4', text: 'Where do you see your business in 3 years?', options: ['Just surviving', 'Same as today', 'Slightly larger', 'Significantly expanded', 'A regional or national brand'], category: 'growth_mindset' },
  { id: 'q5', text: 'How do you handle customer complaints?', options: ['Ignore them', 'Argue with the customer', 'Apologise and move on', 'Resolve and improve process', 'Turn complaints into case studies for growth'], category: 'customer_focus' },
  { id: 'q6', text: 'How do you manage your business expenses?', options: ['No tracking at all', 'Mental notes only', 'Basic written records', 'Spreadsheet tracking', 'Accounting software with categories'], category: 'financial_discipline' },
];
