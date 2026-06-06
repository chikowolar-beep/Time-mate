import { useState, useEffect } from 'react';
import { 
  Home, Calendar, Clock, Droplets, Phone, Bell, BarChart2, Settings, Sparkles, 
  Moon, Sun, Compass, RefreshCw, Smartphone, LogOut, X
} from 'lucide-react';

// Subcomponents import
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import SmartTimetable from './components/SmartTimetable';
import CalendarView from './components/CalendarView';
import WorkMode from './components/WorkMode';
import WaterReminder from './components/WaterReminder';
import ScheduledCalls from './components/ScheduledCalls';
import NotificationCenter from './components/NotificationCenter';
import Reports from './components/Reports';
import SettingsComponent from './components/Settings';
import AIChat from './components/AIChat';

// Synth sound triggers
import { synth } from './utils/synth';

// Custom types
import { 
  TimetableEvent, WaterReminderSetting, WaterLog, 
  FocusSession, ScheduledCall, TimeMateNotification, SystemSettings, User 
} from './types';

export default function App() {
  
  // App system states
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAIChat, setShowAIChat] = useState(false);

  // Relational database states representation
  const [profile, setProfile] = useState<User | null>(null);
  const [events, setEvents] = useState<TimetableEvent[]>([]);
  const [waterSettings, setWaterSettings] = useState<WaterReminderSetting>({
    enabled: true,
    intervalMinutes: 60,
    dailyGoalMl: 2000,
    currentIntakeMl: 0
  });
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [calls, setCalls] = useState<ScheduledCall[]>([]);
  const [notifications, setNotifications] = useState<TimeMateNotification[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    notificationsEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    themeMode: 'dark', // Elegant deep dark mode is standard for TimeMate!
    backupSynced: false
  });

  // ---------------------- DATA PERSISTENCE INITIALIZATION ----------------------
  useEffect(() => {
    // Simulated Splash timing
    setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    // Initial database pull from local SQLite-style representations
    try {
      const storedProfile = localStorage.getItem('timemate_profile');
      let parsedProfile: User | null = null;
      if (storedProfile) {
        parsedProfile = JSON.parse(storedProfile);
        if (parsedProfile) {
          parsedProfile.name = "Ben";
          parsedProfile.avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=Ben`;
        }
      } else {
        parsedProfile = {
          id: 'usr_ben',
          name: "Ben",
          email: "ben@timemate.local",
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=Ben`,
          joinedAt: new Date().toLocaleDateString()
        };
      }
      localStorage.setItem('timemate_profile', JSON.stringify(parsedProfile));
      setProfile(parsedProfile);

      const storedEvents = localStorage.getItem('timemate_events');
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      } else {
        // Pre-populate with typical academic & health calendar entries
        const defaultEvents: TimetableEvent[] = [
          {
            id: 'evt-1',
            title: "🧠 Smart Timetable Sync Class",
            description: "Study and organization strategies review with AI Companion",
            date: new Date().toISOString().split('T')[0],
            startTime: "09:30",
            endTime: "10:30",
            location: "Lecture Hall A & Virtual Meet",
            priority: "high",
            colorCategory: "bg-indigo-500 text-indigo-50",
            repeatType: "once",
            reminderMinutesBefore: 15,
            completed: false
          },
          {
            id: 'evt-2',
            title: "🏋️ Daily Workout Habit",
            description: "Stamina and weight endurance routine",
            date: new Date().toISOString().split('T')[0],
            startTime: "17:15",
            endTime: "18:00",
            location: "TimeMate Health Gym",
            priority: "low",
            colorCategory: "bg-emerald-500 text-emerald-50",
            repeatType: "daily",
            reminderMinutesBefore: 10,
            completed: true
          }
        ];
        localStorage.setItem('timemate_events', JSON.stringify(defaultEvents));
        setEvents(defaultEvents);
      }

      const storedWaterSettings = localStorage.getItem('timemate_water_settings');
      if (storedWaterSettings) {
        setWaterSettings(JSON.parse(storedWaterSettings));
      } else {
        const defaultWater = { enabled: true, intervalMinutes: 60, dailyGoalMl: 2000, currentIntakeMl: 250 };
        localStorage.setItem('timemate_water_settings', JSON.stringify(defaultWater));
        setWaterSettings(defaultWater);
      }

      const storedWaterLogs = localStorage.getItem('timemate_water_logs');
      if (storedWaterLogs) {
        setWaterLogs(JSON.parse(storedWaterLogs));
      } else {
        const defaultLogs = [{ id: 'w-log-initial', timestamp: new Date().toISOString(), amountMl: 250 }];
        localStorage.setItem('timemate_water_logs', JSON.stringify(defaultLogs));
        setWaterLogs(defaultLogs);
      }

      const storedFocus = localStorage.getItem('timemate_focus_sessions');
      if (storedFocus) setFocusSessions(JSON.parse(storedFocus));

      const storedCalls = localStorage.getItem('timemate_calls');
      if (storedCalls) {
        setCalls(JSON.parse(storedCalls));
      } else {
        const defaultCalls: ScheduledCall[] = [
          {
            id: 'call-1',
            personName: "Sarah Mitchell (Advisor)",
            phoneNumber: "+1 (455) 789-2233",
            date: new Date().toISOString().split('T')[0],
            time: "15:30",
            notes: "Review next calendar project budget",
            status: 'upcoming'
          }
        ];
        localStorage.setItem('timemate_calls', JSON.stringify(defaultCalls));
        setCalls(defaultCalls);
      }

      const storedNotifications = localStorage.getItem('timemate_notifications');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      } else {
        const defaultNotifs: TimeMateNotification[] = [
          {
            id: 'notif-1',
            title: "✨ Welcome to TimeMate Companion!",
            message: "All internal database schemas initialized. Have a highly organized daily focus cycle.",
            timestamp: new Date().toISOString(),
            type: 'system',
            read: false
          }
        ];
        localStorage.setItem('timemate_notifications', JSON.stringify(defaultNotifs));
        setNotifications(defaultNotifs);
      }

      const storedSettings = localStorage.getItem('timemate_settings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings(parsed);
      } else {
        // Defaults to dark Mode on TimeMate for elegant cosmic design aesthetics
        const defSettings: SystemSettings = {
          notificationsEnabled: true,
          soundEnabled: true,
          vibrationEnabled: true,
          themeMode: 'dark',
          backupSynced: false
        };
        localStorage.setItem('timemate_settings', JSON.stringify(defSettings));
        setSettings(defSettings);
      }
    } catch (e) {
      console.warn("Local Storage parsing failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Theme Toggler effect to apply Tailwind V4 configuration classes dynamically to document node
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.themeMode === 'dark') {
      root.classList.add('dark');
    } else if (settings.themeMode === 'light') {
      root.classList.remove('dark');
    } else {
      // System auto toggle
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.themeMode]);

  // ---------------------- DATABASE TRANSACTIONS API ----------------------
  
  const handleOnboardingComplete = (name: string, dailyWaterGoal: number) => {
    const freshProfile: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name,
      email: `${name.toLowerCase().replace(/\s/g, '')}@timemate.local`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      joinedAt: new Date().toLocaleDateString()
    };
    localStorage.setItem('timemate_profile', JSON.stringify(freshProfile));
    setProfile(freshProfile);

    const updatedWaterSettings = {
      ...waterSettings,
      dailyGoalMl: dailyWaterGoal
    };
    localStorage.setItem('timemate_water_settings', JSON.stringify(updatedWaterSettings));
    setWaterSettings(updatedWaterSettings);

    // Initial alert log
    handleAddNotification("Profile Completed!", "Onboarding transaction logged successfully. Ready for daily companion tasks.", "system");
  };

  const handleAddEvent = (newEvent: Omit<TimetableEvent, 'id' | 'completed'>) => {
    const created: TimetableEvent = {
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      ...newEvent,
      completed: false
    };
    const updated = [created, ...events];
    localStorage.setItem('timemate_events', JSON.stringify(updated));
    setEvents(updated);
    handleAddNotification("📅 New Event Scheduled!", `${created.title} added successfully for ${created.date} at ${created.startTime}.`, 'event');
  };

  const handleToggleEventCompleted = (eventId: string) => {
    const updated = events.map(e => e.id === eventId ? { ...e, completed: !e.completed } : e);
    localStorage.setItem('timemate_events', JSON.stringify(updated));
    setEvents(updated);
  };

  const handleDeleteEvent = (eventId: string) => {
    const updated = events.filter(e => e.id !== eventId);
    localStorage.setItem('timemate_events', JSON.stringify(updated));
    setEvents(updated);
  };

  const handleUpdateWaterSettings = (updatedProps: Partial<WaterReminderSetting>) => {
    const updated = { ...waterSettings, ...updatedProps };
    localStorage.setItem('timemate_water_settings', JSON.stringify(updated));
    setWaterSettings(updated);
  };

  const handleAddWaterLog = (amountMl: number) => {
    const log: WaterLog = {
      id: 'wl_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      amountMl
    };
    const updatedLogs = [log, ...waterLogs];
    localStorage.setItem('timemate_water_logs', JSON.stringify(updatedLogs));
    setWaterLogs(updatedLogs);

    const nextIntake = waterSettings.currentIntakeMl + amountMl;
    const updatedSettings = {
      ...waterSettings,
      currentIntakeMl: nextIntake
    };
    localStorage.setItem('timemate_water_settings', JSON.stringify(updatedSettings));
    setWaterSettings(updatedSettings);

    handleAddNotification("💧 Drink Logged", `Logged +${amountMl}ml glass hydration successfully! Total: ${nextIntake}ml / ${waterSettings.dailyGoalMl}ml.`, 'water');

    // Goal reached congratulations check
    if (nextIntake >= waterSettings.dailyGoalMl && waterSettings.currentIntakeMl < waterSettings.dailyGoalMl) {
      synth.playSuccess();
      handleAddNotification("🏆 Daily Goal Reached!", `Aesthetic! You completed your initial hydration target of ${waterSettings.dailyGoalMl}ml successfully.`, 'water');
    }
  };

  const handleClearWaterLogs = () => {
    localStorage.setItem('timemate_water_logs', JSON.stringify([]));
    setWaterLogs([]);
    const updated = { ...waterSettings, currentIntakeMl: 0 };
    localStorage.setItem('timemate_water_settings', JSON.stringify(updated));
    setWaterSettings(updated);
  };

  const handleAddFocusSession = (workMinutes: number, breakMinutes: number, completed: boolean, type: string) => {
    const session: FocusSession = {
      id: 'fs_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      workDurationMinutes: workMinutes,
      breakDurationMinutes: breakMinutes,
      completed,
      type: type as any
    };
    const updated = [session, ...focusSessions];
    localStorage.setItem('timemate_focus_sessions', JSON.stringify(updated));
    setFocusSessions(updated);
  };

  const handleAddCall = (newCall: Omit<ScheduledCall, 'id' | 'status'>) => {
    const call: ScheduledCall = {
      id: 'cl_' + Math.random().toString(36).substring(2, 9),
      ...newCall,
      status: 'upcoming'
    };
    const updated = [call, ...calls];
    localStorage.setItem('timemate_calls', JSON.stringify(updated));
    setCalls(updated);
    handleAddNotification("📞 Call Reminder Scheduled", `Dial task set with ${call.personName} for ${call.date} at ${call.time}.`, 'call');
  };

  const handleUpdateCallStatus = (callId: string, status: 'completed' | 'missed' | 'upcoming', addedNotes?: string) => {
    const updated = calls.map(c => {
      if (c.id === callId) {
        return {
          ...c,
          status,
          notes: addedNotes ? `${c.notes || ''} ${addedNotes}` : c.notes
        };
      }
      return c;
    });
    localStorage.setItem('timemate_calls', JSON.stringify(updated));
    setCalls(updated);

    if (status === 'completed') {
      handleAddNotification("📞 Call Completed", `Outgoing conversation logged with contact successfully.`, 'call');
    } else if (status === 'missed') {
      handleAddNotification("⚠️ Call Missed", `Telephone alert logged as missed status. Check phone lists.`, 'call');
    }
  };

  const handleAddNotification = (title: string, message: string, type: 'focus' | 'water' | 'event' | 'call' | 'system') => {
    const notif: TimeMateNotification = {
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      title,
      message,
      timestamp: new Date().toISOString(),
      type,
      read: false
    };
    const updated = [notif, ...notifications];
    localStorage.setItem('timemate_notifications', JSON.stringify(updated));
    setNotifications(updated);

    // Trigger audible tone bip if enable alerts sound
    if (settings.soundEnabled) {
      if (type === 'water') {
        synth.playWaterDrop();
      } else {
        synth.playBubble();
      }
    }
  };

  const handleMarkNotificationRead = (notifId: string) => {
    const updated = notifications.map(n => n.id === notifId ? { ...n, read: true } : n);
    localStorage.setItem('timemate_notifications', JSON.stringify(updated));
    setNotifications(updated);
  };

  const handleClearNotifications = () => {
    localStorage.setItem('timemate_notifications', JSON.stringify([]));
    setNotifications([]);
  };

  const handleUpdateSettings = (newSettingsProps: Partial<SystemSettings>) => {
    const updated = { ...settings, ...newSettingsProps };
    localStorage.setItem('timemate_settings', JSON.stringify(updated));
    setSettings(updated);
  };

  const handleResetDatabase = () => {
    // Purge key registers
    localStorage.clear();
    setEvents([]);
    setWaterSettings({ enabled: true, intervalMinutes: 60, dailyGoalMl: 2000, currentIntakeMl: 0 });
    setWaterLogs([]);
    setFocusSessions([]);
    setCalls([]);
    setNotifications([]);
    setSettings({ notificationsEnabled: true, soundEnabled: true, vibrationEnabled: true, themeMode: 'dark', backupSynced: false });
    setProfile(null);
    setActiveTab('dashboard');
    synth.playAlarm();
  };

  // AIChat direct calendar injection suggested by AI Companion
  const handleAddAIChatEventSuggestion = (title: string, desc: string, startTime: string, endTime: string) => {
    handleAddEvent({
      title,
      description: desc,
      date: new Date().toISOString().split('T')[0],
      startTime,
      endTime,
      priority: 'medium',
      colorCategory: 'bg-indigo-500 text-indigo-50',
      repeatType: 'once',
      reminderMinutesBefore: 15
    });
  };

  // Active unread alerts badge
  const unreadAlertsCount = notifications.filter(n => !n.read).length;

  if (loading || showSplash) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 text-white font-sans">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
            <Clock className="w-10 h-10 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">TimeMate</h1>
            <p className="text-xs text-indigo-300 font-semibold tracking-widest uppercase">Your Smart Daily Companion</p>
          </div>
        </div>
      </div>
    );
  }

  // Check onboarding visual routing
  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#090D16] text-[#1E293B] dark:text-[#F8FAFC] flex flex-col md:flex-row transition-colors duration-300 font-sans">
      
      {/* ---------------------- NAVIGATION DESKTOP DRAWER SIDEBAR ---------------------- */}
      <aside className="hidden md:flex flex-col justify-between w-64 shrink-0 bg-white dark:bg-[#131A2A] border-r border-gray-150 dark:border-[#1E293B] p-5 relative z-20">
        <div className="space-y-6">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-[#4F46E5] dark:bg-[#6366F1] text-white rounded-xl shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-base tracking-tight leading-none text-gray-900 dark:text-white">TimeMate</h1>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-wider">Daily Companion</span>
            </div>
          </div>

          {/* Nav pills */}
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Timeline Hub', icon: <Home className="w-4 h-4" /> },
              { id: 'timetable', label: 'Smart Timetable', icon: <Compass className="w-4 h-4" /> },
              { id: 'calendar', label: 'Calendars', icon: <Calendar className="w-4 h-4" /> },
              { id: 'focus', label: 'Focus Mode', icon: <Clock className="w-4 h-4" /> },
              { id: 'water', label: 'Daily Hydration', icon: <Droplets className="w-4 h-4" /> },
              { id: 'calls', label: 'Call Reminders', icon: <Phone className="w-4 h-4" /> },
              { id: 'notifications', label: 'System Alarms', icon: <Bell className="w-4 h-4" />, count: unreadAlertsCount },
              { id: 'reports', label: 'Sync Reports', icon: <BarChart2 className="w-4 h-4" /> },
              { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { synth.playBubble(); setActiveTab(tab.id); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all relative ${
                  activeTab === tab.id
                    ? 'bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#1A1C35] dark:text-[#6366F1]'
                    : 'text-[#64748B] hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:text-[#94A3B8]'
                }`}
              >
                <span className="flex items-center gap-3">
                  {tab.icon}
                  <span>{tab.label}</span>
                </span>
                
                {/* Numeric Alert Count pills */}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-[#F43F5E] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* User avatar and profile logs */}
        <div className="pt-4 border-t border-gray-150 dark:border-[#1E293B] flex items-center gap-3.5 select-none shrink-0 cursor-pointer" onClick={() => setActiveTab('settings')}>
          <img src={profile.avatar} alt="User Avatar" className="w-10 h-10 rounded-full border border-gray-150 dark:border-gray-750 bg-gray-50 bg-indigo-50/20" />
          <div className="min-w-0">
            <h5 className="text-xs font-extrabold text-gray-800 dark:text-white truncate leading-tight">{profile.name}</h5>
            <span className="text-[10px] text-gray-400 block truncate mt-0.5">{profile.email}</span>
          </div>
        </div>
      </aside>

      {/* ---------------------- COMPACT VIEW NAVIGATION BAR ---------------------- */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#131A2A] border-b border-gray-150 dark:border-[#1E293B] shrink-0 relative z-20 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1 px-1.5 bg-[#4F46E5] dark:bg-[#6366F1] text-white rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
          <span className="font-black text-sm tracking-tight text-gray-950 dark:text-white">TimeMate</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick theme toggler in mobile header */}
          <button
            onClick={() => {
              synth.playBubble();
              handleUpdateSettings({ themeMode: settings.themeMode === 'dark' ? 'light' : 'dark' });
            }}
            className="p-1.5 border border-gray-105 dark:border-gray-700/60 rounded-lg text-gray-400 hover:text-gray-900"
          >
            {settings.themeMode === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={() => { synth.playBubble(); setShowAIChat(!showAIChat); }}
            className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-xl"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ---------------------- VIEWPORT MAIN BOARD CONTAINER ---------------------- */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-x-hidden">
        
        {/* Main tabs view elements */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto pb-24 md:pb-8">
          
          {activeTab === 'dashboard' && (
            <Dashboard 
              userName={profile.name}
              events={events}
              calls={calls}
              waterSettings={waterSettings}
              onAddWater={handleAddWaterLog}
              onNavigate={setActiveTab}
              onCompleteEvent={handleToggleEventCompleted}
            />
          )}

          {activeTab === 'timetable' && (
            <SmartTimetable 
              events={events}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
              onToggleEvent={handleToggleEventCompleted}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView 
              events={events}
              calls={calls}
              focusSessions={focusSessions}
            />
          )}

          {activeTab === 'focus' && (
            <WorkMode 
              onAddFocusSession={handleAddFocusSession}
              onAddNotification={handleAddNotification}
            />
          )}

          {activeTab === 'water' && (
            <WaterReminder 
              settings={waterSettings}
              logs={waterLogs}
              onUpdateSettings={handleUpdateWaterSettings}
              onAddLog={handleAddWaterLog}
              onClearLogs={handleClearWaterLogs}
              onAddNotification={handleAddNotification}
            />
          )}

          {activeTab === 'calls' && (
            <ScheduledCalls 
              calls={calls}
              onAddCall={handleAddCall}
              onUpdateCallStatus={handleUpdateCallStatus}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationCenter 
              notifications={notifications}
              onMarkRead={handleMarkNotificationRead}
              onClearAll={handleClearNotifications}
            />
          )}

          {activeTab === 'reports' && (
            <Reports 
              events={events}
              calls={calls}
              focusSessions={focusSessions}
              waterLogs={waterLogs}
              waterGoalMl={waterSettings.dailyGoalMl}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsComponent 
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetDatabase={handleResetDatabase}
            />
          )}

        </div>

      </main>

      {/* FLOATING ACTION ELEMENT: TIME MATE AI COACH FLOATING COMPANION CHAT */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
        
        {/* Floating toggle circle */}
        {!showAIChat && (
          <button
            id="floating-btn-ai-chat"
            onClick={() => { synth.playBubble(); setShowAIChat(true); }}
            className="w-12 h-12 bg-indigo-650 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-105 active:scale-95 transition-all text-sm font-bold gap-1"
          >
            <Sparkles className="w-5 h-5 fill-current animate-pulse text-yellow-300" />
          </button>
        )}

        {/* Floating container drawer */}
        {showAIChat && (
          <div className="absolute bottom-0 right-0 w-[320px] sm:w-[350px] shadow-2xl relative">
            <div className="absolute right-3 top-3 z-10">
              <button 
                onClick={() => { synth.playBubble(); setShowAIChat(false); }}
                className="p-1 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <AIChat 
              userName={profile.name}
              currentSchedule={events}
              onAddEventSuggestion={handleAddAIChatEventSuggestion}
            />
          </div>
        )}

      </div>

      {/* ---------------------- NAVIGATION MOBILE BAR COMPONENT ---------------------- */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-gray-850/95 backdrop-blur-md border-t border-gray-105 dark:border-gray-800 py-1.5 px-3 flex justify-between items-center z-30 select-none shadow-lg">
        {[
          { id: 'dashboard', icon: <Home className="w-5 h-5" />, label: 'Timeline' },
          { id: 'timetable', icon: <Compass className="w-5 h-5" />, label: 'Schedule' },
          { id: 'focus', icon: <Clock className="w-5 h-5" />, label: 'Focus' },
          { id: 'water', icon: <Droplets className="w-5 h-5" />, label: 'Hydrate' },
          { id: 'calls', icon: <Phone className="w-5 h-5" />, label: 'Calls' }
        ].map(mTab => (
          <button
            key={mTab.id}
            onClick={() => { synth.playBubble(); setActiveTab(mTab.id); }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
              activeTab === mTab.id
                ? 'text-indigo-650 dark:text-indigo-400 font-extrabold'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {mTab.icon}
            <span className="text-[9px] mt-1 leading-none">{mTab.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}
