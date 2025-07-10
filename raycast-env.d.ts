/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Work Duration (minutes) - Duration of work intervals in minutes */
  "workDuration": string,
  /** Short Break Duration (minutes) - Duration of short breaks in minutes */
  "shortBreakDuration": string,
  /** Long Break Duration (minutes) - Duration of long breaks in minutes */
  "longBreakDuration": string,
  /** Long Break Interval - Number of work sessions before a long break */
  "longBreakInterval": string,
  /** Enable Audio Notifications - Play sound when timer completes */
  "enableNotifications": boolean,
  /** Auto-start Breaks - Automatically start break timers after work sessions */
  "autoStartBreaks": boolean,
  /** Auto-start Work - Automatically start work timers after breaks */
  "autoStartWork": boolean,
  /** Enable Application Tracking - Track which applications you use during work sessions */
  "enableApplicationTracking": boolean,
  /** Tracking Interval (seconds) - How often to check the active application (lower values are more accurate but use more resources) */
  "trackingInterval": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `main-command` command */
  export type MainCommand = ExtensionPreferences & {}
  /** Preferences accessible in the `timer-history` command */
  export type TimerHistory = ExtensionPreferences & {}
  /** Preferences accessible in the `menu-bar-timer` command */
  export type MenuBarTimer = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `main-command` command */
  export type MainCommand = {}
  /** Arguments passed to the `timer-history` command */
  export type TimerHistory = {}
  /** Arguments passed to the `menu-bar-timer` command */
  export type MenuBarTimer = {}
}

