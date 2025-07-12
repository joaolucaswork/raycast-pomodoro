/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Work Duration - Duration of work sessions in minutes */
  "workDuration": string,
  /** Short Break Duration - Duration of short breaks in minutes */
  "shortBreakDuration": string,
  /** Long Break Duration - Duration of long breaks in minutes */
  "longBreakDuration": string,
  /** Long Break Interval - Number of work sessions before a long break */
  "longBreakInterval": string,
  /** Enable Notifications - Show system notifications for timer events */
  "enableNotifications": boolean,
  /** Auto-start Breaks - Automatically start break sessions after work sessions */
  "autoStartBreaks": boolean,
  /** Auto-start Work Sessions - Automatically start work sessions after breaks */
  "autoStartWork": boolean,
  /** Enable Application Tracking - Track active applications during focus sessions */
  "enableApplicationTracking": boolean,
  /** Tracking Interval - How often to check active application (in seconds) */
  "trackingInterval": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `main-command` command */
  export type MainCommand = ExtensionPreferences & {}
  /** Preferences accessible in the `timer-history` command */
  export type TimerHistory = ExtensionPreferences & {}
  /** Preferences accessible in the `profile-command` command */
  export type ProfileCommand = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `main-command` command */
  export type MainCommand = {}
  /** Arguments passed to the `timer-history` command */
  export type TimerHistory = {}
  /** Arguments passed to the `profile-command` command */
  export type ProfileCommand = {}
}

