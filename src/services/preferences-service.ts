import { getPreferenceValues } from '@raycast/api'
import { TimerConfig } from '../types/timer'

export interface TimerPreset {
  id: string
  name: string
  description: string
  config: TimerConfig
}

export interface RaycastPreferences {
  workDuration: string
  shortBreakDuration: string
  longBreakDuration: string
  longBreakInterval: string
  enableNotifications: boolean
  autoStartBreaks: boolean
  autoStartWork: boolean
}

export class PreferencesService {
  private static instance: PreferencesService
  private presets: TimerPreset[] = []

  private constructor() {
    this.initializePresets()
  }

  public static getInstance(): PreferencesService {
    if (!PreferencesService.instance) {
      PreferencesService.instance = new PreferencesService()
    }
    return PreferencesService.instance
  }

  private initializePresets(): void {
    this.presets = [
      {
        id: 'classic',
        name: 'Classic Pomodoro',
        description: 'Traditional 25/5/15 minute intervals',
        config: {
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          longBreakInterval: 4,
          enableNotifications: true,
          autoStartBreaks: false,
          autoStartWork: false
        }
      },
      {
        id: 'extended',
        name: 'Extended Focus',
        description: 'Longer work sessions for deep work',
        config: {
          workDuration: 45,
          shortBreakDuration: 10,
          longBreakDuration: 30,
          longBreakInterval: 3,
          enableNotifications: true,
          autoStartBreaks: false,
          autoStartWork: false
        }
      },
      {
        id: 'short-burst',
        name: 'Short Bursts',
        description: 'Quick sessions for high-energy tasks',
        config: {
          workDuration: 15,
          shortBreakDuration: 3,
          longBreakDuration: 10,
          longBreakInterval: 5,
          enableNotifications: true,
          autoStartBreaks: true,
          autoStartWork: true
        }
      },
      {
        id: 'study-session',
        name: 'Study Session',
        description: 'Optimized for learning and retention',
        config: {
          workDuration: 30,
          shortBreakDuration: 5,
          longBreakDuration: 20,
          longBreakInterval: 3,
          enableNotifications: true,
          autoStartBreaks: false,
          autoStartWork: false
        }
      },
      {
        id: 'creative-flow',
        name: 'Creative Flow',
        description: 'Longer sessions with extended breaks for creativity',
        config: {
          workDuration: 90,
          shortBreakDuration: 15,
          longBreakDuration: 45,
          longBreakInterval: 2,
          enableNotifications: true,
          autoStartBreaks: false,
          autoStartWork: false
        }
      }
    ]
  }

  public getPresets(): TimerPreset[] {
    return [...this.presets]
  }

  public getPreset(id: string): TimerPreset | undefined {
    return this.presets.find(preset => preset.id === id)
  }

  public getCurrentConfig(): TimerConfig {
    try {
      const preferences: RaycastPreferences = getPreferenceValues()
      
      return {
        workDuration: this.parseIntWithDefault(preferences.workDuration, 25),
        shortBreakDuration: this.parseIntWithDefault(preferences.shortBreakDuration, 5),
        longBreakDuration: this.parseIntWithDefault(preferences.longBreakDuration, 15),
        longBreakInterval: this.parseIntWithDefault(preferences.longBreakInterval, 4),
        enableNotifications: preferences.enableNotifications ?? true,
        autoStartBreaks: preferences.autoStartBreaks ?? false,
        autoStartWork: preferences.autoStartWork ?? false
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
      return this.getPreset('classic')!.config
    }
  }

  private parseIntWithDefault(value: string, defaultValue: number): number {
    const parsed = parseInt(value, 10)
    return isNaN(parsed) || parsed <= 0 ? defaultValue : Math.min(parsed, 180) // Max 3 hours
  }

  public validateConfig(config: Partial<TimerConfig>): string[] {
    const errors: string[] = []

    if (config.workDuration !== undefined) {
      if (config.workDuration < 1 || config.workDuration > 180) {
        errors.push('Work duration must be between 1 and 180 minutes')
      }
    }

    if (config.shortBreakDuration !== undefined) {
      if (config.shortBreakDuration < 1 || config.shortBreakDuration > 60) {
        errors.push('Short break duration must be between 1 and 60 minutes')
      }
    }

    if (config.longBreakDuration !== undefined) {
      if (config.longBreakDuration < 1 || config.longBreakDuration > 120) {
        errors.push('Long break duration must be between 1 and 120 minutes')
      }
    }

    if (config.longBreakInterval !== undefined) {
      if (config.longBreakInterval < 1 || config.longBreakInterval > 10) {
        errors.push('Long break interval must be between 1 and 10 sessions')
      }
    }

    return errors
  }

  public getRecommendedPresetForUser(completedSessions: number, averageSessionLength: number): TimerPreset {
    // Recommend presets based on user behavior
    if (completedSessions < 5) {
      return this.getPreset('short-burst')! // Start with shorter sessions for beginners
    }

    if (averageSessionLength < 20) {
      return this.getPreset('classic')! // Standard Pomodoro for most users
    }

    if (averageSessionLength > 40) {
      return this.getPreset('extended')! // Extended sessions for experienced users
    }

    return this.getPreset('classic')!
  }

  public createCustomPreset(name: string, description: string, config: TimerConfig): TimerPreset {
    const customPreset: TimerPreset = {
      id: `custom-${Date.now()}`,
      name,
      description,
      config: { ...config }
    }

    // In a real implementation, you might want to persist custom presets
    // For now, we'll just return the preset without storing it
    return customPreset
  }

  public getConfigSummary(config: TimerConfig): string {
    return `${config.workDuration}min work, ${config.shortBreakDuration}min short break, ${config.longBreakDuration}min long break (every ${config.longBreakInterval} sessions)`
  }

  public getProductivityTips(config: TimerConfig): string[] {
    const tips: string[] = []

    if (config.workDuration >= 45) {
      tips.push('💡 Long work sessions are great for deep work, but make sure to take proper breaks')
    }

    if (config.workDuration <= 15) {
      tips.push('⚡ Short sessions help maintain high energy - perfect for tackling difficult tasks')
    }

    if (config.autoStartBreaks && config.autoStartWork) {
      tips.push('🔄 Auto-start mode keeps you in the flow - great for maintaining momentum')
    }

    if (!config.enableNotifications) {
      tips.push('🔕 Silent mode is active - remember to check your timer regularly')
    }

    if (config.longBreakInterval <= 2) {
      tips.push('🌴 Frequent long breaks help prevent burnout and maintain creativity')
    }

    return tips
  }
}

// Export singleton instance
export const preferencesService = PreferencesService.getInstance()
