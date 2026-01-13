
import React, { useState, useLayoutEffect, useRef } from 'react';
import { AppState, Goal } from '../types';
import { Target, Compass, Plus, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORIES: Goal['category'][] = ['工作', '学习', '生活', '财务', '信仰', '关系', '服务', '其他'];

// 极致可靠的自适应高度文本框组件
const AutoResizingTextarea = ({ value, onChange, placeholder, className, isExpanded }: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const node = textareaRef.current;
    if (node) {
      if (isExpanded) {
        // 展开状态：重置并根据内容自适应高度
        node.style.height = '0px';
        node.style.height = `${node.scrollHeight}px`;
      } else {
        // 收起状态：固定在一个较小的高度
        node.style.height = '64px';
      }
    }
  };

  // 监听内容变化或展开状态变化，重新计算高度
  useLayoutEffect(() => {
    adjustHeight();
  }, [value, isExpanded]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${className} resize-none overflow-hidden block w-full outline-none transition-[height] duration-300`}
      rows={1}
    />
  );
};

const GoalsView: React.FC<{ state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }> = ({ state, setState }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState<Goal['category']>('工作');
  
  // 使命与愿景的展开状态，默认为收起，方便查看下方内容
  const [isMissionExpanded, setIsMissionExpanded] = useState(false);
  const [isVisionExpanded, setIsVisionExpanded] = useState(false);

  const updateGoalProgress = (id: string, progress: number) => {
    setState(prev => ({
      ...prev,
      annualGoals: prev.annualGoals.map(g => g.id === id ? { ...g, progress } : g)
    }));
  };

  const toggleExpand = (id: string) => {
    setState(prev => ({
      ...prev,
      annualGoals: prev.annualGoals.map(g => g.id === id ? { ...g, isExpanded: !g.isExpanded } : g)
    }));
  };

  const addAnnualGoal = () => {
    if (!newTitle.trim()) return;
    const goal: Goal = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category: newCat,
      progress: 0,
      isExpanded: true
    };
    setState(prev => ({ ...prev, annualGoals: [...prev.annualGoals, goal] }));
    setNewTitle('');
    setShowAdd(false);
  };

  const deleteGoal = (id: string) => {
    setState(prev => ({ ...prev, annualGoals: prev.annualGoals.filter(g => g.id !== id) }));
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100 text-left">目标</h1>
        <p className="text-slate-400 dark:text-slate-500 font-bold mt-1 text-left">奔向你的星辰大海</p>
      </header>

      {/* 使命愿景卡片 */}
      <section className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-sm border border-slate-50 dark:border-slate-800 space-y-8 transition-colors">
          
          {/* 使命部分 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center">
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-xl mr-3">
                  <Target size={18} className="text-[#ff6b6b]" strokeWidth={3} />
                </div>
                使命 (Mission)
              </h3>
              <button 
                onClick={() => setIsMissionExpanded(!isMissionExpanded)}
                className="text-slate-300 hover:text-[#ff6b6b] transition-colors p-1"
              >
                {isMissionExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            <div className="relative group">
              <AutoResizingTextarea 
                value={state.mission} 
                isExpanded={isMissionExpanded}
                onChange={(e: any) => setState(prev => ({ ...prev, mission: e.target.value }))}
                className={`w-full bg-slate-50/80 dark:bg-slate-800/50 rounded-3xl p-6 text-slate-600 dark:text-slate-300 font-bold leading-relaxed border border-transparent focus:border-red-100 dark:focus:border-red-900/30 transition-all ${!isMissionExpanded ? 'mask-fade' : ''}`}
                placeholder="你的核心价值观..."
              />
              {!isMissionExpanded && state.mission.length > 50 && (
                <div 
                  onClick={() => setIsMissionExpanded(true)}
                  className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-slate-50/95 dark:from-slate-800/95 via-slate-50/70 dark:via-slate-800/70 to-transparent rounded-b-3xl cursor-pointer flex items-end justify-center pb-3 text-[10px] font-black text-[#ff6b6b] uppercase tracking-[0.2em] transition-all hover:pb-4"
                >
                  点击展开全文
                </div>
              )}
            </div>
          </div>

          {/* 愿景部分 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center">
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-xl mr-3">
                  <Compass size={18} className="text-[#ff6b6b]" strokeWidth={3} />
                </div>
                愿景 (Vision)
              </h3>
              <button 
                onClick={() => setIsVisionExpanded(!isVisionExpanded)}
                className="text-slate-300 hover:text-[#ff6b6b] transition-colors p-1"
              >
                {isVisionExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            <div className="relative group">
              <AutoResizingTextarea 
                value={state.vision} 
                isExpanded={isVisionExpanded}
                onChange={(e: any) => setState(prev => ({ ...prev, vision: e.target.value }))}
                className={`w-full bg-slate-50/80 dark:bg-slate-800/50 rounded-3xl p-6 text-slate-600 dark:text-slate-300 font-bold leading-relaxed border border-transparent focus:border-red-100 dark:focus:border-red-900/30 transition-all ${!isVisionExpanded ? 'mask-fade' : ''}`}
                placeholder="你希望达成的未来状态..."
              />
              {!isVisionExpanded && state.vision.length > 50 && (
                <div 
                  onClick={() => setIsVisionExpanded(true)}
                  className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-slate-50/95 dark:from-slate-800/95 via-slate-50/70 dark:via-slate-800/70 to-transparent rounded-b-3xl cursor-pointer flex items-end justify-center pb-3 text-[10px] font-black text-[#ff6b6b] uppercase tracking-[0.2em] transition-all hover:pb-4"
                >
                  点击展开全文
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 年目标区域 */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-black text-2xl text-slate-800 dark:text-slate-100">关键年度目标</h2>
          <button 
            onClick={() => setShowAdd(true)} 
            className="bg-[#ff6b6b] text-white px-5 py-3 rounded-2xl flex items-center text-xs font-black shadow-lg shadow-red-100 dark:shadow-none active:scale-95 transition-all"
          >
            <Plus size={16} className="mr-1" strokeWidth={3} /> 添加目标
          </button>
        </div>

        {showAdd && (
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-2xl border border-red-50 dark:border-slate-800 animate-in slide-in-from-top-4">
            <input 
              value={newTitle} 
              onChange={e => setNewTitle(e.target.value)} 
              placeholder="设定一个年度大计..." 
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-3xl px-6 py-5 mb-6 border-none outline-none font-black text-slate-700 dark:text-slate-100" 
            />
            <div className="flex flex-wrap gap-2 mb-8">
              {CATEGORIES.map(c => (
                <button 
                  key={c} 
                  onClick={() => setNewCat(c)} 
                  className={`px-4 py-2.5 rounded-2xl text-[10px] font-black transition-all ${
                    newCat === c ? 'bg-[#ff6b6b] text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex space-x-3">
              <button onClick={addAnnualGoal} className="flex-1 bg-[#ff6b6b] text-white py-5 rounded-3xl font-black active:scale-95 transition-all">开启新挑战</button>
              <button onClick={() => setShowAdd(false)} className="px-8 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-3xl font-black active:scale-95 transition-all">取消</button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {state.annualGoals.map(goal => (
            <div key={goal.id} className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-sm border border-slate-50 dark:border-slate-800 transition-all">
              <button 
                onClick={() => toggleExpand(goal.id)}
                className="w-full p-7 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center space-x-5 text-left">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                    goal.progress === 100 ? 'bg-emerald-500 text-white' : 'bg-red-50 dark:bg-red-900/20 text-[#ff6b6b]'
                  }`}>
                    {goal.progress === 100 ? <Check size={24} /> : goal.category.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-slate-100 text-base leading-tight">{goal.title}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mt-1">
                      {goal.category} · {goal.progress}% 已推进
                    </p>
                  </div>
                </div>
                <div className="text-slate-200 dark:text-slate-700">
                  {goal.isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </div>
              </button>
              
              {goal.isExpanded && (
                <div className="px-8 pb-10 animate-in slide-in-from-top-2">
                  <div className="h-[1px] bg-slate-50 dark:bg-slate-800 mb-8" />
                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">调节完成进度</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }} 
                        className="text-slate-200 dark:text-slate-700 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="relative group px-1">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="1" 
                        value={goal.progress} 
                        onChange={e => updateGoalProgress(goal.id, parseInt(e.target.value))}
                        className="w-full h-3 rounded-full cursor-pointer appearance-none accent-[#ff6b6b]"
                        style={{
                          background: `linear-gradient(to right, #ff6b6b 0%, #ff6b6b ${goal.progress}%, ${state.settings.darkMode ? '#1e293b' : '#f1f5f9'} ${goal.progress}%, ${state.settings.darkMode ? '#1e293b' : '#f1f5f9'} 100%)`
                        }}
                      />
                      <div className="flex justify-between mt-4 text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase">
                        <span>起点 0%</span>
                        <span className="text-[#ff6b6b]">{goal.progress}%</span>
                        <span>终点 100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {state.annualGoals.length === 0 && (
            <div className="text-center py-20 text-slate-300 dark:text-slate-700 font-bold italic">尚无年度大计，点击上方添加</div>
          )}
        </div>
      </section>

      <style>{`
        .mask-fade {
          mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
        }
        
        /* 自定义滑动条外观以支持渐变背景 */
        input[type="range"]::-webkit-slider-runnable-track {
          height: 12px;
          border-radius: 99px;
        }
        input[type="range"]::-webkit-slider-thumb {
          height: 24px;
          width: 24px;
          background: white;
          border: 4px solid #ff6b6b;
          border-radius: 50%;
          cursor: pointer;
          appearance: none;
          margin-top: -6px; /* 居中 Thumb */
          box-shadow: 0 4px 10px rgba(255, 107, 107, 0.2);
          transition: transform 0.2s ease;
        }
        input[type="range"]:active::-webkit-slider-thumb {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default GoalsView;
