import { useState } from 'react';
import { Bell, Search, Filter, Trash, Eye, Coffee, Droplet, Clock, Phone, Sparkles, AlertCircle } from 'lucide-react';
import { TimeMateNotification } from '../types';
import { synth } from '../utils/synth';

interface NotificationCenterProps {
  notifications: Array<TimeMateNotification>;
  onMarkRead: (notificationId: string) => void;
  onClearAll: () => void;
}

export default function NotificationCenter({
  notifications,
  onMarkRead,
  onClearAll
}: NotificationCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'event' | 'water' | 'focus' | 'call'>('all');

  // Filter logs
  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || n.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getVisualConfig = (type: string) => {
    switch(type) {
      case 'water':
        return { icon: <Droplet className="w-4 h-4 text-sky-500" />, bg: 'bg-sky-50 dark:bg-sky-950/20' };
      case 'focus':
        return { icon: <Coffee className="w-4 h-4 text-orange-500" />, bg: 'bg-orange-50 dark:bg-orange-950/20' };
      case 'call':
        return { icon: <Phone className="w-4 h-4 text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-955/20' };
      case 'event':
        return { icon: <Clock className="w-4 h-4 text-indigo-500" />, bg: 'bg-indigo-50 dark:bg-indigo-950/20' };
      default:
        return { icon: <Bell className="w-4 h-4 text-gray-500" />, bg: 'bg-gray-50 dark:bg-gray-750' };
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header and bulk purge option */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-105 dark:border-gray-750 shadow-sm flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Alarms & Notifications</h2>
          <p className="text-xs text-gray-400">Review system reminders, drink signals, completed goals</p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={() => { synth.playBubble(); onClearAll(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-100 hover:bg-rose-50 text-rose-500 rounded-xl text-xs font-bold transition-all"
          >
            <Trash className="w-3.5 h-3.5" /> Clear History
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-105 dark:border-gray-750 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input bar */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts message text..."
            className="w-full bg-gray-55 dark:bg-gray-750 text-gray-900 dark:text-white pl-9 pr-3.5 py-2 rounded-xl focus:outline-none border-transparent text-xs font-medium"
          />
        </div>

        {/* Categories togglers */}
        <div className="flex flex-wrap gap-1 bg-gray-55 dark:bg-gray-750 p-1 rounded-xl w-full md:w-auto">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'event', label: 'Meetings' },
            { id: 'water', label: 'Hydration' },
            { id: 'focus', label: 'Work blocks' },
            { id: 'call', label: 'Calls' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => { synth.playBubble(); setActiveFilter(opt.id as any); }}
              className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                activeFilter === opt.id
                  ? 'bg-white dark:bg-gray-700 text-gray-950 dark:text-white shadow-xs'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

      </div>

      {/* Notification Lists timeline cells */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl text-center border border-gray-100 dark:border-gray-750 shadow-sm">
            <Bell className="w-12 h-12 text-gray-300 mx-auto opacity-40 mb-3 animate-pulse" />
            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Clean slate!</p>
            <p className="text-xs text-gray-400 mt-1">No alerts or warnings trigger on this classification index.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-750 shadow-sm divide-y divide-gray-50 dark:divide-gray-800 overflow-hidden">
            {filteredNotifications.map((notif) => {
              const style = getVisualConfig(notif.type);
              return (
                <div 
                  key={notif.id}
                  onClick={() => onMarkRead(notif.id)}
                  className={`p-4 sm:p-5 flex items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-850/45 transition-colors cursor-pointer relative ${
                    notif.read ? 'opacity-70' : ''
                  }`}
                >
                  {/* Unread circle label badge */}
                  {!notif.read && (
                    <span className="absolute top-5 left-4 flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping pointer-events-none" />
                  )}

                  <div className={`p-3 rounded-2xl flex-shrink-0 ${style.bg}`}>
                    {style.icon}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-gray-850 dark:text-white">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] font-mono text-gray-400">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal max-w-2xl">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1.5">
                      <span className="text-[9px] font-black uppercase text-gray-400 bg-gray-55 dark:bg-gray-700/60 px-1.5 py-0.5 rounded">
                        {notif.type}
                      </span>
                      {!notif.read && (
                        <span className="text-[9px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                          Unread
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
