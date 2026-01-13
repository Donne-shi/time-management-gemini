
import React, { useState } from 'react';
import { Task, FocusSession, AppView } from '../types';
import { Check, Timer, ChevronRight, Trash2, Plus, Zap } from 'lucide-react';
import { BrandLogo } from '../constants';

interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setView: (v: AppView) => void;
  focusHistory: FocusSession[];
  settings: any;
}

const TodayView: React.FC<Props> = ({ tasks, setTasks, toggleTask, deleteTask, setView, focusHistory }) => {
  const [slotInputs, setSlotInputs] = useState(['', '', '']);
  const [bottomInput, setBottomInput] = useState('');
  const today = new Date().toLocaleDateString('en-CA');

  const handleAddSlotTask = (index: number) => {
    const title = slotInputs[index].trim();
    if (!title) return;
    const newTask: Task = {
      id: Date.now().toString() + Math.random(),
      title,
      completed: false,
      isCore: true,
      slot: index + 1,
      date: today,
    };
    setTasks(prev => [...prev, newTask]);
    const newSlotInputs = [...slotInputs];
    newSlotInputs[index] = '';
    setSlotInputs(newSlotInputs);
  };

  const handleAddBottomTask = () => {
    const title = bottomInput.trim();
    if (!title) return;

    // 获取今日已存在的槽位编号
    const todayTasks = tasks.filter(t => t.date === today);
    const filledSlots = todayTasks.filter(t => t.slot !== undefined).map(t => t.slot as number);
    
    // 自动寻找第一个空余的槽位
    let assignedSlot: number | undefined = undefined;
    for (let i = 1; i <= 3; i++) {
      if (!filledSlots.includes(i)) {
        assignedSlot = i;
        break;
      }
    }

    const newTask: Task = {
      id: Date.now().toString() + Math.random(),
      title,
      completed: false,
      isCore: assignedSlot !== undefined, // 如果分配到了槽位，则是核心任务
      slot: assignedSlot,
      date: today,
    };

    setTasks(prev => [...prev, newTask]);
    setBottomInput('');
    
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const handleSlotInputChange = (index: number, val: string) => {
    const newSlotInputs = [...slotInputs];
    newSlotInputs[index] = val;
    setSlotInputs(newSlotInputs);
  };

  const todayTasks = tasks.filter(t => t.date === today);
  const slotTasks = [
    todayTasks.find(t => t.slot === 1),
    todayTasks.find(t => t.slot === 2),
    todayTasks.find(t => t.slot === 3),
  ];
  const generalTasks = todayTasks.filter(t => !t.slot);
  const todayFocus = focusHistory.filter(f => f.date === today);
  const todayMinutes = todayFocus.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const TaskItem: React.FC<{ task: Task }> = ({ task }) => (
    <div className="group flex items-center px-4 py-4 rounded-[24px] bg-red-50/40 dark:bg-red-900/10 border border-red-100/20 dark:border-red-900/10 transition-all active:scale-[0.98]">
      <button 
        onClick={() => toggleTask(task.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-all shrink-0 ${
          task.completed ? 'bg-[#FF6B6B] border-[#FF6B6B]' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
        }`}
      >
        {task.completed && <Check size={12} className="text-white" strokeWidth={4} />}
      </button>
      <span className={`flex-1 font-bold text-slate-700 dark:text-slate-200 text-sm ${task.completed ? 'line-through opacity-30' : ''}`}>
        {task.title}
      </span>
      <button 
        onClick={() => deleteTask(task.id)} 
        className="text-slate-200 dark:text-slate-800 hover:text-red-400 ml-2 transition-colors p-1"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="px-1 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800 dark:text-slate-100">今日</h1>
          <p className="text-slate-400 dark:text-slate-500 font-bold mt-1 text-sm">
            {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
        <BrandLogo className="w-14 h-14 rounded-2xl shadow-xl shadow-red-100 dark:shadow-none" />
      </header>

      <section className="space-y-4">
        <div className="flex items-center space-x-2 px-1">
          <Zap size={18} className="text-[#FF6B6B]" strokeWidth={3} />
          <h2 className="font-black text-lg text-slate-800 dark:text-slate-100">今日核心目标</h2>
        </div>

        <div className="space-y-3">
          {slotTasks.map((task, idx) => (
            <div key={`slot-${idx}`}>
              {task ? (
                <TaskItem task={task} />
              ) : (
                <div className={`flex items-center px-4 py-4 rounded-[24px] border-2 border-dashed transition-all ${
                  slotInputs[idx].trim() ? 'bg-white dark:bg-slate-900 border-[#FF6B6B]/40 shadow-sm' : 'border-slate-100 dark:border-slate-800'
                }`}>
                  <div className="w-6 h-6 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 mr-3 shrink-0" />
                  <input
                    value={slotInputs[idx]}
                    onChange={(e) => handleSlotInputChange(idx, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSlotTask(idx)}
                    placeholder={`设定核心目标 ${idx + 1}`}
                    className="flex-1 bg-transparent border-none outline-none font-bold text-slate-600 dark:text-slate-300 text-sm placeholder:text-slate-200"
                  />
                  {slotInputs[idx].trim() && (
                    <button onClick={() => handleAddSlotTask(idx)} className="bg-[#FF6B6B] text-white p-2 rounded-xl active:scale-90 shadow-sm"><Check size={16} strokeWidth={4} /></button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {generalTasks.length > 0 && (
           <div className="space-y-3 mt-4">
             {generalTasks.map(task => <TaskItem key={task.id} task={task} />)}
           </div>
        )}

        <div className="flex items-center bg-slate-100/50 dark:bg-slate-800/40 rounded-[28px] p-4 mt-6 border border-slate-50 dark:border-slate-800 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:shadow-xl transition-all">
          <input 
            value={bottomInput}
            onChange={(e) => setBottomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddBottomTask()}
            placeholder="添加任务，点击➕号"
            className="flex-1 bg-transparent border-none outline-none font-bold text-slate-500 dark:text-slate-400 text-sm"
          />
          <button onClick={handleAddBottomTask} className={`p-2.5 rounded-2xl transition-all active:scale-90 ${bottomInput.trim() ? 'bg-[#FF6B6B] text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}><Plus size={20} strokeWidth={4} /></button>
        </div>
      </section>

      <div onClick={() => setView('pomodoro')} className="bg-[#FF6B6B] rounded-[32px] p-6 text-white flex items-center justify-between shadow-xl shadow-red-100 dark:shadow-none mt-8 active:scale-[0.98] transition-all cursor-pointer">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"><Timer size={28} strokeWidth={3} /></div>
          <div>
            <h3 className="text-xl font-black italic">番茄专注</h3>
            <p className="text-white/70 text-xs font-bold">进入沉浸式生产力模式</p>
          </div>
        </div>
        <ChevronRight size={24} className="opacity-40" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-50 dark:border-slate-800">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-4xl font-black text-[#FF6B6B] leading-tight tabular-nums">{todayFocus.length}</p>
            <p className="text-slate-300 dark:text-slate-600 text-[9px] font-black mt-2 uppercase tracking-widest">专注次数</p>
          </div>
          <div className="border-l border-slate-50 dark:border-slate-800">
            <p className="text-4xl font-black text-[#FF6B6B] leading-tight tabular-nums">{todayMinutes}</p>
            <p className="text-slate-300 dark:text-slate-600 text-[9px] font-black mt-2 uppercase tracking-widest">专注分钟</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayView;
