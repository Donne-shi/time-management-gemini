
import React from 'react';
import { Task, FocusSession } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Props {
  tasks: Task[];
  focusHistory: FocusSession[];
}

const DashboardView: React.FC<Props> = ({ tasks, focusHistory }) => {
  const completedCount = tasks.filter(t => t.completed).length;
  const totalFocusMinutes = focusHistory.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  
  // Prepare data for charts (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const daySessions = focusHistory.filter(s => new Date(s.startTime).toISOString().startsWith(date));
    const mins = daySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    return { name: date.slice(-2), minutes: mins };
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold">Productivity Report</h1>
        <p className="text-slate-400">Track your progress and momentum</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-slate-400 text-sm font-medium">Completed Tasks</p>
          <div className="flex items-end mt-2">
            <span className="text-4xl font-bold">{completedCount}</span>
            <span className="text-emerald-500 text-sm ml-2 mb-1">Total</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-slate-400 text-sm font-medium">Focus Time</p>
          <div className="flex items-end mt-2">
            <span className="text-4xl font-bold">{Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m</span>
            <span className="text-indigo-400 text-sm ml-2 mb-1">Total focus</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-slate-400 text-sm font-medium">Daily Streak</p>
          <div className="flex items-end mt-2">
            <span className="text-4xl font-bold">5</span>
            <span className="text-amber-500 text-sm ml-2 mb-1">Days active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-2xl h-80">
          <h3 className="text-lg font-semibold mb-6">Focus Trends (Min)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="minutes" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMins)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Task Categories</h3>
          <div className="space-y-4">
            {['Work', 'Personal', 'Health'].map(cat => {
              const count = tasks.filter(t => t.category === cat).length;
              const total = tasks.length || 1;
              const percent = (count / total) * 100;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{cat}</span>
                    <span className="text-slate-500">{count} tasks</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
