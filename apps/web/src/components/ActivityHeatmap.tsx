"use client";

import { useMemo } from "react";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, differenceInDays } from "date-fns";
import { useHabitStore } from "@/store/useHabitStore";

export default function ActivityHeatmap() {
  const { logs, habits } = useHabitStore();

  const data = useMemo(() => {
    const today = new Date();
    // Go back roughly a year, but align to start of a week
    const startDate = startOfWeek(subDays(today, 364), { weekStartsOn: 0 });
    const endDate = endOfWeek(today, { weekStartsOn: 0 });
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const heatmap = [];

    let currentWeek = [];
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const dayStr = format(day, 'yyyy-MM-dd');
      
      let completedCount = 0;
      habits.forEach(h => {
        if (logs[`${dayStr}_${h._id}`] === 'completed') completedCount++;
      });
      
      const intensity = habits.length === 0 ? 0 : Math.min(4, Math.ceil((completedCount / habits.length) * 4));

      currentWeek.push({
        date: dayStr,
        count: completedCount,
        intensity // 0 to 4
      });

      if (currentWeek.length === 7) {
        heatmap.push(currentWeek);
        currentWeek = [];
      }
    }
    return heatmap;
  }, [logs, habits]);

  const getColor = (intensity: number) => {
    switch (intensity) {
      case 4: return "bg-emerald-400 border-emerald-500/20";
      case 3: return "bg-emerald-500/80 border-emerald-500/20";
      case 2: return "bg-emerald-700/60 border-emerald-500/20";
      case 1: return "bg-emerald-900/40 border-emerald-500/10";
      default: return "bg-premium-border/20 border-premium-border/10";
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-premium-border w-full flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-heading tracking-tight text-premium-text">Activity Heatmap</h3>
        <span className="text-xs font-mono tracking-widest uppercase text-premium-muted">Last 365 Days</span>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar pb-4 -mx-2 px-2">
        <div className="flex gap-1 min-w-max">
          {data.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day, dIdx) => (
                <div 
                  key={day.date}
                  title={`${day.count} habits on ${day.date}`}
                  className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-[3px] border transition-colors hover:ring-2 hover:ring-emerald-400/50 ${getColor(day.intensity)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end items-center gap-2 text-[10px] font-mono text-premium-muted uppercase tracking-widest mt-2">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-[3px] bg-premium-border/20" />
          <div className="w-3 h-3 rounded-[3px] bg-emerald-900/40" />
          <div className="w-3 h-3 rounded-[3px] bg-emerald-700/60" />
          <div className="w-3 h-3 rounded-[3px] bg-emerald-500/80" />
          <div className="w-3 h-3 rounded-[3px] bg-emerald-400" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
