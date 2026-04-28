import { useEffect, useState } from 'react';
import { TrendingUp, Award, ChevronDown, ChevronUp } from 'lucide-react';

export default function ScoreCard({ assessment, compact = false }) {
  const { scoreTotal, pillars, band } = assessment;
  const [animated, setAnimated] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const circumference = 2 * Math.PI * 45;
  const offset = animated ? circumference - (scoreTotal / 100) * circumference : circumference;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Main Score Ring */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Credit Readiness Score</h2>
            <p className="text-slate-500 text-sm">Based on 4 pillars of creditworthiness</p>
          </div>
          <Award size={22} className="text-teal-500" />
        </div>
        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="45" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle cx="55" cy="55" r="45" fill="none" stroke={band.color} strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1.5s ease-out', transformOrigin: 'center', transform: 'rotate(-90deg)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-800">{scoreTotal}</span>
              <span className="text-xs text-slate-400 font-medium">/100</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold mb-2"
              style={{ backgroundColor: band.bg, color: band.color }}>
              {band.emoji} {band.label}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{band.description}</p>
          </div>
        </div>
      </div>

      {/* Pillar Breakdown */}
      {!compact && (
        <div className="space-y-2">
          {Object.entries(pillars).map(([key, pillar]) => (
            <div key={key} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <button className="w-full px-4 py-3 flex items-center gap-3 text-left"
                onClick={() => setExpanded(expanded === key ? null : key)}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: pillar.color + '20' }}>
                  <TrendingUp size={16} style={{ color: pillar.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-700 truncate">{pillar.label}</span>
                    <span className="text-sm font-bold ml-2 flex-shrink-0" style={{ color: pillar.color }}>{pillar.score}/100</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-1.5 w-full">
                    <div className="h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: animated ? `${pillar.score}%` : '0%', backgroundColor: pillar.color }} />
                  </div>
                </div>
                <span className="text-slate-400 flex-shrink-0">
                  {expanded === key ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>
              {expanded === key && (
                <div className="px-4 pb-4 border-t border-slate-50 pt-3 space-y-2">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Breakdown (Weight: {pillar.weight}%)</p>
                  {pillar.breakdown.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${item.pts >= 10 ? 'bg-emerald-400' : item.pts > 0 ? 'bg-amber-400' : 'bg-red-400'}`} />
                      <div>
                        <span className="text-xs font-semibold text-slate-700">{item.item}</span>
                        <span className="text-xs text-slate-500 ml-2">({item.pts} pts)</span>
                        <p className="text-xs text-slate-500 mt-0.5">{item.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
