"use client";

import { useMemo } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useHabitStore } from "@/store/useHabitStore";
import { format, subDays } from "date-fns";

export default function CategoryRadar() {
  const { logs, habits } = useHabitStore();

  const data = useMemo(() => {
    // Collect stats over the last 30 days
    const today = new Date();
    
    // Group habits by category
    const categories: Record<string, { totalPossible: number, totalCompleted: number }> = {};
    
    habits.forEach(h => {
      const cat = h.category || "General";
      if (!categories[cat]) {
        categories[cat] = { totalPossible: 0, totalCompleted: 0 };
      }
      
      for (let i = 0; i < 30; i++) {
        categories[cat].totalPossible++;
        const dayStr = format(subDays(today, i), 'yyyy-MM-dd');
        if (logs[`${dayStr}_${h._id}`] === 'completed') {
          categories[cat].totalCompleted++;
        }
      }
    });

    return Object.keys(categories).map(cat => ({
      subject: cat,
      score: Math.round((categories[cat].totalCompleted / categories[cat].totalPossible) * 100) || 0,
      fullMark: 100,
    }));
  }, [logs, habits]);

  if (data.length < 3) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-premium-border w-full flex flex-col gap-4 justify-center items-center h-[300px]">
        <span className="text-xs font-mono uppercase tracking-widest text-premium-muted">Category Balance</span>
        <p className="text-sm text-premium-muted opacity-50 text-center max-w-[200px]">Add habits in at least 3 categories to unlock radar insights.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border border-premium-border w-full flex flex-col h-[300px]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-heading tracking-tight text-premium-text">Category Balance</h3>
        <span className="text-xs font-mono tracking-widest uppercase text-premium-muted">30 Day Radar</span>
      </div>
      
      <div className="flex-1 w-full h-full min-h-0 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="var(--theme-text)" strokeOpacity={0.1} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'var(--theme-text)', fontSize: 10, fontFamily: 'monospace', opacity: 0.7 }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-text)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--theme-text)' }}
              formatter={(value) => [`${value}% Completion`, 'Score']}
            />
            <Radar
              name="Balance"
              dataKey="score"
              stroke="var(--theme-text)"
              fill="var(--theme-text)"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
