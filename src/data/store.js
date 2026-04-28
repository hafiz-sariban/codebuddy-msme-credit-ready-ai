// Central state store using localStorage for persistence
// Acts as our lightweight "database" for the MVP

const STORAGE_KEY = 'msme_credit_app';

const defaultState = {
  user: null,
  assessments: [],
  auditLog: [],
  chatHistory: [],
  actionPlan: [],
  achievements: [],
  currentView: 'onboarding', // onboarding | dashboard | assessment | coach | plan | history
};

export function getState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

export function setState(updates) {
  const current = getState();
  const next = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function addAuditEntry(action, details) {
  const state = getState();
  const entry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    action,
    details,
  };
  setState({ auditLog: [...(state.auditLog || []), entry] });
}

export function saveAssessment(assessment) {
  const state = getState();
  const record = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...assessment,
  };
  setState({ assessments: [...(state.assessments || []), record] });
  addAuditEntry('ASSESSMENT_SAVED', { scoreTotal: assessment.scoreTotal });
  return record;
}

export function addChatMessage(role, content) {
  const state = getState();
  const msg = {
    id: Date.now(),
    role, // 'user' | 'coach'
    content,
    timestamp: new Date().toISOString(),
  };
  setState({ chatHistory: [...(state.chatHistory || []), msg] });
  return msg;
}

export function resetApp() {
  localStorage.removeItem(STORAGE_KEY);
}
