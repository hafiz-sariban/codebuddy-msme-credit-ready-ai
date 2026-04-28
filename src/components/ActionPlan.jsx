import { useState } from 'react';
import { CheckCircle2, Circle, Clock, TrendingUp, Zap, Filter } from 'lucide-react';
import { getState, setState } from '../data/store';

const CATEGORY_COLORS = {
  Financial: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  Operations: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-400' },
  Digital: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
};

export default function ActionPlan({ plan: initialPlan }) {
  const [plan, setPlan] = useState(() => {
    const saved = getState().actionPlan;
    return saved && saved.length > 0 ? saved : initialPlan;
  });
  const [filter, setFilter] = useState('all');

  const toggle = (id) => {
    const updated = plan.map(t =>
      t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t
    );
    setPlan(updated);
    setState({ actionPlan: updated });
  };

  const done = plan.filter(t => t.status === 'done').length;
  const progress = plan.length ? Math.round((done / plan.length) * 100) : 0;

  const filtered = filter === 'all' ? plan : filter === 'pending' ? plan.filter(t => t.status !== 'done') : plan.filter(t => t.status === 'done');

  return (
    <div style={{ width: '100%', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-lg">Your Action Plan</h2>
            <p className="text-teal-200 text-sm">{done} of {plan.length} tasks completed</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black">{progress}%</span>
            <p className="text-teal-200 text-xs">Complete</p>
          </div>
        </div>
        <div className="bg-teal-800/50 rounded-full h-2">
          <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        {progress === 100 && (
          <p className="text-center text-teal-100 text-sm mt-3 font-semibold">🎉 Excellent! Reassess your score now!</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'High Priority', val: plan.filter(t => t.priority === 'high').length, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Pending', val: plan.filter(t => t.status !== 'done').length, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Done', val: done, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
            <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-600 text-xs font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Filter size={16} className="text-slate-400 mt-2 flex-shrink-0" />
        {['all', 'pending', 'done'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-teal-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
            {f === 'all' ? 'All Tasks' : f === 'pending' ? 'To Do' : 'Completed'}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filtered.map(task => {
          const c = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Operations;
          const isDone = task.status === 'done';
          return (
            <div key={task.id}
              className={`bg-white rounded-xl border-2 p-4 transition-all ${isDone ? 'border-emerald-200 opacity-70' : task.priority === 'high' ? 'border-red-200' : 'border-slate-100'}`}>
              <div className="flex gap-3">
                <button onClick={() => toggle(task.id)} className="mt-0.5 flex-shrink-0">
                  {isDone
                    ? <CheckCircle2 size={22} className="text-emerald-500" />
                    : <Circle size={22} className="text-slate-300" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className={`text-sm font-semibold leading-snug ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.task}
                    </p>
                    {task.priority === 'high' && !isDone && (
                      <span className="flex-shrink-0 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Urgent</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{task.reason}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${c.bg} ${c.border} ${c.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                      {task.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                      <Clock size={10} /> {task.timeframe}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-full font-semibold">
                      <TrendingUp size={10} /> {task.impact}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10">
          <Zap size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No tasks here</p>
        </div>
      )}
    </div>
  );
}
