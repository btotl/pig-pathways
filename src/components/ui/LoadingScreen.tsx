import { useEffect, useState } from 'react';
import { LoadingProgress } from '../../types';

interface LoadingScreenProps {
  progress: LoadingProgress;
  isComplete: boolean;
  onComplete?: () => void;
}

const LoadingScreen = ({ progress, isComplete, onComplete }: LoadingScreenProps) => {
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        setShouldHide(true);
        onComplete?.();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onComplete]);

  if (shouldHide) return null;

  return (
    <div className={`fixed inset-0 bg-gradient-nature flex items-center justify-center z-50 transition-opacity duration-800 ${
      isComplete ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="text-center space-y-8 p-8">
        {/* Logo/Title */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white drop-shadow-lg">
            🐷 Wandering Pigs
          </h1>
          <p className="text-xl text-white/90 font-medium">
            A peaceful 3D meadow experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-96 mx-auto space-y-4">
          <div className="bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300 ease-out shadow-soft"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          
          <div className="text-white/90 space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>{progress.stage}</span>
              <span>{Math.round(progress.percentage)}%</span>
            </div>
            <div className="text-xs text-white/70">
              {progress.loaded} of {progress.total} assets loaded
            </div>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;