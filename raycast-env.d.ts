/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

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

