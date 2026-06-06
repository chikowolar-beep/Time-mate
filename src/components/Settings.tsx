import { useState } from 'react';
import { Settings, Shield, Bell, Cloud, Trash, Moon, Sun, Info, Check, RefreshCw } from 'lucide-react';
import { SystemSettings } from '../types';
import { synth } from '../utils/synth';

interface SettingsProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
  onResetDatabase: () => void;
}

export default function SettingsComponent({
  settings,
  onUpdateSettings,
  onResetDatabase
}: SettingsProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; syncId: string; timestamp: string } | null>(null);

  const toggleSound = () => {
    synth.playBubble();
    onUpdateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const toggleVibration = () => {
    synth.playBubble();
    onUpdateSettings({ vibrationEnabled: !settings.vibrationEnabled });
  };

  const toggleNotifications = () => {
    synth.playBubble();
    onUpdateSettings({ notificationsEnabled: !settings.notificationsEnabled });
  };

  const changeTheme = (theme: 'light' | 'dark' | 'system') => {
    synth.playBubble();
    onUpdateSettings({ themeMode: theme });
  };

  const executeBackupSync = async () => {
    synth.playBubble();
    setSyncing(true);
    setSyncResult(null);

    try {
      // Gather current localStorage state representing the sqlite schema representation
      const databaseSchema = {
        timetable_events: localStorage.getItem('timemate_events'),
        water_settings: localStorage.getItem('timemate_water_settings'),
        water_logs: localStorage.getItem('timemate_water_logs'),
        focus_sessions: localStorage.getItem('timemate_focus_sessions'),
        calls: localStorage.getItem('timemate_calls'),
        profile: localStorage.getItem('timemate_profile')
      };

      // Perform a genuine, non-mocked post submission to our full-stack server backend endpoint!
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: databaseSchema })
      });

      if (!res.ok) throw new Error("Sync failed");
      const transaction = await res.json();

      synth.playSuccess();
      setSyncResult({
        success: true,
        syncId: transaction.syncId,
        timestamp: new Date(transaction.timestamp).toLocaleTimeString()
      });

      onUpdateSettings({
        backupSynced: true,
        lastSyncTime: transaction.timestamp
      });
    } catch (e) {
      console.error(e);
      setSyncResult({
        success: false,
        syncId: 'FAIL_ERR',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Settings configuration container header */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-105 dark:border-gray-750 shadow-sm">
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-505 text-indigo-500" /> Companion Configuration & Settings
        </h2>
        <p className="text-xs text-gray-400 font-medium">Control alarms levels, sound cues, backups and dark modes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Alerts and sounds preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-105 dark:border-gray-750 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-gray-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-50 dark:border-gray-750 pb-2.5">
            <Bell className="w-4 h-4 text-emerald-500" /> Notifications & Sound
          </h3>

          <div className="space-y-4">
            
            {/* Enable alarms */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">System Audio Alerts</p>
                <p className="text-[10px] text-gray-400 leading-tight">Enable synthetic tone cues for Pomodoro expired rings and alarms</p>
              </div>
              
              <button
                id="toggle-sound-settings"
                onClick={toggleSound}
                className={`w-11 h-6 rounded-full transition-all flex items-center p-0.5 focus:outline-none ${
                  settings.soundEnabled ? 'bg-indigo-650 justify-end' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
              </button>
            </div>

            {/* Haptic bips */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Device Vibration Cues</p>
                <p className="text-[10px] text-gray-400">Trigger short vibrational pulses on event alarms (where supported)</p>
              </div>
              
              <button
                id="toggle-vibrate"
                onClick={toggleVibration}
                className={`w-11 h-6 rounded-full transition-all flex items-center p-0.5 focus:outline-none ${
                  settings.vibrationEnabled ? 'bg-indigo-650 justify-end' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
              </button>
            </div>

            {/* Notifications enabled */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Visual Desktop Notifications</p>
                <p className="text-[10px] text-gray-400">Display micro alerts and notification timeline registers</p>
              </div>
              
              <button
                id="toggle-alerts-vis"
                onClick={toggleNotifications}
                className={`w-11 h-6 rounded-full transition-all flex items-center p-0.5 focus:outline-none ${
                  settings.notificationsEnabled ? 'bg-indigo-650 justify-end' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
              </button>
            </div>

          </div>
        </div>

        {/* Visual Styles and Themes */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-105 dark:border-gray-750 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-50 dark:border-gray-750 pb-2.5">
            <Sun className="w-4 h-4 text-amber-500" /> Aesthetic Theme Selection
          </h3>

          <p className="text-xs text-gray-400 leading-normal">TimeMate uses Material Design 3 guidelines. Choose the dark tone or light scheme.</p>
          
          <div className="grid grid-cols-3 gap-2.5 pt-1.5">
            {[
              { id: 'light', icon: <Sun className="w-4 h-4" />, label: 'Light' },
              { id: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Dark' },
              { id: 'system', icon: <Settings className="w-4 h-4" />, label: 'System' }
            ].map(thm => (
              <button
                key={thm.id}
                onClick={() => changeTheme(thm.id as any)}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all outline-none ${
                  settings.themeMode === thm.id
                    ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 dark:bg-indigo-955/20 dark:text-indigo-400'
                    : 'border-gray-100 dark:border-gray-750 text-gray-500 hover:bg-gray-55 dark:hover:bg-gray-850'
                }`}
              >
                {thm.icon}
                <span>{thm.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Backup and Cloud synching database configurations */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-105 dark:border-gray-750 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-gray-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-50 dark:border-gray-750 pb-2.5">
            <Cloud className="w-4 h-4 text-indigo-500" /> Firebase Account Sync & Backup
          </h3>

          <div className="space-y-4">
            <div className="p-3.5 bg-gray-55 dark:bg-gray-850 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex items-start gap-3">
              <Shield className="w-8 h-8 text-indigo-500 flex-shrink-0 animate-pulse" />
              <div>
                <p className="text-xs font-black text-gray-800 dark:text-gray-200 leading-none">Durable Backup Architecture</p>
                <p className="text-[10px] text-gray-400 mt-1 leading-normal">Backups will sync your timetable, scheduled calls, focus counts and hydration indices directly to cloud storage secure databases.</p>
              </div>
            </div>

            {/* Sync trigger button */}
            <button
              onClick={executeBackupSync}
              disabled={syncing}
              className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? "Initiating backup session..." : "Perform Backup Now"}</span>
            </button>

            {/* Sync transactions feedback records */}
            {syncResult && (
              <div className={`p-3 rounded-2xl text-xs font-bold border ${
                syncResult.success 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-955/20 dark:text-emerald-450 dark:border-emerald-900' 
                  : 'bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-955/20 dark:text-rose-400'
              }`}>
                {syncResult.success ? (
                  <div className="space-y-1.5 text-center">
                    <p className="flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Cloud sync transaction completed!</p>
                    <p className="text-[10px] opacity-75 font-mono">Sync Identifier: {syncResult.syncId} • Time: {syncResult.timestamp}</p>
                  </div>
                ) : (
                  <p className="text-center">Cloud backup transaction interrupted. Please check network logs and retry.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Database administration reset controls */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-105 dark:border-gray-750 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-50 dark:border-gray-750 pb-2.5">
            <Trash className="w-4 h-4 text-rose-500" /> Factory Database resets
          </h3>

          <p className="text-xs text-gray-400 leading-normal">Completely drop all SQLite-stored companion metadata logs, profiles and scheduled events. This reset is irreversible.</p>
          
          <button
            onClick={() => {
              if (confirm("Verify Factory reset? This operation completely wipes your timetable calendars, water tracks, scheduled calls and metadata logs.")) {
                synth.playBubble();
                onResetDatabase();
              }
            }}
            className="w-full py-3 border border-rose-100 dark:border-rose-950 text-rose-550 dark:text-rose-450 rounded-2xl text-xs font-bold transition-all hover:bg-rose-50/50 dark:hover:bg-rose-955/20"
          >
            Wipe Local database Schema
          </button>
        </div>

      </div>

    </div>
  );
}
