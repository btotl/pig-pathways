import { useState, useEffect, useRef } from 'react';

export interface PerformanceMetrics {
  fps: number;
  averageFPS: number;
  memoryUsage: number;
  renderTime: number;
  quality: 'low' | 'medium' | 'high';
}

export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    averageFPS: 60,
    memoryUsage: 0,
    renderTime: 0,
    quality: 'medium'
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const qualityRef = useRef<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    let animationFrame: number;

    const measurePerformance = () => {
      const now = performance.now();
      const deltaTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // Calculate FPS
      frameTimesRef.current.push(deltaTime);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      const averageFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const currentFPS = Math.round(1000 / deltaTime);
      const averageFPS = Math.round(1000 / averageFrameTime);

      // Auto-adjust quality based on performance
      let newQuality = qualityRef.current;
      if (averageFPS < 30 && qualityRef.current !== 'low') {
        newQuality = 'low';
      } else if (averageFPS > 50 && qualityRef.current !== 'high') {
        newQuality = 'high';
      } else if (averageFPS > 40 && averageFPS < 50 && qualityRef.current !== 'medium') {
        newQuality = 'medium';
      }
      qualityRef.current = newQuality;

      // Get memory usage if available
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;

      setMetrics({
        fps: currentFPS,
        averageFPS,
        memoryUsage,
        renderTime: deltaTime,
        quality: newQuality
      });

      animationFrame = requestAnimationFrame(measurePerformance);
    };

    animationFrame = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return metrics;
};