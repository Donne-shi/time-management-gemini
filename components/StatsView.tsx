
import React, { useState } from 'react';
import { Task, FocusSession } from '../types';
import { Zap, Activity, Award, CheckCircle2, Lock, Sparkles, Lightbulb, Timer, Clock, Sprout, Waves, Crown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  tasks: Task[];
  focusHistory: FocusSession[];
}

interface Badge {
  id: string;
  title: string;
  requirement: string;
  icon: any;
  check: (count: number, mins: number) => { isEarned: boolean; progress: number; target: number };
}

const BADGES: Badge[] = [
  { id: 'start', title: '专注起点', requirement: '1 个番茄钟', icon: Sprout, check: (count) => ({ isEarned: count >= 1, progress: count, target: 1 }) },
  { id: 'deep', title: '深度专注', requirement: '100 分钟', icon: Waves, check: (_, mins) => ({ isEarned: mins >= 100, progress: mins, target: 100 }) },
  { id: 'pro', title: '达人', requirement: '50 个番茄', icon: Zap, check: (count) => ({ isEarned: count >= 50, progress: count, target: 50 }) },
  { id: 'master', title: '大师', requirement: '200 个番茄', icon: Crown, check: (count) => ({ isEarned: count >= 200, progress: count, target: 200 }) }
];

const StatsView: React.FC<Props> = ({ tasks, focusHistory }) => {
  const [range, setRange] = useState<'today' | 'weekly' | 'monthly'>('today');

  const totalCount = focusHistory.length;
  const totalMins = focusHistory.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const aggregateData = () => {
    const today = new Date().toISOString().split('T')[0];
    let filteredFocus = focusHistory;
    let filteredTasks = tasks;
    if (range === 'today') {
      filteredFocus = focusHistory.filter(f => f.date === today);
      filteredTasks = tasks.filter(t => t.date === today && t.completed);
    } else if (range === 'weekly') {
      const threshold = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];
      filteredFocus = focusHistory.filter(f => f.date >= threshold);
      filteredTasks = tasks.filter(t => t.completed && t.date >= threshold);
    }
    return { count: filteredFocus.length, mins: filteredFocus.reduce((acc, curr) => acc + curr.durationMinutes, 0), tasks: filteredTasks.length };
  };

  const stats = aggregateData();

  const chartData = (range === 'today' ? 
    ['08', '10', '12', '14', '16', '18', '20', '22'].map(h => ({
      name: `${h}:00`,
      energy: focusHistory.find(f => f.timeLabel?.startsWith(h))?.energyScore || 0
    })) : 
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayFocus = focusHistory.filter(f => f.date === dateStr);
      const avg = dayFocus.length > 0 ? dayFocus.reduce((a, c) => a + c.energyScore, 0) / dayFocus.length : 0;
      return { name: dateStr.split('-').slice(1).join('/'), energy: avg };
    })
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="px-1">
        <h1 className="text-4xl font-black tracking-tight text-slate-800 dark:text-slate-100">统计</h1>
        <p className="text-slate-400 dark:text-slate-500 font-bold mt-1 text-sm">你的每一份专注都有迹可循</p>
      </header>

      <div className="bg-slate-100/50 dark:bg-slate-800/40 p-1 rounded-[22px] flex border border-slate-100 dark:border-slate-800">
        {(['today', 'weekly', 'monthly'] as const).map((r) => (
          <button 
            key={r} 
            onClick={() => setRange(r)}
            className={`flex-1 py-3 rounded-[18px] text-[11px] font-black transition-all ${
              range === r ? 'bg-white dark:bg-slate-900 text-[#ff6b6b] shadow-sm' : 'text-slate-400 dark:text-slate-600'
            }`}
          >
            {r === 'today' ? '今日' : r === 'weekly' ? '本周' : '累计'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '番茄', val: stats.count },
          { label: '时长', val: stats.mins },
          { label: '完成', val: stats.tasks },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-[28px] p-5 shadow-sm border border-slate-50 dark:border-slate-800 text-center transition-colors">
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tabular-nums">{card.val}</p>
            <p className="text-[8px] text-slate-300 dark:text-slate-600 mt-2 font-black uppercase tracking-widest">{card.label}</p>
          </div>
        ))}
      </div>

      <section className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-50 dark:border-slate-800">
        <div className="flex items-center space-x-2 mb-8">
          <Activity size={18} className="text-[#ff6b6b]" strokeWidth={3} />
          <h2 className="font-black text-slate-800 dark:text-slate-100 text-base">专注精力曲线</h2>
        </div>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: -25, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" className="dark:opacity-5" />
              <XAxis dataKey="name" stroke="#cbd5e1" fontSize={9} axisLine={false} tickLine={false} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#cbd5e1" fontSize={9} axisLine={false} tickLine={false} width={35} tick={{ fontWeight: 'black' }} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'black' }} />
              <Area type="monotone" dataKey="energy" stroke="#ff6b6b" strokeWidth={3} fillOpacity={1} fill="url(#colorEnergy)" animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Award size={18} className="text-[#ff6b6b]" strokeWidth={3} />
            <h2 className="font-black text-slate-800 dark:text-slate-100 text-base">成就勋章</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {BADGES.map(badge => {
            const { isEarned, progress, target } = badge.check(totalCount, totalMins);
            const Icon = badge.icon;
            return (
              <div key={badge.id} className={`bg-white dark:bg-slate-900 rounded-[28px] p-5 border transition-all ${isEarned ? 'border-red-50 dark:border-red-900/20' : 'border-slate-50 dark:border-slate-800 opacity-60'}`}>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${isEarned ? 'bg-red-50 dark:bg-red-900/20 text-[#ff6b6b]' : 'bg-slate-50 dark:bg-slate-800 text-slate-200'}`}>
                    <Icon size={24} strokeWidth={2.5} />
                  </div>
                  <h3 className="font-black text-xs text-slate-800 dark:text-slate-200">{badge.title}</h3>
                  <p className="text-[8px] font-bold text-slate-300 dark:text-slate-600 mt-1 uppercase tracking-tight">{badge.requirement}</p>
                  <div className="w-full h-1 bg-slate-50 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                    <div className={`h-full ${isEarned ? 'bg-[#ff6b6b]' : 'bg-slate-200'}`} style={{ width: `${Math.min(100, (progress/target)*100)}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default StatsView;
