import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flame, Coffee, Trophy, TrendingUp, Sparkles, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { synth } from '../utils/synth';

interface WorkModeProps {
  onAddFocusSession: (workMinutes: number, breakMinutes: number, completed: boolean, type: string) => void;
  onAddNotification: (title: string, message: string, type: 'focus' | 'water' | 'event' | 'call' | 'system') => void;
}

export default function WorkMode({
  onAddFocusSession,
  onAddNotification
}: WorkModeProps) {
  const [sessionType, setSessionType] = useState<'25-5' | '50-10' | '90-15' | 'custom'>('25-5');
  const [workMinutesInput, setWorkMinutesInput] = useState(25);
  const [breakMinutesInput, setBreakMinutesInput] = useState(5);

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Seconds
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);

  // Sound preferences
  const [soundAlerts, setSoundAlerts] = useState(true);

  // Stats stored in localStorage or passed down
  const [localStats, setLocalStats] = useState({
    sessionsCount: 0,
    totalMinutesLogged: 0,
    totalBreaksCount: 0
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state stats
  useEffect(() => {
    const historical = localStorage.getItem('timemate_stats');
    if (historical) {
      setLocalStats(JSON.parse(historical));
    }
  }, []);

  const saveStats = (updated: typeof localStats) => {
    localStorage.setItem('timemate_stats', JSON.stringify(updated));
    setLocalStats(updated);
  };

  // Re-adjust timer values when sessionType changes
  useEffect(() => {
    let wM = 25;
    let bM = 5;
    if (sessionType === '50-10') {
      wM = 50;
      bM = 10;
    } else if (sessionType === '90-15') {
      wM = 90;
      bM = 15;
    } else if (sessionType === 'custom') {
      wM = workMinutesInput;
      bM = breakMinutesInput;
    }
    
    setTimeLeft(wM * 60);
    setTotalSeconds(wM * 60);
    setTimerMode('work');
    setIsTimerRunning(false);
  }, [sessionType, workMinutesInput, breakMinutesInput]);

  useEffect(() => {
    if (isTimerRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer expired!
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerRunning, timerMode]);

  const handleTimerComplete = () => {
    setIsTimerRunning(false);

    if (soundAlerts) {
      synth.playAlarm();
    }

    if (timerMode === 'work') {
      // Completed Focus Session!
      const workMinutes = sessionType === 'custom' ? workMinutesInput : parseInt(sessionType.split('-')[0]);
      const breakMinutes = sessionType === 'custom' ? breakMinutesInput : parseInt(sessionType.split('-')[1]);

      // Trigger standard logs
      onAddFocusSession(workMinutes, breakMinutes, true, sessionType);
      onAddNotification("🔔 Focus Session Completed!", `Stunning work! Clear focused study of ${workMinutes} minutes finished. Take a relaxing break.`, 'focus');

      // Update statistics
      const updatedStats = {
        sessionsCount: localStats.sessionsCount + 1,
        totalMinutesLogged: localStats.totalMinutesLogged + workMinutes,
        totalBreaksCount: localStats.totalBreaksCount
      };
      saveStats(updatedStats);

      // Pivot to break state
      setTimerMode('break');
      setTimeLeft(breakMinutes * 60);
      setTotalSeconds(breakMinutes * 60);
    } else {
      // Completed Break Session!
      const breakMinutes = sessionType === 'custom' ? breakMinutesInput : parseInt(sessionType.split('-')[1]);
      onAddNotification("☕ Break Completed!", "Break is complete. Return to work mode to remain highly organized and productive.", 'focus');
      
      const updatedStats = {
        ...localStats,
        totalBreaksCount: localStats.totalBreaksCount + 1
      };
      saveStats(updatedStats);

      // Return to work state
      const workMinutes = sessionType === 'custom' ? workMinutesInput : parseInt(sessionType.split('-')[0]);
      setTimerMode('work');
      setTimeLeft(workMinutes * 60);
      setTotalSeconds(workMinutes * 60);
    }
  };

  const toggleTimer = () => {
    synth.playBubble();
    setIsTimerRunning(!isTimerRunning);
    
    if (!isTimerRunning) {
      if (timerMode === 'work') {
        onAddNotification("🔔 Focus session running!", "Concentration timer initialized. Avoid phone widgets to optimize performance.", 'focus');
      } else {
        onAddNotification("☕ Relaxation timer active!", "Prepare to relax.", 'focus');
      }
    }
  };

  const resetTimer = () => {
    synth.playBubble();
    setIsTimerRunning(false);
    const wMinutes = sessionType === 'custom' ? workMinutesInput : parseInt(sessionType.split('-')[0]);
    setTimeLeft(wMinutes * 60);
    setTotalSeconds(wMinutes * 60);
    setTimerMode('work');
  };

  // Convert seconds to readable MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rms = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rms).padStart(2, '0')}`;
  };

  // SVG ring stroke calculations
  const radius = 90;
  const strokeCircumference = 2 * Math.PI * radius;
  const strokeDashoffset = strokeCircumference - (timeLeft / totalSeconds) * strokeCircumference;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upper header */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-105 dark:border-gray-750 shadow-sm flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Focused Work Mode</h2>
          <p className="text-xs text-gray-400">Increase productivity with standard Pomodoro cycles</p>
        </div>

        {/* Alerts mute toggles */}
        <button
          onClick={() => { synth.playBubble(); setSoundAlerts(!soundAlerts); }}
          className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
            soundAlerts 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-150' 
              : 'bg-gray-50 border-gray-150 dark:bg-gray-750 text-gray-400 dark:border-gray-700'
          }`}
        >
          {soundAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>Audio Alerts</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Presets Column Selector */}
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-105 dark:border-gray-750 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Choose Focus Cadence</h3>
          
          <div className="space-y-2.5">
            {[
              { id: '25-5', label: 'Classic Pomodoro', work: 25, break: 5, desc: '25 min work + 5 min break' },
              { id: '50-10', label: 'Extended Sprint', work: 50, break: 10, desc: '50 min work + 10 min break' },
              { id: '90-15', label: 'Ultra Focus Deep Work', work: 90, break: 15, desc: '90 min work + 15 min break' },
              { id: 'custom', label: 'Custom Timing', work: workMinutesInput, break: breakMinutesInput, desc: 'Adjust parameters below' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => { synth.playBubble(); setSessionType(p.id as any); }}
                className={`w-full text-left p-3 rounded-2xl border transition-all ${
                  sessionType === p.id 
                    ? 'border-indigo-650 bg-indigo-50/30 text-indigo-950 dark:bg-indigo-955/20 dark:text-indigo-300 font-bold' 
                    : 'border-gray-100 dark:border-gray-750 hover:bg-gray-55 text-gray-550 dark:text-gray-400'
                }`}
              >
                <div className="text-xs sm:text-sm font-black flex items-center justify-between">
                  <span>{p.label}</span>
                  {sessionType === p.id && <Flame className="w-4 h-4 text-orange-500 fill-current" />}
                </div>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{p.desc}</p>
              </button>
            ))}
          </div>

          {/* Custom parameter adjustments */}
          {sessionType === 'custom' && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Work Duration (Mins)</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={workMinutesInput}
                  onChange={(e) => setWorkMinutesInput(Math.max(5, Math.min(180, Number(e.target.value))))}
                  className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none text-sm font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Break Duration (Mins)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={breakMinutesInput}
                  onChange={(e) => setBreakMinutesInput(Math.max(1, Math.min(60, Number(e.target.value))))}
                  className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none text-sm font-bold"
                />
              </div>
            </div>
          )}
        </div>

        {/* Circular Animation Countdown Column */}
        <div className="md:col-span-2 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 rounded-3xl p-6 border border-gray-105 dark:border-gray-750 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          
          <div className="flex items-center gap-2 mb-4">
            {timerMode === 'work' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 rounded-full uppercase tracking-wider">
                <Flame className="w-4 h-4 fill-current text-orange-500 animate-pulse" /> Focus Block
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-teal-650 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 py-1.5 rounded-full uppercase tracking-wider animate-bounce">
                <Coffee className="w-4 h-4 text-emerald-500" /> Break Interval
              </span>
            )}
          </div>

          {/* SVG Progress Circle wrapper */}
          <div className="relative w-52 h-52 flex items-center justify-center">
            
            <svg className="absolute w-full h-full transform -rotate-90">
              {/* Back track shadow circle */}
              <circle
                cx="104"
                cy="104"
                r={radius}
                className="stroke-gray-100 dark:stroke-gray-700 fill-transparent"
                strokeWidth="10"
              />
              {/* Front progress line */}
              <circle
                cx="104"
                cy="104"
                r={radius}
                className={`fill-transparent transition-all duration-300 ${
                  timerMode === 'work' ? 'stroke-orange-500' : 'stroke-teal-500'
                }`}
                strokeWidth="10"
                strokeDasharray={strokeCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Time counter labels within the circle */}
            <div className="flex flex-col items-center justify-center text-center z-10 select-none">
              <span className="text-3xl font-black font-mono tracking-tight text-gray-900 dark:text-white">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase mt-1">
                {isTimerRunning ? 'Time Running' : 'Paused'}
              </span>
            </div>

          </div>

          {/* Action Button Handles */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={resetTimer}
              className="p-3 bg-white hover:bg-gray-100 dark:bg-gray-750 text-gray-500 hover:text-gray-900 rounded-2xl border border-gray-150 dark:border-gray-700 transition-all shadow-xs"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button
              id="btn-trigger-pomodoro"
              onClick={toggleTimer}
              className={`px-8 py-3.5 rounded-2xl font-bold font-sans text-sm shadow-md text-white transition-all flex items-center gap-2 ${
                isTimerRunning 
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-100 dark:shadow-none' 
                  : timerMode === 'work' 
                    ? 'bg-indigo-650 hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none' 
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 dark:shadow-none'
              }`}
            >
              {isTimerRunning ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isTimerRunning ? "Pause Sprint" : "Start Session"}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Historical Statistics block */}
      <section className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-750 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" /> Focus Analytics
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-orange-50/30 border border-orange-100/50 flex items-center gap-4">
            <div className="p-2.5 bg-orange-100 dark:bg-orange-950 text-orange-500 rounded-xl">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-450">Sessions Completed</p>
              <p className="text-xl font-extrabold text-orange-600 dark:text-orange-400">{localStats.sessionsCount}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/35 border border-indigo-100/50 flex items-center gap-4">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-500 rounded-xl">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-450">Focused Deep Time</p>
              <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {Math.round((localStats.totalMinutesLogged / 60) * 10) / 10} hours
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/25 border border-teal-100/40 flex items-center gap-4">
            <div className="p-2.5 bg-teal-100 dark:bg-teal-950 text-teal-550 rounded-xl">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-450">Relaxing Breaks Taken</p>
              <p className="text-xl font-extrabold text-teal-650 dark:text-teal-400">{localStats.totalBreaksCount}</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
