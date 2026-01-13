
import React, { useState } from 'react';
import { AppState } from '../types';
import { ChevronRight, Minus, Plus, Camera, Volume2, Moon, Bell, Check, Shield, Globe, User } from 'lucide-react';
import { BrandLogo } from '../constants';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  user: any;
}

const SOUND_OPTIONS: { id: AppState['settings']['soundType']; name: string; url: string }[] = [
  { id: 'digital', name: '数码', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
  { id: 'bell', name: '风铃', url: 'https://assets.mixkit.co/active_storage/sfx/3005/3005-preview.mp3' },
  { id: 'nature', name: '木鸣', url: 'https://assets.mixkit.co/active_storage/sfx/2431/2431-preview.mp3' },
];

const SettingsView: React.FC<Props> = ({ state, setState, user }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);

  const updateSettings = (key: keyof AppState['settings'], value: any) => {
    setState(prev => ({ 
      ...prev, 
      settings: { ...prev.settings, [key]: value } 
    }));
    if (key === 'vibrationEnabled' && value === true && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
  };

  const handleSoundChange = (type: AppState['settings']['soundType']) => {
    updateSettings('soundType', type);
    const option = SOUND_OPTIONS.find(o => o.id === type);
    if (option) {
      const audio = new Audio(option.url);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }
  };

  const SettingRow = ({ icon: Icon, title, subtitle, rightElement, onClick }: any) => (
    <div 
      className={`flex items-center justify-between px-8 min-h-[100px] transition-colors ${onClick ? 'cursor-pointer active:bg-slate-50/80 dark:active:bg-slate-800/30' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-5 text-left">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 transition-all border border-slate-200/50 dark:border-slate-700 shadow-sm shrink-0">
          <Icon size={22} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col justify-center">
          <p className="font-black text-slate-800 dark:text-slate-100 text-base leading-tight">{title}</p>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-1.5 font-black uppercase tracking-widest">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center shrink-0">
        {rightElement}
      </div>
    </div>
  );

  const SettingToggle = ({ icon, title, subtitle, checked, onChange, children }: any) => (
    <div className="flex flex-col">
      <SettingRow 
        icon={icon}
        title={title}
        subtitle={subtitle}
        onClick={() => onChange(!checked)}
        rightElement={
          <div className="relative inline-flex items-center pointer-events-none">
            <input type="checkbox" checked={checked} onChange={() => {}} className="sr-only peer" />
            <div className={`w-12 h-6.5 rounded-full transition-all duration-300 border-2 ${
              checked 
                ? 'bg-[#FF6B6B] border-[#FF6B6B]' 
                : 'bg-slate-300 dark:bg-slate-700 border-slate-300 dark:border-slate-700'
            } after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md peer-checked:after:translate-x-[22px]`}></div>
          </div>
        }
      />
      {checked && children && (
        <div className="px-8 pb-8 -mt-2 animate-in slide-in-from-top-2">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      <header className="px-1 text-left">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">设置</h1>
        <p className="text-slate-400 dark:text-slate-500 font-bold mt-1">时间好管家 · 高效生活从现在开始</p>
      </header>

      {/* 用户资料卡片 */}
      <div 
        onClick={() => setShowProfileModal(true)}
        className="bg-[#FF6B6B] rounded-[44px] p-8 text-white shadow-2xl shadow-red-200 dark:shadow-none cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 transition-transform group-hover:scale-[1.7]">
          <BrandLogo className="w-32 h-32 rounded-[24px]" />
        </div>
        <div className="flex items-center space-x-6 relative z-10">
          <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[32px] flex items-center justify-center shadow-xl relative shrink-0 overflow-hidden border-4 border-white dark:border-slate-700 transition-colors">
            {state.profile.avatar && state.profile.avatar.startsWith('data:') ? (
              <img src={state.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full">
                 <BrandLogo className="w-full h-full" />
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-black/40 py-1 flex justify-center">
              <Camera size={12} className="text-white" />
            </div>
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-2xl font-black leading-none">{state.profile.name || '时间好管家'}</h3>
            <p className="text-white/80 text-sm font-bold mt-3 flex items-center">
              {user ? '数据已同步' : '点击完善并开启同步'} <ChevronRight size={16} className="ml-1" />
            </p>
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-slate-900 rounded-[44px] shadow-sm divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <SettingRow 
          icon={Bell}
          title="默认番茄时长"
          subtitle={`当前设定: ${state.settings.pomodoroMinutes}分钟`}
          rightElement={
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
              <button onClick={(e) => { e.stopPropagation(); updateSettings('pomodoroMinutes', Math.max(5, state.settings.pomodoroMinutes - 5)) }} className="p-2 text-[#FF6B6B] hover:bg-white dark:hover:bg-slate-700 rounded-xl active:scale-90 transition-all"><Minus size={18} strokeWidth={3} /></button>
              <span className="mx-4 font-black text-sm text-slate-800 dark:text-slate-200 tabular-nums min-w-[3ch] text-center">{state.settings.pomodoroMinutes}m</span>
              <button onClick={(e) => { e.stopPropagation(); updateSettings('pomodoroMinutes', Math.min(60, state.settings.pomodoroMinutes + 5)) }} className="p-2 text-[#FF6B6B] hover:bg-white dark:hover:bg-slate-700 rounded-xl active:scale-90 transition-all"><Plus size={18} strokeWidth={3} /></button>
            </div>
          }
        />

        <SettingToggle 
          icon={Volume2} 
          title="提示音效" 
          subtitle="专注结束时的回响" 
          checked={state.settings.soundEnabled}
          onChange={(val: boolean) => updateSettings('soundEnabled', val)}
        >
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[22px] border border-slate-200 dark:border-slate-700 shadow-inner transition-colors">
            {SOUND_OPTIONS.map(opt => (
              <button 
                key={opt.id}
                onClick={(e) => { e.stopPropagation(); handleSoundChange(opt.id); }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-[11px] font-black transition-all flex items-center justify-center space-x-1.5 ${
                  state.settings.soundType === opt.id 
                    ? 'bg-[#FF6B6B] text-white shadow-lg' 
                    : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <span>{opt.name}</span>
                {state.settings.soundType === opt.id && <Check size={12} strokeWidth={4} />}
              </button>
            ))}
          </div>
        </SettingToggle>

        <SettingToggle 
          icon={Bell} 
          title="触觉反馈" 
          subtitle="灵动的物理震动反馈" 
          checked={state.settings.vibrationEnabled}
          onChange={(val: boolean) => updateSettings('vibrationEnabled', val)}
        />

        <SettingToggle 
          icon={Moon} 
          title="深色模式" 
          subtitle="保护视力，深夜更专注" 
          checked={state.settings.darkMode}
          onChange={(val: boolean) => updateSettings('darkMode', val)}
        />
      </section>

      {/* 开发者与支持区域 */}
      <section className="space-y-4">
        <div className="px-1 flex items-center space-x-2">
          <Shield size={18} className="text-[#FF6B6B]" strokeWidth={3} />
          <h2 className="font-black text-slate-800 dark:text-slate-100 text-lg">关于与支持</h2>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[44px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 transition-colors">
          <a 
            href="https://www.mrbigtree.cn" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-[22px] overflow-hidden border-2 border-white dark:border-slate-700 shadow-md">
                <img 
                  src="https://www.mrbigtree.cn/wp-content/uploads/2023/11/cropped-bigtree-avatar.jpg" 
                  alt="大树老师"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/avataaars/svg?seed=BigTree";
                  }}
                />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <p className="font-black text-slate-800 dark:text-slate-100 text-base">大树老师</p>
                  <span className="bg-red-50 dark:bg-red-900/30 text-[#FF6B6B] text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">开发者</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-widest flex items-center">
                  www.mrbigtree.cn <Globe size={10} className="ml-1" />
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl shadow-sm text-[#FF6B6B] group-hover:bg-[#FF6B6B] group-hover:text-white transition-all">
              <ChevronRight size={20} strokeWidth={3} />
            </div>
          </a>

          <div className="grid grid-cols-2 gap-3 px-1">
             <button className="bg-slate-50 dark:bg-slate-800/50 py-5 rounded-[28px] text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center space-x-2">
               <Shield size={14} />
               <span>隐私政策</span>
             </button>
             <button className="bg-slate-50 dark:bg-slate-800/50 py-5 rounded-[28px] text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center space-x-2">
               <Globe size={14} />
               <span>官方社区</span>
             </button>
          </div>
        </div>
      </section>

      <div className="text-center opacity-30 mt-6 px-10">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">时间好管家 · 为高效而生</p>
      </div>
    </div>
  );
};

export default SettingsView;
