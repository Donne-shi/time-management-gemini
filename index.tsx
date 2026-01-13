
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

// --- 1. 类型定义 (Types) ---
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

// --- 2. 常量 (Constants) ---
const SOUND_URLS = {
  digital: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  bell: 'https://assets.mixkit.co/active_storage/sfx/3005/3005-preview.mp3',
  nature: 'https://assets.mixkit.co/active_storage/sfx/2431/2431-preview.mp3'
};
const GOAL_CATEGORIES: Goal['category'][] = ['工作', '学习', '生活', '财务', '信仰', '关系', '服务', '其他'];

// --- 3. 基础 UI 组件 ---
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
  useLayoutEffect(() => {
    const node = textareaRef.current;
    if (node) {
      if (isExpanded) {
        node.style.height = '0px';
        node.style.height = `${node.scrollHeight}px`;
      } else {
        node.style.height = '64px';
      }
    }
  }, [value, isExpanded]);
  return (
    <textarea ref={textareaRef} value={value} onChange={onChange} placeholder={placeholder}
      className={`${className} resize-none overflow-hidden block w-full outline-none transition-[height] duration-300`} rows={1} />
  );
};

// --- 4. 今日视图 (TodayView) ---
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
    <div className="group flex items-center px-4 py-4 rounded-[24px] bg-red-50/40 dark:bg-red-900/10 border border-red-100/20 dark:border-red-900/10 active:scale-[0.98] transition-all">
      <button onClick={() => toggleTask(task.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-all shrink-0 ${task.completed ? 'bg-[#FF6B6B] border-[#FF6B6B]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
        {task.completed && <Check size={12} className="text-white" strokeWidth={4} />}
      </button>
      <span className={`flex-1 font-bold text-slate-700 dark:text-slate-200 text-sm ${task.completed ? 'line-through opacity-30' : ''}`}>{task.title}</span>
      <button onClick={() => deleteTask(task.id)} className="text-slate-200 dark:text-slate-800 hover:text-red-400 p-1"><Trash2 size={16} /></button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 text-left">
      <header className="flex justify-between items-start">
        <div><h1 className="text-4xl font-black text-slate-800 dark:text-slate-100">今日</h1><p className="text-slate-400 font-bold mt-1 text-sm">{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</p></div>
        <BrandLogo className="w-14 h-14 rounded-2xl shadow-xl shadow-red-100 dark:shadow-none" />
      </header>
      <section className="space-y-4">
        <div className="flex items-center space-x-2"><Zap size={18} className="text-[#FF6B6B]" strokeWidth={3} /><h2 className="font-black text-lg">今日核心目标</h2></div>
        {slotTasks.map((task, idx) => (
          <div key={idx}>
            {task ? <TaskItem task={task} /> : (
              <div className="flex items-center px-4 py-4 rounded-[24px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <input value={slotInputs[idx]} onChange={e => { const n = [...slotInputs]; n[idx] = e.target.value; setSlotInputs(n); }} onKeyDown={e => e.key === 'Enter' && handleAddSlotTask(idx)} placeholder={`设定核心目标 ${idx + 1}`} className="flex-1 bg-transparent outline-none font-bold text-slate-600 text-sm" />
              </div>
            )}
          </div>
        ))}
        {generalTasks.map(t => <div key={t.id}><TaskItem task={t} /></div>)}
        <div className="flex items-center bg-slate-100/50 dark:bg-slate-800/40 rounded-[28px] p-4 mt-6 border border-slate-50 dark:border-slate-800">
          <input value={bottomInput} onChange={e => setBottomInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddBottomTask()} placeholder="添加任务，回退确认" className="flex-1 bg-transparent outline-none font-bold text-sm" />
          <button onClick={handleAddBottomTask} className="p-2.5 bg-[#FF6B6B] text-white rounded-2xl active:scale-90 shadow-lg"><Plus size={20} strokeWidth={4} /></button>
        </div>
      </section>
      <div onClick={() => setView('pomodoro')} className="bg-[#FF6B6B] rounded-[32px] p-6 text-white flex items-center justify-between shadow-xl cursor-pointer active:scale-[0.98] transition-all">
        <div className="flex items-center space-x-4"><div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"><TimerIcon size={28} strokeWidth={3} /></div><div><h3 className="text-xl font-black italic">番茄专注</h3><p className="opacity-70 text-xs font-bold">进入沉浸式生产力模式</p></div></div>
        <ChevronRight size={24} className="opacity-40" />
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-4 text-center">
        <div><p className="text-4xl font-black text-[#FF6B6B] tabular-nums">{todayFocus.length}</p><p className="text-[9px] text-slate-300 font-black mt-2 uppercase tracking-widest">专注次数</p></div>
        <div className="border-l border-slate-50 dark:border-slate-800"><p className="text-4xl font-black text-[#FF6B6B] tabular-nums">{todayMinutes}</p><p className="text-[9px] text-slate-300 font-black mt-2 uppercase tracking-widest">专注分钟</p></div>
      </div>
    </div>
  );
};

// --- 5. 统计视图 (StatsView) ---
const StatsView = ({ tasks, focusHistory }) => {
  const [range, setRange] = useState('today');
  const aggregate = () => {
    const today = new Date().toLocaleDateString('en-CA');
    const fFocus = range === 'today' ? focusHistory.filter(f => f.date === today) : focusHistory;
    const fTasks = range === 'today' ? tasks.filter(t => t.date === today && t.completed) : tasks.filter(t => t.completed);
    return { count: fFocus.length, mins: fFocus.reduce((a,c)=>a+c.durationMinutes,0), done: fTasks.length };
  };
  const stats = aggregate();
  const chartData = useMemo(() => ['08', '10', '12', '14', '16', '18', '20', '22'].map(h => ({ name: `${h}:00`, energy: focusHistory.find(f => f.timeLabel?.startsWith(h))?.energyScore || 0 })), [focusHistory]);

  const BADGES = [
    { id: '1', title: '专注起点', requirement: '1 个番茄钟', icon: Sprout, check: (c) => ({ isEarned: c >= 1, progress: c, target: 1 }) },
    { id: '2', title: '深度专注', requirement: '100 分钟', icon: Waves, check: (_, m) => ({ isEarned: m >= 100, progress: m, target: 100 }) },
    { id: '3', title: '达人', icon: Zap, requirement: '50 个番茄', check: (c) => ({ isEarned: c >= 50, progress: c, target: 50 }) },
    { id: '4', title: '大师', icon: Crown, requirement: '200 个番茄', check: (c) => ({ isEarned: c >= 200, progress: c, target: 200 }) }
  ];

  return (
    <div className="space-y-6 pb-20 text-left">
      <h1 className="text-4xl font-black">统计</h1>
      <div className="bg-slate-100/50 dark:bg-slate-800/40 p-1 rounded-[22px] flex">
        {['today', 'all'].map(r => (
          <button key={r} onClick={()=>setRange(r)} className={`flex-1 py-3 rounded-[18px] text-[11px] font-black ${range===r?'bg-white dark:bg-slate-900 text-[#FF6B6B] shadow-sm':'text-slate-400'}`}>{r==='today'?'今日':'累计'}</button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[{l:'番茄',v:stats.count}, {l:'时长',v:stats.mins}, {l:'完成',v:stats.done}].map((c,i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-[28px] p-5 shadow-sm border border-slate-50 dark:border-slate-800 text-center">
            <p className="text-3xl font-black text-[#FF6B6B] tabular-nums">{c.v}</p><p className="text-[8px] text-slate-300 mt-2 font-black uppercase tracking-widest">{c.l}</p>
          </div>
        ))}
      </div>
      <section className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-50">
        <h2 className="font-black mb-8 flex items-center"><Activity size={18} className="mr-2 text-[#FF6B6B]"/>专注精力曲线</h2>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{left:-25}}>
              <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} />
              <YAxis domain={[1,5]} hide />
              <Tooltip contentStyle={{ borderRadius:'16px', border:'none', boxShadow:'0 8px 30px rgba(0,0,0,0.05)', fontSize:'11px' }} />
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
            <div key={badge.id} className={`bg-white dark:bg-slate-900 rounded-[28px] p-5 border ${isEarned?'border-red-50':'opacity-60 grayscale'}`}>
              <div className="flex flex-col items-center"><Icon size={24} className="mb-2 text-[#FF6B6B]"/><h3 className="font-black text-xs">{badge.title}</h3><p className="text-[8px] text-slate-300 uppercase mt-1 tracking-tight">{badge.requirement}</p>
              <div className="w-full h-1 bg-slate-100 rounded-full mt-4 overflow-hidden"><div className={`h-full ${isEarned?'bg-[#FF6B6B]':'bg-slate-200'}`} style={{width:`${Math.min(100,(progress/target)*100)}%`}}/></div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 6. 番茄钟视图 (PomodoroView) ---
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
      if ('vibrate' in navigator) navigator.vibrate([150, 80, 150]);
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
      <div className={`relative w-80 h-80 flex items-center justify-center mb-12 transition-all ${isActive?'scale-110':''}`}>
        <svg className="absolute inset-0 w-full h-full -rotate-90"><circle cx="50%" cy="50%" r="45%" fill="none" stroke="#f1f5f9" strokeWidth="12" className="dark:stroke-slate-800"/><circle cx="50%" cy="50%" r="45%" fill="none" stroke="#FF6B6B" strokeWidth="12" strokeDasharray="301.6%" strokeDashoffset={`${301.6*(1-timeLeft/(targetMinutes*60))}%`} strokeLinecap="round" className="transition-all duration-1000"/></svg>
        <div className="flex flex-col items-center"><div className="text-7xl font-black tabular-nums">{Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</div><p className="text-slate-400 font-bold mt-4 text-sm">{isActive?'享受心流':'滑动刻度盘选择时间'}</p></div>
      </div>
      {!isActive && (
        <div className="w-full relative h-24 mb-12">
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
      <button onClick={() => setIsActive(!isActive)} className={`w-full py-6 rounded-[32px] text-xl font-black shadow-2xl transition-all ${isActive?'bg-slate-800 text-white':'bg-[#FF6B6B] text-white'}`}>{isActive?'放弃本次专注':'开始专注'}</button>
      {showScore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-8 z-[110] animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 w-full max-w-sm text-center">
            <h3 className="text-2xl font-black mb-10">专注达成！</h3>
            <div className="flex justify-between">{[1,2,3,4,5].map(v => (
              <button key={v} onClick={() => { onComplete({ id:Date.now().toString(), durationMinutes:targetMinutes, energyScore:v, date:new Date().toLocaleDateString('en-CA'), timeLabel:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}) }); onBack(); }}
                className="w-12 h-12 rounded-2xl bg-slate-50 font-black hover:bg-[#FF6B6B] hover:text-white transition-all">{v}</button>
            ))}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 7. 周/月视图 (WeeklyView) ---
const WeeklyView = ({ tasks, focusHistory, appState, setAppState }) => {
  const [mode, setMode] = useState('week');
  const [pivot, setPivot] = useState(new Date());
  const [selDay, setSelDay] = useState(new Date().toLocaleDateString('en-CA'));
  const days = useMemo(() => {
    const d = new Date(pivot); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diff));
    return Array.from({length:7}, (_,i) => { const c = new Date(mon); c.setDate(mon.getDate()+i); return c.toLocaleDateString('en-CA'); });
  }, [pivot]);

  const stats = useMemo(() => {
    const dFocus = focusHistory.filter(f => f.date === selDay);
    return { done: tasks.filter(t=>t.date===selDay&&t.completed).length, mins: dFocus.reduce((a,c)=>a+c.durationMinutes,0), list: dFocus };
  }, [selDay, tasks, focusHistory]);

  return (
    <div className="space-y-6 pb-20 text-left">
      <header className="flex justify-between items-start">
        <div><h1 className="text-4xl font-black">{mode==='week'?'本周':'本月'}</h1><p className="text-slate-400 font-bold mt-1 text-sm">{pivot.getFullYear()}年{pivot.getMonth()+1}月</p></div>
        <button onClick={()=>setMode(mode==='week'?'month':'week')} className="bg-[#2a2a3c] text-white px-4 py-2 rounded-2xl text-xs font-black shadow-lg">切换视图</button>
      </header>
      <section className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-50">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-1 font-black text-[10px] text-slate-300 w-full justify-around">{['一','二','三','四','五','六','日'].map(d=><span key={d}>{d}</span>)}</div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map(d => (
            <button key={d} onClick={()=>setSelDay(d)} className={`aspect-square rounded-2xl flex items-center justify-center font-black text-sm transition-all ${d===selDay?'bg-[#FF6B6B] text-white shadow-lg shadow-red-100':'text-slate-700'}`}>{new Date(d).getDate()}</button>
          ))}
        </div>
      </section>
      <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-50">
        <h3 className="font-black mb-8">{new Date(selDay).toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})}</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div><p className="text-3xl font-black text-[#FF6B6B] tabular-nums">{stats.done}</p><p className="text-[10px] text-slate-400 mt-2 font-black uppercase">完成任务</p></div>
          <div><p className="text-3xl font-black text-[#FF6B6B] tabular-nums">{stats.mins}</p><p className="text-[10px] text-slate-400 mt-2 font-black uppercase">专注分钟</p></div>
        </div>
      </section>
      <button className="w-full bg-[#FF6B6B] text-white py-5 rounded-[28px] font-black flex items-center justify-center shadow-xl shadow-red-100"><BookOpen size={20} className="mr-3"/>生成本周总结</button>
    </div>
  );
};

// --- 8. 目标视图 (GoalsView) ---
const GoalsView = ({ state, setState }) => {
  const [mExp, setMExp] = useState(false);
  const [vExp, setVExp] = useState(false);
  const updateP = (id, val) => setState(p => ({...p, annualGoals: p.annualGoals.map(g=>g.id===id?{...g, progress:val}:g)}));

  return (
    <div className="space-y-8 pb-20 text-left">
      <h1 className="text-4xl font-black">目标</h1>
      <section className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-50 space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center"><h3 className="font-black flex items-center"><Target size={18} className="mr-2 text-[#FF6B6B]"/>使命 (Mission)</h3><button onClick={()=>setMExp(!mExp)} className="text-slate-300">{mExp?<ChevronUp/>:<ChevronDown/>}</button></div>
          <div className="relative"><AutoResizingTextarea value={state.mission} isExpanded={mExp} onChange={e=>setState(p=>({...p, mission:e.target.value}))} className={`bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl font-bold text-sm leading-relaxed ${!mExp?'mask-fade':''}`} />{!mExp&&<div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-slate-50 rounded-b-3xl"/>}</div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center"><h3 className="font-black flex items-center"><Compass size={18} className="mr-2 text-[#FF6B6B]"/>愿景 (Vision)</h3><button onClick={()=>setVExp(!vExp)} className="text-slate-300">{vExp?<ChevronUp/>:<ChevronDown/>}</button></div>
          <div className="relative"><AutoResizingTextarea value={state.vision} isExpanded={vExp} onChange={e=>setState(p=>({...p, vision:e.target.value}))} className={`bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl font-bold text-sm leading-relaxed ${!vExp?'mask-fade':''}`} />{!vExp&&<div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-slate-50 rounded-b-3xl"/>}</div>
        </div>
      </section>
      <div className="space-y-4">
        {state.annualGoals.map(g => (
          <div key={g.id} className="bg-white dark:bg-slate-900 rounded-[32px] p-7 shadow-sm border border-slate-50">
            <div className="flex justify-between items-center mb-6"><div><h4 className="font-black">{g.title}</h4><p className="text-[10px] text-slate-400 font-black mt-1 uppercase">{g.category} · {g.progress}% 已推进</p></div><div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#FF6B6B] font-black">{g.progress}%</div></div>
            <input type="range" min="0" max="100" value={g.progress} onChange={e=>updateP(g.id, parseInt(e.target.value))} className="w-full h-3 rounded-full appearance-none accent-[#FF6B6B] bg-slate-100" />
          </div>
        ))}
      </div>
      <style>{`.mask-fade { mask-image: linear-gradient(to bottom, black 40%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 100%); }`}</style>
    </div>
  );
};

// --- 9. 设置视图 (SettingsView) ---
const SettingsView = ({ state, setState }) => {
  const update = (k, v) => setState(p => ({...p, settings: {...p.settings, [k]: v}}));
  const playPreview = (type) => { const a = new Audio(SOUND_URLS[type]); a.volume = 0.5; a.play().catch(()=>{}); };

  return (
    <div className="space-y-8 pb-20 text-left">
      <h1 className="text-4xl font-black">设置</h1>
      <div className="bg-[#FF6B6B] rounded-[44px] p-8 text-white shadow-2xl shadow-red-200 flex items-center space-x-6">
        <div className="w-20 h-20 bg-white rounded-[28px] shrink-0 overflow-hidden"><BrandLogo className="w-full h-full"/></div>
        <div><h3 className="text-2xl font-black">{state.profile.name}</h3><p className="opacity-70 text-sm font-bold">数据同步开启中</p></div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[44px] shadow-sm divide-y dark:divide-slate-800 border border-slate-100 dark:border-slate-800">
        <div className="p-8 flex items-center justify-between"><div className="flex items-center space-x-5"><div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl"><Bell size={22}/></div><div><p className="font-black">番茄时长</p></div></div><div className="flex items-center space-x-4"><button onClick={()=>update('pomodoroMinutes',Math.max(5,state.settings.pomodoroMinutes-5))}><Minus/></button><span className="font-black tabular-nums">{state.settings.pomodoroMinutes}m</span><button onClick={()=>update('pomodoroMinutes',Math.min(120,state.settings.pomodoroMinutes+5))}><Plus/></button></div></div>
        <div className="p-8 flex items-center justify-between"><div className="flex items-center space-x-5"><div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl"><Moon size={22}/></div><div><p className="font-black">深色模式</p></div></div><button onClick={()=>update('darkMode',!state.settings.darkMode)} className={`w-12 h-6.5 rounded-full border-2 ${state.settings.darkMode?'bg-[#FF6B6B] border-[#FF6B6B]':'bg-slate-200 border-slate-200'}`}/></div>
        <div className="p-8 space-y-6"><div className="flex items-center space-x-5"><div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl"><Volume2 size={22}/></div><div><p className="font-black">提示音效</p></div></div><div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">{Object.keys(SOUND_URLS).map(t => <button key={t} onClick={()=>{update('soundType',t);playPreview(t);}} className={`flex-1 py-2 rounded-xl text-[11px] font-black ${state.settings.soundType===t?'bg-[#FF6B6B] text-white shadow-lg':'text-slate-400'}`}>{t==='digital'?'数码':t==='bell'?'风铃':'木鸣'}</button>)}</div></div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[44px] p-6 shadow-sm border border-slate-100">
        <a href="https://www.mrbigtree.cn" target="_blank" className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-6 rounded-[32px]">
          <div className="flex items-center space-x-4"><div className="w-16 h-16 rounded-[22px] overflow-hidden border-2 border-white"><img src="https://www.mrbigtree.cn/wp-content/uploads/2023/11/cropped-bigtree-avatar.jpg" className="w-full h-full object-cover"/></div><div><p className="font-black">大树老师</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">www.mrbigtree.cn</p></div></div>
          <ChevronRight size={20} className="text-[#FF6B6B]" />
        </a>
      </div>
    </div>
  );
};

// --- 10. 主应用组件 (App) ---
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
