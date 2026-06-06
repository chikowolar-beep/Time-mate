import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, PhoneMissed, PhoneForwarded, Plus, Calendar, Clock, User, FileText, X, ChevronRight, CheckCircle } from 'lucide-react';
import { ScheduledCall } from '../types';
import { synth } from '../utils/synth';

interface ScheduledCallsProps {
  calls: Array<ScheduledCall>;
  onAddCall: (newCall: Omit<ScheduledCall, 'id' | 'status'>) => void;
  onUpdateCallStatus: (callId: string, status: 'completed' | 'missed' | 'upcoming', notes?: string) => void;
}

export default function ScheduledCalls({
  calls,
  onAddCall,
  onUpdateCallStatus
}: ScheduledCallsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [personName, setPersonName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [notes, setNotes] = useState('');

  // Call simulator state
  const [activeCallSim, setActiveCallSim] = useState<ScheduledCall | null>(null);
  const [simSeconds, setSimSeconds] = useState(0);
  const [simNotes, setSimNotes] = useState('');
  const [isCalling, setIsCalling] = useState(false); // Ring state

  // Timer run for call active duration
  useEffect(() => {
    let callTimer: NodeJS.Timeout;
    if (activeCallSim && !isCalling) {
      callTimer = setInterval(() => {
        setSimSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (callTimer) clearInterval(callTimer);
    };
  }, [activeCallSim, isCalling]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || !phoneNumber.trim()) {
      alert("Please provide the contact's Name and Phone Number");
      return;
    }

    onAddCall({
      personName,
      phoneNumber,
      date,
      time,
      notes
    });

    synth.playSuccess();
    setPersonName('');
    setPhoneNumber('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleStartCallSim = (call: ScheduledCall) => {
    synth.playBubble();
    setActiveCallSim(call);
    setIsCalling(true);
    setSimSeconds(0);
    setSimNotes(call.notes || '');

    // Simulate standard 2-seconds ringing sequence, then establish call
    setTimeout(() => {
      setIsCalling(false);
      synth.playSuccess();
    }, 2000);
  };

  const handleEndCallSim = () => {
    if (!activeCallSim) return;
    synth.playBubble();
    
    // Save completed status + updated notes
    onUpdateCallStatus(
      activeCallSim.id, 
      'completed', 
      simNotes ? `${activeCallSim.notes || ''}\n[Sim Call Notes: ${simNotes}]` : activeCallSim.notes
    );

    setActiveCallSim(null);
    setSimSeconds(0);
  };

  const formatSimTime = (total: number) => {
    const mm = Math.floor(total / 60);
    const ss = total % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  const upcomingCalls = calls.filter(c => c.status === 'upcoming');
  const completedCalls = calls.filter(c => c.status === 'completed');
  const missedCalls = calls.filter(c => c.status === 'missed');

  return (
    <div className="space-y-6 font-sans relative">
      
      {/* Header index panel */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-105 dark:border-gray-750 shadow-sm flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Scheduled Call Reminders</h2>
          <p className="text-xs text-gray-400">Schedule phone calls, register notes, dial contacts</p>
        </div>

        <button
          onClick={() => { synth.playBubble(); setShowAddForm(!showAddForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? "Cancel" : "Add Reminder"}
        </button>
      </div>

      {/* Add Call panel */}
      {showAddForm && (
        <form 
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-150 dark:border-gray-700 shadow-md space-y-4 animate-fade-in"
        >
          <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-700">Schedule a Call</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Person name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Contact Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g., Sarah Mitchell"
                  className="w-full bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g., +1 (555) 123-4567"
                  className="w-full bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Target Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Time */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Target Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>
            </div>

            {/* Agenda/Notes */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Brief agenda / Prep Notes</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Core talking points, questions to ask or file references..."
                  rows={2}
                  className="w-full bg-gray-55 dark:bg-gray-750 text-gray-900 dark:text-white pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 hover:dark:bg-gray-650 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
            >
              Confirm Schedule
            </button>
          </div>

        </form>
      )}

      {/* Main Call categorization list grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Upcoming list */}
        <section className="md:col-span-2 space-y-3">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><PhoneCall className="w-4 h-4 text-indigo-500" /> Upcoming Calls Today</h3>
          
          {upcomingCalls.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl text-center border border-gray-100 dark:border-gray-750 text-gray-400 italic text-xs">
              No outstanding call tasks. Click Schedule a Call above to add targets.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingCalls.map(c => (
                <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-150 dark:border-gray-700 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-indigo-150">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-500 rounded-2xl flex-shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-gray-800 dark:text-white truncate">{c.personName}</h4>
                      <p className="text-xs text-gray-400 font-mono flex items-center gap-1 mt-0.5">{c.phoneNumber}</p>
                      
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-2">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-indigo-500" /> {c.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-500" /> {c.time}</span>
                      </div>
                      
                      {c.notes && (
                        <p className="text-[11px] text-indigo-500 dark:text-indigo-400 italic bg-indigo-50/20 dark:bg-indigo-950/25 px-2 py-1 rounded mt-2 max-w-sm truncate">
                          💡 Prep: {c.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto border-t pt-2.5 sm:border-transparent sm:pt-0 justify-end">
                    <button
                      onClick={() => { synth.playBubble(); onUpdateCallStatus(c.id, 'missed'); }}
                      className="px-3 py-1.5 border border-rose-100 dark:border-rose-950 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955/20 rounded-xl transition-all"
                    >
                      Missed
                    </button>
                    
                    <button
                      onClick={() => handleStartCallSim(c)}
                      className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Call Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right side history column */}
        <section className="space-y-5">
          
          {/* Completed calls logs */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Completed Logs</h3>
            
            {completedCalls.length === 0 ? (
              <p className="text-xs text-gray-400 bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-750 rounded-2xl italic">No completed call history logged.</p>
            ) : (
              <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                {completedCalls.map(c => (
                  <div key={c.id} className="p-3 bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-750 rounded-xl relative group">
                    <p className="text-xs font-extrabold text-gray-800 dark:text-white truncate">{c.personName}</p>
                    <p className="text-[10px] text-gray-400">{c.date} • {c.time}</p>
                    {c.notes && <p className="text-[10px] text-indigo-400 mt-1 italic truncate">{c.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missed calls logs */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><PhoneMissed className="w-4 h-4 text-rose-500" /> Missed Logs</h3>
            
            {missedCalls.length === 0 ? (
              <p className="text-xs text-gray-400 bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-750 rounded-2xl italic">No missed telephone logs recorded.</p>
            ) : (
              <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                {missedCalls.map(c => (
                  <div key={c.id} className="p-3 bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-750 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-xs font-extrabold text-gray-800 dark:text-white truncate">{c.personName}</p>
                      <p className="text-[10px] text-gray-400">{c.date} • {c.time}</p>
                    </div>
                    
                    <button
                      onClick={() => handleStartCallSim(c)}
                      className="p-1 px-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-500 rounded text-[10px] font-black uppercase"
                    >
                      Redial
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

      </div>

      {/* FULL CALL DIALING GRAPHIC SIMULATION OVERLAY */}
      {activeCallSim && (
        <div className="fixed inset-0 z-50 bg-gray-950/90 flex flex-col justify-between p-8 text-center text-white backdrop-blur-sm animate-fade-in font-sans">
          
          {/* Header warning logo */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase text-gray-500 tracking-widest flex items-center gap-1.5"><Phone className="w-4 h-4 animate-bounce" /> TimeMate Dialer</span>
            <span className="text-xs font-bold text-gray-400 bg-gray-900 px-3 py-1.5 rounded-full">SIM Mode</span>
          </div>

          {/* Core Profile section */}
          <div className="space-y-3 my-auto">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white text-3xl font-black rounded-full flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25 relative">
              {/* Ringing waves outline */}
              {isCalling && (
                <div className="absolute inset-0 border-4 border-indigo-400 rounded-full animate-ping opacity-60" />
              )}
              {activeCallSim.personName.charAt(0).toUpperCase()}
            </div>

            <h3 className="text-2xl font-black">{activeCallSim.personName}</h3>
            <p className="text-xs font-semibold text-gray-400 font-mono tracking-wider">{activeCallSim.phoneNumber}</p>

            {/* Time status trigger */}
            {isCalling ? (
              <p className="text-sm text-indigo-400 font-bold tracking-widest uppercase animate-pulse mt-4">Connecting Call...</p>
            ) : (
              <div className="space-y-1 mt-4">
                <p className="text-sm font-black font-mono tracking-widest uppercase text-emerald-400 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Connection Established
                </p>
                <p className="text-3xl font-extrabold font-mono text-gray-200 mt-2">{formatSimTime(simSeconds)}</p>
              </div>
            )}
          </div>

          {/* Bottom interactive notes pad */}
          <div className="w-full max-w-md mx-auto space-y-4">
            
            {!isCalling && (
              <div className="space-y-1.5 text-left bg-gray-900/65 p-4 rounded-2xl border border-gray-800">
                <label className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">In-call instant conversation notes</label>
                <textarea
                  value={simNotes}
                  onChange={(e) => setSimNotes(e.target.value)}
                  placeholder="Record summary feedback, deadlines, or dates mentioned during this call..."
                  rows={3}
                  className="w-full bg-gray-950 text-white p-3 rounded-xl border border-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>
            )}

            <button
              onClick={handleEndCallSim}
              className="w-16 h-16 bg-rose-600 hover:bg-rose-700 rounded-full flex items-center justify-center mx-auto hover:scale-105 active:scale-95 transition-all shadow-lg"
              title="End call"
            >
              <X className="w-6 h-6 stroke-[3px]" />
            </button>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Hang up telephone</p>

          </div>

        </div>
      )}

    </div>
  );
}
