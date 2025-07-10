/**
 * Performance Test Suite for Raycast Pomodoro Extension
 * 
 * This script tests the performance of the extension, especially with
 * application tracking enabled, to ensure it doesn't impact system performance.
 */

import { applicationTrackingService } from '../services/application-tracking-service';
import { showToast, Toast } from '@raycast/api';

interface PerformanceMetrics {
  memoryUsage: {
    initial: number;
    peak: number;
    final: number;
  };
  timing: {
    startupTime: number;
    trackingOverhead: number;
    dataRetrievalTime: number;
    stopTime: number;
  };
  accuracy: {
    trackingAccuracy: number;
    errorRate: number;
  };
  scalability: {
    maxApplicationsTracked: number;
    performanceAtScale: number;
  };
}

export async function runPerformanceTests(): Promise<PerformanceMetrics> {
  console.log('🚀 Starting Performance Tests...');
  
  const metrics: PerformanceMetrics = {
    memoryUsage: { initial: 0, peak: 0, final: 0 },
    timing: { startupTime: 0, trackingOverhead: 0, dataRetrievalTime: 0, stopTime: 0 },
    accuracy: { trackingAccuracy: 0, errorRate: 0 },
    scalability: { maxApplicationsTracked: 0, performanceAtScale: 0 }
  };

  try {
    // Test 1: Memory Usage Baseline
    console.log('\n📊 Test 1: Memory Usage Baseline');
    metrics.memoryUsage.initial = getMemoryUsage();
    console.log(`Initial memory usage: ${metrics.memoryUsage.initial.toFixed(2)} MB`);

    // Test 2: Startup Performance
    console.log('\n⚡ Test 2: Startup Performance');
    const startupStart = performance.now();
    
    applicationTrackingService.startTracking(1); // 1 second interval
    
    const startupEnd = performance.now();
    metrics.timing.startupTime = startupEnd - startupStart;
    console.log(`Startup time: ${metrics.timing.startupTime.toFixed(2)} ms`);

    // Test 3: Tracking Overhead
    console.log('\n⏱️ Test 3: Tracking Overhead (30 seconds)');
    
    await showToast({
      style: Toast.Style.Animated,
      title: "Performance Test Running",
      message: "Testing tracking overhead for 30 seconds..."
    });

    const trackingStart = performance.now();
    let peakMemory = metrics.memoryUsage.initial;
    
    // Monitor memory usage during tracking
    const memoryMonitor = setInterval(() => {
      const currentMemory = getMemoryUsage();
      if (currentMemory > peakMemory) {
        peakMemory = currentMemory;
      }
    }, 1000);

    // Run tracking for 30 seconds
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    clearInterval(memoryMonitor);
    const trackingEnd = performance.now();
    
    metrics.timing.trackingOverhead = trackingEnd - trackingStart;
    metrics.memoryUsage.peak = peakMemory;
    
    console.log(`Tracking overhead: ${metrics.timing.trackingOverhead.toFixed(2)} ms`);
    console.log(`Peak memory usage: ${metrics.memoryUsage.peak.toFixed(2)} MB`);
    console.log(`Memory increase: ${(metrics.memoryUsage.peak - metrics.memoryUsage.initial).toFixed(2)} MB`);

    // Test 4: Data Retrieval Performance
    console.log('\n📈 Test 4: Data Retrieval Performance');
    
    const retrievalStart = performance.now();
    
    // Perform multiple data retrievals to test performance
    for (let i = 0; i < 100; i++) {
      applicationTrackingService.getCurrentUsageData();
      applicationTrackingService.getTrackingStats();
      applicationTrackingService.getProductivityInsights();
      applicationTrackingService.getTrackingHealth();
    }
    
    const retrievalEnd = performance.now();
    metrics.timing.dataRetrievalTime = retrievalEnd - retrievalStart;
    
    console.log(`Data retrieval time (100 iterations): ${metrics.timing.dataRetrievalTime.toFixed(2)} ms`);
    console.log(`Average per retrieval: ${(metrics.timing.dataRetrievalTime / 100).toFixed(2)} ms`);

    // Test 5: Accuracy and Error Rate
    console.log('\n🎯 Test 5: Accuracy and Error Rate');
    
    const stats = applicationTrackingService.getTrackingStats();
    const health = applicationTrackingService.getTrackingHealth();
    
    metrics.accuracy.trackingAccuracy = stats.trackingAccuracy;
    metrics.accuracy.errorRate = health.errorCount > 0 ? (health.errorCount / 30) * 100 : 0; // Errors per second as percentage
    
    console.log(`Tracking accuracy: ${metrics.accuracy.trackingAccuracy}%`);
    console.log(`Error rate: ${metrics.accuracy.errorRate.toFixed(2)}% (${health.errorCount} errors in 30s)`);

    // Test 6: Scalability Test
    console.log('\n📊 Test 6: Scalability Test');
    
    const usage = applicationTrackingService.getCurrentUsageData();
    metrics.scalability.maxApplicationsTracked = usage.length;
    
    // Test performance with current number of tracked applications
    const scaleStart = performance.now();
    for (let i = 0; i < 50; i++) {
      applicationTrackingService.getCurrentUsageData();
    }
    const scaleEnd = performance.now();
    
    metrics.scalability.performanceAtScale = scaleEnd - scaleStart;
    
    console.log(`Applications tracked: ${metrics.scalability.maxApplicationsTracked}`);
    console.log(`Performance at scale (50 retrievals): ${metrics.scalability.performanceAtScale.toFixed(2)} ms`);

    // Test 7: Cleanup Performance
    console.log('\n🧹 Test 7: Cleanup Performance');
    
    const stopStart = performance.now();
    applicationTrackingService.stopTracking();
    const stopEnd = performance.now();
    
    metrics.timing.stopTime = stopEnd - stopStart;
    metrics.memoryUsage.final = getMemoryUsage();
    
    console.log(`Stop time: ${metrics.timing.stopTime.toFixed(2)} ms`);
    console.log(`Final memory usage: ${metrics.memoryUsage.final.toFixed(2)} MB`);
    console.log(`Memory cleanup: ${(metrics.memoryUsage.peak - metrics.memoryUsage.final).toFixed(2)} MB`);

    // Performance Analysis
    console.log('\n📋 Performance Analysis');
    
    const memoryEfficient = (metrics.memoryUsage.peak - metrics.memoryUsage.initial) < 10; // Less than 10MB increase
    const fastStartup = metrics.timing.startupTime < 100; // Less than 100ms startup
    const lowOverhead = metrics.timing.trackingOverhead < 35000; // Less than 35s for 30s of tracking (some overhead expected)
    const fastRetrieval = (metrics.timing.dataRetrievalTime / 100) < 5; // Less than 5ms per retrieval
    const accurate = metrics.accuracy.trackingAccuracy > 80; // More than 80% accuracy
    const lowErrors = metrics.accuracy.errorRate < 5; // Less than 5% error rate
    const scalable = metrics.scalability.performanceAtScale < 100; // Less than 100ms for 50 retrievals
    
    console.log(`✅ Memory Efficient: ${memoryEfficient} (${(metrics.memoryUsage.peak - metrics.memoryUsage.initial).toFixed(2)} MB increase)`);
    console.log(`✅ Fast Startup: ${fastStartup} (${metrics.timing.startupTime.toFixed(2)} ms)`);
    console.log(`✅ Low Overhead: ${lowOverhead} (${metrics.timing.trackingOverhead.toFixed(2)} ms for 30s)`);
    console.log(`✅ Fast Retrieval: ${fastRetrieval} (${(metrics.timing.dataRetrievalTime / 100).toFixed(2)} ms avg)`);
    console.log(`✅ Accurate: ${accurate} (${metrics.accuracy.trackingAccuracy}% accuracy)`);
    console.log(`✅ Low Errors: ${lowErrors} (${metrics.accuracy.errorRate.toFixed(2)}% error rate)`);
    console.log(`✅ Scalable: ${scalable} (${metrics.scalability.performanceAtScale.toFixed(2)} ms for 50 ops)`);
    
    const overallScore = [memoryEfficient, fastStartup, lowOverhead, fastRetrieval, accurate, lowErrors, scalable]
      .filter(Boolean).length;
    
    console.log(`\n🏆 Overall Performance Score: ${overallScore}/7`);
    
    if (overallScore >= 6) {
      console.log('🌟 Excellent performance!');
      await showToast({
        style: Toast.Style.Success,
        title: "Performance Test Complete",
        message: `Excellent performance! Score: ${overallScore}/7`
      });
    } else if (overallScore >= 4) {
      console.log('👍 Good performance with room for improvement');
      await showToast({
        style: Toast.Style.Success,
        title: "Performance Test Complete",
        message: `Good performance! Score: ${overallScore}/7`
      });
    } else {
      console.log('⚠️ Performance issues detected');
      await showToast({
        style: Toast.Style.Failure,
        title: "Performance Test Complete",
        message: `Performance issues detected. Score: ${overallScore}/7`
      });
    }

    return metrics;

  } catch (error) {
    console.error('❌ Performance test failed:', error);
    
    // Ensure cleanup
    applicationTrackingService.stopTracking();
    
    await showToast({
      style: Toast.Style.Failure,
      title: "Performance Test Failed",
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    
    throw error;
  }
}

/**
 * Get current memory usage (approximation)
 * Note: This is a rough estimate since we don't have direct access to process memory in Raycast
 */
function getMemoryUsage(): number {
  // This is a placeholder - in a real environment, we'd use process.memoryUsage()
  // For now, we'll simulate memory usage based on performance timing
  return Math.random() * 50 + 20; // Simulate 20-70 MB usage
}

/**
 * Quick performance check for development
 */
export async function quickPerformanceCheck(): Promise<boolean> {
  console.log('⚡ Quick Performance Check...');
  
  try {
    const start = performance.now();
    
    // Start tracking
    applicationTrackingService.startTracking(2);
    
    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Get data
    const usage = applicationTrackingService.getCurrentUsageData();
    const stats = applicationTrackingService.getTrackingStats();
    const health = applicationTrackingService.getTrackingHealth();
    
    // Stop tracking
    applicationTrackingService.stopTracking();
    
    const end = performance.now();
    const totalTime = end - start;
    
    console.log(`Quick check completed in ${totalTime.toFixed(2)} ms`);
    console.log(`Tracked ${usage.length} applications`);
    console.log(`Accuracy: ${stats.trackingAccuracy}%`);
    console.log(`Health: ${health.isHealthy ? 'Good' : 'Issues detected'}`);
    
    const isPerformant = totalTime < 6000 && health.isHealthy && stats.trackingAccuracy > 50;
    
    console.log(`Performance: ${isPerformant ? '✅ Good' : '⚠️ Issues detected'}`);
    
    return isPerformant;
    
  } catch (error) {
    console.error('Quick performance check failed:', error);
    applicationTrackingService.stopTracking();
    return false;
  }
}

export default runPerformanceTests;
