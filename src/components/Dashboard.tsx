import { Play, Plus, PhoneCall, Droplet, Clock, CheckCircle2, CalendarRange } from 'lucide-react';
import { motion } from 'motion/react';
import { TimetableEvent, ScheduledCall, WaterReminderSetting } from '../types';
import { synth } from '../utils/synth';

interface DashboardProps {
  userName: string;
  events: TimetableEvent[];
  calls: ScheduledCall[];
  waterSettings: WaterReminderSetting;
  onAddWater: (amount: number) => void;
  onNavigate: (tab: string) => void;
  onCompleteEvent: (eventId: string) => void;
}

export default function Dashboard({
  userName,
  events,
  calls,
  waterSettings,
  onAddWater,
  onNavigate,
  onCompleteEvent
}: DashboardProps) {
  
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Filtering today's events
  const todayEvents = events.filter(e => e.date === todayStr);
  const completedEventsCount = todayEvents.filter(e => e.completed).length;
  
  // Filtering today's calls
  const todayCalls = calls.filter(c => c.date === todayStr);
  const activeCalls = todayCalls.filter(c => c.status === 'upcoming');

  // Sort today's events chronologically
  const sortedTodayEvents = [...todayEvents].sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Determine current ongoing event (based on approximate time)
  const now = new Date();
  const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const ongoingEvent = sortedTodayEvents.find(e => {
    return !e.completed && e.startTime <= currentHourMin && e.endTime >= currentHourMin;
  });

  const nextUpcomingEvent = sortedTodayEvents.find(e => {
    return !e.completed && e.startTime > currentHourMin;
  });

  const handleQuickWater = () => {
    synth.playWaterDrop();
    onAddWater(250);
  };

  const getDayName = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };

  // Find the next call upcoming
  const nextCall = activeCalls[0];

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Welcoming Bento Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white dark:bg-[#131A2A] rounded-3xl border border-gray-150 dark:border-[#1E293B] shadow-xs gap-4 transition-all">
        <div className="space-y-1">
          <p className="text-xs uppercase font-extrabold tracking-widest text-[#4F46E5] dark:text-[#6366F1]">
            Active Companion Mode
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Bonjour, {userName}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
            {getDayName()} • You have <span className="font-bold text-[#4F46E5] dark:text-[#6366F1]">{todayEvents.length}</span> events today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { synth.playBubble(); onNavigate('timetable'); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 dark:bg-[#1E293B] dark:hover:bg-[#25324D] border border-gray-150 dark:border-[#334155] rounded-xl text-xs font-bold text-gray-800 dark:text-white transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
            <span>+ Add Event</span>
          </button>
          
          <div className="w-10 h-10 rounded-full border border-gray-150 dark:border-[#334155] overflow-hidden bg-gray-50 flex-shrink-0">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366f1&color=fff`} alt={userName} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* 2. Primary Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Box 1: Scheduled Tracker (Takes 2 Columns & 2 Rows on Desktop) */}
        <div className="md:col-span-2 bento-card flex flex-col justify-between min-h-[360px] relative">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] dark:text-[#6366F1] bg-[#EEF2FF] dark:bg-[#1A1C35] px-2.5 py-1 rounded-full mb-2">
                  Upcoming Today
                </span>
                <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Today's Schedule
                </h2>
              </div>
              <button 
                onClick={() => { synth.playBubble(); onNavigate('timetable'); }} 
                className="text-xs font-bold text-[#4F46E5] dark:text-[#6366F1] hover:underline hover:opacity-90"
              >
                See all
              </button>
            </div>

            <div className="space-y-3">
              {/* Ongoing status alert item */}
              {ongoingEvent && (
                <div className="bg-[#ECFDF5] dark:bg-[#10261E] border border-[#A7F3D0] dark:border-[#1E3A2E] rounded-2xl p-4 flex items-start gap-3.5 transition-all">
                  <span className="flex h-3 w-3 translate-y-1.5 rounded-full bg-[#10B981] animate-ping" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase bg-[#10B981] text-white px-2 py-0.5 rounded-full">Ongoing</span>
                      <span className="text-xs font-bold text-[#10B981] dark:text-[#34D399]">{ongoingEvent.startTime} - {ongoingEvent.endTime}</span>
                    </div>
                    <h4 className="font-extrabold text-gray-900 dark:text-white mt-1 text-sm">{ongoingEvent.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{ongoingEvent.description}</p>
                  </div>
                  <button 
                    onClick={() => { synth.playSuccess(); onCompleteEvent(ongoingEvent.id); }}
                    className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 border border-gray-150 dark:border-gray-700 text-xs font-bold text-[#10B981] dark:text-[#34D399] rounded-xl shadow-xs transition-all"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Next upcoming banner in today's schedule if no active ongoing */}
              {!ongoingEvent && nextUpcomingEvent && (
                <div className="bg-[#EEF2FF] dark:bg-[#1A1C35] border border-indigo-100 dark:border-indigo-950/40 rounded-2xl p-4 flex items-start gap-4">
                  <div className="p-2 bg-white dark:bg-[#131A2A] text-[#4F46E5] dark:text-[#6366F1] rounded-xl border border-gray-100 dark:border-slate-800">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-[#4F46E5] dark:text-[#6366F1]">Next event begins at {nextUpcomingEvent.startTime}</p>
                    <h4 className="font-extrabold text-gray-950 dark:text-white mt-1 text-sm">{nextUpcomingEvent.title}</h4>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{nextUpcomingEvent.description}</p>
                  </div>
                </div>
              )}

              {/* List of scrollable today's items */}
              {sortedTodayEvents.length === 0 ? (
                <div className="bg-gray-50/50 dark:bg-gray-900/40 p-8 rounded-2xl text-center border border-dashed border-gray-150 dark:border-gray-800 my-2">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500">No structured activities for today.</p>
                  <button 
                    onClick={() => { synth.playBubble(); onNavigate('timetable'); }}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#4F46E5] dark:text-[#6366F1] hover:underline"
                  >
                    Create an Event <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {sortedTodayEvents.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-3.5 flex items-center justify-between rounded-2xl border transition-all ${
                        item.completed 
                          ? 'bg-gray-50/50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-900' 
                          : 'bg-gray-50/50 dark:bg-gray-900/40 border-gray-150 dark:border-[#1E293B] hover:border-gray-200 dark:hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          item.priority === 'high' 
                            ? 'bg-[#F43F5E]' 
                            : item.priority === 'medium' 
                              ? 'bg-amber-500' 
                              : 'bg-[#4F46E5] dark:bg-[#6366F1]'
                        }`} />
                        <div className="min-w-0">
                          <h5 className={`text-sm font-extrabold truncate ${
                            item.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-850 dark:text-white'
                          }`}>
                            {item.title}
                          </h5>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                            <span>{item.startTime} - {item.endTime}</span>
                            {item.location && <span className="opacity-75">• {item.location}</span>}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          if (!item.completed) synth.playSuccess();
                          onCompleteEvent(item.id);
                        }}
                        className={`p-1.5 rounded-full border transition-all flex-shrink-0 ${
                          item.completed 
                            ? 'bg-[#EEF2FF] border-indigo-150 text-[#4F46E5] dark:bg-[#1A1C35] dark:border-indigo-950 dark:text-indigo-400' 
                            : 'border-gray-200 hover:bg-white dark:border-gray-700 dark:hover:bg-gray-850 text-gray-300 dark:text-gray-700 hover:text-indigo-500'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 fill-current text-white dark:text-transparent" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 flex items-center justify-between">
            <span>Completed Today: <strong>{completedEventsCount} of {todayEvents.length}</strong></span>
            <span>Total events: <strong>{events.length}</strong></span>
          </div>
        </div>

        {/* Box 2: Work Mode Focus Cadence Timer Preview (Column 3, Row 1) */}
        <div className="bento-card flex flex-col justify-between text-center min-h-[220px]">
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="inline-block text-[10.5px] font-bold uppercase tracking-wider text-[#F43F5E] bg-[#FFF1F2] dark:bg-[#2D1B22] px-3 py-1 rounded-full w-fit">
              Work Mode Active
            </span>
            <div className="text-4xl font-black tracking-tight text-[#F43F5E] font-mono mt-3">
              25:00
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              Daily Deep Concentration Timer
            </p>
          </div>

          <button 
            onClick={() => { synth.playBubble(); onNavigate('focus'); }}
            className="mt-4 w-full py-2.5 bg-[#F43F5E] hover:bg-[#E11D48] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Launch Focus Session
          </button>
        </div>

        {/* Box 3: Hydration Metrics Dashboard (Column 3, Row 2) */}
        <div className="bento-card flex flex-col justify-between min-h-[220px] bg-[#EFF6FF] dark:bg-[#0B1F35] border-[#DBEAFE] dark:border-[#1E293B]">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block text-[10.5px] font-bold uppercase tracking-widest text-[#1D4ED8] bg-[#DBEAFE] dark:bg-[#1A2C55] px-2.5 py-1 rounded-full mb-1">
                  Hydration Status
                </span>
                <h3 className="text-lg font-extrabold text-blue-900 dark:text-blue-100 mt-1">
                  Water Intake
                </h3>
              </div>
              <Droplet className="w-5 h-5 text-[#3B82F6] animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end text-xs font-extrabold text-blue-800 dark:text-blue-300">
                <span>{waterSettings.currentIntakeMl} ml completed</span>
                <span>{Math.round((waterSettings.currentIntakeMl / waterSettings.dailyGoalMl) * 100)}%</span>
              </div>
              
              <div className="w-full bg-blue-100 dark:bg-blue-950/50 h-3 rounded-full overflow-hidden relative shadow-inner">
                <motion.div 
                  className="bg-gradient-to-r from-[#3B82F6] to-sky-400 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((waterSettings.currentIntakeMl / waterSettings.dailyGoalMl) * 100, 100)}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleQuickWater}
            className="mt-4 w-full py-2.5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-100/10 dark:shadow-none"
          >
            Drink Water (+250ml)
          </button>
        </div>

        {/* Box 4: Scheduled Call Reminders Widget (Takes full columns span 3 - Wide banner at bottom) */}
        <div className="md:col-span-3 bento-card bg-[#4F46E5] text-white border-none p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-10 pointer-events-none">
            <PhoneCall className="w-40 h-40 rotate-12" />
          </div>
          
          <div className="space-y-1 z-10">
            <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
              Incoming Calls
            </span>
            <h3 className="text-lg font-black tracking-tight">
              {nextCall ? `Call with ${nextCall.personName} at ${nextCall.time}` : 'Next Call Scheduler'}
            </h3>
            <p className="text-xs text-indigo-100 max-w-xl">
              {nextCall 
                ? `Remind to execute call: ${nextCall.phoneNumber} for topic "${nextCall.notes || 'General Synching'}".`
                : 'Keep your communications integrated. Add reminders for outgoing telephone tasks to remain in contact.'}
            </p>
          </div>

          <div className="z-10 shrink-0">
            <button 
              onClick={() => { synth.playBubble(); onNavigate('calls'); }}
              className="px-5 py-2.5 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white rounded-xl text-xs font-bold transition-all border border-white/25 backdrop-blur-md"
            >
              {nextCall ? 'Manage Reminders' : 'Set Call Reminders'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
