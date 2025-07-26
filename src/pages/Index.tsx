import { useState, useEffect } from 'react';
import Scene3D from '../components/Scene3D';
import LoadingScreen from '../components/ui/LoadingScreen';
import { LoadingProgress } from '../types';

const Index = () => {
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    loaded: 0,
    total: 4,
    stage: 'Initializing 3D engine...',
    percentage: 0
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [showScene, setShowScene] = useState(false);

  // Simulate progressive loading
  useEffect(() => {
    const stages = [
      { stage: 'Loading 3D engine...', delay: 800 },
      { stage: 'Creating pig models...', delay: 600 },
      { stage: 'Growing grass field...', delay: 500 },
      { stage: 'Setting up lighting...', delay: 400 },
      { stage: 'Activating pig AI...', delay: 300 }
    ];

    let currentStage = 0;

    const loadNextStage = () => {
      if (currentStage < stages.length) {
        setLoadingProgress(prev => ({
          ...prev,
          loaded: currentStage + 1,
          total: stages.length,
          stage: stages[currentStage].stage,
          percentage: ((currentStage + 1) / stages.length) * 100
        }));

        setTimeout(() => {
          currentStage++;
          if (currentStage < stages.length) {
            loadNextStage();
          } else {
            setIsLoaded(true);
          }
        }, stages[currentStage].delay);
      }
    };

    const timer = setTimeout(loadNextStage, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSceneLoaded = () => {
    setShowScene(true);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <LoadingScreen
        progress={loadingProgress}
        isComplete={isLoaded}
        onComplete={handleSceneLoaded}
      />
      
      {isLoaded && (
        <div className={`transition-opacity duration-1000 ${showScene ? 'opacity-100' : 'opacity-0'}`}>
          <Scene3D onLoaded={handleSceneLoaded} />
        </div>
      )}
    </div>
  );
};

export default Index;
