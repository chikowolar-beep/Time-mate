import { useState, useEffect, useMemo, useRef } from 'react';
import { Droplet, ToggleLeft, ToggleRight, Clock, Plus, Trash, Sparkles, ShowerHead, HelpCircle, ChevronDown, ChevronUp, Activity, Heart, Scale, Baby, Pill, AlertTriangle, Info, Bell, BellRing, BellOff, Timer, Moon, Sun, Coffee, Play, Pause, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WaterReminderSetting, WaterLog } from '../types';
import { synth } from '../utils/synth';

interface WaterReminderProps {
  settings: WaterReminderSetting;
  logs: WaterLog[];
  onUpdateSettings: (newSettings: Partial<WaterReminderSetting>) => void;
  onAddLog: (amountMl: number) => void;
  onClearLogs: () => void;
  onAddNotification?: (title: string, message: string, type: 'focus' | 'water' | 'event' | 'call' | 'system') => void;
}

export default function WaterReminder({
  settings,
  logs,
  onUpdateSettings,
  onAddLog,
  onClearLogs,
  onAddNotification
}: WaterReminderProps) {
  const [customAmount, setCustomAmount] = useState('250');
  const [customInterval, setCustomInterval] = useState('60');

  // Interactive Smart target recommendation engine states
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcTab, setCalcTab] = useState<'body' | 'lifestyle' | 'health'>('body');

  const [age, setAge] = useState<number>(28);
  const [weight, setWeight] = useState<number>(70);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'moderate' | 'high'>('moderate');
  const [weatherCondition, setWeatherCondition] = useState<'cool' | 'temperate' | 'hot'>('temperate');
  const [pregnancyStatus, setPregnancyStatus] = useState<'none' | 'pregnant' | 'breastfeeding'>('none');
  const [healthStatus, setHealthStatus] = useState<'none' | 'illness' | 'restriction'>('none');
  const [dietType, setDietType] = useState<'standard' | 'salty' | 'high_protein'>('standard');
  const [medicationDiuretic, setMedicationDiuretic] = useState<boolean>(false);
  const [urineColor, setUrineColor] = useState<'pale' | 'dark_yellow' | 'amber'>('pale');

  // Alarm & Reminder States
  const [wakeTime, setWakeTime] = useState<string>(() => localStorage.getItem('timemate_water_wakeTime') || '07:00');
  const [sleepTime, setSleepTime] = useState<string>(() => localStorage.getItem('timemate_water_sleepTime') || '22:00');
  const [autoStopOnGoal, setAutoStopOnGoal] = useState<boolean>(() => {
    const saved = localStorage.getItem('timemate_water_autoStop');
    return saved !== null ? saved === 'true' : true;
  });
  const [isPaused, setIsPaused] = useState<boolean>(() => {
    const saved = localStorage.getItem('timemate_water_isPaused');
    return saved !== null ? saved === 'true' : false;
  });
  const [snoozeUntil, setSnoozeUntil] = useState<string | null>(() => localStorage.getItem('timemate_water_snoozeUntil') || null);
  const [adjustExercise, setAdjustExercise] = useState<boolean>(() => {
    const saved = localStorage.getItem('timemate_water_adjustExercise');
    return saved !== null ? saved === 'true' : true;
  });
  const [adjustIllness, setAdjustIllness] = useState<boolean>(() => {
    const saved = localStorage.getItem('timemate_water_adjustIllness');
    return saved !== null ? saved === 'true' : true;
  });
  const [adjustWeather, setAdjustWeather] = useState<boolean>(() => {
    const saved = localStorage.getItem('timemate_water_adjustWeather');
    return saved !== null ? saved === 'true' : true;
  });

  // Active alarms / Triggered UI Modal state
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const lastTriggeredTimeRef = useRef<number>(0);
  const [now, setNow] = useState<Date>(new Date());

  // Local effect to save alarm states to localStorage on transitions
  useEffect(() => {
    localStorage.setItem('timemate_water_wakeTime', wakeTime);
    localStorage.setItem('timemate_water_sleepTime', sleepTime);
    localStorage.setItem('timemate_water_autoStop', String(autoStopOnGoal));
    localStorage.setItem('timemate_water_isPaused', String(isPaused));
    localStorage.setItem('timemate_water_adjustExercise', String(adjustExercise));
    localStorage.setItem('timemate_water_adjustIllness', String(adjustIllness));
    localStorage.setItem('timemate_water_adjustWeather', String(adjustWeather));
    if (snoozeUntil) {
      localStorage.setItem('timemate_water_snoozeUntil', snoozeUntil);
    } else {
      localStorage.removeItem('timemate_water_snoozeUntil');
    }
  }, [wakeTime, sleepTime, autoStopOnGoal, isPaused, snoozeUntil, adjustExercise, adjustIllness, adjustWeather]);

  // Clock ticker updates once per second to guide exact alarm tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter logs associated with today only
  const todayLogs = useMemo(() => {
    const todayStr = new Date().toDateString();
    return logs.filter(l => new Date(l.timestamp).toDateString() === todayStr);
  }, [logs]);

  // Oldest ingestion of today triggers the automatic schedule launch
  const firstLog = useMemo(() => {
    if (todayLogs.length === 0) return null;
    return [...todayLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
  }, [todayLogs]);

  // Check if current hour is within waking hours
  const checkInWakingHours = (date: Date, wake: string, sleep: string) => {
    const [wakeH, wakeM] = wake.split(':').map(Number);
    const [sleepH, sleepM] = sleep.split(':').map(Number);
    const currentHour = date.getHours();
    const currentMinute = date.getMinutes();
    
    const minutesCur = currentHour * 60 + currentMinute;
    const minutesWake = wakeH * 60 + wakeM;
    let minutesSleep = sleepH * 60 + sleepM;
    
    if (minutesSleep < minutesWake) {
      // Sleep goes past midnight
      if (minutesCur >= minutesWake || minutesCur < minutesSleep) {
        return true;
      }
      return false;
    } else {
      return minutesCur >= minutesWake && minutesCur < minutesSleep;
    }
  };

  const inWakingHours = useMemo(() => {
    return checkInWakingHours(now, wakeTime, sleepTime);
  }, [now, wakeTime, sleepTime]);

  // Alarm frequency calculation with all active offsets
  const calculatedInterval = useMemo(() => {
    let base = settings.intervalMinutes; // base selected minutes e.g., 60
    if (!base || base <= 0) base = 60;

    let adjustmentsList: string[] = [];

    // 1) Workouts
    if (adjustExercise) {
      if (activityLevel === 'high') {
        base -= 15;
        adjustmentsList.push("Athletic Workout pace (-15m)");
      } else if (activityLevel === 'moderate') {
        base -= 5;
        adjustmentsList.push("Moderate Workout pace (-5m)");
      }
    }

    // 2) Weather / Hot climate
    if (adjustWeather) {
      if (weatherCondition === 'hot') {
        base -= 15;
        adjustmentsList.push("Hot Weather sweat risk (-15m)");
      } else if (weatherCondition === 'cool') {
        base += 10;
        adjustmentsList.push("Cold Temperature comfort (+10m)");
      }
    }

    // 3) Sickness/Medical details
    if (adjustIllness) {
      if (healthStatus === 'illness') {
        base -= 10;
        adjustmentsList.push("Acute Illness recovery boost (-10m)");
      } else if (healthStatus === 'restriction') {
        base += 30; // Fluid limit slows frequency
        adjustmentsList.push("Fluids restriction safe delay (+30m)");
      }
    }

    // 4) Hourly Hydration rate pace requirement
    const goal = settings.dailyGoalMl || 2000;
    const current = settings.currentIntakeMl || 0;
    const progressRatio = current / goal;

    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    const [sleepH, sleepM] = sleepTime.split(':').map(Number);
    const currentHourDecimal = now.getHours() + now.getMinutes() / 60;

    const wakeFraction = wakeH + wakeM / 60;
    let sleepFraction = sleepH + sleepM / 60;
    if (sleepFraction < wakeFraction) {
      sleepFraction += 24;
    }

    const currentAdjustedHour = currentHourDecimal < wakeFraction && sleepFraction > 24 ? currentHourDecimal + 24 : currentHourDecimal;
    const remainingWakingHours = Math.max(0, sleepFraction - currentAdjustedHour);
    const waterNeeded = Math.max(0, goal - current);

    if (waterNeeded > 0 && remainingWakingHours > 0) {
      const neededRate = waterNeeded / remainingWakingHours;
      if (neededRate > 350 && progressRatio < 0.5) {
        base -= 15;
        adjustmentsList.push("Hydration lag acceleration (-15m)");
      } else if (neededRate < 150 && progressRatio > 0.6) {
        base += 15;
        adjustmentsList.push("Hydration buffer pacing (+15m)");
      }
    }

    const finalInterval = Math.max(15, Math.min(base, 240));

    return {
      minutes: finalInterval,
      seconds: finalInterval * 60,
      adjustments: adjustmentsList,
      targetHourlyRate: waterNeeded > 0 && remainingWakingHours > 0 ? Math.round(waterNeeded / remainingWakingHours) : 0
    };
  }, [settings.intervalMinutes, settings.dailyGoalMl, settings.currentIntakeMl, activityLevel, weatherCondition, healthStatus, wakeTime, sleepTime, adjustExercise, adjustWeather, adjustIllness, now]);

  // Determine relative countdown timer until next hydration reminder
  const alarmDetails = useMemo(() => {
    if (!firstLog) {
      return { status: 'idle', timeString: 'Waiting for first glass today...', secRemaining: 0, targetTime: null };
    }

    // Goal reached stop check
    const goalCompleted = settings.currentIntakeMl >= settings.dailyGoalMl;
    if (autoStopOnGoal && goalCompleted) {
      return { status: 'goal_met', timeString: 'Daily Target Complete! Alarms muted.', secRemaining: 0, targetTime: null };
    }

    if (isPaused) {
      return { status: 'paused', timeString: 'Reminders Paused', secRemaining: 0, targetTime: null };
    }

    if (!inWakingHours) {
      return { status: 'sleeping', timeString: 'Sleeping Hours mode active', secRemaining: 0, targetTime: null };
    }

    const firstLogMs = new Date(firstLog.timestamp).getTime();
    const currentMs = now.getTime();
    const intervalMs = calculatedInterval.seconds * 1000;

    const elapsedMs = Math.max(0, currentMs - firstLogMs);
    const currentSequenceNum = Math.floor(elapsedMs / intervalMs) + 1;
    let nextScheduledAlarmMs = firstLogMs + (currentSequenceNum * intervalMs);

    // Filter by snooze limits
    let isSnoozedActive = false;
    if (snoozeUntil) {
      const snoozeMs = new Date(snoozeUntil).getTime();
      if (snoozeMs > currentMs) {
        isSnoozedActive = true;
        if (snoozeMs > nextScheduledAlarmMs) {
          nextScheduledAlarmMs = snoozeMs;
        }
      }
    }

    const secRemaining = Math.max(0, Math.round((nextScheduledAlarmMs - currentMs) / 1000));
    
    // Format minutes/seconds
    const mins = Math.floor(secRemaining / 60);
    const secs = secRemaining % 60;
    const timeFull = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    return {
      status: isSnoozedActive ? 'snoozed' : 'running',
      timeString: timeFull,
      secRemaining,
      targetTime: new Date(nextScheduledAlarmMs)
    };
  }, [firstLog, settings.currentIntakeMl, settings.dailyGoalMl, autoStopOnGoal, isPaused, inWakingHours, snoozeUntil, calculatedInterval, now]);

  // Message generator considering relative daily target progress and constraints
  const getFriendlyAlarmMessage = (ratio: number) => {
    if (ratio >= 1.0) {
      return "Fantastic job! You've achieved your daily hydration goal. Keep it up!";
    } else if (ratio < 0.4) {
      return "You are behind your water goal. Take a glass of water.";
    } else if (ratio < 0.8) {
      return "Time to drink water and stay hydrated.";
    } else {
      return "Great progress! Keep drinking water.";
    }
  };

  // Automated Alarm due checker
  useEffect(() => {
    if (alarmDetails.status !== 'running' && alarmDetails.status !== 'snoozed') return;
    if (alarmDetails.secRemaining <= 0) {
      const currentMs = now.getTime();
      // Enforce 45s anti-loop throttle guard
      if (currentMs - lastTriggeredTimeRef.current > 45000) {
        lastTriggeredTimeRef.current = currentMs;
        
        const ratio = settings.dailyGoalMl > 0 ? settings.currentIntakeMl / settings.dailyGoalMl : 0;
        const msg = getFriendlyAlarmMessage(ratio);
        
        setAlertMessage(msg);
        setIsAlertOpen(true);
        synth.playAlarm();

        // Add to main notifications timeline database securely
        onAddNotification?.("💧 Hydration reminder", msg, "water");
      }
    }
  }, [alarmDetails, now, settings.currentIntakeMl, settings.dailyGoalMl, onAddNotification]);

  // Method to manually clear alarm snooze
  const handleCancelSnooze = () => {
    synth.playBubble();
    setSnoozeUntil(null);
  };

  // Method to trigger snooze period
  const handleTriggerSnooze = (minutes: number) => {
    synth.playBubble();
    const until = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setSnoozeUntil(until);
    setIsAlertOpen(false);
  };

  // Direct trigger test warning for users
  const triggerManualTestAlert = () => {
    synth.playAlarm();
    const ratio = settings.dailyGoalMl > 0 ? settings.currentIntakeMl / settings.dailyGoalMl : 0;
    const msg = getFriendlyAlarmMessage(ratio);
    setAlertMessage(msg);
    setIsAlertOpen(true);
    onAddNotification?.("💧 Hydration alert [TEST SIMULATION]", msg, "water");
  };

  // Dynamically computed optimal daily target intake recommendation considering all 10 factors
  const computedRequirement = (() => {
    // 1. Age and Gender Base Multiplier (ml per kg)
    let baseMultiplier = 35; // typical average for adults
    if (age < 18) {
      baseMultiplier = 40; // child/youth baseline
    } else if (age > 60) {
      if (gender === 'female') {
        baseMultiplier = 28;
      } else if (gender === 'male') {
        baseMultiplier = 30;
      } else {
        baseMultiplier = 29;
      }
    } else {
      // Adults 18 - 60
      if (gender === 'female') {
        baseMultiplier = 31;
      } else if (gender === 'male') {
        baseMultiplier = 35;
      } else {
        baseMultiplier = 33;
      }
    }

    // 2. Body Weight baseline calculation
    let totalWater = weight * baseMultiplier;

    // 3. Climate / Weather Condition Addition
    if (weatherCondition === 'cool') {
      totalWater += 0;
    } else if (weatherCondition === 'temperate') {
      totalWater += 350;
    } else if (weatherCondition === 'hot') {
      totalWater += 800; // hot climate sweat offset
    }

    // 4. Physical Activity Level Addition
    if (activityLevel === 'sedentary') {
      totalWater += 0;
    } else if (activityLevel === 'moderate') {
      totalWater += 400;
    } else if (activityLevel === 'high') {
      totalWater += 900; // intense athletic workouts
    }

    // 5. Pregnancy / Breastfeeding status (Available if female)
    if (gender === 'female') {
      if (pregnancyStatus === 'pregnant') {
        totalWater += 350;
      } else if (pregnancyStatus === 'breastfeeding') {
        totalWater += 700;
      }
    }

    // 6. Diet Type adjustment
    if (dietType === 'salty') {
      totalWater += 300; // spices/salt require high sodium flushing volume
    } else if (dietType === 'high_protein') {
      totalWater += 500; // high protein diet demands kidney flushing
    }

    // 7. Medication use - Diuretics
    if (medicationDiuretic) {
      totalWater += 350; // diuretics induce higher excretion volume
    }

    // 8. Health conditions (fever, diarrhea, vomiting, kidney or heart problems)
    if (healthStatus === 'illness') {
      totalWater += 750; // rapid fluid replenishment for sickness
    } else if (healthStatus === 'restriction') {
      // Fluid restriction protocol - significantly limit intake
      totalWater -= 800;
    }

    // 9. Current Hydration status (urine color estimation)
    if (urineColor === 'dark_yellow') {
      totalWater += 250;
    } else if (urineColor === 'amber') {
      totalWater += 600; // dehydration mitigation addition
    }

    // Ensure safe boundaries
    const lowerBound = healthStatus === 'restriction' ? 820 : 1200;
    const upperBound = 6000;
    const bounded = Math.max(lowerBound, Math.min(totalWater, upperBound));

    // Round to nearest 100 ml for polished intake matching
    return Math.round(bounded / 100) * 100;
  })();

  const addHydration = (amount: number) => {
    synth.playWaterDrop();
    onAddLog(amount);
  };

  const toggleStatus = () => {
    synth.playBubble();
    onUpdateSettings({ enabled: !settings.enabled });
  };

  const handleCustomIntervalChange = (val: number) => {
    onUpdateSettings({ intervalMinutes: val });
  };

  // Percentage completion
  const percentage = Math.min(Math.round((settings.currentIntakeMl / settings.dailyGoalMl) * 100), 100);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header and Enable Toggle */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-105 dark:border-gray-750 shadow-sm flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Smart Hydration Reminders</h2>
          <p className="text-xs text-gray-400">Set alarms to drink water, track hydration benefits</p>
        </div>

        <button
          onClick={toggleStatus}
          className="flex items-center gap-1.5 focus:outline-none focus:ring-transparent"
        >
          <span className="text-xs font-extrabold tracking-wider text-gray-400 uppercase mr-1">Status</span>
          {settings.enabled ? (
            <ToggleRight className="w-12 h-12 text-sky-500 fill-current text-white cursor-pointer" />
          ) : (
            <ToggleLeft className="w-12 h-12 text-gray-300 dark:text-gray-650 cursor-pointer" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Animated Water Cup Cup Shape & Core Metrics */}
        <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 rounded-3xl p-6 border border-gray-105 dark:border-gray-750 shadow-sm flex flex-col items-center justify-center min-h-[380px]">
          
          {/* Animated Liquid Wave cup visual indicator */}
          <div className="relative w-36 h-48 border-4 border-gray-200 dark:border-gray-700 rounded-b-3xl rounded-t-lg overflow-hidden flex flex-col justify-end shadow-inner bg-gray-50/50 dark:bg-gray-900/10">
            {/* Water liquid color block with height adjusted reactive with status */}
            <div 
              className={`w-full bg-gradient-to-t from-sky-600 via-sky-500 to-sky-400 relative transition-all duration-700 ease-out flex items-center justify-center`}
              style={{ height: `${percentage}%` }}
            >
              {/* Dynamic Wave flow animations */}
              {percentage > 0 && (
                <div className="absolute inset-x-0 -top-2 h-4 bg-sky-300 opacity-60 animate-wave rounded-full flex banner-wave" />
              )}
              {percentage > 0 && (
                <div className="absolute inset-x-0 -top-1 h-2 bg-sky-200 opacity-80 animate-wave-slow waves" />
              )}
              
              {/* Centered Percentage indicators */}
              {percentage >= 15 && (
                <span className="text-white text-lg font-black font-mono leading-none drop-shadow-md z-1 flex items-center gap-1">
                  {percentage}%
                </span>
              )}
            </div>

            {/* If zero water consumed yet container label */}
            {percentage < 15 && (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-gray-400 select-none">
                {percentage}% Done
              </span>
            )}
          </div>

          <div className="text-center mt-6 space-y-1">
            <p className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Hydration achieved today</p>
            <h3 className="text-2xl font-black text-sky-650 dark:text-sky-400">{settings.currentIntakeMl} / {settings.dailyGoalMl} ml</h3>
            <p className="text-xs text-gray-400">Keep logging to hit your daily productivity targets.</p>
          </div>

        </div>

        {/* Interval Options & Fast Add actions */}
        <div className="space-y-6">
          
          {/* Intake logs fast selectors */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-105 dark:border-gray-750 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Quick Hydrate Presets</h3>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { amount: 250, label: 'Cup of water', size: '250ml' },
                { amount: 500, label: 'Standard Bottle', size: '500ml' },
                { amount: 750, label: 'Insulated Flask', size: '750ml' }
              ].map(w => (
                <button
                  key={w.amount}
                  onClick={() => addHydration(w.amount)}
                  className="p-3.5 rounded-2xl border border-sky-100 hover:border-sky-300 focus:outline-none hover:bg-sky-50/40 dark:border-gray-750 hover:dark:bg-sky-955/20 text-center transition-all group"
                >
                  <Droplet className="w-5 h-5 text-sky-500 mx-auto group-hover:scale-125 transition-transform" />
                  <span className="block text-sm font-black text-gray-800 dark:text-white mt-2 leading-none">{w.size}</span>
                  <span className="block text-[10px] text-gray-400 mt-1 leading-none">{w.label}</span>
                </button>
              ))}
            </div>

            {/* Custom ML entry */}
            <div className="pt-2 border-t border-gray-50 dark:border-gray-750 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs font-bold text-gray-500">Custom Consumption ml</span>
              <div className="flex items-center gap-1.5 flex-1 max-w-[170px]">
                <input
                  type="number"
                  min="50"
                  max="1500"
                  step="50"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-gray-55 dark:bg-gray-750 text-gray-900 dark:text-white px-3 py-2 rounded-xl text-xs font-extrabold text-center focus:outline-none"
                />
                <button
                  onClick={() => addHydration(Number(customAmount) || 250)}
                  className="px-3 py-2 bg-sky-550 text-white rounded-xl text-xs font-bold"
                >
                  Add
                </button>
              </div>
            </div>

          </div>

          {/* Adaptive Alarm & Smart Reminders Control Center */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-105 dark:border-gray-750 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Interactive Reminder Alarms</h3>
                <p className="text-[10px] text-gray-400 pl-1">Calculates adaptive intervals based on lifestyle & climate offsets</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                alarmDetails.status === 'running' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                alarmDetails.status === 'snoozed' ? 'bg-amber-500/15 text-amber-600 font-extrabold' :
                alarmDetails.status === 'sleeping' ? 'bg-indigo-500/10 text-indigo-500' :
                alarmDetails.status === 'goal_met' ? 'bg-sky-500/10 text-sky-500' :
                'bg-gray-100 dark:bg-gray-750 text-gray-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  alarmDetails.status === 'running' ? 'bg-emerald-500 animate-pulse' :
                  alarmDetails.status === 'snoozed' ? 'bg-amber-500' :
                  alarmDetails.status === 'sleeping' ? 'bg-indigo-500' :
                  alarmDetails.status === 'goal_met' ? 'bg-sky-500' :
                  'bg-gray-400'
                }`} />
                {alarmDetails.status === 'running' ? 'Active Tracking' :
                 alarmDetails.status === 'snoozed' ? 'Snoozed' :
                 alarmDetails.status === 'sleeping' ? 'Asleep' :
                 alarmDetails.status === 'goal_met' ? 'Goal Met' :
                 alarmDetails.status === 'paused' ? 'Paused' : 'Waiting Sip'}
              </span>
            </div>

            {/* Live Countdown Clock Timer display */}
            <div className="p-4 bg-gray-50 dark:bg-gray-850/60 border border-gray-100/40 dark:border-gray-750/50 rounded-2xl flex flex-col items-center justify-center text-center space-y-1">
              {alarmDetails.status === 'idle' ? (
                <div className="space-y-1 py-1">
                  <Coffee className="w-6 h-6 text-sky-400 mx-auto" />
                  <span className="block text-xs font-bold text-gray-750 dark:text-gray-300">Start Sequence</span>
                  <p className="text-[10px] text-gray-400 leading-normal max-w-[240px] mx-auto">First drink logged today automatically initializes your custom adaptive alarm timeline.</p>
                </div>
              ) : alarmDetails.status === 'sleeping' ? (
                <div className="space-y-1 py-1">
                  <Moon className="w-6 h-6 text-indigo-400 mx-auto" />
                  <span className="block text-xs font-bold text-gray-700 dark:text-gray-300">Quiet Sleeping Hours</span>
                  <p className="text-[10px] text-gray-400">Reminders suspended (Night time schedule: {wakeTime} to {sleepTime}). Sleep well!</p>
                </div>
              ) : alarmDetails.status === 'goal_met' ? (
                <div className="space-y-1 py-1">
                  <Sparkles className="w-6 h-6 text-sky-500 mx-auto animate-bounce" />
                  <span className="block text-xs font-bold text-gray-800 dark:text-white">Hydration Target Completed!</span>
                  <p className="text-[10px] text-gray-400 leading-normal">Superb work hitting your daily volume. Alarms auto-muted for rest and recovery.</p>
                </div>
              ) : alarmDetails.status === 'paused' ? (
                <div className="space-y-1 py-1">
                  <Pause className="w-5 h-5 text-gray-400 mx-auto" />
                  <span className="block text-xs font-bold text-gray-500">Alarms Suspended</span>
                  <button 
                    onClick={() => { synth.playBubble(); setIsPaused(false); }}
                    className="text-[10px] font-bold text-sky-500 dark:text-sky-450 hover:underline"
                  >
                    Resume tracking timeline
                  </button>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">Next Hydration Reminder In</span>
                  <div className="flex items-center justify-center gap-2">
                    {alarmDetails.status === 'snoozed' ? <BellOff className="w-5 h-5 text-amber-500 animate-wiggle" /> : <Bell className="w-5 h-5 text-sky-500 animate-pulse" />}
                    <span className="text-3xl font-black font-mono tracking-tight text-gray-850 dark:text-white">{alarmDetails.timeString}</span>
                  </div>
                  {alarmDetails.status === 'snoozed' ? (
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-[9px] text-amber-600 font-extrabold bg-amber-500/10 px-1.5 py-0.5 rounded-md">Snooze Override</span>
                      <button 
                        onClick={handleCancelSnooze}
                        className="text-[10px] font-bold text-sky-500 hover:underline hover:text-sky-600"
                      >
                        Cancel Snooze
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 mt-1.5">
                      <button 
                        onClick={() => handleTriggerSnooze(15)}
                        className="text-[9px] px-2 py-0.5 rounded-md bg-gray-150/50 hover:bg-gray-200 dark:bg-gray-750 font-bold text-gray-600 dark:text-gray-300"
                      >
                        +15m Snooze
                      </button>
                      <button 
                        onClick={() => handleTriggerSnooze(30)}
                        className="text-[9px] px-2 py-0.5 rounded-md bg-gray-150/50 hover:bg-gray-200 dark:bg-gray-750 font-bold text-gray-600 dark:text-gray-300"
                      >
                        +30m Snooze
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Custom Waking schedule & Base Intention option selectors */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-450 dark:text-gray-400 flex items-center gap-1"><Sun className="w-3 h-3 text-amber-500" /> Morning Wake-up</span>
                <input 
                  type="time" 
                  value={wakeTime}
                  onChange={(e) => { synth.playBubble(); setWakeTime(e.target.value); }}
                  className="w-full text-xs font-extrabold p-2 bg-gray-55 dark:bg-gray-750/70 text-gray-800 dark:text-white rounded-xl border border-gray-100/50 dark:border-gray-750/20 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-450 dark:text-gray-400 flex items-center gap-1"><Moon className="w-3 h-3 text-indigo-500" /> Bedtime Sleep</span>
                <input 
                  type="time" 
                  value={sleepTime}
                  onChange={(e) => { synth.playBubble(); setSleepTime(e.target.value); }}
                  className="w-full text-xs font-extrabold p-2 bg-gray-55 dark:bg-gray-750/70 text-gray-800 dark:text-white rounded-xl border border-gray-100/50 dark:border-gray-750/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Base Interval Selector config */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-gray-450 dark:text-gray-400 block pl-0.5">Choose Intended Base Frequency</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { val: 30, text: '30 Min' },
                  { val: 60, text: '1 Hr' },
                  { val: 120, text: '2 Hr' },
                  { val: 180, text: '3 Hr' }
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => { synth.playBubble(); handleCustomIntervalChange(opt.val); }}
                    className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                      settings.intervalMinutes === opt.val
                        ? 'border-sky-500 bg-sky-50/20 text-sky-650 dark:bg-sky-955/20 dark:text-sky-450 font-extrabold shadow-3xs'
                        : 'border-gray-100 dark:border-gray-750 text-gray-500 hover:bg-gray-55 dark:hover:bg-gray-750/50'
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Adaptive Offsets & Smart Overwrites Checklist */}
            <div className="pt-2 border-t border-gray-50 dark:border-gray-750 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 pl-0.5 block">Adaptive Calibration Overrides</span>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] font-bold text-gray-600 dark:text-gray-300">
                <button 
                  onClick={() => { synth.playBubble(); setAdjustExercise(!adjustExercise); }}
                  className="flex items-center gap-1.5 hover:opacity-85 text-left"
                >
                  <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-colors ${adjustExercise ? 'bg-sky-500 border-sky-500 text-white' : 'border-gray-300 dark:border-gray-650 bg-transparent'}`}>
                    {adjustExercise && <Check className="w-2.5 h-2.5" />}
                  </div>
                  Adjust for Exercise
                </button>
                <button 
                  onClick={() => { synth.playBubble(); setAdjustWeather(!adjustWeather); }}
                  className="flex items-center gap-1.5 hover:opacity-85 text-left"
                >
                  <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-colors ${adjustWeather ? 'bg-sky-500 border-sky-500 text-white' : 'border-gray-300 dark:border-gray-650 bg-transparent'}`}>
                    {adjustWeather && <Check className="w-2.5 h-2.5" />}
                  </div>
                  Adjust for Climate
                </button>
                <button 
                  onClick={() => { synth.playBubble(); setAdjustIllness(!adjustIllness); }}
                  className="flex items-center gap-1.5 hover:opacity-85 text-left"
                >
                  <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-colors ${adjustIllness ? 'bg-sky-500 border-sky-500 text-white' : 'border-gray-300 dark:border-gray-650 bg-transparent'}`}>
                    {adjustIllness && <Check className="w-2.5 h-2.5" />}
                  </div>
                  Adjust for Illness
                </button>
                <button 
                  onClick={() => { synth.playBubble(); setAutoStopOnGoal(!autoStopOnGoal); }}
                  className="flex items-center gap-1.5 hover:opacity-85 text-left"
                >
                  <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-colors ${autoStopOnGoal ? 'bg-sky-500 border-sky-500 text-white' : 'border-gray-300 dark:border-gray-650 bg-transparent'}`}>
                    {autoStopOnGoal && <Check className="w-2.5 h-2.5" />}
                  </div>
                  Auto-stop on Goal
                </button>
              </div>

              {/* Offset statuses breakdown readout tags */}
              <div className="pt-2 flex flex-wrap gap-1">
                {calculatedInterval.adjustments.length === 0 ? (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-gray-55/60 dark:bg-gray-850 text-gray-450 border border-gray-100/40 dark:border-gray-750/30">✨ Schedule active at standard frequency.</span>
                ) : (
                  <>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-sky-50 hover:bg-sky-100/60 dark:bg-sky-955/20 text-sky-600 dark:text-sky-400 border border-sky-100/40 dark:border-sky-900/30 font-extrabold">Adjusted: {calculatedInterval.minutes} min</span>
                    {calculatedInterval.adjustments.map((adj, i) => (
                      <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-indigo-50/50 dark:bg-indigo-955/20 text-indigo-650 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/20">{adj}</span>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Syncing target daily goals & manual test simulation button */}
            <div className="pt-2.5 border-t border-gray-55 dark:border-gray-750 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs text-gray-505">
                <span>Direct Intention Volume Target</span>
                <span className="font-extrabold text-sky-500">{settings.dailyGoalMl} ml</span>
              </div>
              <input
                type="range"
                min="1000"
                max="4000"
                step="250"
                value={settings.dailyGoalMl}
                onChange={(e) => { synth.playBubble(); onUpdateSettings({ dailyGoalMl: Number(e.target.value) }); }}
                className="w-full accent-sky-500 cursor-pointer h-1.5 rounded-lg"
              />

              <button
                onClick={triggerManualTestAlert}
                className="w-full mt-1.5 py-1.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-55 hover:bg-gray-100 dark:bg-gray-750 dark:hover:bg-gray-700/60 transition-colors pointer text-[10px] font-bold text-gray-650 dark:text-gray-300 flex items-center justify-center gap-1.5 active:scale-[98]"
              >
                <Timer className="w-3.5 h-3.5 text-sky-500 animate-spin" />
                Simulate Hydration Alarm Trigger
              </button>
            </div>

            {/* Smart Climate, Weight & Age Target Calculator */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-750">
              <button
                onClick={() => { synth.playBubble(); setCalcOpen(!calcOpen); }}
                className="w-full flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400 hover:opacity-85 transition-opacity py-0.5"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
                  Auto-Calculate Daily Intake Goal
                </span>
                <span className="text-[10px] text-gray-400 font-mono bg-gray-50 dark:bg-gray-850 px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-gray-100/50 dark:border-gray-750">
                   {calcOpen ? "Close Finder" : "Try It"}
                   {calcOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </span>
              </button>

              <AnimatePresence>
                {calcOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden space-y-3.5 pt-3 mt-1.5 border-t border-gray-50/50 dark:border-gray-750/30"
                  >
                    <p className="text-[11px] leading-relaxed text-gray-400">
                      We check baseline body-mass demands paired with hydration additions for climate, physical, medical & diet parameters.
                    </p>

                    {/* Modern tab selectors */}
                    <div className="flex border border-gray-100 dark:border-gray-700/50 p-1 rounded-xl bg-gray-50/80 dark:bg-gray-850/50">
                      {[
                        { id: 'body', title: '1. Body', icon: Scale },
                        { id: 'lifestyle', title: '2. Habit', icon: Activity },
                        { id: 'health', title: '3. Health', icon: Heart }
                      ].map(t => {
                        const Icon = t.icon;
                        return (
                          <button
                            key={t.id}
                            onClick={() => { synth.playBubble(); setCalcTab(t.id as any); }}
                            className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all capitalize cursor-pointer ${
                              calcTab === t.id
                                ? 'bg-white shadow-soft text-sky-600 dark:bg-gray-800 dark:text-sky-400 border border-black/5 dark:border-white/5'
                                : 'text-gray-450 hover:text-gray-700 dark:text-gray-405 dark:hover:text-white'
                            }`}
                          >
                            <Icon className="w-3 h-3 text-sky-500" />
                            {t.title}
                          </button>
                        );
                      })}
                    </div>

                    {calcTab === 'body' && (
                      <div className="space-y-3.5 pt-1">
                        {/* Gender selection */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase text-gray-450 tracking-wider block pl-0.5">Assigned Gender</span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: 'male', label: '♂️ Male' },
                              { id: 'female', label: '♀️ Female' },
                              { id: 'other', label: 'Diverse / Other' }
                            ].map(g => (
                              <button
                                key={g.id}
                                onClick={() => { synth.playBubble(); setGender(g.id as any); }}
                                className={`py-1.5 px-1 rounded-xl border text-[10px] font-bold text-center transition-all cursor-pointer ${
                                  gender === g.id
                                    ? 'bg-sky-50/25 border-sky-400 text-sky-600 dark:bg-sky-955/25 dark:border-sky-500 dark:text-sky-400 font-extrabold'
                                    : 'bg-transparent border-gray-100 dark:border-gray-750 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750/30'
                                }`}
                              >
                                {g.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Weight & Age Grid */}
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* Weight */}
                          <div className="space-y-1 bg-gray-55/60 dark:bg-gray-850/40 p-2.5 rounded-xl border border-gray-100/30 dark:border-gray-750">
                            <span className="text-[10px] font-extrabold uppercase text-gray-455 block tracking-wider flex items-center gap-1">
                              <Scale className="w-2.5 h-2.5 text-gray-400" /> Weight
                            </span>
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs text-gray-800 dark:text-white">{weight} <span className="text-[10px] text-gray-400 font-normal">kg</span></span>
                              <span className="text-[10px] text-gray-405 font-mono">{Math.round(weight * 2.20462)} lbs</span>
                            </div>
                            <input
                              type="range"
                              min="30"
                              max="160"
                              value={weight}
                              onChange={(e) => setWeight(Number(e.target.value))}
                              className="w-full h-1 accent-sky-500 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer"
                            />
                          </div>

                          {/* Age */}
                          <div className="space-y-1 bg-gray-55/60 dark:bg-gray-850/40 p-2.5 rounded-xl border border-gray-100/30 dark:border-gray-750 flex flex-col justify-between">
                            <span className="text-[10px] font-extrabold uppercase text-gray-455 block tracking-wider">Age Group</span>
                            <div className="flex items-center justify-between mt-1">
                              <button
                                onClick={() => { synth.playBubble(); setAge(Math.max(5, age - 5)); }}
                                className="w-5 h-5 rounded bg-gray-200/50 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 text-xs font-black text-gray-700 dark:text-gray-300 transition-transform cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-extrabold text-xs text-gray-800 dark:text-white font-mono">{age} yrs</span>
                              <button
                                onClick={() => { synth.playBubble(); setAge(Math.min(100, age + 5)); }}
                                className="w-5 h-5 rounded bg-gray-200/50 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 text-xs font-black text-gray-700 dark:text-gray-300 transition-transform cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Pregnancy and Breastfeeding status (Adjust if female) */}
                        {gender === 'female' && (
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-1.5 bg-indigo-500/5 border border-indigo-100/20 dark:border-indigo-950/20 p-2.5 rounded-xl"
                          >
                            <span className="text-[10px] font-extrabold uppercase text-indigo-500 dark:text-indigo-400 tracking-wider flex items-center gap-1">
                              <Baby className="w-3.5 h-3.5" /> Pregnancy / Breastfeeding
                            </span>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                { id: 'none', label: 'Not active' },
                                { id: 'pregnant', label: 'Pregnant (+350ml)' },
                                { id: 'breastfeeding', label: 'Nursing (+700ml)' }
                              ].map(p => (
                                <button
                                  key={p.id}
                                  onClick={() => { synth.playBubble(); setPregnancyStatus(p.id as any); }}
                                  className={`py-1 px-1 rounded-lg border text-[8px] font-extrabold text-center transition-all cursor-pointer ${
                                    pregnancyStatus === p.id
                                      ? 'bg-indigo-50/25 border-indigo-400 text-indigo-600 dark:bg-indigo-955/35 dark:border-indigo-500 dark:text-indigo-400 font-extrabold'
                                      : 'bg-transparent border-gray-100 dark:border-gray-750 text-gray-500 hover:bg-gray-55/40'
                                  }`}
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {calcTab === 'lifestyle' && (
                      <div className="space-y-3.5 pt-1">
                        {/* Physical Activity Level */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase text-gray-455 tracking-wider block pl-0.5 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-sky-500" /> Physical Activity Level
                          </span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: 'sedentary', label: '🛋️ Sedentary', info: 'Low active / standard' },
                              { id: 'moderate', label: '🏃 Moderate', info: 'Light sport / walk (+400)' },
                              { id: 'high', label: '🏋️ Athletic', info: 'Heavy workout (+900)' }
                            ].map(act => (
                              <button
                                key={act.id}
                                onClick={() => { synth.playBubble(); setActivityLevel(act.id as any); }}
                                className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                                  activityLevel === act.id
                                    ? 'bg-sky-50/25 border-sky-400 text-sky-600 dark:bg-sky-955/25 dark:border-sky-500 dark:text-sky-400 font-extrabold'
                                    : 'bg-transparent border-gray-100 dark:border-gray-750 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750/30'
                                }`}
                              >
                                <span className="block text-[10px] font-bold leading-none">{act.label}</span>
                                <span className="block text-[7px] text-gray-400 mt-0.5 leading-none">{act.info}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Climate / Weather selector segment */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase text-gray-455 tracking-wider block pl-0.5">Environment Climate</span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: 'cool', emoji: '❄️', tag: 'Cool', info: 'Cold climate' },
                              { id: 'temperate', emoji: '⛅', tag: 'Temperate', info: 'Mild weather (+350)' },
                              { id: 'hot', emoji: '🔥', tag: 'Hot Climate', info: 'Summer / sweat (+800)' }
                            ].map(wt => (
                              <button
                                key={wt.id}
                                onClick={() => { synth.playBubble(); setWeatherCondition(wt.id as any); }}
                                className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                                  weatherCondition === wt.id
                                    ? 'bg-sky-50/25 border-sky-400 text-sky-600 dark:bg-sky-955/25 dark:border-sky-500 dark:text-sky-400 font-extrabold'
                                    : 'bg-transparent border-gray-100 dark:border-gray-750 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750/30'
                                }`}
                              >
                                <span className="block text-xs leading-none mb-0.5">{wt.emoji}</span>
                                <span className="block text-[10px] uppercase font-bold leading-none tracking-tight">{wt.tag}</span>
                                <span className="block text-[7px] text-gray-400 mt-0.5 leading-none">{wt.info}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Diet type */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase text-gray-455 tracking-wider block pl-0.5">Daily Diet Type</span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: 'standard', label: '🥗 Balanced', info: 'Normal healthy meals' },
                              { id: 'salty', label: '🌶️ Spicy / Salty', info: 'High sodium (+300)' },
                              { id: 'high_protein', label: '🍖 Protein Heavy', info: 'Urea excretion demands (+500)' }
                            ].map(dt => (
                              <button
                                key={dt.id}
                                onClick={() => { synth.playBubble(); setDietType(dt.id as any); }}
                                className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                                  dietType === dt.id
                                    ? 'bg-sky-50/25 border-sky-400 text-sky-600 dark:bg-sky-955/25 dark:border-sky-500 dark:text-sky-400 font-extrabold'
                                    : 'bg-transparent border-gray-100 dark:border-gray-750 text-gray-500 hover:bg-gray-55/55'
                                }`}
                              >
                                <span className="block text-[10px] font-bold leading-none">{dt.label}</span>
                                <span className="block text-[7px] text-gray-400 mt-0.5 leading-none">{dt.info}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {calcTab === 'health' && (
                      <div className="space-y-3.5 pt-1">
                        {/* Health condition illness or restriction */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase text-gray-455 tracking-wider block pl-0.5">Medical & Health Condition</span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: 'none', label: '💚 Normal Health', info: 'None' },
                              { id: 'illness', label: '🤒 Acute illness', info: 'Fever, diarrhea, vomiting (+750)' },
                              { id: 'restriction', label: '⚠️ Restricted Fluids', info: 'Kidney or heart problems' }
                            ].map(hc => (
                              <button
                                key={hc.id}
                                onClick={() => { synth.playBubble(); setHealthStatus(hc.id as any); }}
                                className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                                  healthStatus === hc.id
                                    ? hc.id === 'restriction'
                                      ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:bg-amber-950/20'
                                      : 'bg-sky-50/25 border-sky-400 text-sky-600 dark:bg-sky-955/25 dark:border-sky-500 dark:text-sky-400 font-extrabold'
                                    : 'bg-transparent border-gray-100 dark:border-gray-750 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750/30'
                                }`}
                              >
                                <span className="block text-[10px] font-bold leading-none">{hc.label}</span>
                                <span className="block text-[7px] text-gray-400 mt-0.5 leading-none whitespace-normal">{hc.info}</span>
                              </button>
                            ))}
                          </div>

                          {healthStatus === 'restriction' && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-2 border border-amber-300 bg-amber-500/5 dark:border-amber-700/30 text-[9px] text-amber-700 dark:text-amber-400 rounded-xl leading-relaxed mt-1 flex items-start gap-1"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-500" />
                              <span>
                                <strong>Advisory:</strong> Congestive heart failure or kidney disease require clinically restricted water targets (standard decrease of -800ml) to protect organs from fluid overload. Please consult your physician!
                              </span>
                            </motion.div>
                          )}
                        </div>

                        {/* Medications (Diuretic) switch */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-gray-55/65 dark:bg-gray-850/40 border border-gray-100/50 dark:border-gray-750">
                          <div className="max-w-[75%]">
                            <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider block flex items-center gap-1">
                              <Pill className="w-3.5 h-3.5 text-purple-500" /> Taking Medications (Diuretics)
                            </span>
                            <span className="block text-[8px] text-gray-400 leading-normal mt-0.5">
                              Takes prescription diuretic water-pills which increase urination output, requiring extra water compensation.
                            </span>
                          </div>
                          <button
                            onClick={() => { synth.playBubble(); setMedicationDiuretic(!medicationDiuretic); }}
                            className="bg-transparent border-none outline-none focus:ring-transparent p-1 cursor-pointer"
                          >
                            {medicationDiuretic ? (
                              <ToggleRight className="w-9 h-9 text-purple-500 fill-current text-white" />
                            ) : (
                              <ToggleLeft className="w-9 h-9 text-gray-300 dark:text-gray-650" />
                            )}
                          </button>
                        </div>

                        {/* Hydration / Urine color parameter */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-extrabold uppercase text-gray-455 tracking-wider block pl-0.5">Current Hydration (Urine Color)</span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: 'pale', tag: 'Pale Yellow / Clear', color: 'bg-yellow-101 dark:bg-yellow-905 border-yellow-250', desc: 'Hydrated' },
                              { id: 'dark_yellow', tag: 'Dark Yellow', color: 'bg-yellow-300 dark:bg-yellow-750/30 border-yellow-450', desc: 'Alert (+250ml)' },
                              { id: 'amber', tag: 'Amber / Orange', color: 'bg-amber-500/20 border-amber-600', desc: 'Dehydrated (+600ml)' }
                            ].map(uc => (
                              <button
                                key={uc.id}
                                onClick={() => { synth.playBubble(); setUrineColor(uc.id as any); }}
                                className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                                  urineColor === uc.id
                                    ? 'border-sky-400 bg-sky-50/10 dark:bg-sky-955/20 font-extrabold text-sky-600 dark:text-sky-400'
                                    : 'bg-transparent border-gray-100 dark:border-gray-750 text-gray-500 hover:bg-gray-55/60'
                                }`}
                              >
                                <div className={`w-3.5 h-3.5 rounded-full ${uc.color} border mb-1`} />
                                <span className="block text-[9px] font-extrabold leading-none">{uc.tag}</span>
                                <span className="block text-[7px] opacity-75 mt-0.5 leading-none whitespace-normal">{uc.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Result and applying */}
                    <div className="bg-sky-500/5 dark:bg-sky-400/5 border border-sky-550/15 dark:border-sky-450/15 p-2.5 rounded-xl flex items-center justify-between gap-1 mt-2">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-sky-500 block leading-none">Suggested Daily Intake</span>
                        <div className="inline-flex items-baseline gap-0.5 mt-0.5">
                          <span className="text-lg font-black text-sky-600 dark:text-sky-400 font-mono tracking-tight leading-none">{computedRequirement}</span>
                          <span className="text-[10px] font-bold text-gray-450 dark:text-gray-400 block leading-none">ml</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          synth.playWaterDrop();
                          onUpdateSettings({ dailyGoalMl: computedRequirement });
                        }}
                        className="text-[10px] font-black tracking-wide uppercase px-3 py-2 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-650 text-white shadow-soft rounded-xl active:scale-[97] transition-all cursor-pointer"
                      >
                        Apply Target
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>

      {/* Consumption Timeline list history */}
      <section className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-750 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Today's Ingestion Timeline</h3>
          {logs.length > 0 && (
            <button
              onClick={() => { synth.playBubble(); onClearLogs(); }}
              className="text-xs font-bold text-rose-500 flex items-center gap-1 hover:underline"
            >
              <Trash className="w-3.5 h-3.5" /> Reset History
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4 italic">No hydration logs yet for today. Start drinking to ensure high energy.</p>
        ) : (
          <div className="flex gap-2.5 flex-wrap">
            {logs.map(lg => (
              <div key={lg.id} className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-650 dark:text-sky-400 border border-sky-100/50 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>{lg.amountMl}ml logged</span>
                <span className="opacity-60 text-[10px] ml-1 font-mono">{new Date(lg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Immersive Glassmorphism Alarm Popup Alert overlay */}
      <AnimatePresence>
        {isAlertOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/65 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full border border-sky-100 dark:border-gray-700 shadow-2xl space-y-5 text-center relative overflow-hidden"
            >
              {/* Background ambient lighting glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-sky-450/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />

              <div className="relative space-y-4">
                {/* Pulsing droplet & bell ringing symbol graphics */}
                <div className="relative mx-auto w-16 h-16 flex items-center justify-center bg-sky-50 dark:bg-sky-955/30 rounded-full border border-sky-100 dark:border-sky-850/50">
                  <motion.div
                    animate={{ rotate: [0, -12, 12, -12, 12, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="absolute z-10 -top-1 -right-1 p-1 bg-amber-500 rounded-full border-2 border-white dark:border-gray-800 text-white"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                  </motion.div>
                  <Droplet className="w-8 h-8 text-sky-500 animate-bounce" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Time to Hydrate!</h3>
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-455 font-extrabold tracking-widest uppercase">Adaptive Water Reminder</p>
                </div>

                {/* Friendly Custom Progressive Messages */}
                <div className="p-3.5 bg-sky-50/50 dark:bg-sky-955/20 border border-sky-100/50 dark:border-sky-900/40 rounded-2xl text-xs font-extrabold text-gray-750 dark:text-gray-250 leading-relaxed text-center">
                  "{alertMessage}"
                </div>

                {/* Real-time stats context inside dialogue */}
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="bg-gray-55 dark:bg-gray-850 p-2 rounded-xl border border-gray-100/10">
                    <span className="text-[8px] uppercase font-bold tracking-wider text-gray-400 block">Intake achieved</span>
                    <span className="font-extrabold text-xs text-gray-800 dark:text-white">{settings.currentIntakeMl} / {settings.dailyGoalMl} ml</span>
                  </div>
                  <div className="bg-gray-55 dark:bg-gray-850 p-2 rounded-xl border border-gray-100/10">
                    <span className="text-[8px] uppercase font-bold tracking-wider text-gray-400 block">Hourly target pace</span>
                    <span className="font-extrabold text-xs text-sky-500">{calculatedInterval.targetHourlyRate} ml/hr</span>
                  </div>
                </div>

                {/* Custom User interactives */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => {
                      addHydration(250);
                      setIsAlertOpen(false);
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-650 text-white font-black rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 group text-xs active:scale-98"
                  >
                    <span>Log Standard Cup (250ml)</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleTriggerSnooze(15)}
                      className="py-2 px-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-55 dark:hover:bg-gray-750 text-gray-650 dark:text-gray-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-98"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Snooze 15m
                    </button>
                    <button
                      onClick={() => handleTriggerSnooze(30)}
                      className="py-2 px-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-55 dark:hover:bg-gray-750 text-gray-650 dark:text-gray-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-98"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Snooze 30m
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      synth.playBubble();
                      setIsAlertOpen(false);
                    }}
                    className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors pt-1.5 block cursor-pointer"
                  >
                    Dismiss Reminder Quietly
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
