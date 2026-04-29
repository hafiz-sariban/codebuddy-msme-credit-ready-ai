import { useState } from 'react';
import { calculateCreditScore, generateActionPlan } from './engine/scoringEngine';
import { saveAssessment, getState, setState } from './data/store';
import Onboarding from './components/Onboarding.jsx';
import Dashboard from './components/Dashboard.jsx';
import CoachChat from './components/CoachChat.jsx';
import ActionPlan from './components/ActionPlan.jsx';
import ScoreCard from './components/ScoreCard.jsx';
import { LayoutDashboard, Bot, ListChecks, Award, RefreshCw, Settings } from 'lucide-react';
import ApiSettings from './components/ApiSettings.jsx';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'score', label: 'Score', icon: Award },
  { id: 'plan', label: 'Action Plan', icon: ListChecks },
  { id: 'coach', label: 'Coach', icon: Bot },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function App() {
  const [state, setAppState] = useState(() => getState());
  const [tab, setTab] = useState('dashboard');

  const handleOnboardingComplete = (formData) => {
    const assessment = calculateCreditScore(
      formData, formData, formData, formData.psychAnswers
    );
    const actionPlan = generateActionPlan(assessment.pillars);
    const record = saveAssessment(assessment);
    const allAssessments = [...(getState().assessments || [])];
    const user = { businessName: formData.businessName, ownerName: formData.ownerName, businessType: formData.businessType };
    setState({ user, actionPlan, currentView: 'app' });
    setAppState({ ...getState(), user, actionPlan, assessments: allAssessments, currentView: 'app', latestAssessment: { ...assessment, ...record } });
  };

  const handleReassess = () => {
    setState({ currentView: 'onboarding' });
    setAppState(s => ({ ...s, currentView: 'onboarding' }));
  };

  if (state.currentView === 'onboarding' || !state.assessments || state.assessments.length === 0) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const assessments = state.assessments || [];
  const latest = state.latestAssessment || assessments[assessments.length - 1];
  const actionPlan = state.actionPlan || [];
  const user = state.user || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', background: '#f8fafc' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#0d9488,#0f766e)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b', lineHeight: 1 }}>MSME Credit Ready AI</div>
            {user.businessName && <div style={{ fontSize: 12, color: '#0d9488', fontWeight: 600, marginTop: 2 }}>{user.businessName}</div>}
          </div>
        </div>
        {latest && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Credit Score</div>
              <div style={{ fontWeight: 900, fontSize: 22, color: '#1e293b', lineHeight: 1 }}>
                {latest.scoreTotal}<span style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8' }}>/100</span>
              </div>
            </div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: latest.band?.color || '#0d9488' }} />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 72, width: '100%' }}>
        {tab === 'dashboard' && latest && (
          <Dashboard assessment={latest} assessments={assessments} onReassess={handleReassess} />
        )}
        {tab === 'score' && latest && (
          <div style={{ padding: '20px 20px', width: '100%' }}>
            <ScoreCard assessment={latest} />
            <button onClick={handleReassess} style={{ width: '100%', marginTop: 16, border: '2px solid #0d9488', color: '#0d9488', background: '#fff', fontWeight: 700, padding: '14px', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <RefreshCw size={16} /> Reassess My Score
            </button>
          </div>
        )}
        {tab === 'plan' && <ActionPlan plan={actionPlan} />}
        {tab === 'coach' && (
          <div style={{ height: 'calc(100vh - 130px)', display: 'flex', flexDirection: 'column' }}>
            <CoachChat assessment={latest} />
          </div>
        )}
        {tab === 'settings' && <ApiSettings />}
      </main>

      {/* Bottom Nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '8px 0 10px', zIndex: 10 }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 20px', background: 'none', border: 'none', cursor: 'pointer', color: tab === id ? '#0d9488' : '#94a3b8', flex: 1 }}>
            <Icon size={22} strokeWidth={tab === id ? 2.5 : 1.8} />
            <span style={{ fontSize: 11, fontWeight: 700 }}>{label}</span>
            {tab === id && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#0d9488' }} />}
          </button>
        ))}
      </nav>
    </div>
  );
}
