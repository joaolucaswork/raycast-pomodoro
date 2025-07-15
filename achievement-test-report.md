# Achievement System Test Report

Generated: 2025-07-15T01:34:39.549Z

## Summary

- **Total Tests**: 55
- **Passed**: 0 ✅
- **Failed**: 55 ❌
- **Skipped**: 0 ⏭️
- **Success Rate**: 0.0%

## Failed Tests

### boxing-achievement-service.test.ts

1. **BoxingAchievementService › Achievement Definitions › should return a valid list of boxing achievements**
```
expect(received).toContain(expected) // indexOf
    Expected value: "knockout_streaks"
    Received array: ["training_milestones", "streak_achievements", "time_achievements", "special_achievements", "mood_achievements"]
    [0m [90m 56 |[39m     [32m"special_achievements"[39m[33m,[39m
     [90m 57 |[39m     [32m"mood_achievements"[39m[33m,[39m
    [31m[1m>[22m[39m[90m 58 |[39m   ])[33m.[39mtoContain(achievement[33m.[39mcategory)[33m;[39m
     [90m    |[39m      [31m[1m^[22m[39m
     [90m 59 |[39m }
     [90m 60 |[39m
     [90m 61 |[39m [90m/**[39m[0m
      at expectValidAchievementStructure (src/tests/utils/achievement-test-helpers.ts:58:6)
      at src/tests/boxing-achievement-service.test.ts:61:40
          at Array.forEach (<anonymous>)
      at Object.<anonymous> (src/tests/boxing-achievement-service.test.ts:60:20)
```

2. **BoxingAchievementService › Boxing Progress Calculation › should calculate streak correctly for consecutive sessions**
```
expect(received).toBe(expected) // Object.is equality
    Expected: 5
    Received: 2
    [0m [90m 151 |[39m       )[33m;[39m
     [90m 152 |[39m
    [31m[1m>[22m[39m[90m 153 |[39m       expect(progress[33m.[39mcurrentStreak)[33m.[39mtoBe([35m5[39m)[33m;[39m
     [90m     |[39m                                      [31m[1m^[22m[39m
     [90m 154 |[39m       expect(progress[33m.[39mlongestStreak)[33m.[39mtoBe([35m5[39m)[33m;[39m
     [90m 155 |[39m     })[33m;[39m
     [90m 156 |[39m[0m
      at Object.<anonymous> (src/tests/boxing-achievement-service.test.ts:153:38)
```

3. **BoxingAchievementService › Boxing Progress Calculation › should handle broken streaks correctly**
```
expect(received).toBe(expected) // Object.is equality
    Expected: 3
    Received: 5
    [0m [90m 177 |[39m
     [90m 178 |[39m       expect(progress[33m.[39mcurrentStreak)[33m.[39mtoBe([35m2[39m)[33m;[39m [90m// Current streak after break[39m
    [31m[1m>[22m[39m[90m 179 |[39m       expect(progress[33m.[39mlongestStreak)[33m.[39mtoBe([35m3[39m)[33m;[39m [90m// Best streak before break[39m
     [90m     |[39m                                      [31m[1m^[22m[39m
     [90m 180 |[39m     })[33m;[39m
     [90m 181 |[39m
     [90m 182 |[39m     it([32m"should calculate time-based statistics correctly"[39m[33m,[39m () [33m=>[39m {[0m
      at Object.<anonymous> (src/tests/boxing-achievement-service.test.ts:179:38)
```

4. **BoxingAchievementService › Achievement Requirement Checking › should check total_time requirement correctly**
```
expect(received).toBe(expected) // Object.is equality
    Expected: true
    Received: false
    [0m [90m 264 |[39m       )[33m;[39m
     [90m 265 |[39m
    [31m[1m>[22m[39m[90m 266 |[39m       expect(newAchievements[33m.[39msome((a) [33m=>[39m a[33m.[39mid [33m===[39m achievement[33m.[39mid))[33m.[39mtoBe([36mtrue[39m)[33m;[39m
     [90m     |[39m                                                                    [31m[1m^[22m[39m
     [90m 267 |[39m     })[33m;[39m
     [90m 268 |[39m
     [90m 269 |[39m     it([32m"should check daily timeframe requirement correctly"[39m[33m,[39m () [33m=>[39m {[0m
      at Object.<anonymous> (src/tests/boxing-achievement-service.test.ts:266:68)
```

5. **BoxingAchievementService › Achievement Requirement Checking › should check daily timeframe requirement correctly**
```
expect(received).toBe(expected) // Object.is equality
    Expected: true
    Received: false
    [0m [90m 278 |[39m       )[33m;[39m
     [90m 279 |[39m
    [31m[1m>[22m[39m[90m 280 |[39m       expect(newAchievements[33m.[39msome((a) [33m=>[39m a[33m.[39mid [33m===[39m achievement[33m.[39mid))[33m.[39mtoBe([36mtrue[39m)[33m;[39m
     [90m     |[39m                                                                    [31m[1m^[22m[39m
     [90m 281 |[39m     })[33m;[39m
     [90m 282 |[39m
     [90m 283 |[39m     it([32m"should not unlock achievements when requirements are not met"[39m[33m,[39m () [33m=>[39m {[0m
      at Object.<anonymous> (src/tests/boxing-achievement-service.test.ts:280:68)
```

6. **BoxingAchievementService › Achievement Requirement Checking › should not unlock achievements when requirements are not met**
```
expect(received).toBe(expected) // Object.is equality
    Expected: false
    Received: true
    [0m [90m 292 |[39m       )[33m;[39m
     [90m 293 |[39m
    [31m[1m>[22m[39m[90m 294 |[39m       expect(newAchievements[33m.[39msome((a) [33m=>[39m a[33m.[39mid [33m===[39m achievement[33m.[39mid))[33m.[39mtoBe([36mfalse[39m)[33m;[39m
     [90m     |[39m                                                                    [31m[1m^[22m[39m
     [90m 295 |[39m     })[33m;[39m
     [90m 296 |[39m
     [90m 297 |[39m     it([32m"should handle complex multi-requirement achievements"[39m[33m,[39m () [33m=>[39m {[0m
      at Object.<anonymous> (src/tests/boxing-achievement-service.test.ts:294:68)
```

7. **BoxingAchievementService › Achievement Requirement Checking › should handle complex multi-requirement achievements**
```
expect(received).toBe(expected) // Object.is equality
    Expected: true
    Received: false
    [0m [90m 310 |[39m       )[33m;[39m
     [90m 311 |[39m
    [31m[1m>[22m[39m[90m 312 |[39m       expect(newAchievements[33m.[39msome((a) [33m=>[39m a[33m.[39mid [33m===[39m achievement[33m.[39mid))[33m.[39mtoBe([36mtrue[39m)[33m;[39m
     [90m     |[39m                                                                    [31m[1m^[22m[39m
     [90m 313 |[39m     })[33m;[39m
     [90m 314 |[39m
     [90m 315 |[39m     it([32m"should not unlock multi-requirement achievements when only some requirements are met"[39m[33m,[39m () [33m=>[39m {[0m
      at Object.<anonymous> (src/tests/boxing-achievement-service.test.ts:312:68)
```

8. **BoxingAchievementService › Edge Cases and Boundary Conditions › should handle rapid session completions**
```
expect(received).toBe(expected) // Object.is equality
    Expected: 600
    Received: 15000
    [0m [90m 461 |[39m       )[33m;[39m
     [90m 462 |[39m       expect(progress[33m.[39mtotalRounds)[33m.[39mtoBe([35m10[39m)[33m;[39m
    [31m[1m>[22m[39m[90m 463 |[39m       expect(progress[33m.[39mtotalTrainingTime)[33m.[39mtoBe([35m600[39m)[33m;[39m [90m// 10 minutes total[39m
     [90m     |[39m                                          [31m[1m^[22m[39m
     [90m 464 |[39m     })[33m;[39m
     [90m 465 |[39m
     [90m 466 |[39m     it([32m"should handle empty achievement requirements gracefully"[39m[33m,[39m () [33m=>[39m {[0m
      at Object.<anonymous> (src/tests/boxing-achievement-service.test.ts:463:42)
Test Suites: 1 failed, 1 total
Tests:       8 failed, 25 passed, 33 total
Snapshots:   0 total
Time:        0.82 s, estimated 2 s
Ran all test suites matching src/tests/boxing-achievement-service.test.ts.
```

### achievement-store-integration.test.ts

1. **Achievement Store Integration › Initial State › should initialize with default reward system**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

2. **Achievement Store Integration › Initial State › should initialize with default boxing progress**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

3. **Achievement Store Integration › Initial State › should initialize hyperfocus detection**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

4. **Achievement Store Integration › Points System Integration › should award points and update level**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

5. **Achievement Store Integration › Points System Integration › should accumulate points from multiple awards**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

6. **Achievement Store Integration › Points System Integration › should handle zero and negative point awards gracefully**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

7. **Achievement Store Integration › Achievement Unlocking › should unlock achievement by ID**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

8. **Achievement Store Integration › Achievement Unlocking › should not unlock the same achievement twice**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

9. **Achievement Store Integration › Achievement Unlocking › should handle unlocking non-existent achievement**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

10. **Achievement Store Integration › Boxing Progress Updates › should update boxing progress from session history**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

11. **Achievement Store Integration › Boxing Progress Updates › should check for new achievements when updating boxing progress**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

12. **Achievement Store Integration › Boxing Progress Updates › should show notifications for new achievements**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

13. **Achievement Store Integration › Reward System Management › should reset reward system to defaults**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

14. **Achievement Store Integration › Reward System Management › should update daily goal**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

15. **Achievement Store Integration › Reward System Management › should handle invalid daily goal values**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

16. **Achievement Store Integration › Hyperfocus Detection › should check hyperfocus status**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

17. **Achievement Store Integration › Hyperfocus Detection › should reset hyperfocus warning**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

18. **Achievement Store Integration › Hyperfocus Detection › should update hyperfocus detection settings**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

19. **Achievement Store Integration › Break Activities Management › should initialize with default break activities**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

20. **Achievement Store Integration › Break Activities Management › should set current break activity**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

21. **Achievement Store Integration › Break Activities Management › should clear current break activity**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

22. **Achievement Store Integration › Boxing Achievement Methods › should get boxing achievements**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

23. **Achievement Store Integration › Boxing Achievement Methods › should get achievement stats**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

24. **Achievement Store Integration › Boxing Achievement Methods › should get boxing level**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
```

25. **Achievement Store Integration › Boxing Achievement Methods › should get next boxing level**
```
TypeError: adhd_support_service_1.adhdSupportService.getDefaultBreakActivities is not a function
    [0m [90m 140 |[39m   rewardSystem[33m:[39m [33mDEFAULT_REWARD_SYSTEM[39m[33m,[39m
     [90m 141 |[39m   hyperfocusDetection[33m:[39m [33mDEFAULT_HYPERFOCUS_DETECTION[39m[33m,[39m
    [31m[1m>[22m[39m[90m 142 |[39m   breakActivities[33m:[39m adhdSupportService[33m.[39mgetDefaultBreakActivities()[33m,[39m
     [90m     |[39m                                       [31m[1m^[22m[39m
     [90m 143 |[39m   currentBreakActivity[33m:[39m undefined[33m,[39m
     [90m 144 |[39m   boxingProgress[33m:[39m [33mDEFAULT_BOXING_PROGRESS[39m[33m,[39m
     [90m 145 |[39m[0m
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-store-integration.test.ts:53:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-store-integration.test.ts:51:16)
      at Object.<anonymous> (src/tests/achievement-store-integration.test.ts:62:13)
Test Suites: 1 failed, 1 total
Tests:       25 failed, 25 total
Snapshots:   0 total
Time:        0.837 s, estimated 2 s
Ran all test suites matching src/tests/achievement-store-integration.test.ts.
```

### achievement-data-persistence.test.ts

1. **Test suite failed to run**
```
ReferenceError: Cannot access 'mockLocalStorage' before initialization
    [0m [90m 28 |[39m
     [90m 29 |[39m jest[33m.[39mmock([32m"@raycast/api"[39m[33m,[39m () [33m=>[39m ({
    [31m[1m>[22m[39m[90m 30 |[39m   [33mLocalStorage[39m[33m:[39m mockLocalStorage[33m,[39m
     [90m    |[39m                 [31m[1m^[22m[39m
     [90m 31 |[39m }))[33m;[39m
     [90m 32 |[39m
     [90m 33 |[39m [90m// Storage keys (should match actual implementation)[39m[0m
      at src/tests/achievement-data-persistence.test.ts:30:17
      at Object.<anonymous> (src/tests/achievement-data-persistence.test.ts:8:1)
Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        0.52 s
Ran all test suites matching src/tests/achievement-data-persistence.test.ts.
```

### achievement-edge-cases.test.ts

1. **Achievement Edge Cases and Boundary Conditions › Achievement Requirement Edge Cases › should handle achievements at exact requirement thresholds**
```
expect(received).toBe(expected) // Object.is equality
    Expected: true
    Received: false
    [0m [90m 259 |[39m
     [90m 260 |[39m       [90m// Should unlock since all requirements are exactly met[39m
    [31m[1m>[22m[39m[90m 261 |[39m       expect(newAchievements[33m.[39msome(a [33m=>[39m a[33m.[39mid [33m===[39m thresholdAchievement[33m.[39mid))[33m.[39mtoBe([36mtrue[39m)[33m;[39m
     [90m     |[39m                                                                           [31m[1m^[22m[39m
     [90m 262 |[39m     })[33m;[39m
     [90m 263 |[39m
     [90m 264 |[39m     it([32m"should handle achievements just below thresholds"[39m[33m,[39m () [33m=>[39m {[0m
      at Object.<anonymous> (src/tests/achievement-edge-cases.test.ts:261:75)
```

2. **Achievement Edge Cases and Boundary Conditions › Data Integrity Edge Cases › should handle extreme numeric values**
```
expect(received).toBeLessThanOrEqual(expected)
    Expected: <= 0
    Received:    9007199254740991
    [0m [90m 89 |[39m
     [90m 90 |[39m   [90m// Logical constraints[39m
    [31m[1m>[22m[39m[90m 91 |[39m   expect(progress[33m.[39mcurrentStreak)[33m.[39mtoBeLessThanOrEqual(progress[33m.[39mlongestStreak)[33m;[39m
     [90m    |[39m                                  [31m[1m^[22m[39m
     [90m 92 |[39m   expect(progress[33m.[39mmoodEntriesWithNotes)[33m.[39mtoBeLessThanOrEqual(
     [90m 93 |[39m     progress[33m.[39mtotalMoodEntries
     [90m 94 |[39m   )[33m;[39m[0m
      at expectValidBoxingProgressStructure (src/tests/utils/achievement-test-helpers.ts:91:34)
      at Object.<anonymous> (src/tests/achievement-edge-cases.test.ts:388:41)
Test Suites: 1 failed, 1 total
Tests:       2 failed, 23 passed, 25 total
Snapshots:   0 total
Time:        0.804 s, estimated 2 s
Ran all test suites matching src/tests/achievement-edge-cases.test.ts.
```

### achievement-session-integration.test.ts

1. **Achievement Integration with Session System › Session Completion and Achievement Updates › should update boxing progress when session is completed**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

2. **Achievement Integration with Session System › Session Completion and Achievement Updates › should check for new achievements after session completion**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

3. **Achievement Integration with Session System › Session Completion and Achievement Updates › should award points based on session completion type**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

4. **Achievement Integration with Session System › Session Completion and Achievement Updates › should handle manual session stopping and achievement updates**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

5. **Achievement Integration with Session System › 40-Second Minimum Rule Integration › should update achievements for sessions meeting 40-second minimum**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

6. **Achievement Integration with Session System › 40-Second Minimum Rule Integration › should not update achievements for sessions below 40-second minimum**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

7. **Achievement Integration with Session System › 40-Second Minimum Rule Integration › should handle sessions exactly at 40-second boundary**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

8. **Achievement Integration with Session System › Mood Tracking Integration › should include mood data in achievement progress calculation**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

9. **Achievement Integration with Session System › Mood Tracking Integration › should update mood-related achievement progress**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

10. **Achievement Integration with Session System › Mood Tracking Integration › should handle mood tracking achievements**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

11. **Achievement Integration with Session System › Timer State Management Integration › should update achievements when transitioning from COMPLETED to IDLE**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

12. **Achievement Integration with Session System › Timer State Management Integration › should handle achievement updates during PAUSED state**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

13. **Achievement Integration with Session System › Timer State Management Integration › should handle achievement updates for different session types**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

14. **Achievement Integration with Session System › Session History and Achievement Correlation › should maintain consistency between session history and achievement progress**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

15. **Achievement Integration with Session System › Session History and Achievement Correlation › should handle achievement progress with mixed session completion states**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

16. **Achievement Integration with Session System › Session History and Achievement Correlation › should handle achievement updates with empty session history**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

17. **Achievement Integration with Session System › Achievement Notification Integration › should show notifications for newly unlocked achievements**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

18. **Achievement Integration with Session System › Achievement Notification Integration › should not show notifications when no new achievements are unlocked**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
```

19. **Achievement Integration with Session System › Achievement Notification Integration › should handle notification errors gracefully**
```
TypeError: Cannot read properties of undefined (reading 'Person')
    [0m [90m 310 |[39m           [32m"Take 5 deep breaths"[39m[33m,[39m
     [90m 311 |[39m         ][33m,[39m
    [31m[1m>[22m[39m[90m 312 |[39m         icon[33m:[39m [33mIcon[39m[33m.[39m[33mPerson[39m[33m,[39m
     [90m     |[39m                    [31m[1m^[22m[39m
     [90m 313 |[39m         adhdBenefit[33m:[39m [32m"Increases blood flow and reduces restlessness"[39m[33m,[39m
     [90m 314 |[39m         difficulty[33m:[39m [32m"easy"[39m[33m,[39m
     [90m 315 |[39m       }[33m,[39m[0m
      at ADHDSupportService.getDefaultBreakActivities (src/services/features/adhd-support-service.ts:312:20)
      at createAchievementSlice (src/store/slices/achievement-slice.ts:142:39)
      at src/tests/achievement-session-integration.test.ts:73:30
      at createStoreImpl (node_modules/zustand/vanilla.js:21:32)
      at Object.createStore (node_modules/zustand/vanilla.js:24:52)
      at createImpl (node_modules/zustand/react.js:17:23)
      at create (node_modules/zustand/react.js:22:47)
      at createTestStore (src/tests/achievement-session-integration.test.ts:71:16)
      at Object.<anonymous> (src/tests/achievement-session-integration.test.ts:82:13)
Test Suites: 1 failed, 1 total
Tests:       19 failed, 19 total
Snapshots:   0 total
Time:        0.632 s, estimated 2 s
Ran all test suites matching src/tests/achievement-session-integration.test.ts.
```

## Recommended Actions

### Achievement categories mismatch

**Description**: Test expects wrong achievement categories

**Fix**: Update test to use actual categories: training_milestones, knockout_streaks, championship_belts, daily_training, endurance_challenges, consistency_championships, special_achievements, mood_mastery

**Affected Files**: boxing-achievement-service.test.ts

### Achievement requirement types mismatch

**Description**: Test expects wrong requirement types

**Fix**: Update test to use actual requirement types: sessions_completed, streak_length, total_time, daily_goal, session_duration, consecutive_days, time_of_day, weekend_sessions, mood_entries_total, mood_tracking_streak, mood_entries_with_notes, mood_intensity_range, mood_specific_sessions, mood_context_entries, mood_improvement_pattern, mood_awareness_diversity

**Affected Files**: boxing-achievement-service.test.ts

### Streak calculation logic

**Description**: Streak calculation may not work as expected in tests

**Fix**: Review streak calculation logic in boxing-achievement-service.ts and update test expectations

**Affected Files**: boxing-achievement-service.test.ts, achievement-edge-cases.test.ts

### Time-based achievement requirements

**Description**: Time requirements may be in minutes vs seconds

**Fix**: Verify if time requirements are in minutes (as in service) vs seconds (as in tests)

**Affected Files**: points-achievement-integration.test.ts, boxing-achievement-service.test.ts

### Mock service integration

**Description**: Mocked services may not reflect actual behavior

**Fix**: Update mocks to more closely match actual service behavior

**Affected Files**: achievement-store-integration.test.ts, achievement-session-integration.test.ts

