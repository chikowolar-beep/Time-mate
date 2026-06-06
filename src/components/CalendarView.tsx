import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Phone, MessageSquare, Flame } from 'lucide-react';
import { TimetableEvent, ScheduledCall, FocusSession } from '../types';
import { synth } from '../utils/synth';

interface CalendarViewProps {
  events: TimetableEvent[];
  calls: ScheduledCall[];
  focusSessions: FocusSession[];
}

type CalendarTab = 'month' | 'week' | 'day';

export default function CalendarView({
  events,
  calls,
  focusSessions
}: CalendarViewProps) {
  const [currentTab, setCurrentTab] = useState<CalendarTab>('month');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeMonthYear, setActiveMonthYear] = useState<Date>(new Date());

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonthIndex = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const shiftMonth = (offset: number) => {
    synth.playBubble();
    const copy = new Date(activeMonthYear);
    copy.setMonth(copy.getMonth() + offset);
    setActiveMonthYear(copy);
  };

  const getFormattedDateString = (day: number) => {
    const year = activeMonthYear.getFullYear();
    const month = String(activeMonthYear.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-${String(day).padStart(2, '0')}`;
  };

  // Generate Month Matrix grid cells
  const drawMonthGrid = () => {
    const daysInMonth = getDaysInMonth(activeMonthYear);
    const startOffset = getFirstDayOfMonthIndex(activeMonthYear);
    const cells = [];

    // Empty lead cells
    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`blank-${i}`} className="h-10 sm:h-14 bg-gray-50/50 dark:bg-gray-850/40 rounded-lg opacity-30 border border-gray-100 dark:border-gray-800" />);
    }

    // Actual day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const fullDateStr = getFormattedDateString(d);
      const isSelected = selectedDate === fullDateStr;
      
      const dayEvents = events.filter(e => e.date === fullDateStr);
      const dayCalls = calls.filter(c => c.date === fullDateStr);
      const isToday = new Date().toISOString().split('T')[0] === fullDateStr;

      cells.push(
        <button
          key={`day-${d}`}
          id={`day-cell-${d}`}
          onClick={() => { synth.playBubble(); setSelectedDate(fullDateStr); }}
          className={`h-10 sm:h-14 p-1 sm:p-1.5 flex flex-col justify-between items-start rounded-xl border text-left transition-all ${
            isSelected 
              ? 'border-indigo-650 bg-indigo-50/40 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400' 
              : isToday
                ? 'border-indigo-200 bg-indigo-50/20 text-gray-900 dark:text-white font-bold'
                : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-300'
          }`}
        >
          <span className="text-xs font-bold leading-none">{d}</span>
          
          {/* Micro tag dots */}
          <div className="flex gap-1 flex-wrap mt-auto">
            {dayEvents.map(e => (
              <span key={e.id} className="w-1.5 h-1.5 rounded-full bg-indigo-500" title={`Meeting: ${e.title}`} />
            ))}
            {dayCalls.map(c => (
              <span key={c.id} className="w-1.5 h-1.5 rounded-full bg-amber-500" title={`Phone Call: ${c.personName}`} />
            ))}
          </div>
        </button>
      );
    }
    return cells;
  };

  // Agenda List compiled for currently selected date
  const selectedDateEvents = events.filter(e => e.date === selectedDate);
  const selectedDateCalls = calls.filter(c => c.date === selectedDate);
  
  // Quick format visual text
  const dateFormattedText = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* View Toggle tabs */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-750 shadow-sm flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-indigo-650" />
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">Fluid Calendar View</h2>
            <p className="text-xs text-gray-400">Monthly indices and dynamic daily agendas</p>
          </div>
        </div>

        <div className="flex bg-gray-55 dark:bg-gray-750 p-1 rounded-xl">
          {(['month', 'week', 'day'] as CalendarTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { synth.playBubble(); setCurrentTab(tab); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                currentTab === tab
                  ? 'bg-white dark:bg-gray-700 text-gray-950 dark:text-white shadow-xs'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'day' ? 'agenda' : tab}
            </button>
          ))}
        </div>
      </div>

      {currentTab === 'month' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-750 shadow-sm space-y-4">
          
          {/* Header Month Slider controls */}
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              {activeMonthYear.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-1.5">
              <button
                onClick={() => shiftMonth(-1)}
                className="p-1.5 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-xl transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => { synth.playBubble(); setActiveMonthYear(new Date()); setSelectedDate(new Date().toISOString().split('T')[0]); }}
                className="px-3 py-1.5 border border-gray-100 dark:border-gray-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-750 rounded-xl"
              >
                Today
              </button>
              <button
                onClick={() => shiftMonth(1)}
                className="p-1.5 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-xl transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days notation labels */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-black text-gray-400">
            {daysOfWeek.map(d => (
              <span key={d} className="py-1">{d}</span>
            ))}
          </div>

          {/* Monthly grid cell matrix */}
          <div className="grid grid-cols-7 gap-1.5">
            {drawMonthGrid()}
          </div>

        </div>
      )}

      {currentTab === 'week' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-750 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Weekly Agenda Summary</h3>
          <div className="space-y-4">
            {/* 7-Day sequence */}
            {[0, 1, 2, 3, 4, 5, 6].map(offset => {
              const pivot = new Date();
              pivot.setDate(pivot.getDate() - pivot.getDay() + offset); // Get start of current week
              const dateStr = pivot.toISOString().split('T')[0];
              const dayLabel = pivot.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
              
              const dayEventList = events.filter(e => e.date === dateStr);
              const dayCallList = calls.filter(c => c.date === dateStr);

              return (
                <div key={offset} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-start p-3.5 rounded-xl border border-gray-100 dark:border-gray-750 hover:border-indigo-100/40">
                  <div className="text-xs font-black text-indigo-650 dark:text-indigo-400">{dayLabel}</div>
                  
                  <div className="sm:col-span-3 space-y-1.5">
                    {dayEventList.length === 0 && dayCallList.length === 0 ? (
                      <span className="text-xs text-gray-400 italic">No schedules or phone calls planned</span>
                    ) : (
                      <>
                        {dayEventList.map(e => (
                          <div key={e.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-indigo-50/20 text-gray-700 dark:text-gray-300">
                            <span className="font-semibold truncate">{e.title}</span>
                            <span className="font-bold flex-shrink-0 ml-1 opacity-70">{e.startTime}</span>
                          </div>
                        ))}
                        {dayCallList.map(c => (
                          <div key={c.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-amber-50/20 text-gray-700 dark:text-gray-300">
                            <span className="font-semibold truncate">📞 Call: {c.personName}</span>
                            <span className="font-bold flex-shrink-0 ml-1 opacity-70">{c.time}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected day Agenda detail (Tab 'day' is dedicated to currently selected date summary details) */}
      {(currentTab === 'month' || currentTab === 'day') && (
        <section className="bg-gray-50 dark:bg-gray-850 p-5 rounded-3xl border border-dashed border-gray-200 dark:border-gray-750 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Schedule Details: {dateFormattedText}
            </h4>
            <span className="text-xs font-bold text-gray-400">
              {selectedDateEvents.length + selectedDateCalls.length} items logged
            </span>
          </div>

          {selectedDateEvents.length === 0 && selectedDateCalls.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              Nothing scheduled for this specific date representation. Feel free to use the Quick Accelerators above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Event Cards */}
              {selectedDateEvents.map((e) => (
                <div key={e.id} className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-500 rounded-xl">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-800 dark:text-white leading-tight">{e.title}</h5>
                    <p className="text-xs text-gray-400 mt-1">{e.startTime} - {e.endTime}</p>
                    <p className="text-[11px] text-gray-400 italic mt-0.5">{e.description || "No description provided."}</p>
                  </div>
                </div>
              ))}

              {/* Call Cards */}
              {selectedDateCalls.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs flex items-start gap-3">
                  <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-500 rounded-xl">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-800 dark:text-white leading-tight">Call: {c.personName}</h5>
                    <p className="text-xs text-gray-400 mt-1">Scheduled at {c.time}</p>
                    <p className="text-[11px] text-gray-400 italic mt-0.5">Ph: {c.phoneNumber}</p>
                  </div>
                </div>
              ))}

            </div>
          )}
        </section>
      )}

    </div>
  );
}
