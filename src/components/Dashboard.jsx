import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { TrendingUp, Calendar, Shield, BarChart3 } from 'lucide-react';
import ScoreCard from './ScoreCard';

export default function Dashboard({ assessment, assessments, onReassess }) {
  const [activeTab, setActiveTab] = useState('overview');

  const chartData = assessments.map((a, i) => ({
    name: `Assessment ${i + 1}`,
    score: a.scoreTotal,
    financial: a.pillars.financial.score,
    operational: a.pillars.operational.score,
    alternative: a.pillars.alternative.score,
    psychometric: a.pillars.psychometric.score,
    date: new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const radarData = Object.entries(assessment.pillars).map(([k, p]) => ({
    subject: p.label.split(' ')[0],
    score: p.score,
    fullMark: 100,
  }));

  const trend = assessments.length >= 2
    ? assessment.scoreTotal - assessments[assessments.length - 2].scoreTotal
    : null;

  return (
    <div style={{ width: '100%', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Score + quick stats */}
      <ScoreCard assessment={assessment} compact />

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Assessments" value={assessments.length} icon={<BarChart3 size={16} />} color="teal" />
        <StatCard label="Score Trend" value={trend !== null ? (trend >= 0 ? `+${trend}` : `${trend}`) : '—'} icon={<TrendingUp size={16} />} color={trend >= 0 ? 'green' : 'red'} />
        <StatCard label="Best Pillar" value={Object.entries(assessment.pillars).sort((a,b) => b[1].score - a[1].score)[0][1].score} icon={<Shield size={16} />} color="indigo" />
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
        {[['overview', 'Overview'], ['trend', 'Trend'], ['pillars', 'Pillars'], ['audit', 'Audit']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === id ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab assessment={assessment} onReassess={onReassess} />}
      {activeTab === 'trend' && <TrendTab chartData={chartData} />}
      {activeTab === 'pillars' && <PillarsTab radarData={radarData} assessment={assessment} />}
      {activeTab === 'audit' && <AuditTab assessments={assessments} />}
    </div>
  );
}

function OverviewTab({ assessment, onReassess }) {
  const pillars = Object.entries(assessment.pillars);
  const sorted = [...pillars].sort((a, b) => a[1].score - b[1].score);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-3">Pillar Scores</h3>
        {pillars.map(([k, p]) => (
          <div key={k} className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">{p.label}</span>
              <span className="font-bold" style={{ color: p.color }}>{p.score}/100</span>
            </div>
            <div className="bg-slate-100 rounded-full h-2">
              <div className="h-2 rounded-full" style={{ width: `${p.score}%`, backgroundColor: p.color, transition: 'width 1s ease' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 border border-red-100 rounded-xl p-3">
          <p className="text-xs text-red-500 font-semibold uppercase tracking-wide mb-1">Needs Most Work</p>
          <p className="font-bold text-slate-700 text-sm">{weakest[1].label}</p>
          <p className="text-red-600 font-black text-xl">{weakest[1].score}<span className="text-xs font-normal">/100</span></p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
          <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wide mb-1">Strongest Pillar</p>
          <p className="font-bold text-slate-700 text-sm">{strongest[1].label}</p>
          <p className="text-emerald-600 font-black text-xl">{strongest[1].score}<span className="text-xs font-normal">/100</span></p>
        </div>
      </div>

      <button onClick={onReassess}
        className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2">
        <TrendingUp size={18} /> Re-assess My Score
      </button>
    </div>
  );
}

function TrendTab({ chartData }) {
  if (chartData.length < 2) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm text-center">
        <Calendar size={32} className="text-slate-300 mx-auto mb-3" />
        <p className="font-semibold text-slate-600">Not enough data yet</p>
        <p className="text-slate-400 text-sm mt-1">Complete another assessment to see your score trend.</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
      <h3 className="font-semibold text-slate-800 mb-4">Score Over Time</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
          <Area type="monotone" dataKey="score" stroke="#0d9488" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill: '#0d9488', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function PillarsTab({ radarData, assessment }) {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4">Pillar Radar View</h3>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
            <Radar name="Score" dataKey="score" stroke="#0d9488" fill="#0d9488" fillOpacity={0.2} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {Object.entries(assessment.pillars).map(([k, p]) => (
        <div key={k} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-700 text-sm">{p.label}</span>
            <span className="font-bold text-sm" style={{ color: p.color }}>{p.score}/100</span>
          </div>
          <div className="space-y-1.5">
            {p.breakdown.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.pts >= 10 ? 'bg-emerald-400' : item.pts > 0 ? 'bg-amber-400' : 'bg-red-400'}`} />
                <span className="text-slate-600">{item.item}</span>
                <span className="ml-auto font-semibold" style={{ color: item.pts >= 10 ? '#10b981' : item.pts > 0 ? '#f59e0b' : '#ef4444' }}>{item.pts}pts</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditTab({ assessments }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-800">Assessment History</h3>
      {[...assessments].reverse().map((a, i) => (
        <div key={a.id || i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-700 text-sm">Assessment #{assessments.length - i}</p>
              <p className="text-slate-400 text-xs">{new Date(a.timestamp).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black" style={{ color: a.band?.color || '#0d9488' }}>{a.scoreTotal}</p>
              <p className="text-xs text-slate-400">{a.band?.label}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {Object.entries(a.pillars).map(([k, p]) => (
              <div key={k} className="text-center">
                <p className="text-xs text-slate-400">{p.label.split(' ')[0]}</p>
                <p className="font-bold text-sm" style={{ color: p.color }}>{p.score}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      {assessments.length === 0 && (
        <p className="text-center text-slate-400 py-8">No assessments yet</p>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-500',
    indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm text-center">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mx-auto mb-1`}>{icon}</div>
      <p className="text-lg font-black text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
    </div>
  );
}
