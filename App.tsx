
import React, { useState, useEffect } from 'react';
import { AppView, Task, AppState, FocusSession } from './types';
import TodayView from './components/TodayView';
import WeeklyView from './components/WeeklyView';
import StatsView from './components/StatsView';
import GoalsView from './components/GoalsView';
import SettingsView from './components/SettingsView';
import PomodoroView from './components/PomodoroView';
import { Calendar, BarChart2, Flag, Settings, ClipboardList } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './services/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('today');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusHistory, setFocusHistory] = useState<FocusSession[]>([]);
  const [user, setUser] = useState<any>(null);
  const [appState, setAppState] = useState<AppState>({
    profile: { name: '时间好管家', avatar: '🍎' },
    mission: "恢复自己和他人生命中真善美的形象和样式。帮助青少年和家庭建立卓越的自我管理能力。",
    vision: "1. 成为一个好丈夫、好爸爸，建立有爱的亲密家庭\n2. 成为福音的使者，向1000人分享福音\n3. 帮助10万青少年学习高效时间管理能力\n4. 出版2本畅销书",
    weeklyGoals: [],
    annualGoals: [
      { id: '1', title: '学习英语和泰语', category: '学习', progress: 0 },
      { id: '2', title: '服务好cha学生', category: '工作', progress: 0 },
    ],
    reflections: [],
    settings: {
      pomodoroMinutes: 35,
      maxMinutes: 120,
      soundEnabled: true,
      soundType: 'digital',
      vibrationEnabled: true,
      darkMode: false,
    }
  });

  useEffect(() => {
    const savedTasks = localStorage.getItem('chronos_tasks_v4');
    const savedFocus = localStorage.getItem('chronos_focus_v4');
    const savedState = localStorage.getItem('chronos_state_v4');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedFocus) setFocusHistory(JSON.parse(savedFocus));
    if (savedState) setAppState(JSON.parse(savedState));

    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
      supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chronos_tasks_v4', JSON.stringify(tasks));
    localStorage.setItem('chronos_focus_v4', JSON.stringify(focusHistory));
    localStorage.setItem('chronos_state_v4', JSON.stringify(appState));
    
    if (appState.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [tasks, focusHistory, appState]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const NavItem = ({ id, label, Icon }: { id: AppView; label: string; Icon: any }) => (
    <button 
      onClick={() => setView(id)}
      className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${view === id ? 'text-[#ff6b6b]' : 'text-slate-400 dark:text-slate-500'}`}
    >
      <Icon size={22} strokeWidth={view === id ? 2.5 : 2} />
      <span className="text-[10px] mt-1 font-bold">{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${appState.settings.darkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#f8fafc] text-slate-800'}`}>
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-8 max-w-lg mx-auto w-full">
        {view === 'today' && <TodayView tasks={tasks} setTasks={setTasks} toggleTask={toggleTask} deleteTask={deleteTask} setView={setView} focusHistory={focusHistory} settings={appState.settings} />}
        {view === 'weekly' && <WeeklyView tasks={tasks} focusHistory={focusHistory} appState={appState} setAppState={setAppState} />}
        {view === 'stats' && <StatsView tasks={tasks} focusHistory={focusHistory} />}
        {view === 'goals' && <GoalsView state={appState} setState={setAppState} />}
        {view === 'settings' && <SettingsView state={appState} setState={setAppState} user={user} />}
        {view === 'pomodoro' && (
          <PomodoroView 
            settings={appState.settings}
            onBack={() => setView('today')} 
            onComplete={(session) => {
              setFocusHistory(prev => [...prev, session]);
              setView('today');
            }} 
          />
        )}
      </main>

      {view !== 'pomodoro' && (
        <nav className={`fixed bottom-0 left-0 right-0 border-t flex justify-around items-center safe-bottom z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] h-20 transition-all duration-500 ${appState.settings.darkMode ? 'bg-slate-900/90 border-slate-800 backdrop-blur-xl' : 'bg-white/95 border-slate-100 backdrop-blur-md'}`}>
          <NavItem id="today" label="今日" Icon={Calendar} />
          <NavItem id="weekly" label="本周" Icon={ClipboardList} />
          <NavItem id="stats" label="统计" Icon={BarChart2} />
          <NavItem id="goals" label="目标" Icon={Flag} />
          <NavItem id="settings" label="设置" Icon={Settings} />
        </nav>
      )}
    </div>
  );
};

export default App;
