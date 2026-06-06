import React, { useState } from 'react';
import { Plus, Trash, Calendar, Clock, MapPin, Tag, RefreshCw, Bell, Check, X } from 'lucide-react';
import { TimetableEvent, PriorityType, RepeatType } from '../types';
import { synth } from '../utils/synth';

interface SmartTimetableProps {
  events: TimetableEvent[];
  onAddEvent: (newEvent: Omit<TimetableEvent, 'id' | 'completed'>) => void;
  onDeleteEvent: (eventId: string) => void;
  onToggleEvent: (eventId: string) => void;
}

const colorPresets = [
  { name: 'Sky Blue', value: 'bg-sky-500 text-sky-50 dark:bg-sky-500' },
  { name: 'Indigo', value: 'bg-indigo-500 text-indigo-50 dark:bg-indigo-500' },
  { name: 'Emerald', value: 'bg-emerald-500 text-emerald-50 dark:bg-emerald-500' },
  { name: 'Amber', value: 'bg-amber-500 text-amber-50 dark:bg-amber-500' },
  { name: 'Rose Red', value: 'bg-rose-500 text-rose-50 dark:bg-rose-500' },
  { name: 'Violet', value: 'bg-violet-500 text-violet-50 dark:bg-violet-500' }
];

export default function SmartTimetable({
  events,
  onAddEvent,
  onDeleteEvent,
  onToggleEvent
}: SmartTimetableProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<PriorityType>('medium');
  const [colorCategory, setColorCategory] = useState(colorPresets[1].value);
  const [repeatType, setRepeatType] = useState<RepeatType>('once');
  const [reminderMinutes, setReminderMinutes] = useState(15);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please provide an Event Title");
      return;
    }
    if (startTime >= endTime) {
      alert("Start time must be strictly before End time");
      return;
    }

    onAddEvent({
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      priority,
      colorCategory,
      repeatType,
      reminderMinutesBefore: reminderMinutes
    });

    synth.playSuccess();
    
    // Clear state
    setTitle('');
    setDescription('');
    setLocation('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header and Add Trigger */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-750 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Smart Timetable</h2>
          <p className="text-xs text-gray-400">Schedule meetings, repeat triggers, and alerts</p>
        </div>
        <button
          onClick={() => { synth.playBubble(); setShowAddForm(!showAddForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? "Cancel" : "Add Event"}
        </button>
      </div>

      {/* Add Event Form Modal-Drawer */}
      {showAddForm && (
        <form 
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-150 dark:border-gray-700 shadow-md space-y-4 animate-fade-in"
        >
          <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-700">Create New Timetable Event</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Event Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Mathematics Lecture, Gym Session"
                className="w-full bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Location (Optional)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Room 304, Virtual Meet, Gym"
                  className="w-full bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Description / Objectives</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief notes, agenda, or materials to bring..."
                rows={2}
                className="w-full bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Date</label>
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

            {/* Time windows */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Starts *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white pl-9 pr-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Ends *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white pl-9 pr-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Repeat triggers */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Repeat Cadence</label>
              <div className="relative">
                <RefreshCw className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <select
                  value={repeatType}
                  onChange={(e) => setRepeatType(e.target.value as RepeatType)}
                  className="w-full bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                >
                  <option value="once">Once (No Recurrence)</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            {/* Reminder Alert trigger points */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Notification Alarm</label>
              <div className="relative">
                <Bell className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <select
                  value={reminderMinutes}
                  onChange={(e) => setReminderMinutes(Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                >
                  <option value="5">5 mins before</option>
                  <option value="10">10 mins before</option>
                  <option value="15">15 mins before</option>
                  <option value="30">30 mins before</option>
                  <option value="60">1 hour before</option>
                </select>
              </div>
            </div>

            {/* Priority level */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Priority Rating</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as PriorityType[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border capitalize transition-all ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-955 dark:border-rose-900 dark:text-rose-450'
                          : p === 'medium'
                            ? 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-955 dark:border-amber-900 dark:text-amber-450'
                            : 'bg-indigo-50 border-indigo-300 text-indigo-600 dark:bg-indigo-955 dark:border-indigo-900 dark:text-indigo-400'
                        : 'bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 text-gray-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Color identifier Category tag */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Color Index Tag</label>
              <div className="flex gap-2.5 flex-wrap pt-1.5">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setColorCategory(preset.value)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center border transition-transform ${preset.value} ${
                      colorCategory === preset.value ? 'scale-125 border-gray-400 shadow-sm' : 'border-transparent'
                    }`}
                  >
                    {colorCategory === preset.value && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Action Trigger keys */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 hover:dark:bg-gray-650 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Confirm and Schedule
            </button>
          </div>

        </form>
      )}

      {/* Main Events list */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">All Planned Schedule Slots</h3>
        
        {events.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl text-center border border-gray-100 dark:border-gray-750 shadow-xs">
            <Calendar className="w-12 h-12 text-indigo-400 mx-auto opacity-40 mb-3 animate-bounce" />
            <p className="text-sm font-bold text-gray-750 dark:text-gray-300">Your schedule is vacant.</p>
            <p className="text-xs text-gray-400 mt-1">Start adding events to manage repeat configurations.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {events.map((event) => (
              <div 
                key={event.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all ${
                  event.completed 
                    ? 'opacity-65 border-gray-100 dark:border-gray-750 scale-[0.99]' 
                    : 'border-gray-150 shadow-xs dark:border-gray-700 hover:border-indigo-200'
                }`}
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  
                  {/* Left segment showing calendar detail */}
                  <div className="flex items-start gap-4">
                    {/* Visual Preset Category circle index */}
                    <div className={`p-3 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 ${event.colorCategory.split(' ')[0] || 'bg-indigo-500'}`}>
                      <Calendar className="w-5 h-5 text-white" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <h4 className={`text-sm sm:text-base font-extrabold ${event.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {event.title}
                        </h4>
                        
                        {/* Repeat visual indicator */}
                        {event.repeatType !== 'once' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                            <RefreshCw className="w-2.5 h-2.5 spin-slow" /> {event.repeatType.toUpperCase()}
                          </span>
                        )}

                        {/* Priority micro tags */}
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded capitalize ${
                          event.priority === 'high' 
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500' 
                            : event.priority === 'medium' 
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500' 
                              : 'bg-indigo-52 dark:bg-indigo-950/45 text-indigo-400'
                        }`}>
                          {event.priority}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        {event.description || "N/A description notes"}
                      </p>

                      {/* Schedule parameters */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 pt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> {event.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-500" /> {event.startTime} - {event.endTime}</span>
                        {event.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-500" /> {event.location}</span>}
                      </div>

                    </div>
                  </div>

                  {/* Right segment action handles */}
                  <div className="flex items-center justify-end gap-2 border-t pt-3 sm:pt-0 sm:border-transparent dark:border-gray-700">
                    <button
                      onClick={() => {
                        if (!event.completed) synth.playSuccess();
                        onToggleEvent(event.id);
                      }}
                      className={`px-4 py-2 border text-xs font-bold rounded-xl transition-all ${
                        event.completed 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-250 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-white hover:bg-gray-55 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {event.completed ? 'Completed' : 'Complete Target'}
                    </button>
                    
                    <button
                      onClick={() => { synth.playBubble(); onDeleteEvent(event.id); }}
                      className="p-2 border border-gray-100 hover:border-rose-200 hover:bg-rose-50 dark:border-gray-700 dark:hover:bg-rose-955 text-gray-400 hover:text-rose-500 rounded-xl transition-all"
                      title="Delete Event"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
