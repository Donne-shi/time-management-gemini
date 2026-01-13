
import React, { useState } from 'react';
import { Task, Priority } from '../types';
import { Icons, CATEGORIES } from '../constants';

interface Props {
  tasks: Task[];
  onAdd: (task: any) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskView: React.FC<Props> = ({ tasks, onAdd, onToggle, onDelete }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState(CATEGORIES[0]);
  const [newPriority, setNewPriority] = useState<Priority>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAdd({
      title: newTitle,
      category: newCat,
      priority: newPriority,
      description: '',
      dueDate: new Date().toISOString(),
      estimatedMinutes: 25,
    });
    setNewTitle('');
    setShowAdd(false);
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Tasks</h1>
          <p className="text-slate-400 mt-1">Manage your daily goals and priorities</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Icons.Plus className="w-5 h-5 mr-2" />
          Add Task
        </button>
      </header>

      {showAdd && (
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl mb-8 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <input
            autoFocus
            type="text"
            placeholder="What needs to be done?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
          />
          <div className="flex flex-wrap gap-4">
            <select 
              value={newCat} 
              onChange={(e) => setNewCat(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={newPriority} 
              onChange={(e) => setNewPriority(e.target.value as Priority)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <button type="submit" className="ml-auto bg-slate-100 text-slate-900 px-6 py-2 rounded-lg font-semibold hover:bg-white transition-colors">
              Save Task
            </button>
          </div>
        </form>
      )}

      <div className="space-y-8">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">In Progress — {activeTasks.length}</h2>
          <div className="grid gap-3">
            {activeTasks.length === 0 && (
              <div className="text-center py-12 glass-card rounded-2xl border-dashed border-2 border-slate-700">
                <p className="text-slate-500">No active tasks. Take a break or add something new!</p>
              </div>
            )}
            {activeTasks.map(task => (
              <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </div>
        </section>

        {completedTasks.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Completed</h2>
            <div className="grid gap-3 opacity-60">
              {completedTasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const TaskItem: React.FC<{ task: Task; onToggle: (id: string) => void; onDelete: (id: string) => void }> = ({ task, onToggle, onDelete }) => {
  const priorityColors = {
    low: 'bg-emerald-500/10 text-emerald-500',
    medium: 'bg-amber-500/10 text-amber-500',
    high: 'bg-rose-500/10 text-rose-500',
  };

  return (
    <div className="glass-card group flex items-center p-4 rounded-xl hover:bg-slate-800/50 transition-all border border-slate-800 hover:border-slate-700">
      <button 
        onClick={() => onToggle(task.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600 hover:border-indigo-400'
        }`}
      >
        {task.completed && <Icons.Check className="w-4 h-4 text-white" />}
      </button>
      <div className="ml-4 flex-1">
        <h3 className={`font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
          {task.title}
        </h3>
        <div className="flex items-center mt-1 space-x-3">
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 uppercase font-bold tracking-tight">{task.category}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tight ${priorityColors[task.priority]}`}>{task.priority}</span>
        </div>
      </div>
      <button 
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-500 transition-opacity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

export default TaskView;
