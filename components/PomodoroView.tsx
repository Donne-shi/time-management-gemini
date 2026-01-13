
import React, { useState, useEffect, useRef } from 'react';
import { FocusSession, AppState } from '../types';
import { ChevronLeft, Play, X, Timer as TimerIcon, Sparkles, Coffee } from 'lucide-react';

interface Props {
  settings: AppState['settings'];
  onBack: () => void;
  onComplete: (session: FocusSession) => void;
}

// 同步 SettingsView 中的超短促音效 (1s以内)
const SOUND_URLS = {
  digital: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  bell: 'https://assets.mixkit.co/active_storage/sfx/3005/3005-preview.mp3',
  nature: 'https://assets.mixkit.co/active_storage/sfx/2431/2431-preview.mp3'
};

const PomodoroView: React.FC<Props> = ({ settings, onBack, onComplete }) => {
  const [targetMinutes, setTargetMinutes] = useState(settings.pomodoroMinutes);
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [showConfirmAbandon, setShowConfirmAbandon] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const timeOptions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 90, 120];

  const scoreLabels = [
    { val: 1, label: '低能' },
    { val: 2, label: '疲惫' },
    { val: 3, label: '平稳' },
    { val: 4, label: '高能' },
    { val: 5, label: '心流' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToValue(targetMinutes, 'auto');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      finishSession();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  const scrollToValue = (val: number, behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      const index = timeOptions.indexOf(val);
      if (index !== -1) {
        const item = scrollRef.current.children[index] as HTMLElement;
        if (item) {
          const containerWidth = scrollRef.current.offsetWidth;
          const itemWidth = item.offsetWidth;
          const scrollPos = item.offsetLeft - (containerWidth / 2) + (itemWidth / 2);
          scrollRef.current.scrollTo({ left: scrollPos, behavior });
        }
      }
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current || isActive) return;
    const container = scrollRef.current;
    const center = container.scrollLeft + container.offsetWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;
    Array.from(container.children).forEach((child, index) => {
      const element = child as HTMLElement;
      const elementCenter = element.offsetLeft + element.offsetWidth / 2;
      const distance = Math.abs(center - elementCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    const newValue = timeOptions[closestIndex];
    if (newValue !== targetMinutes) {
      setTargetMinutes(newValue);
      setTimeLeft(newValue * 60);
      if ('vibrate' in navigator && settings.vibrationEnabled) navigator.vibrate(8);
    }
  };

  const selectTime = (min: number) => {
    if (isActive) return;
    scrollToValue(min);
  };

  const finishSession = () => {
    setIsActive(false);
    setShowScore(true);
    
    // 触发震动
    if ('vibrate' in navigator && settings.vibrationEnabled) {
      navigator.vibrate([150, 80, 150]);
    }
    
    // 触发音效
    if (settings.soundEnabled) {
      const audio = new Audio(SOUND_URLS[settings.soundType]);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  };

  const handleScore = (score: number) => {
    setShowScore(false);
    setShowCelebration(true);
    setTimeout(() => {
      const now = new Date();
      const session: FocusSession = {
        id: Date.now().toString(),
        startTime: Date.now() - targetMinutes * 60 * 1000,
        durationMinutes: targetMinutes,
        energyScore: score,
        type: 'pomodoro',
        date: now.toLocaleDateString('en-CA'),
        timeLabel: now.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })
      };
      onComplete(session);
    }, 2800);
  };

  const abandonSession = () => {
    setIsActive(false);
    setTimeLeft(targetMinutes * 60);
    setShowConfirmAbandon(false);
    if ('vibrate' in navigator && settings.vibrationEnabled) {
      navigator.vibrate(10);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (targetMinutes * 60)) * 100;

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-900 z-[60] flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden transition-colors">
      <header className="p-6 flex items-center justify-between">
        <button 
          onClick={isActive ? () => setShowConfirmAbandon(true) : onBack} 
          className="p-3 -ml-3 text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 active:scale-90 transition-all"
        >
          {isActive ? <X size={32} strokeWidth={2.5} /> : <ChevronLeft size={32} strokeWidth={2.5} />}
        </button>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          {isActive ? '专注时刻' : '番茄任务'}
        </h2>
        <div className="w-12" />
      </header>

      <div className={`flex-1 flex flex-col items-center justify-center transition-all duration-700 px-6 ${isActive ? 'translate-y-0' : 'translate-y-[-40px]'}`}>
        
        {/* 计时器圆环 */}
        <div className={`relative transition-all duration-700 ${isActive ? 'w-80 h-80 sm:w-96 sm:h-96' : 'w-72 h-72 sm:w-80 sm:h-80'} flex items-center justify-center`}>
          <div className="absolute inset-0 rounded-full border-[12px] border-slate-50 dark:border-slate-800 transition-colors" />
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%" cy="50%" r="48%"
              fill="none" stroke="#ff6b6b" strokeWidth="12"
              strokeDasharray="301.6%"
              strokeDashoffset={`${301.6 * (1 - progress / 100)}%`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="flex flex-col items-center text-center z-10">
            {!isActive && (
              <div className="w-16 h-16 bg-white dark:bg-slate-800 shadow-xl rounded-[24px] flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-700 animate-in zoom-in duration-500 transition-colors">
                <TimerIcon size={32} className="text-[#ff6b6b]" strokeWidth={2.5} />
              </div>
            )}
            <div className={`font-black tracking-tighter text-slate-800 dark:text-slate-100 tabular-nums transition-all duration-700 ${isActive ? 'text-8xl' : 'text-7xl'}`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-slate-400 dark:text-slate-500 font-bold mt-4 text-sm tracking-wide">
              {isActive ? '保持专注，享受心流' : '滑动刻度盘选择时间'}
            </p>
          </div>
        </div>

        {/* 交互刻度盘 */}
        <div className={`w-full space-y-4 relative mt-12 transition-all duration-500 ${isActive ? 'opacity-0 scale-95 pointer-events-none translate-y-20' : 'opacity-100 scale-100'}`}>
          <div className="text-center">
            <span className="text-4xl font-black text-[#ff6b6b] tabular-nums">{targetMinutes}</span>
            <span className="text-slate-400 dark:text-slate-500 font-black ml-2 text-xs uppercase tracking-widest">MINS</span>
          </div>
          
          <div className="relative h-24 flex items-center">
            <div className="absolute left-1/2 -top-2 -translate-x-1/2 w-0.5 h-16 bg-[#ff6b6b] rounded-full z-20 pointer-events-none" />
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex items-center overflow-x-auto no-scrollbar snap-x snap-mandatory px-[50%] py-4 space-x-12 cursor-grab active:cursor-grabbing"
              style={{ scrollBehavior: 'smooth' }}
            >
              {timeOptions.map((opt) => (
                <button 
                  key={opt}
                  onClick={() => selectTime(opt)}
                  className={`snap-center flex-shrink-0 transition-all duration-300 flex flex-col items-center justify-center min-w-[40px] ${
                    targetMinutes === opt 
                      ? 'text-[#ff6b6b] scale-150 font-black' 
                      : 'text-slate-200 dark:text-slate-800 font-bold scale-100'
                  }`}
                >
                  <span className="text-2xl">{opt}</span>
                  <div className={`w-1 rounded-full mt-2 transition-all ${
                    targetMinutes === opt ? 'h-3 bg-[#ff6b6b]' : 'h-1.5 bg-slate-100 dark:bg-slate-800'
                  }`} />
                </button>
              ))}
            </div>
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white dark:from-slate-900 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </div>

      <div className="p-10 pb-16">
        <button 
          onClick={isActive ? () => setShowConfirmAbandon(true) : () => setIsActive(true)}
          className={`w-full py-6 rounded-[32px] font-black text-xl flex items-center justify-center shadow-2xl transition-all active:scale-[0.97] ${
            isActive 
              ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-slate-200 dark:shadow-none' 
              : 'bg-[#ff6b6b] text-white shadow-red-200 dark:shadow-none hover:bg-[#ff5252]'
          }`}
        >
          {isActive ? (
            <><X size={24} className="mr-3" strokeWidth={3} /> 放弃本次专注</>
          ) : (
            <><Play size={24} className="mr-3" fill="currentColor" /> 开始专注</>
          )}
        </button>
      </div>

      {/* 放弃确认弹窗 */}
      {showConfirmAbandon && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[44px] p-10 text-center animate-in zoom-in-95 shadow-2xl transition-colors">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tight">确定放弃吗？</h3>
            <p className="text-slate-400 dark:text-slate-500 font-bold mb-8 leading-relaxed">
              当前专注还未完成，放弃后该番茄钟将作废。
            </p>
            <div className="flex flex-col space-y-3">
              <button 
                onClick={abandonSession} 
                className="w-full bg-[#ff6b6b] text-white py-5 rounded-3xl font-black active:scale-95 transition-all"
              >
                确认放弃
              </button>
              <button 
                onClick={() => setShowConfirmAbandon(false)} 
                className="w-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300 py-5 rounded-3xl font-black active:scale-95 transition-all"
              >
                继续专注
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 评分弹窗 */}
      {showScore && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[48px] p-10 text-center animate-in zoom-in-95 shadow-2xl transition-colors">
            <div className="w-20 h-20 bg-red-50 dark:bg-slate-700 rounded-[32px] flex items-center justify-center mx-auto mb-6 transition-colors">
              <Sparkles size={40} className="text-[#ff6b6b]" strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">专注达成！</h3>
            <p className="text-slate-400 dark:text-slate-500 font-bold mb-10 text-sm">为这次专注的状态打个分吧</p>
            <div className="flex justify-between px-2">
              {scoreLabels.map(item => (
                <button 
                  key={item.val} 
                  onClick={() => handleScore(item.val)} 
                  className="flex flex-col items-center group space-y-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-black text-xl flex items-center justify-center group-hover:bg-[#ff6b6b] group-hover:text-white transition-all shadow-sm active:scale-90">
                    {item.val}
                  </div>
                  <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 group-hover:text-[#ff6b6b] uppercase tracking-tighter transition-colors">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default PomodoroView;
