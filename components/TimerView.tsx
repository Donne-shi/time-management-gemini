import React, { useState, useEffect, useRef } from 'react';
import { Task, FocusSession } from '../types';
import { Icons } from '../constants';

interface Props {
  tasks: Task[];
  onLogSession: (session: FocusSession) => void;
}

const TimerView: React.FC<Props> = ({ tasks, onLogSession }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'pomodoro' | 'short-break' | 'long-break'>('pomodoro');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  
  // Fix: Use ReturnType<typeof setInterval> to avoid 'NodeJS' namespace error in browser-based TypeScript environments
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(sessionType === 'pomodoro' ? 25 * 60 : sessionType === 'short-break' ? 5 * 60 : 15 * 60);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleSessionComplete();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    onLogSession({
      id: Math.random().toString(36).substr(2, 9),
      taskId: selectedTaskId || undefined,
      startTime: Date.now() - (sessionType === 'pomodoro' ? 25 : 5) * 60 * 1000,
      endTime: Date.now(),
      durationMinutes: sessionType === 'pomodoro' ? 25 : 5,
      type: sessionType,
    });
    alert('Session complete! Great job!');
    resetTimer();
  };

  const switchType = (type: typeof sessionType) => {
    setSessionType(type);
    setIsActive(false);
    setTimeLeft(type === 'pomodoro' ? 25 * 60 : type === 'short-break' ? 5 * 60 : 15 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (sessionType === 'pomodoro' ? 25 * 60 : 5 * 60)) * 100;

  return (
    <div className="max-w-md mx-auto py-12 space-y-8 text-center animate-in fade-in zoom-in duration-500">
      <header>
        <h1 className="text-3xl font-bold mb-2">Focus Timer</h1>
        <p className="text-slate-400">Deep work is the key to productivity</p>
      </header>

      <div className="flex justify-center p-1 bg-slate-800 rounded-xl">
        {(['pomodoro', 'short-break', 'long-break'] as const).map(type => (
          <button
            key={type}
            onClick={() => switchType(type)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium capitalize transition-all ${
              sessionType === type ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {type.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="relative w-72 h-72 mx-auto flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="144"
            cy="144"
            r="130"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-800"
          />
          <circle
            cx="144"
            cy="144"
            r="130"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={816.8}
            strokeDashoffset={816.8 * (progress / 100)}
            strokeLinecap="round"
            className="text-indigo-500 transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-bold tracking-tighter tabular-nums">{formatTime(timeLeft)}</span>
          <span className="text-slate-500 mt-2 font-medium uppercase tracking-widest text-xs">
            {isActive ? 'Keep Going' : 'Paused'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center space-x-4">
          {!isActive ? (
            <button
              onClick={startTimer}
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-xl shadow-indigo-600/30 transition-transform active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="bg-slate-700 hover:bg-slate-600 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
          )}
          <button
            onClick={resetTimer}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <div className="pt-8">
          <label className="block text-sm font-medium text-slate-400 mb-2">Focusing on:</label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">No specific task</option>
            {tasks.filter(t => !t.completed).map(task => (
              <option key={task.id} value={task.id}>{task.title}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TimerView;