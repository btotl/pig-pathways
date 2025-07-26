import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { toast } from '../hooks/use-toast';
import Lighting from './Lighting';
import GrassField from './GrassField';
import PigModel from './PigModel';
import { usePigAI } from '../hooks/usePigAI';
import { usePerformance } from '../hooks/usePerformance';
import { SCENE_SETTINGS } from '../utils/constants';

interface Scene3DProps {
  onLoaded?: () => void;
}

const Scene3D = ({ onLoaded }: Scene3DProps) => {
  const { pigs, resetPigs } = usePigAI();
  const performance = usePerformance();
  const [selectedPig, setSelectedPig] = useState<string | null>(null);

  const handlePigClick = (pigId: string) => {
    setSelectedPig(pigId);
    const pig = pigs.find(p => p.id === pigId);
    if (pig) {
      toast({
        title: `Pig ${pigId.split('-')[1]}`,
        description: `Current state: ${pig.state}. Speed: ${pig.speed.toFixed(2)}`,
      });
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-sky">
      <Canvas
        shadows
        camera={{
          position: [
            SCENE_SETTINGS.cameraPosition.x,
            SCENE_SETTINGS.cameraPosition.y,
            SCENE_SETTINGS.cameraPosition.z
          ],
          fov: 60,
          near: 0.1,
          far: 200
        }}
        onCreated={() => {
          // Scene is ready
          setTimeout(onLoaded, 500);
        }}
      >
        <Suspense fallback={null}>
          <Lighting />
          <GrassField />
          
          {pigs.map((pig) => (
            <PigModel
              key={pig.id}
              pigState={pig}
              onClick={() => handlePigClick(pig.id)}
            />
          ))}
          
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={10}
            maxDistance={50}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Performance indicator */}
      {performance.fps < 45 && (
        <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-2 rounded-lg shadow-soft">
          Low FPS: {performance.fps}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 left-4 space-y-2">
        <button
          onClick={resetPigs}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-soft hover:bg-primary/90 transition-colors"
        >
          Reset Pigs
        </button>
        
        <div className="text-sm text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg">
          <div>FPS: {performance.fps}</div>
          <div>Quality: {performance.quality}</div>
          <div>Pigs: {pigs.length}</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm p-4 rounded-lg shadow-nature max-w-sm">
        <h2 className="font-semibold text-card-foreground mb-2">🐷 Wandering Pigs</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Click and drag to orbit the camera</li>
          <li>• Scroll to zoom in/out</li>
          <li>• Click on pigs to see their status</li>
          <li>• Watch them wander autonomously!</li>
        </ul>
      </div>

      {selectedPig && (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-card p-4 rounded-lg shadow-nature">
          <h3 className="font-medium text-card-foreground mb-2">
            Pig {selectedPig.split('-')[1]}
          </h3>
          {pigs.find(p => p.id === selectedPig) && (
            <div className="text-sm text-muted-foreground space-y-1">
              <div>State: {pigs.find(p => p.id === selectedPig)?.state}</div>
              <div>Speed: {pigs.find(p => p.id === selectedPig)?.speed.toFixed(2)}</div>
              <div>Size: {pigs.find(p => p.id === selectedPig)?.size.toFixed(2)}</div>
            </div>
          )}
          <button
            onClick={() => setSelectedPig(null)}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Scene3D;