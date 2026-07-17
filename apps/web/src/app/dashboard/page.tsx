"use client";

import { useEffect, useState } from "react";
import { useHabitStore } from "@/store/useHabitStore";
import ProgressRing from "@/components/ProgressRing";
import { Check, Clock, Plus, Trash2, Flame, GripVertical } from "lucide-react";
import { format, subDays } from "date-fns";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export default function Dashboard() {
  const { habits, logs, addHabit, removeHabit, toggleLog, reorderHabit } = useHabitStore();
  const [mounted, setMounted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<'binary' | 'timer'>('binary');
  const [newTime, setNewTime] = useState("25");
  const [newCategory, setNewCategory] = useState("General");

  const categoriesOptions = ['General', 'Health', 'Learning', 'Work', 'Creative', 'Finance'];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayLabel = format(new Date(), 'EEEE, MMMM do');
  
  // Count how many habits are completed TODAY
  const completedCount = habits.filter(h => logs[`${todayStr}_${h._id}`] === 'completed').length;
  const progress = habits.length ? (completedCount / habits.length) * 100 : 0;

  // Calculate streaks for a habit
  const getStreak = (habitId: string) => {
    let current = 0;
    let longest = 0;
    let tempStreak = 0;
    const today = new Date();
    
    // Check up to 365 days back for longest streak
    for (let i = 0; i < 365; i++) {
      const dayStr = format(subDays(today, i), 'yyyy-MM-dd');
      if (logs[`${dayStr}_${habitId}`] === 'completed') {
        tempStreak++;
        if (i === current) current = tempStreak; // current streak is contiguous from today
      } else {
        if (tempStreak > longest) longest = tempStreak;
        tempStreak = 0;
      }
    }
    if (tempStreak > longest) longest = tempStreak;
    return { current, longest };
  };

  // Calculate weekly & monthly stats
  const getStats = () => {
    if (habits.length === 0) return { weekly: 0, monthly: 0, last7Days: [] };
    
    let weeklyCompleted = 0;
    let monthlyCompleted = 0;
    const last7Days = [];

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const dayStr = format(subDays(today, i), 'yyyy-MM-dd');
      const completedOnDay = habits.filter(h => logs[`${dayStr}_${h._id}`] === 'completed').length;
      weeklyCompleted += completedOnDay;
      last7Days.push(completedOnDay / habits.length);
    }

    for (let i = 0; i < 30; i++) {
      const dayStr = format(subDays(today, i), 'yyyy-MM-dd');
      const completedOnDay = habits.filter(h => logs[`${dayStr}_${h._id}`] === 'completed').length;
      monthlyCompleted += completedOnDay;
    }

    return {
      weekly: Math.round((weeklyCompleted / (habits.length * 7)) * 100),
      monthly: Math.round((monthlyCompleted / (habits.length * 30)) * 100),
      last7Days
    };
  };

  const stats = getStats();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addHabit({
      title: newTitle,
      type: newType,
      targetTimeMinutes: newType === 'timer' ? parseInt(newTime) || 25 : undefined,
      isActive: true,
      category: newCategory === 'General' ? undefined : newCategory
    });
    setNewTitle("");
    setNewCategory("General");
    setNewTime("25");
    setIsAdding(false);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    reorderHabit(
      draggableId, 
      source.droppableId, 
      destination.droppableId, 
      source.index, 
      destination.index
    );
  };

  // Compute grouped habits to map over
  const activeCategories = Array.from(new Set(habits.map(h => h.category || 'General')));
  const groupedHabits: Record<string, typeof habits> = {};
  activeCategories.forEach(c => groupedHabits[c] = []);
  habits.forEach(h => groupedHabits[h.category || 'General'].push(h));

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.15, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-12 mt-12"
    >
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-premium-border pb-8 mb-4">
        <div>
          <h1 className="text-5xl md:text-7xl font-heading tracking-tighter mb-4 text-premium-text leading-none">Dashboard</h1>
          <p className="text-premium-muted font-sans text-sm tracking-widest uppercase">{todayLabel}</p>
        </div>
        <div className="hidden md:block">
           <ProgressRing progress={progress} radius={40} stroke={3} />
        </div>
      </header>

      {/* Stats Section */}
      {habits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="glass-panel p-5 rounded-xl border border-premium-border flex flex-col justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-premium-muted mb-4">7-Day Trend</span>
            <div className="flex items-end gap-2 h-12">
              {stats.last7Days.map((val, i) => (
                <div key={i} className="flex-1 bg-premium-border/30 rounded-t-sm relative h-full">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-premium-text rounded-t-sm transition-all duration-500" 
                    style={{ height: `${val * 100}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel p-5 rounded-xl border border-premium-border flex flex-col justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-premium-muted mb-2">Weekly</span>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-heading text-premium-text leading-none">{stats.weekly}%</span>
              <span className="text-xs text-premium-muted mb-1 font-mono uppercase tracking-widest">Done</span>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-xl border border-premium-border flex flex-col justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-premium-muted mb-2">Monthly</span>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-heading text-premium-text leading-none">{stats.monthly}%</span>
              <span className="text-xs text-premium-muted mb-1 font-mono uppercase tracking-widest">Done</span>
            </div>
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className="flex flex-col gap-8">
        <DragDropContext onDragEnd={onDragEnd}>
          {activeCategories.map((category) => (
            <div key={category} className="flex flex-col gap-4">
              <h2 className="text-xs font-heading font-medium tracking-widest text-premium-muted uppercase ml-2">{category}</h2>
              <Droppable droppableId={category}>
                {(provided) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    className="flex flex-col gap-4 min-h-[10px]"
                  >
                    {groupedHabits[category].map((habit, index) => {
                      const isCompleted = logs[`${todayStr}_${habit._id}`] === 'completed';
                      const streak = getStreak(habit._id);
                      return (
                        <Draggable key={habit._id} draggableId={habit._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`group glass-panel flex items-center justify-between p-5 rounded-xl transition-all duration-300 ${
                                isCompleted 
                                  ? 'border-transparent opacity-40' 
                                  : 'hover:border-premium-muted'
                              } ${snapshot.isDragging ? 'shadow-2xl z-50 ring-1 ring-premium-accent bg-[var(--theme-bg)]' : 'border border-premium-border'}`}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div 
                                  {...provided.dragHandleProps} 
                                  className="text-premium-muted opacity-30 hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
                                >
                                  <GripVertical size={18} />
                                </div>
                                <div 
                                  className={`h-6 w-6 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer flex-shrink-0 ${
                                    isCompleted ? 'bg-premium-accent text-black border-premium-accent' : 'border-premium-border text-transparent'
                                  }`}
                                  onClick={() => toggleLog(habit._id, todayStr)}
                                >
                                  <Check size={12} strokeWidth={3} />
                                </div>
                                <div className="flex flex-col cursor-pointer" onClick={() => toggleLog(habit._id, todayStr)}>
                                  <h3 className={`text-lg font-medium tracking-tight ${isCompleted ? 'line-through text-premium-muted' : 'text-premium-text'}`}>
                                    {habit.title}
                                  </h3>
                                  {streak.current > 0 && (
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="flex items-center gap-1 text-xs text-premium-muted font-mono">
                                        <Flame size={12} className="text-orange-400" />
                                        {streak.current}d streak
                                      </span>
                                      {streak.longest > streak.current && (
                                        <span className="text-xs text-premium-muted font-mono opacity-50">
                                          best {streak.longest}d
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 ml-4">
                                {habit.type === 'timer' && (
                                  <div className="flex items-center gap-2 text-premium-muted text-xs uppercase tracking-widest font-mono opacity-80 whitespace-nowrap">
                                    <Clock size={14} />
                                    {habit.targetTimeMinutes} MIN
                                  </div>
                                )}
                                <button 
                                  onClick={() => removeHabit(habit._id)}
                                  className="opacity-0 group-hover:opacity-100 text-premium-muted hover:text-red-500 transition-opacity p-2 flex-shrink-0"
                                  title="Remove Habit"
                                  aria-label={`Remove ${habit.title}`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>

        {isAdding ? (
          <form onSubmit={handleAdd} className="glass-panel p-5 rounded-xl border border-premium-border animate-in fade-in zoom-in-95 duration-200 mt-4">
            <div className="flex flex-col gap-4">
              <input 
                autoFocus
                type="text"
                placeholder="What do you want to build?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-transparent text-premium-text text-lg outline-none placeholder:text-premium-muted border-b border-premium-border pb-2"
              />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="bg-[var(--theme-bg)] text-premium-text border border-premium-border rounded p-2 text-sm outline-none focus:border-premium-text w-full sm:w-auto"
                  >
                    {categoriesOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'binary' | 'timer')}
                    className="bg-[var(--theme-bg)] text-premium-text border border-premium-border rounded p-2 text-sm outline-none focus:border-premium-text w-full sm:w-auto"
                  >
                    <option value="binary">Binary (Checkoff)</option>
                    <option value="timer">Timer (Pomodoro)</option>
                  </select>
                  {newType === 'timer' && (
                     <div className="flex items-center gap-2">
                       <div className="flex items-center gap-1">
                         {[25, 45, 90].map(min => (
                           <button 
                             key={min} 
                             type="button"
                             onClick={() => setNewTime(min.toString())}
                             className={`px-2 py-1 text-xs rounded border transition-colors ${newTime === min.toString() ? 'bg-premium-text text-black border-premium-text' : 'border-premium-border text-premium-muted hover:text-premium-text hover:border-premium-muted'}`}
                           >
                             {min}m
                           </button>
                         ))}
                       </div>
                       <input 
                         type="number" 
                         value={newTime}
                         onChange={(e) => setNewTime(e.target.value)}
                         className="bg-transparent border border-premium-border rounded p-1 w-16 text-sm text-center text-premium-text outline-none focus:border-premium-text ml-1"
                         min="1"
                       />
                     </div>
                  )}
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-premium-muted hover:text-premium-text">Cancel</button>
                  <button type="submit" disabled={!newTitle.trim()} className="px-4 py-2 text-sm bg-premium-text text-black rounded font-medium disabled:opacity-50">Create</button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 p-5 rounded-xl border border-dashed border-premium-border text-premium-muted hover:border-premium-text hover:text-premium-text transition-all duration-300 mt-4"
          >
            <Plus size={16} />
            <span className="font-medium tracking-tight">Add new habit</span>
          </button>
        )}
      </div>
      
      <p className="text-center text-xs text-premium-muted opacity-50 mt-8 font-sans tracking-wide">
        Press <kbd className="font-mono bg-premium-panel text-premium-muted border border-premium-border px-2 py-1 rounded mx-1">Ctrl+K</kbd> to navigate
      </p>
    </motion.div>
  );
}
