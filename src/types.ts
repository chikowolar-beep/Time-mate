/**
 * TimeMate - SQLite Database-Ready Type System
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedAt: string;
}

export type RepeatType = 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
export type PriorityType = 'low' | 'medium' | 'high';

export interface TimetableEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location?: string;
  priority: PriorityType;
  colorCategory: string; // Tailwind class/color hex/preset name
  repeatType: RepeatType;
  reminderMinutesBefore: number; // 5, 10, 15, 30, 60, etc.
  completed: boolean;
}

export interface WaterReminderSetting {
  enabled: boolean;
  intervalMinutes: number; // 30, 60, 120, 180, etc.
  dailyGoalMl: number;
  currentIntakeMl: number;
}

export interface WaterLog {
  id: string;
  timestamp: string; // ISO String
  amountMl: number;
}

export interface FocusSession {
  id: string;
  timestamp: string; // ISO String
  workDurationMinutes: number;
  breakDurationMinutes: number;
  completed: boolean;
  type: '25-5' | '50-10' | '90-15' | 'custom';
}

export interface ScheduledCall {
  id: string;
  personName: string;
  phoneNumber: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
  status: 'upcoming' | 'completed' | 'missed';
}

export interface TimeMateNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO String
  type: 'event' | 'water' | 'focus' | 'call' | 'system';
  read: boolean;
}

export interface SystemSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  themeMode: 'light' | 'dark' | 'system';
  backupSynced: boolean;
  lastSyncTime?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

// Relational Schema Representation
export interface LocalDatabaseState {
  users: User[];
  events: TimetableEvent[];
  waterSettings: WaterReminderSetting;
  waterLogs: WaterLog[];
  focusSessions: FocusSession[];
  scheduledCalls: ScheduledCall[];
  notifications: TimeMateNotification[];
  settings: SystemSettings;
}
