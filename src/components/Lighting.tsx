import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DirectionalLight } from 'three';
import { SCENE_SETTINGS } from '../utils/constants';

const Lighting = () => {
  const sunRef = useRef<DirectionalLight>(null);

  useFrame((state) => {
    if (sunRef.current) {
      // Subtle sun movement for dynamic shadows
      const time = state.clock.getElapsedTime() * 0.1;
      sunRef.current.position.x = SCENE_SETTINGS.lighting.sunPosition.x + Math.sin(time) * 2;
      sunRef.current.position.z = SCENE_SETTINGS.lighting.sunPosition.z + Math.cos(time) * 2;
    }
  });

  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight 
        intensity={SCENE_SETTINGS.lighting.ambientIntensity} 
        color="#f0f8ff" 
      />
      
      {/* Main sun light */}
      <directionalLight
        ref={sunRef}
        position={[
          SCENE_SETTINGS.lighting.sunPosition.x,
          SCENE_SETTINGS.lighting.sunPosition.y,
          SCENE_SETTINGS.lighting.sunPosition.z
        ]}
        intensity={SCENE_SETTINGS.lighting.sunIntensity}
        color="#fff8dc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      
      {/* Fill light for softer shadows */}
      <directionalLight
        position={[-10, 5, -10]}
        intensity={0.3}
        color="#87ceeb"
      />
      
      {/* Hemisphere light for natural sky lighting */}
      <hemisphereLight
        args={["#87ceeb", "#4a7c59", 0.4]}
      />
    </>
  );
};

export default Lighting;