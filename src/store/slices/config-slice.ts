import { StateCreator } from "zustand";
import { TimerConfig, PomodoroStore } from "../../types/timer";

/**
 * Default timer configuration with ADHD-friendly defaults
 */
export const DEFAULT_CONFIG: TimerConfig = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  enableNotifications: true,
  autoStartBreaks: false,
  autoStartWork: false,
  enableApplicationTracking: true,
  trackingInterval: 5,
  // ADHD-friendly defaults
  enableAdaptiveTimers: false,
  adaptiveMode: "energy-based",
  minWorkDuration: 10,
  maxWorkDuration: 60,
  adaptiveBreakRatio: 0.2,
  enableRewardSystem: true,
  enableTransitionWarnings: true,
  warningIntervals: [300, 120, 60], // 5min, 2min, 1min
  enableHyperfocusDetection: true,
  maxConsecutiveSessions: 3,
  forcedBreakAfterHours: 2.5,
};

/**
 * Configuration slice interface - defines config-related state and actions
 */
export interface ConfigSlice {
  // Configuration state
  config: TimerConfig;

  // Configuration actions
  updateConfig: (newConfig: Partial<TimerConfig>) => void;
  resetConfig: () => void;
  
  // Configuration utilities
  getWorkDuration: () => number;
  getShortBreakDuration: () => number;
  getLongBreakDuration: () => number;
  getLongBreakInterval: () => number;
  isNotificationsEnabled: () => boolean;
  isAutoStartBreaksEnabled: () => boolean;
  isAutoStartWorkEnabled: () => boolean;
  isApplicationTrackingEnabled: () => boolean;
  getTrackingInterval: () => number;
  
  // ADHD feature getters
  isAdaptiveTimersEnabled: () => boolean;
  getAdaptiveMode: () => "energy-based" | "focus-based" | "mood-based";
  getMinWorkDuration: () => number;
  getMaxWorkDuration: () => number;
  getAdaptiveBreakRatio: () => number;
  isRewardSystemEnabled: () => boolean;
  isTransitionWarningsEnabled: () => boolean;
  getWarningIntervals: () => number[];
  isHyperfocusDetectionEnabled: () => boolean;
  getMaxConsecutiveSessions: () => number;
  getForcedBreakAfterHours: () => number;
}

/**
 * Create configuration slice with all config-related functionality
 */
export const createConfigSlice: StateCreator<
  PomodoroStore,
  [],
  [],
  ConfigSlice
> = (set, get) => ({
  // Initial state
  config: DEFAULT_CONFIG,

  // Configuration actions
  updateConfig: (newConfig: Partial<TimerConfig>) => {
    const { config } = get();
    set({
      config: { ...config, ...newConfig },
    });
  },

  resetConfig: () => {
    set({
      config: DEFAULT_CONFIG,
    });
  },

  // Configuration utilities
  getWorkDuration: () => {
    return get().config.workDuration;
  },

  getShortBreakDuration: () => {
    return get().config.shortBreakDuration;
  },

  getLongBreakDuration: () => {
    return get().config.longBreakDuration;
  },

  getLongBreakInterval: () => {
    return get().config.longBreakInterval;
  },

  isNotificationsEnabled: () => {
    return get().config.enableNotifications;
  },

  isAutoStartBreaksEnabled: () => {
    return get().config.autoStartBreaks;
  },

  isAutoStartWorkEnabled: () => {
    return get().config.autoStartWork;
  },

  isApplicationTrackingEnabled: () => {
    return get().config.enableApplicationTracking;
  },

  getTrackingInterval: () => {
    return get().config.trackingInterval;
  },

  // ADHD feature getters
  isAdaptiveTimersEnabled: () => {
    return get().config.enableAdaptiveTimers;
  },

  getAdaptiveMode: () => {
    return get().config.adaptiveMode;
  },

  getMinWorkDuration: () => {
    return get().config.minWorkDuration;
  },

  getMaxWorkDuration: () => {
    return get().config.maxWorkDuration;
  },

  getAdaptiveBreakRatio: () => {
    return get().config.adaptiveBreakRatio;
  },

  isRewardSystemEnabled: () => {
    return get().config.enableRewardSystem;
  },

  isTransitionWarningsEnabled: () => {
    return get().config.enableTransitionWarnings;
  },

  getWarningIntervals: () => {
    return get().config.warningIntervals;
  },

  isHyperfocusDetectionEnabled: () => {
    return get().config.enableHyperfocusDetection;
  },

  getMaxConsecutiveSessions: () => {
    return get().config.maxConsecutiveSessions;
  },

  getForcedBreakAfterHours: () => {
    return get().config.forcedBreakAfterHours;
  },
});
