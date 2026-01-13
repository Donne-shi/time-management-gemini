
import React, { useState, useMemo } from 'react';
import { Task, FocusSession, AppState } from '../types';
import { Target, BookOpen, Plus, Trash2, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Props {
  tasks: Task[];
  focusHistory: FocusSession[];
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const WeeklyView: React.FC<Props> = ({ tasks, focusHistory, appState, setAppState }) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [pivotDate, setPivotDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState(new Date().toLocaleDateString('en-CA'));
  const [newGoalInput, setNewGoalInput] = useState('');
  const [showOutcome, setShowOutcome] = useState(false);

  // 计算当前周的数据
  const weekInfo = useMemo(() => {
    const d = new Date(pivotDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    
    const days = Array.from({ length: 7 }, (_, i) => {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      return {
        label: ['一', '二', '三', '四', '五', '六', '日'][i],
        date: current.getDate(),
        fullDate: current.toLocaleDateString('en-CA')
      };
    });

    return { days, rangeStr: `${monday.getFullYear()}年${monday.getMonth() + 1}月` };
  }, [pivotDate]);

  // 计算当前月的数据
  const monthInfo = useMemo(() => {
    const year = pivotDate.getFullYear();
    const month = pivotDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startPadding = firstDay.getDay() - 1;
    if (startPadding === -1) startPadding = 6;
    
    const days = [];
    for (let i = 0; i < startPadding; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        date: i,
        fullDate: d.toLocaleDateString('en-CA')
      });
    }
    
    return { 
      days, 
      title: `${year}年${month + 1}月`,
    };
  }, [pivotDate]);

  const navigate = (amount: number) => {
    const newPivot = new Date(pivotDate);
    if (viewMode === 'week') {
      newPivot.setDate(newPivot.getDate() + amount * 7);
    } else {
      newPivot.setMonth(newPivot.getMonth() + amount);
    }
    setPivotDate(newPivot);
  };

  const getStatsForDate = (dateStr: string) => {
    const dayTasks = tasks.filter(t => t.date === dateStr);
    const completed = dayTasks.filter(t => t.completed);
    const dayFocus = focusHistory.filter(f => f.date === dateStr);
    const minutes = dayFocus.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const avgEnergy = dayFocus.length > 0 
      ? (dayFocus.reduce((acc, curr) => acc + curr.energyScore, 0) / dayFocus.length).toFixed(1) 
      : '-';

    return {
      completed: completed.length,
      focusCount: dayFocus.length,
      minutes,
      avgEnergy,
      focusSessions: dayFocus.sort((a, b) => a.startTime - b.startTime),
      hasRecord: dayTasks.length > 0 || dayFocus.length > 0
    };
  };

  const currentStats = getStatsForDate(selectedDayStr);

  const addWeeklyGoal = () => {
    if (!newGoalInput.trim()) return;
    setAppState(prev => ({ 
      ...prev, 
      weeklyGoals: [...prev.weeklyGoals, { id: Date.now().toString(), title: newGoalInput.trim(), completed: false }] 
    }));
    setNewGoalInput('');
  };

  const toggleWeeklyGoal = (id: string) => {
    setAppState(prev => ({
      ...prev,
      weeklyGoals: prev.weeklyGoals.map(g => g.id === id ? { ...g, completed: !g.completed } : g)
    }));
  };

  const deleteWeeklyGoal = (id: string) => {
    setAppState(prev => ({
      ...prev,
      weeklyGoals: prev.weeklyGoals.filter(g => g.id !== id)
    }));
  };

  const editWeeklyGoal = (id: string, newTitle: string) => {
    setAppState(prev => ({
      ...prev,
      weeklyGoals: prev.weeklyGoals.map(g => g.id === id ? { ...g, title: newTitle } : g)
    }));
  };

  const formatDateTitle = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-start px-1">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800 dark:text-slate-100">
            {viewMode === 'week' ? '本周' : '本月'}
          </h1>
          <p className="text-slate-400 dark:text-slate-500 font-bold mt-1 text-sm">
            {viewMode === 'week' ? weekInfo.rangeStr : monthInfo.title}
          </p>
        </div>
        <button 
          onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
          className="bg-[#2a2a3c] text-white px-4 py-2 rounded-2xl text-xs font-black shadow-lg active:scale-95 transition-all"
        >
          {viewMode === 'week' ? '月视图' : '周视图'}
        </button>
      </header>

      {viewMode === 'week' && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2 px-1">
            <Target size={18} className="text-slate-800 dark:text-slate-200" strokeWidth={3} />
            <h2 className="font-black text-lg text-slate-800 dark:text-slate-100">本周核心目标</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-5 shadow-sm border border-slate-50 dark:border-slate-800">
            <div className="space-y-1 mb-4">
              {appState.weeklyGoals.map((goal) => (
                <div key={goal.id} className="group flex items-center p-2 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <button 
                    onClick={() => toggleWeeklyGoal(goal.id)}
                    className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-all shrink-0 ${goal.completed ? 'bg-[#ff6b6b] border-[#ff6b6b]' : 'border-slate-200 bg-white dark:bg-slate-900'}`}
                  >
                    {goal.completed && <Check size={12} className="text-white" strokeWidth={4} />}
                  </button>
                  <input 
                    value={goal.title}
                    onChange={(e) => editWeeklyGoal(goal.id, e.target.value)}
                    className={`font-bold flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 text-sm ${goal.completed ? 'line-through opacity-40' : ''}`}
                  />
                  <button 
                    onClick={() => deleteWeeklyGoal(goal.id)}
                    className="text-slate-200 dark:text-slate-700 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {appState.weeklyGoals.length === 0 && <p className="text-center py-4 text-slate-300 font-bold text-xs italic">暂无本周目标</p>}
            </div>

            <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800">
              <input 
                value={newGoalInput} 
                onChange={e => setNewGoalInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && addWeeklyGoal()} 
                placeholder="添加本周新目标..." 
                className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700 dark:text-slate-200 text-sm placeholder:text-slate-300" 
              />
              <button onClick={addWeeklyGoal} className={`p-2 rounded-xl shadow-lg active:scale-90 transition-all ml-2 ${newGoalInput.trim() ? 'bg-[#ff6b6b] text-white' : 'bg-slate-200 text-slate-400 dark:bg-slate-700'}`}>
                <Plus size={16} strokeWidth={4} />
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-black text-lg text-slate-800 dark:text-slate-100">
            {viewMode === 'week' ? '周历' : '月历'}
          </h2>
          <div className="flex space-x-2">
            <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center bg-[#2a2a3c] text-white rounded-full active:scale-90 transition-all shadow-md">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => navigate(1)} className="w-9 h-9 flex items-center justify-center bg-[#2a2a3c] text-white rounded-full active:scale-90 transition-all shadow-md">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-50 dark:border-slate-800">
          <div className="grid grid-cols-7 gap-1 text-center mb-6">
            {['一', '二', '三', '四', '五', '六', '日'].map(d => <span key={d} className="text-[12px] font-black text-slate-400 uppercase">{d}</span>)}
          </div>
          
          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
            {(viewMode === 'week' ? weekInfo.days : monthInfo.days).map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;
              const isSelected = day.fullDate === selectedDayStr;
              const hasData = getStatsForDate(day.fullDate).hasRecord;
              
              return (
                <button 
                  key={day.fullDate} 
                  onClick={() => setSelectedDayStr(day.fullDate)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-2xl relative transition-all active:scale-90 ${
                    isSelected ? 'bg-[#ff6b6b] text-white shadow-xl shadow-red-100' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-black tabular-nums">{day.date}</span>
                  {!isSelected && hasData && <div className="absolute bottom-1.5 w-1 h-1 bg-red-400 rounded-full" />}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-50 dark:border-slate-800">
        <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg mb-8">{formatDateTitle(selectedDayStr)}</h3>
        
        <div className="grid grid-cols-4 gap-2 text-center mb-10">
          {[
            { label: '完成任务', val: currentStats.completed },
            { label: '番茄次数', val: currentStats.focusCount },
            { label: '专注分钟', val: currentStats.minutes },
            { label: '平均精力', val: currentStats.avgEnergy },
          ].map((item, i) => (
            <div key={i}>
              <p className="text-3xl font-black text-[#ff6b6b] leading-none tabular-nums tracking-tighter">{item.val}</p>
              <p className="text-[10px] text-slate-400 mt-3 font-black uppercase tracking-widest">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {currentStats.focusSessions.length > 0 ? (
            currentStats.focusSessions.map(session => (
              <div key={session.id} className="bg-red-50/30 dark:bg-red-900/10 px-5 py-4 rounded-[24px] flex items-center justify-between border border-red-50/30 dark:border-red-900/10">
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-black text-[#ff6b6b] tabular-nums">{session.timeLabel}</span>
                  <span className="text-xs font-black text-slate-400">{session.durationMinutes}分钟</span>
                </div>
                <span className="text-xs font-black text-[#ff6b6b]">精力 {session.energyScore}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-300 font-bold italic text-sm">这一天还没有记录</p>
            </div>
          )}
        </div>
      </section>

      {viewMode === 'week' && (
        <div className="px-1 pt-2">
          <button onClick={() => setShowOutcome(true)} className="w-full bg-[#ff6b6b] text-white py-5 rounded-[28px] font-black text-base flex items-center justify-center shadow-xl shadow-red-100 active:scale-[0.98] transition-all">
            <BookOpen size={20} className="mr-3" strokeWidth={2.5} /> 生成本周成果
          </button>
        </div>
      )}

      {showOutcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[44px] p-8 shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setShowOutcome(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors"><X size={24} /></button>
            <div className="text-center mb-8"><h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">成就时刻</h3><p className="text-slate-400 font-bold mt-2 text-sm">这些是你过去一周的勋章</p></div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {tasks.filter(t => t.completed && t.date >= weekInfo.days[0].fullDate).map(t => (
                <div key={t.id} className="flex items-center space-x-3 bg-red-50/50 p-4 rounded-2xl border border-red-100/30"><Check size={18} className="text-[#ff6b6b]" strokeWidth={4} /><span className="font-bold text-slate-700 dark:text-slate-300 text-sm leading-tight">{t.title}</span></div>
              ))}
            </div>
            <button onClick={() => setShowOutcome(false)} className="w-full bg-[#ff6b6b] text-white py-5 rounded-3xl font-black mt-8 shadow-lg shadow-red-50 active:scale-95 transition-all">收下这份喜悦</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyView;
