import { TrendingUp, Award, Droplet, Flame, Coffee, CheckCircle } from 'lucide-react';
import { TimetableEvent, ScheduledCall, FocusSession, WaterLog } from '../types';
import { synth } from '../utils/synth';

interface ReportsProps {
  events: TimetableEvent[];
  calls: ScheduledCall[];
  focusSessions: FocusSession[];
  waterLogs: WaterLog[];
  waterGoalMl: number;
}

export default function Reports({
  events,
  calls,
  focusSessions,
  waterLogs,
  waterGoalMl
}: ReportsProps) {
  
  // Aggregate stats
  const totalCompletedEvents = events.filter(e => e.completed).length;
  const totalEventsCount = events.length;
  const eventCompletionRate = totalEventsCount > 0 ? Math.round((totalCompletedEvents / totalEventsCount) * 100) : 0;

  const totalCallsCount = calls.length;
  const totalCompletedCalls = calls.filter(c => c.status === 'completed').length;

  const totalFocusSessionsCount = focusSessions.length;
  const totalFocusMinutes = focusSessions.reduce((acc, curr) => acc + (curr.completed ? curr.workDurationMinutes : 0), 0);
  const totalFocusHours = Math.round((totalFocusMinutes / 60) * 10) / 10;

  const totalWaterLoggedMl = waterLogs.reduce((acc, curr) => acc + curr.amountMl, 0);
  const waterRate = Math.min(Math.round((totalWaterLoggedMl / waterGoalMl) * 100), 100);

  // SVG Custom Bar Chart dimensions
  const height = 140;
  const dataPoints = [
    { label: 'Schedules', val: totalEventsCount, completed: totalCompletedEvents, color: 'bg-indigo-500', svgColor: '#6366f1' },
    { label: 'Work Mins', val: totalFocusMinutes / 10, completed: totalFocusMinutes / 10, color: 'bg-orange-500', svgColor: '#f97316' },
    { label: 'Calls', val: totalCallsCount, completed: totalCompletedCalls, color: 'bg-amber-500', svgColor: '#f59e0b' }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upper header */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-105 dark:border-gray-750 shadow-sm">
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" /> Executive Analytics & Reports
        </h2>
        <p className="text-xs text-gray-400">Track and visualize your productivity gains and health indices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Productivity Vector Graph Dashboard (Custom SVG Flat Bar Charts) */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-105 dark:border-gray-750 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500 fill-current" /> Productivity Metrics
          </h3>

          <p className="text-xs text-brand-secondary text-gray-400">Comparing complete calendar tasks vs. logged deep focus blocks</p>

          <div className="border border-gray-50 dark:border-gray-750 rounded-2xl p-4 bg-gray-50/50 dark:bg-gray-900/10 relative">
            
            {/* Custom SVG Graphic */}
            <svg viewBox="0 0 300 150" className="w-full h-auto">
              {/* Y Grid lines */}
              <line x1="40" y1="20" x2="280" y2="20" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-gray-800" />
              <line x1="40" y1="65" x2="280" y2="65" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-gray-800" />
              <line x1="40" y1="110" x2="280" y2="110" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-gray-800" />
              <line x1="40" y1="110" x2="280" y2="110" stroke="#cbd5e1" strokeWidth="1.5" className="dark:stroke-gray-700" />

              {/* Data pillars */}
              {/* Pillar 1: Schedules (Index: 0) */}
              <g className="cursor-pointer group" onClick={() => synth.playBubble()}>
                {/* Total scheduled */}
                <rect x="70" y={110 - Math.min(totalEventsCount * 12, 85)} width="25" height={Math.min(totalEventsCount * 12, 85)} rx="4" fill="#e2e8f0" className="dark:fill-gray-700" />
                {/* Completed */}
                <rect x="70" y={110 - Math.min(totalCompletedEvents * 12, 85)} width="25" height={Math.min(totalCompletedEvents * 12, 85)} rx="4" fill="#6366f1" />
                <text x="82.5" y="125" fontSize="8" fontWeight="bold" fill="#94a3b8" textAnchor="middle">Tasks</text>
                <text x="82.5" y={100 - Math.min(totalCompletedEvents * 12, 85)} fontSize="9" fontWeight="bold" fill="#6366f1" textAnchor="middle">{totalCompletedEvents}</text>
              </g>

              {/* Pillar 2: Focus Minutes Progress (Index: 1) */}
              <g className="cursor-pointer" onClick={() => synth.playBubble()}>
                <rect x="145" y={110 - Math.min((totalFocusMinutes / 10) * 4, 85)} width="25" height={Math.min((totalFocusMinutes / 10) * 4, 85)} rx="4" fill="#ea580c" />
                <text x="157.5" y="125" fontSize="8" fontWeight="bold" fill="#94a3b8" textAnchor="middle">WorkMins</text>
                <text x="157.5" y={100 - Math.min((totalFocusMinutes / 10) * 4, 85)} fontSize="9" fontWeight="bold" fill="#ea580c" textAnchor="middle">{totalFocusMinutes}</text>
              </g>

              {/* Pillar 3: Calls Completed (Index: 2) */}
              <g className="cursor-pointer" onClick={() => synth.playBubble()}>
                {/* Total calls scheduled */}
                <rect x="220" y={110 - Math.min(totalCallsCount * 15, 85)} width="25" height={Math.min(totalCallsCount * 15, 85)} rx="4" fill="#e2e8f0" className="dark:fill-gray-700" />
                {/* Completed */}
                <rect x="220" y={110 - Math.min(totalCompletedCalls * 15, 85)} width="25" height={Math.min(totalCompletedCalls * 15, 85)} rx="4" fill="#f59e0b" />
                <text x="232.5" y="125" fontSize="8" fontWeight="bold" fill="#94a3b8" textAnchor="middle">Calls</text>
                <text x="232.5" y={100 - Math.min(totalCompletedCalls * 15, 85)} fontSize="9" fontWeight="bold" fill="#f59e0b" textAnchor="middle">{totalCompletedCalls}</text>
              </g>
            </svg>

          </div>

          {/* Quick stats cards below bar graphs */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3.5 bg-indigo-50/20 rounded-xl border border-indigo-100/40">
              <span className="block text-[10px] font-black uppercase text-gray-400">Timetable Completion Rate</span>
              <span className="text-base font-black text-indigo-700 dark:text-indigo-400">{eventCompletionRate}% ({totalCompletedEvents} / {totalEventsCount})</span>
            </div>
            
            <div className="p-3.5 bg-orange-50/20 rounded-xl border border-orange-100/30">
              <span className="block text-[10px] font-black uppercase text-gray-400">Sum Focus Hours Logged</span>
              <span className="text-base font-black text-orange-600 dark:text-orange-400">{totalFocusHours} hrs</span>
            </div>
          </div>
        </div>

        {/* Health Progress Donut Circle (Custom SVG Curved Progress Radial Ring) */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-105 dark:border-gray-750 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            <Droplet className="w-4 h-4 text-sky-500" /> Hydration Analytics
          </h3>

          <p className="text-xs text-gray-400">Monitoring daily glass fill rates vs target limits</p>

          <div className="flex flex-col items-center justify-center p-6 border border-gray-5 white rounded-2xl bg-gray-50/20 dark:bg-gray-900/10">
            {/* SVG Ring Progress */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="54" className="stroke-gray-100 dark:stroke-gray-750 fill-transparent" strokeWidth="8" />
                <circle 
                  cx="72" 
                  cy="72" 
                  r="54" 
                  className="stroke-sky-500 fill-transparent transition-all duration-500" 
                  strokeWidth="8" 
                  strokeDasharray={2 * Math.PI * 54} 
                  strokeDashoffset={(2 * Math.PI * 54) - (waterRate / 100) * (2 * Math.PI * 54)}
                  strokeLinecap="round"
                />
              </svg>

              <div className="text-center z-10 select-none">
                <span className="text-2xl font-black font-mono text-sky-600 dark:text-sky-400">{waterRate}%</span>
                <span className="block text-[9px] font-black uppercase text-gray-400 mt-1">Goal Status</span>
              </div>

            </div>

            <div className="text-center mt-4">
              <p className="text-xs font-semibold text-gray-550 dark:text-gray-300">Total logged: <b className="text-sky-655 font-black">{totalWaterLoggedMl} ml</b> today</p>
              <p className="text-[10px] text-gray-450 mt-1">Your set targeted daily companion goal is {waterGoalMl}ml.</p>
            </div>
          </div>

        </div>

      </div>

      {/* Rewards achievements cards */}
      <section className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-md flex items-center gap-4">
        <div className="p-3 bg-white/10 rounded-2xl text-white">
          <Award className="w-10 h-10 text-yellow-300 fill-current animate-pulse" />
        </div>
        <div>
          <h4 className="font-extrabold text-sm sm:text-base">Productivity Rank Status</h4>
          <p className="text-xs text-emerald-100 mt-1">
            {totalCompletedEvents >= 1 || totalWaterLoggedMl >= 500
              ? `Aesthetic Streak active! You have checked off ${totalCompletedEvents} schedule slot${totalCompletedEvents > 1 ? 's' : ''} and kept healthy with ${totalWaterLoggedMl}ml water.`
              : "Complete meetings, log water glasses and trigger focus periods to unlock custom daily awards."}
          </p>
        </div>
      </section>

    </div>
  );
}
