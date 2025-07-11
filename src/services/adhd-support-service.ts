import { Icon } from "@raycast/api";
import {
  Achievement,
  Challenge,
  BreakActivity,
  RewardSystem,
  HyperfocusDetection,
} from "../types/timer";
import { isToday, isThisWeek, startOfDay, differenceInHours } from "date-fns";

/**
 * ADHD Support Service
 *
 * Provides specialized functionality for ADHD users including:
 * - Adaptive timer calculations
 * - Reward system management
 * - Break activity suggestions
 * - Hyperfocus detection
 * - Achievement tracking
 */
export class ADHDSupportService {
  private static instance: ADHDSupportService;

  private constructor() {}

  public static getInstance(): ADHDSupportService {
    if (!ADHDSupportService.instance) {
      ADHDSupportService.instance = new ADHDSupportService();
    }
    return ADHDSupportService.instance;
  }

  // Adaptive Timer Logic
  public calculateAdaptiveDuration(
    baseDuration: number,
    energyLevel: 1 | 2 | 3 | 4 | 5,
    moodState: "motivated" | "neutral" | "struggling" | "hyperfocus",
    mode: "energy-based" | "focus-based" | "mood-based",
    minDuration: number,
    maxDuration: number
  ): { duration: number; reason: string } {
    let multiplier = 1;
    let reason = "Standard duration";

    switch (mode) {
      case "energy-based":
        if (energyLevel <= 2) {
          multiplier = 0.6; // 40% shorter for low energy
          reason = "Shortened for low energy level";
        } else if (energyLevel >= 4) {
          multiplier = 1.4; // 40% longer for high energy
          reason = "Extended for high energy level";
        }
        break;

      case "mood-based":
        switch (moodState) {
          case "struggling":
            multiplier = 0.5; // 50% shorter when struggling
            reason = "Shortened due to difficulty focusing";
            break;
          case "hyperfocus":
            multiplier = 1.8; // 80% longer for hyperfocus
            reason = "Extended to support hyperfocus state";
            break;
          case "motivated":
            multiplier = 1.2; // 20% longer when motivated
            reason = "Extended for high motivation";
            break;
        }
        break;

      case "focus-based":
        // This would use historical focus quality data
        // For now, use energy as a proxy
        if (energyLevel <= 2) {
          multiplier = 0.7;
          reason = "Shortened based on focus patterns";
        } else if (energyLevel >= 4) {
          multiplier = 1.3;
          reason = "Extended based on focus patterns";
        }
        break;
    }

    const adaptedDuration = Math.round(baseDuration * multiplier);
    const clampedDuration = Math.max(
      minDuration,
      Math.min(maxDuration, adaptedDuration)
    );

    return {
      duration: clampedDuration,
      reason:
        clampedDuration !== adaptedDuration
          ? `${reason} (clamped to limits)`
          : reason,
    };
  }

  // Reward System
  public calculateSessionPoints(
    duration: number,
    completed: boolean,
    energyLevel?: number,
    moodState?: string
  ): number {
    let basePoints = 10; // Base points for starting

    if (completed) {
      basePoints += Math.round(duration / 60) * 2; // 2 points per minute completed

      // Bonus points for challenging conditions
      if (energyLevel && energyLevel <= 2) {
        basePoints += 20; // Bonus for completing despite low energy
      }
      if (moodState === "struggling") {
        basePoints += 30; // Extra bonus for completing when struggling
      }
    }

    return basePoints;
  }

  public calculateLevel(totalPoints: number): number {
    // Level progression: 100, 250, 450, 700, 1000, 1350, 1750, etc.
    // Formula: level = floor(sqrt(points / 50))
    return Math.floor(Math.sqrt(totalPoints / 50)) + 1;
  }

  public getPointsForNextLevel(currentPoints: number): number {
    const currentLevel = this.calculateLevel(currentPoints);
    const nextLevelPoints = Math.pow(currentLevel, 2) * 50;
    return nextLevelPoints - currentPoints;
  }

  // Achievement System
  public getDefaultAchievements(): Achievement[] {
    return [
      {
        id: "first-timer",
        name: "First Timer",
        description: "Complete your first focus session",
        icon: Icon.Play,
        rarity: "common",
        points: 50,
      },
      {
        id: "energy-warrior",
        name: "Energy Warrior",
        description: "Complete a session with low energy (≤2)",
        icon: Icon.Bolt,
        rarity: "rare",
        points: 100,
      },
      {
        id: "struggle-champion",
        name: "Struggle Champion",
        description: "Complete 5 sessions while struggling",
        icon: Icon.Trophy,
        rarity: "epic",
        points: 200,
      },
      {
        id: "hyperfocus-master",
        name: "Hyperfocus Master",
        description: "Complete 3 consecutive extended sessions",
        icon: Icon.BullsEye,
        rarity: "legendary",
        points: 300,
      },
      {
        id: "consistency-king",
        name: "Consistency King",
        description: "Complete sessions for 7 consecutive days",
        icon: Icon.Calendar,
        rarity: "epic",
        points: 250,
      },
      {
        id: "marathon-runner",
        name: "Marathon Runner",
        description: "Complete 4+ hours of focus time in one day",
        icon: Icon.Clock,
        rarity: "rare",
        points: 150,
      },
    ];
  }

  public checkAchievements(
    history: any[],
    rewardSystem: RewardSystem
  ): Achievement[] {
    const newAchievements: Achievement[] = [];
    const unlockedIds = rewardSystem.achievements.map((a) => a.id);
    const defaultAchievements = this.getDefaultAchievements();

    // Check each achievement
    for (const achievement of defaultAchievements) {
      if (unlockedIds.includes(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.id) {
        case "first-timer":
          shouldUnlock = history.some((s) => s.completed);
          break;

        case "energy-warrior":
          shouldUnlock = history.some(
            (s) => s.completed && s.energyLevel && s.energyLevel <= 2
          );
          break;

        case "struggle-champion":
          const strugglingCompletions = history.filter(
            (s) => s.completed && s.moodState === "struggling"
          ).length;
          shouldUnlock = strugglingCompletions >= 5;
          break;

        case "hyperfocus-master":
          // Check for 3 consecutive sessions with extended duration
          let consecutiveExtended = 0;
          let maxConsecutive = 0;
          for (const session of history.slice().reverse()) {
            if (
              session.completed &&
              session.adaptiveAdjustments?.adjustedDuration >
                session.adaptiveAdjustments?.originalDuration
            ) {
              consecutiveExtended++;
              maxConsecutive = Math.max(maxConsecutive, consecutiveExtended);
            } else {
              consecutiveExtended = 0;
            }
          }
          shouldUnlock = maxConsecutive >= 3;
          break;

        case "consistency-king":
          // Check for 7 consecutive days with completed sessions
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return startOfDay(date);
          });

          shouldUnlock = last7Days.every((day) =>
            history.some(
              (s) =>
                s.completed &&
                startOfDay(new Date(s.startTime)).getTime() === day.getTime()
            )
          );
          break;

        case "marathon-runner":
          const today = startOfDay(new Date());
          const todaysSessions = history.filter(
            (s) =>
              s.completed &&
              startOfDay(new Date(s.startTime)).getTime() === today.getTime()
          );
          const totalTodayTime = todaysSessions.reduce(
            (sum, s) => sum + s.duration,
            0
          );
          shouldUnlock = totalTodayTime >= 4 * 60 * 60; // 4 hours in seconds
          break;
      }

      if (shouldUnlock) {
        newAchievements.push({
          ...achievement,
          unlockedAt: new Date(),
        });
      }
    }

    return newAchievements;
  }

  // Break Activities
  public getDefaultBreakActivities(): BreakActivity[] {
    return [
      {
        id: "desk-stretches",
        name: "5-Minute Desk Stretches",
        duration: 300,
        type: "movement",
        instructions: [
          "Stand up and stretch your arms overhead",
          "Roll your shoulders backward 5 times",
          "Gently turn your head left and right",
          "Touch your toes or reach toward the floor",
          "Take 5 deep breaths",
        ],
        icon: Icon.Person,
        adhdBenefit: "Increases blood flow and reduces restlessness",
        difficulty: "easy",
      },
      {
        id: "box-breathing",
        name: "Box Breathing",
        duration: 240,
        type: "mindfulness",
        instructions: [
          "Sit comfortably with your back straight",
          "Inhale for 4 counts",
          "Hold your breath for 4 counts",
          "Exhale for 4 counts",
          "Hold empty for 4 counts",
          "Repeat this cycle 6 times",
        ],
        icon: Icon.Wind,
        adhdBenefit: "Calms the nervous system and improves focus",
        difficulty: "easy",
      },
      {
        id: "sensory-reset",
        name: "Sensory Reset",
        duration: 180,
        type: "sensory",
        instructions: [
          "Run cold water over your wrists",
          "Look out a window at something far away",
          "Listen to a calming sound for 1 minute",
          "Feel different textures (smooth, rough, soft)",
          "Take 3 deep breaths focusing on the sensation",
        ],
        icon: Icon.Eye,
        adhdBenefit: "Resets sensory processing and reduces overwhelm",
        difficulty: "easy",
      },
      {
        id: "brain-dump",
        name: "Quick Brain Dump",
        duration: 300,
        type: "cognitive",
        instructions: [
          "Get a piece of paper or open a note app",
          "Write down everything on your mind for 3 minutes",
          "Don't worry about organization or grammar",
          "Include worries, tasks, random thoughts",
          "Close the note and take a deep breath",
        ],
        icon: Icon.Document,
        adhdBenefit: "Clears mental clutter and reduces anxiety",
        difficulty: "medium",
      },
    ];
  }

  public suggestBreakActivity(
    energyLevel?: number,
    moodState?: string,
    sessionDuration?: number
  ): BreakActivity {
    const activities = this.getDefaultBreakActivities();

    // Filter based on current state
    let suitableActivities = activities;

    if (energyLevel && energyLevel <= 2) {
      // Low energy - prefer gentle activities
      suitableActivities = activities.filter(
        (a) => a.type === "mindfulness" || a.type === "sensory"
      );
    } else if (energyLevel && energyLevel >= 4) {
      // High energy - prefer movement
      suitableActivities = activities.filter(
        (a) => a.type === "movement" || a.type === "cognitive"
      );
    }

    if (moodState === "struggling") {
      // When struggling, prefer calming activities
      suitableActivities = suitableActivities.filter(
        (a) => a.type === "mindfulness" || a.type === "sensory"
      );
    }

    // Return random suitable activity or fallback to first activity
    return suitableActivities.length > 0
      ? suitableActivities[
          Math.floor(Math.random() * suitableActivities.length)
        ]
      : activities[0];
  }

  // Hyperfocus Detection
  public detectHyperfocus(
    consecutiveSessions: number,
    totalFocusTime: number,
    lastBreakTime?: Date,
    maxConsecutive: number = 3,
    maxHours: number = 2.5
  ): { detected: boolean; reason: string; recommendation: string } {
    const now = new Date();
    const hoursSinceLastBreak = lastBreakTime
      ? differenceInHours(now, lastBreakTime)
      : totalFocusTime / 3600;

    if (consecutiveSessions >= maxConsecutive) {
      return {
        detected: true,
        reason: `${consecutiveSessions} consecutive sessions completed`,
        recommendation: "Take a 15-minute break to prevent burnout",
      };
    }

    if (hoursSinceLastBreak >= maxHours) {
      return {
        detected: true,
        reason: `${Math.round(hoursSinceLastBreak * 10) / 10} hours of continuous focus`,
        recommendation: "Take a longer break and hydrate",
      };
    }

    return {
      detected: false,
      reason: "Normal focus pattern",
      recommendation: "",
    };
  }
}

// Export singleton instance
export const adhdSupportService = ADHDSupportService.getInstance();
