
import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Calendar, BarChart2, Flag, Settings, ClipboardList, 
  Check, Timer as TimerIcon, ChevronRight, Trash2, Plus, Zap, 
  Target, Compass, ChevronDown, ChevronUp,
  Minus, Camera, Volume2, Moon, Bell, Shield, Globe, User,
  Play, X, Sparkles, Activity, Award, Crown, Sprout, Waves,
  ChevronLeft, BookOpen, Coffee
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// --- 类型定义 (Types) ---
type Priority = 'low' | 'medium' | 'high';
interface Task {
  id: string; title: string; completed: boolean; date: string; isCore?: boolean; slot?: number;
}
interface FocusSession {
  id: string; startTime: number; durationMinutes: number; energyScore: number; 
  type: 'pomodoro' | 'short-break' | 'long-break'; date: string; timeLabel: string;
}
interface Goal {
  id: string; title: string; category: '工作' | '学习' | '生活' | '财务' | '信仰' | '关系' | '服务' | '其他';
  progress: number; isExpanded?: boolean;
}
interface AppState {
  profile: { name: string; avatar: string; };
  mission: string; vision: string;
  weeklyGoals: { id: string; title: string; completed: boolean }[];
  annualGoals: Goal[];
  settings: {
    pomodoroMinutes: number; maxMinutes: number; soundEnabled: boolean;
    soundType: 'digital' | 'bell' | 'nature'; vibrationEnabled: boolean; darkMode: boolean;
  };
}

// --- 常量与资源 (Constants) ---
const SOUND_URLS = {
  digital: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  bell: 'https://assets.mixkit.co/active_storage/sfx/3005/3005-preview.mp3',
  nature: 'https://assets.mixkit.co/active_storage/sfx/2431/2431-preview.mp3'
};
const CATEGORIES: Goal['category'][] = ['工作', '学习', '生活', '财务', '信仰', '关系', '服务', '其他'];

// --- 基础组件 ---
const BrandLogo = ({ className }: { className?: string }) => (
  <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#FF6B6B] to-[#EE5253] overflow-hidden ${className}`}>
    <div className="absolute top-0 right-0 w-full h-full bg-white opacity-10 translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl" />
    <svg viewBox="0 0 100 100" className="w-[70%] h-[70%] text-white drop-shadow-lg">
      <path d="M50 15 Q55 5 65 10" stroke="#4ADE80" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="50" cy="55" r="32" fill="none" stroke="currentColor" strokeWidth="7" />
      <path d="M50 38 V55 H62" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  </div>
);

const AutoResizingTextarea = ({ value, onChange, placeholder, className, isExpanded }: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = () => {
    const node = textareaRef.current;
    if (node) {
      if (isExpanded) {
        node.style.height = '0px';
        node.style.height = `${node.scrollHeight}px`;
      } else {
        node.style.height = '64px';
      }
    }
  };
  useLayoutEffect(() => { adjustHeight(); }, [value, isExpanded]);
  return (
    <textarea ref={textareaRef} value={value} onChange={onChange} placeholder={placeholder}
      className={`${className} resize-none overflow-hidden block w-full outline-none transition-[height] duration-300`} rows={1} />
  );
};

// --- 子组件：今日 (TodayView) ---
const TodayView = ({ tasks, setTasks, toggleTask, deleteTask, setView, focusHistory }) => {
  const [slotInputs, setSlotInputs] = useState(['', '', '']);
  const [bottomInput, setBottomInput] = useState('');
  const today = new Date().toLocaleDateString('en-CA');

  const handleAddSlotTask = (index: number) => {
    const title = slotInputs[index].trim();
    if (!title) return;
    const newTask = { id: Math.random().toString(), title, completed: false, isCore: true, slot: index + 1, date: today };
    setTasks(prev => [...prev, newTask]);
    const next = [...slotInputs]; next[index] = ''; setSlotInputs(next);
  };

  const handleAddBottomTask = () => {
    const title = bottomInput.trim();
    if (!title) return;
    const todayTasks = tasks.filter(t => t.date === today);
    const filled = todayTasks.filter(t => t.slot).map(t => t.slot);
    let assigned = undefined;
    for (let i = 1; i <= 3; i++) { if (!filled.includes(i)) { assigned = i; break; } }
    const newTask = { id: Math.random().toString(), title, completed: false, isCore: assigned !== undefined, slot: assigned, date: today };
    setTasks(prev => [...prev, newTask]);
    setBottomInput('');
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const todayTasks = tasks.filter(t => t.date === today);
  const slotTasks = [1, 2, 3].map(s => todayTasks.find(t => t.slot === s));
  const generalTasks = todayTasks.filter(t => !t.slot);
  const todayFocus = focusHistory.filter(f => f.date === today);
  const todayMinutes = todayFocus.reduce((a, c) => a + c.durationMinutes, 0);

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="group flex items-center px-4 py-4 rounded-[24px] bg-red-50/40 dark:bg-red-900/10 border border-red-100/20 dark:border-red-900/10 transition-all active:scale-[0.98]">
      <button onClick={() => toggleTask(task.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-all shrink-0 ${task.completed ? 'bg-[#FF6B6B] border-[#FF6B6B]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
        {task.completed && <Check size={12} className="text-white" strokeWidth={4} />}
      </button>
      <span className={`flex-1 font-bold text-slate-700 dark:text-slate-200 text-sm ${task.completed ? 'line-through opacity-30' : ''}`}>{task.title}</span>
      <button onClick={() => deleteTask(task.id)} className="text-slate-200 dark:text-slate-800 hover:text-red-400 ml-2 transition-colors p-1"><Trash2 size={16} /></button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 text-left">
      <header className="px-1 flex justify-between items-start">
        <div><h1 className="text-4xl font-black text-slate-800 dark:text-slate-100">今日</h1><p className="text-slate-400 font-bold mt-1 text-sm">{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</p></div>
        <BrandLogo className="w-14 h-14 rounded-2xl shadow-xl shadow-red-100 dark:shadow-none" />
      </header>
      <section className="space-y-4">
        <div className="flex items-center space-x-2 px-1"><Zap size={18} className="text-[#FF6B6B]" strokeWidth={3} /><h2 className="font-black text-lg text-slate-800 dark:text-slate-100">今日核心目标</h2></div>
        <div className="space-y-3">
          {slotTasks.map((task, idx) => (
            <div key={idx}>
              {task ? <TaskItem task={task} /> : (
                <div className="flex items-center px-4 py-4 rounded-[24px] border-2 border-dashed border-slate-100 dark:border-slate-800 transition-all">
                  <div className="w-6 h-6 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 mr-3 shrink-0" />
                  <input value={slotInputs[idx]} onChange={e => { const n = [...slotInputs]; n[idx] = e.target.value; setSlotInputs(n); }} onKeyDown={e => e.key === 'Enter' && handleAddSlotTask(idx)} placeholder={`设定核心目标 ${idx + 1}`} className="flex-1 bg-transparent border-none outline-none font-bold text-slate-600 dark:text-slate-300 text-sm placeholder:text-slate-200" />
                </div>
              )}
            </div>
          ))}
        </div>
        {generalTasks.map(t => <div key={t.id}><TaskItem task={t} /></div>)}
        <div className="flex items-center bg-slate-100/50 dark:bg-slate-800/40 rounded-[28px] p-4 mt-6 border border-slate-50 dark:border-slate-800">
          <input value={bottomInput} onChange={e => setBottomInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddBottomTask()} placeholder="添加任务，点击➕号" className="flex-1 bg-transparent outline-none font-bold text-sm" />
          <button onClick={handleAddBottomTask} className={`p-2.5 rounded-2xl transition-all active:scale-90 ${bottomInput.trim() ? 'bg-[#FF6B6B] text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}><Plus size={20} strokeWidth={4} /></button>
        </div>
      </section>
      <div onClick={() => setView('pomodoro')} className="bg-[#FF6B6B] rounded-[32px] p-6 text-white flex items-center justify-between shadow-xl shadow-red-100 dark:shadow-none mt-8 active:scale-[0.98] transition-all cursor-pointer">
        <div className="flex items-center space-x-4"><div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"><TimerIcon size={28} strokeWidth={3} /></div><div><h3 className="text-xl font-black italic">番茄专注</h3><p className="text-white/70 text-xs font-bold">进入沉浸式生产力模式</p></div></div>
        <ChevronRight size={24} className="opacity-40" />
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-4 text-center">
        <div><p className="text-4xl font-black text-[#FF6B6B] tabular-nums">{todayFocus.length}</p><p className="text-[9px] text-slate-300 font-black mt-2 uppercase tracking-widest">专注次数</p></div>
        <div className="border-l border-slate-50 dark:border-slate-800"><p className="text-4xl font-black text-[#FF6B6B] tabular-nums">{todayMinutes}</p><p className="text-[9px] text-slate-300 font-black mt-2 uppercase tracking-widest">专注分钟</p></div>
      </div>
    </div>
  );
};

// --- 子组件：统计 (StatsView) ---
const StatsView = ({ tasks, focusHistory }) => {
  const [range, setRange] = useState<'today' | 'weekly' | 'monthly'>('today');
  const aggregateData = () => {
    const today = new Date().toLocaleDateString('en-CA');
    let fFocus = focusHistory; let fTasks = tasks;
    if (range === 'today') {
      fFocus = focusHistory.filter(f => f.date === today);
      fTasks = tasks.filter(t => t.date === today && t.completed);
    } else if (range === 'weekly') {
      const threshold = new Date(Date.now() - 7 * 86400000).toLocaleDateString('en-CA');
      fFocus = focusHistory.filter(f => f.date >= threshold);
      fTasks = tasks.filter(t => t.completed && t.date >= threshold);
    }
    return { count: fFocus.length, mins: fFocus.reduce((a,c)=>a+c.durationMinutes,0), completed: fTasks.length };
  };
  const stats = aggregateData();
  const chartData = useMemo(() => {
    return ['08', '10', '12', '14', '16', '18', '20', '22'].map(h => ({
      name: `${h}:00`, energy: focusHistory.find(f => f.timeLabel?.startsWith(h))?.energyScore || 0
    }));
  }, [focusHistory]);

  const BADGES = [
    { id: 'start', title: '专注起点', requirement: '1 个番茄钟', icon: Sprout, check: (c) => ({ isEarned: c >= 1, progress: c, target: 1 }) },
    { id: 'deep', title: '深度专注', requirement: '100 分钟', icon: Waves, check: (_, m) => ({ isEarned: m >= 100, progress: m, target: 100 }) },
    { id: 'pro', title: '达人', requirement: '50 个番茄', icon: Zap, check: (c) => ({ isEarned: c >= 50, progress: c, target: 50 }) },
    { id: 'master', title: '大师', requirement: '200 个番茄', icon: Crown, check: (c) => ({ isEarned: c >= 200, progress: c, target: 200 }) }
  ];

  return (
    <div className="space-y-6 pb-20 text-left">
      <header className="px-1"><h1 className="text-4xl font-black">统计</h1><p className="text-slate-400 font-bold mt-1 text-sm">你的每一份专注都有迹可循</p></header>
      <div className="bg-slate-100/50 dark:bg-slate-800/40 p-1 rounded-[22px] flex border border-slate-100 dark:border-slate-800">
        {['today', 'weekly', 'monthly'].map((r: any) => (
          <button key={r} onClick={()=>setRange(r)} className={`flex-1 py-3 rounded-[18px] text-[11px] font-black transition-all ${range === r ? 'bg-white dark:bg-slate-900 text-[#FF6B6B] shadow-sm' : 'text-slate-400'}`}>
            {r === 'today' ? '今日' : r === 'weekly' ? '本周' : '累计'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[{l:'番茄',v:stats.count}, {l:'时长',v:stats.mins}, {l:'完成',v:stats.completed}].map((c,i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-[28px] p-5 shadow-sm border border-slate-50 dark:border-slate-800 text-center transition-colors">
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tabular-nums">{c.v}</p><p className="text-[8px] text-slate-300 mt-2 font-black uppercase tracking-widest">{c.l}</p>
          </div>
        ))}
      </div>
      <section className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-50 dark:border-slate-800">
        <div className="flex items-center space-x-2 mb-8"><Activity size={18} className="text-[#FF6B6B]" strokeWidth={3} /><h2 className="font-black text-base">专注精力曲线</h2></div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{left:-25}}>
              <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} />
              <YAxis domain={[1,5]} ticks={[1,2,3,4,5]} hide />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', fontSize: '11px' }} />
              <Area type="monotone" dataKey="energy" stroke="#FF6B6B" fill="#FF6B6B22" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3">
        {BADGES.map(badge => {
          const { isEarned, progress, target } = badge.check(focusHistory.length, focusHistory.reduce((a,c)=>a+c.durationMinutes,0));
          const Icon = badge.icon;
          return (
            <div key={badge.id} className={`bg-white dark:bg-slate-900 rounded-[28px] p-5 border transition-all ${isEarned ? 'border-red-50' : 'opacity-60 grayscale'}`}>
              <div className="flex flex-col items-center"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${isEarned ? 'bg-red-50 text-[#FF6B6B]' : 'bg-slate-50'}`}><Icon size={24} /></div><h3 className="font-black text-xs">{badge.title}</h3><p className="text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-tight">{badge.requirement}</p>
              <div className="w-full h-1 bg-slate-50 dark:bg-slate-800 rounded-full mt-4 overflow-hidden"><div className={`h-full ${isEarned ? 'bg-[#FF6B6B]' : 'bg-slate-200'}`} style={{ width: `${Math.min(100, (progress/target)*100)}%` }} /></div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 子组件：番茄钟 (PomodoroView) ---
const PomodoroView = ({ settings, onBack, onComplete }) => {
  const [targetMinutes, setTargetMinutes] = useState(settings.pomodoroMinutes);
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeOptions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 90, 120];

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    else if (timeLeft === 0 && isActive) {
      setIsActive(false); setShowScore(true);
      if (settings.soundEnabled) new Audio(SOUND_URLS[settings.soundType]).play().catch(()=>{});
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleScroll = () => {
    if (!scrollRef.current || isActive) return;
    const container = scrollRef.current;
    const center = container.scrollLeft + container.offsetWidth / 2;
    let closestIndex = 0; let minDistance = Infinity;
    Array.from(container.children).forEach((child, index) => {
      const el = child as HTMLElement; const dist = Math.abs(center - (el.offsetLeft + el.offsetWidth / 2));
      if (dist < minDistance) { minDistance = dist; closestIndex = index; }
    });
    const val = timeOptions[closestIndex];
    if (val !== targetMinutes) { setTargetMinutes(val); setTimeLeft(val * 60); if('vibrate' in navigator) navigator.vibrate(8); }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-900 z-[100] flex flex-col p-8 items-center justify-center text-center">
      <button onClick={onBack} className="absolute top-8 left-8 p-2 text-slate-300"><ChevronLeft size={32}/></button>
      <div className={`relative w-80 h-80 flex items-center justify-center mb-12 transition-all duration-700 ${isActive ? 'scale-110' : ''}`}>
        <svg className="absolute inset-0 w-full h-full -rotate-90"><circle cx="50%" cy="50%" r="45%" fill="none" stroke="#f1f5f9" strokeWidth="12" className="dark:stroke-slate-800" /><circle cx="50%" cy="50%" r="45%" fill="none" stroke="#FF6B6B" strokeWidth="12" strokeDasharray="301.6%" strokeDashoffset={`${301.6 * (1 - timeLeft/(targetMinutes*60))}%`} strokeLinecap="round" className="transition-all duration-1000" /></svg>
        <div className="flex flex-col items-center"><div className="text-7xl font-black tabular-nums text-slate-800 dark:text-slate-100">{Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</div><p className="text-slate-400 font-bold mt-4 text-sm">{isActive ? '享受心流' : '滑动刻度选择'}</p></div>
      </div>
      {!isActive && (
        <div className="w-full relative h-24 mb-12 flex items-center">
           <div className="absolute left-1/2 -top-2 -translate-x-1/2 w-0.5 h-16 bg-[#FF6B6B] z-20" />
           <div ref={scrollRef} onScroll={handleScroll} className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory px-[50%] space-x-12 h-full items-center">
             {timeOptions.map(opt => (
               <button key={opt} className={`snap-center shrink-0 flex flex-col items-center min-w-[40px] transition-all ${targetMinutes === opt ? 'text-[#FF6B6B] scale-150 font-black' : 'text-slate-200 font-bold'}`}>
                 <span className="text-2xl">{opt}</span><div className={`w-1 rounded-full mt-2 ${targetMinutes === opt ? 'h-3 bg-[#FF6B6B]' : 'h-1.5 bg-slate-100'}`} />
               </button>
             ))}
           </div>
        </div>
      )}
      <button onClick={() => setIsActive(!isActive)} className={`w-full py-6 rounded-[32px] text-xl font-black shadow-2xl transition-all ${isActive ? 'bg-slate-800 text-white' : 'bg-[#FF6B6B] text-white shadow-red-200'}`}>
        {isActive ? '放弃本次专注' : '开始专注'}
      </button>
      {showScore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-8 z-[110] animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 w-full max-w-sm text-center">
            <h3 className="text-3xl font-black mb-2">专注达成！</h3><p className="text-slate-400 font-bold mb-10 text-sm">为这次专注的状态打个分吧</p>
            <div className="flex justify-between">{[1,2,3,4,5].map(v => (
              <button key={v} onClick={() => { onComplete({ id:Date.now().toString(), durationMinutes:targetMinutes, energyScore:v, date:new Date().toLocaleDateString('en-CA'), timeLabel:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}) }); onBack(); }}
                className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 font-black hover:bg-[#FF6B6B] hover:text-white transition-all">{v}</button>
            ))}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 子组件：周/月 (WeeklyView) ---
const WeeklyView = ({ tasks, focusHistory, appState, setAppState }) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [pivotDate, setPivotDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState(new Date().toLocaleDateString('en-CA'));
  const [showOutcome, setShowOutcome] = useState(false);
  const weekInfo = useMemo(() => {
    const d = new Date(pivotDate); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const days = Array.from({length:7}, (_,i) => {
      const cur = new Date(monday); cur.setDate(monday.getDate()+i); return { label:['一','二','三','四','五','六','日'][i], date:cur.getDate(), fullDate:cur.toLocaleDateString('en-CA') };
    });
    return { days, title: `${monday.getFullYear()}年${monday.getMonth()+1}月` };
  }, [pivotDate]);
  
  const monthInfo = useMemo(() => {
    const y = pivotDate.getFullYear(); const m = pivotDate.getMonth(); const first = new Date(y, m, 1); const last = new Date(y, m+1, 0);
    let pad = first.getDay() - 1; if(pad === -1) pad = 6;
    const days = []; for(let i=0; i<pad; i++) days.push(null);
    for(let i=1; i<=last.getDate(); i++) days.push({ date:i, fullDate: new Date(y, m, i).toLocaleDateString('en-CA') });
    return { days, title: `${y}年${m+1}月` };
  }, [pivotDate]);

  const stats = useMemo(() => {
    const dayTasks = tasks.filter(t => t.date === selectedDayStr);
    const dayFocus = focusHistory.filter(f => f.date === selectedDayStr);
    return { completed: dayTasks.filter(t=>t.completed).length, minutes: dayFocus.reduce((a,c)=>a+c.durationMinutes,0), sessions: dayFocus };
  }, [selectedDayStr, tasks, focusHistory]);

  return (
    <div className="space-y-6 pb-20 text-left">
      <header className="flex justify-between items-start px-1">
        <div><h1 className="text-4xl font-black">{viewMode==='week'?'本周':'本月'}</h1><p className="text-slate-400 font-bold mt-1 text-sm">{viewMode==='week'?weekInfo.title:monthInfo.title}</p></div>
        <button onClick={()=>setViewMode(viewMode==='week'?'month':'week')} className="bg-[#2a2a3c] text-white px-4 py-2 rounded-2xl text-xs font-black shadow-lg">切换视图</button>
      </header>
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-black text-lg text-slate-800 dark:text-slate-100">日历</h2>
          <div className="flex space-x-2">
            <button onClick={()=>setPivotDate(new Date(pivotDate.setDate(pivotDate.getDate()-(viewMode==='week'?7:30))))} className="w-9 h-9 flex items-center justify-center bg-[#2a2a3c] text-white rounded-full shadow-md"><ChevronLeft size={20}/></button>
            <button onClick={()=>setPivotDate(new Date(pivotDate.setDate(pivotDate.getDate()+(viewMode==='week'?7:30))))} className="w-9 h-9 flex items-center justify-center bg-[#2a2a3c] text-white rounded-full shadow-md"><ChevronRight size={20}/></button>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-50 dark:border-slate-800">
          <div className="grid grid-cols-7 gap-1 text-center mb-6">{['一','二','三','四','五','六','日'].map(d=><span key={d} className="text-[12px] font-black text-slate-400">{d}</span>)}</div>
          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
            {(viewMode==='week'?weekInfo.days:monthInfo.days).map((day, idx) => {
              if(!day) return <div key={idx} />;
              const isSel = day.fullDate === selectedDayStr;
              return <button key={day.fullDate} onClick={()=>setSelectedDayStr(day.fullDate)} className={`aspect-square flex flex-col items-center justify-center rounded-2xl relative transition-all ${isSel ? 'bg-[#FF6B6B] text-white shadow-xl shadow-red-100' : 'text-slate-700 dark:text-slate-300'}`}><span className="text-sm font-black tabular-nums">{day.date}</span></button>
            })}
          </div>
        </div>
      </section>
      <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-50">
        <h3 className="font-black text-lg mb-8">{new Date(selectedDayStr).toLocaleDateString('zh-CN', {month:'long',day:'numeric',weekday:'long'})}</h3>
        <div className="grid grid-cols-2 gap-4 text-center mb-10">
          <div><p className="text-3xl font-black text-[#FF6B6B] tabular-nums">{stats.completed}</p><p className="text-[10px] text-slate-400 mt-3 font-black uppercase tracking-widest">完成任务</p></div>
          <div><p className="text-3xl font-black text-[#FF6B6B] tabular-nums">{stats.minutes}</p><p className="text-[10px] text-slate-400 mt-3 font-black uppercase tracking-widest">专注分钟</p></div>
        </div>
        <div className="space-y-3">
          {stats.sessions.map(s => <div key={s.id} className="bg-red-50/30 px-5 py-4 rounded-[24px] flex justify-between border border-red-50/30"><span className="text-xs font-black text-[#FF6B6B] tabular-nums">{s.timeLabel}</span><span className="text-xs font-black text-slate-400">{s.durationMinutes}分钟</span></div>)}
          {stats.sessions.length === 0 && <p className="text-center py-6 text-slate-300 font-bold italic text-sm">无记录</p>}
        </div>
      </section>
      <button onClick={()=>setShowOutcome(true)} className="w-full bg-[#FF6B6B] text-white py-5 rounded-[28px] font-black flex items-center justify-center shadow-xl shadow-red-100 transition-all"><BookOpen size={20} className="mr-3" />生成本周成果</button>
      {showOutcome && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[44px] p-8 w-full max-w-sm relative">
            <button onClick={()=>setShowOutcome(false)} className="absolute top-6 right-6 text-slate-300"><X size={24}/></button>
            <div className="text-center mb-8"><h3 className="text-2xl font-black">成就时刻</h3><p className="text-slate-400 font-bold mt-2 text-sm">这些是你过去一周的勋章</p></div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {tasks.filter(t=>t.completed && t.date >= weekInfo.days[0].fullDate).map(t=><div key={t.id} className="flex items-center space-x-3 bg-red-50/50 p-4 rounded-2xl border border-red-100/30"><Check size={18} className="text-[#FF6B6B]" strokeWidth={4} /><span className="font-bold text-slate-700 text-sm">{t.title}</span></div>)}
            </div>
            <button onClick={()=>setShowOutcome(false)} className="w-full bg-[#FF6B6B] text-white py-5 rounded-3xl font-black mt-8">收下这份喜悦</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 子组件：目标 (GoalsView) ---
const GoalsView = ({ state, setState }) => {
  const [isMissionExpanded, setIsMissionExpanded] = useState(false);
  const [isVisionExpanded, setIsVisionExpanded] = useState(false);
  const updateProgress = (id, val) => setState(p => ({...p, annualGoals: p.annualGoals.map(g=>g.id===id?{...g, progress:val}:g)}));

  return (
    <div className="space-y-8 pb-20 text-left">
      <header><h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">目标</h1><p className="text-slate-400 font-bold mt-1">奔向你的星辰大海</p></header>
      <section className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-sm border border-slate-50 space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center"><h3 className="font-black flex items-center"><div className="bg-red-50 p-2 rounded-xl mr-3"><Target size={18} className="text-[#FF6B6B]" strokeWidth={3}/></div>使命 (Mission)</h3><button onClick={()=>setIsMissionExpanded(!isMissionExpanded)} className="text-slate-300">{isMissionExpanded?<ChevronUp/>:<ChevronDown/>}</button></div>
          <div className="relative"><AutoResizingTextarea value={state.mission} isExpanded={isMissionExpanded} onChange={e=>setState(p=>({...p, mission:e.target.value}))} className={`bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl font-bold text-sm leading-relaxed border border-transparent ${!isMissionExpanded?'mask-fade':''}`} />{!isMissionExpanded && <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-slate-50/95 dark:from-slate-800/95 rounded-b-3xl flex items-end justify-center pb-3 text-[10px] font-black text-[#FF6B6B] tracking-[0.2em]">点击展开全文</div>}</div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center"><h3 className="font-black flex items-center"><div className="bg-red-50 p-2 rounded-xl mr-3"><Compass size={18} className="text-[#FF6B6B]" strokeWidth={3}/></div>愿景 (Vision)</h3><button onClick={()=>setIsVisionExpanded(!isVisionExpanded)} className="text-slate-300">{isVisionExpanded?<ChevronUp/>:<ChevronDown/>}</button></div>
          <div className="relative"><AutoResizingTextarea value={state.vision} isExpanded={isVisionExpanded} onChange={e=>setState(p=>({...p, vision:e.target.value}))} className={`bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl font-bold text-sm leading-relaxed border border-transparent ${!isVisionExpanded?'mask-fade':''}`} />{!isVisionExpanded && <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-slate-50/95 dark:from-slate-800/95 rounded-b-3xl flex items-end justify-center pb-3 text-[10px] font-black text-[#FF6B6B] tracking-[0.2em]">点击展开全文</div>}</div>
        </div>
      </section>
      <div className="space-y-4">
        {state.annualGoals.map(g => (
          <div key={g.id} className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-sm border border-slate-50">
            <div className="p-7 flex items-center justify-between transition-all">
              <div className="flex items-center space-x-5 text-left"><div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center font-black text-lg text-[#FF6B6B]">{g.category.charAt(0)}</div><div><h4 className="font-black text-slate-800 dark:text-slate-100 text-base">{g.title}</h4><p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">{g.category} · {g.progress}% 已推进</p></div></div>
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#FF6B6B] font-black">{g.progress}%</div>
            </div>
            <div className="px-8 pb-10"><input type="range" min="0" max="100" value={g.progress} onChange={e=>updateProgress(g.id, parseInt(e.target.value))} className="w-full h-3 rounded-full appearance-none accent-[#FF6B6B] bg-slate-100" /></div>
          </div>
        ))}
      </div>
      <style>{`.mask-fade { mask-image: linear-gradient(to bottom, black 40%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 100%); }`}</style>
    </div>
  );
};

// --- 子组件：设置 (SettingsView) ---
const SettingsView = ({ state, setState }) => {
  const update = (k, v) => setState(p => ({...p, settings: {...p.settings, [k]: v}}));
  const playPreview = (type) => { const a = new Audio(SOUND_URLS[type]); a.volume = 0.5; a.play().catch(()=>{}); };

  return (
    <div className="space-y-8 pb-20 text-left">
      <header className="px-1"><h1 className="text-4xl font-black">设置</h1><p className="text-slate-400 font-bold mt-1 text-sm">时间好管家 · 高效生活从现在开始</p></header>
      <div className="bg-[#FF6B6B] rounded-[44px] p-8 text-white shadow-2xl shadow-red-200 flex items-center space-x-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 scale-150"><BrandLogo className="w-32 h-32 rounded-[24px]"/></div>
        <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center overflow-hidden border-4 border-white"><BrandLogo className="w-full h-full"/></div>
        <div><h3 className="text-2xl font-black">{state.profile.name}</h3><p className="opacity-70 text-sm font-bold flex items-center">数据已同步 <ChevronRight size={16}/></p></div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[44px] shadow-sm border border-slate-100 divide-y dark:divide-slate-800">
        <div className="px-8 min-h-[100px] flex items-center justify-between">
          <div className="flex items-center space-x-5"><div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl"><Bell size={22} strokeWidth={2.5}/></div><div><p className="font-black">默认番茄时长</p><p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">{state.settings.pomodoroMinutes} 分钟</p></div></div>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5 border border-slate-200">
            <button onClick={()=>update('pomodoroMinutes', Math.max(5, state.settings.pomodoroMinutes-5))} className="p-2 text-[#FF6B6B]"><Minus size={18} strokeWidth={3}/></button>
            <span className="mx-4 font-black tabular-nums">{state.settings.pomodoroMinutes}m</span>
            <button onClick={()=>update('pomodoroMinutes', Math.min(120, state.settings.pomodoroMinutes+5))} className="p-2 text-[#FF6B6B]"><Plus size={18} strokeWidth={3}/></button>
          </div>
        </div>
        <div className="px-8 min-h-[100px] flex items-center justify-between">
          <div className="flex items-center space-x-5"><div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl"><Moon size={22} strokeWidth={2.5}/></div><div><p className="font-black">深色模式</p><p className="text-[10px] text-slate-300 font-black uppercase mt-1">保护视力</p></div></div>
          <button onClick={()=>update('darkMode', !state.settings.darkMode)} className={`w-12 h-6.5 rounded-full transition-all border-2 ${state.settings.darkMode ? 'bg-[#FF6B6B] border-[#FF6B6B]' : 'bg-slate-200 border-slate-200'}`} />
        </div>
        <div className="p-8 space-y-6">
          <div className="flex items-center space-x-5"><div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl"><Volume2 size={22} strokeWidth={2.5}/></div><div><p className="font-black">提示音效</p><p className="text-[10px] text-slate-300 font-black uppercase mt-1">专注结束时的回响</p></div></div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[22px] border border-slate-200">
            {Object.keys(SOUND_URLS).map((type: any) => (
              <button key={type} onClick={()=>{update('soundType', type); playPreview(type);}} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${state.settings.soundType === type ? 'bg-[#FF6B6B] text-white shadow-lg' : 'text-slate-400'}`}>
                {type === 'digital' ? '数码' : type === 'bell' ? '风铃' : '自然'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[44px] p-6 shadow-sm border border-slate-100 space-y-4">
        <a href="https://www.mrbigtree.cn" target="_blank" className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] active:scale-[0.98] transition-all">
          <div className="flex items-center space-x-4"><div className="w-16 h-16 rounded-[22px] overflow-hidden border-2 border-white shadow-md"><img src="https://www.mrbigtree.cn/wp-content/uploads/2023/11/cropped-bigtree-avatar.jpg" className="w-full h-full object-cover"/></div><div><div className="flex items-center space-x-1.5"><p className="font-black text-slate-800 dark:text-slate-100 text-base">大树老师</p><span className="bg-red-50 text-[#FF6B6B] text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">开发者</span></div><p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest flex items-center">www.mrbigtree.cn <Globe size={10} className="ml-1"/></p></div></div>
          <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl shadow-sm text-[#FF6B6B]"><ChevronRight size={20} strokeWidth={3}/></div>
        </a>
      </div>
    </div>
  );
};

// --- 主应用组件 (App) ---
const App = () => {
  const [view, setView] = useState('today');
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('chronos_tasks_v4') || '[]'));
  const [focusHistory, setFocusHistory] = useState(() => JSON.parse(localStorage.getItem('chronos_focus_v4') || '[]'));
  const [state, setState] = useState(() => JSON.parse(localStorage.getItem('chronos_state_v4') || JSON.stringify({
    profile: { name: '时间好管家', avatar: '' },
    mission: "恢复自己和他人生命中真善美的形象和样式。帮助青少年和家庭建立卓越的自我管理能力。", 
    vision: "1. 成为一个好丈夫、好爸爸，建立有爱的亲密家庭\n2. 向1000人分享福音\n3. 帮助10万青少年学习高效时间管理\n4. 出版2本畅销书",
    weeklyGoals: [], annualGoals: [{id:'1', title:'学习英语和泰语', category:'学习', progress:25}, {id:'2', title:'服务好学生', category:'工作', progress:10}],
    settings: { pomodoroMinutes: 35, maxMinutes: 120, soundEnabled: true, soundType: 'digital', vibrationEnabled: true, darkMode: false }
  })));

  useEffect(() => {
    localStorage.setItem('chronos_tasks_v4', JSON.stringify(tasks));
    localStorage.setItem('chronos_focus_v4', JSON.stringify(focusHistory));
    localStorage.setItem('chronos_state_v4', JSON.stringify(state));
    if (state.settings.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [tasks, focusHistory, state]);

  const NavItem = ({ id, icon:Icon, label }) => (
    <button onClick={() => setView(id)} className={`flex-1 flex flex-col items-center py-4 transition-all ${view === id ? 'text-[#FF6B6B]' : 'text-slate-300'}`}>
      <Icon size={22} strokeWidth={view === id ? 3 : 2}/><span className="text-[10px] mt-1 font-bold">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">
      <main className="max-w-md mx-auto px-4 pt-12 pb-32">
        {view === 'today' && <TodayView tasks={tasks} setTasks={setTasks} toggleTask={id=>setTasks(ts=>ts.map(t=>t.id===id?{...t,completed:!t.completed}:t))} deleteTask={id=>setTasks(ts=>ts.filter(t=>t.id!==id))} setView={setView} focusHistory={focusHistory} />}
        {view === 'weekly' && <WeeklyView tasks={tasks} focusHistory={focusHistory} appState={state} setAppState={setState} />}
        {view === 'stats' && <StatsView tasks={tasks} focusHistory={focusHistory} />}
        {view === 'goals' && <GoalsView state={state} setState={setState} />}
        {view === 'settings' && <SettingsView state={state} setState={setState} />}
        {view === 'pomodoro' && <PomodoroView settings={state.settings} onBack={()=>setView('today')} onComplete={s=>{setFocusHistory(p=>[...p,s]); setView('today');}} />}
      </main>
      {view !== 'pomodoro' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex h-24 safe-bottom z-50">
          <NavItem id="today" icon={Calendar} label="今日" />
          <NavItem id="weekly" icon={ClipboardList} label="本周" />
          <NavItem id="stats" icon={BarChart2} label="统计" />
          <NavItem id="goals" icon={Flag} label="目标" />
          <NavItem id="settings" icon={Settings} label="设置" />
        </nav>
      )}
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
