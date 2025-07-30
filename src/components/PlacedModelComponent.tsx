import { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader, ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { PlacedModel } from '../types';

interface PlacedModelComponentProps {
  model: PlacedModel;
  onClick: (model: PlacedModel) => void;
  urlAssignment?: string;
}

const PlacedModelComponent = ({ model, onClick, urlAssignment }: PlacedModelComponentProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);

  // Load the GLB model
  const gltf = useGLTF(model.url);

  // Animation for attractiveness visual effect
  useFrame((state) => {
    if (meshRef.current && model.attractiveness > 50) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = model.position.y + Math.sin(time * 2) * 0.1;
    }

    // Glow effect for URLs
    if (glowRef.current && urlAssignment) {
      const time = state.clock.getElapsedTime();
      const intensity = 0.5 + Math.sin(time * 3) * 0.3;
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = intensity;
    }
  });

  // Clone the model to avoid sharing materials
  const clonedScene = gltf.scene.clone();

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(model.position.x, model.position.y, model.position.z);
      meshRef.current.rotation.set(model.rotation.x, model.rotation.y, model.rotation.z);
      meshRef.current.scale.set(model.scale.x, model.scale.y, model.scale.z);
    }
  }, [model.position, model.rotation, model.scale]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    
    if (urlAssignment) {
      window.open(urlAssignment, '_blank');
    } else {
      onClick(model);
    }
  };

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = urlAssignment ? 'pointer' : 'grab';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  if (!model.isVisible) return null;

  return (
    <group>
      {/* Main model */}
      <group
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <primitive 
          object={clonedScene}
          scale={[model.scale.x, model.scale.y, model.scale.z]}
        />
        
        {/* Glow effect for URL-assigned objects */}
        {urlAssignment && (
          <mesh ref={glowRef}>
            <sphereGeometry args={[Math.max(model.scale.x, model.scale.y, model.scale.z) * 1.2, 16, 16]} />
            <meshBasicMaterial 
              color="#00ff88"
              transparent
              opacity={0.3}
              wireframe
            />
          </mesh>
        )}
        
        {/* Attractiveness particle effect */}
        {model.attractiveness > 70 && (
          <group>
            {Array.from({ length: 5 }).map((_, i) => (
              <mesh key={i} position={[
                Math.sin(Date.now() * 0.001 + i) * 2,
                1 + Math.cos(Date.now() * 0.002 + i) * 0.5,
                Math.cos(Date.now() * 0.001 + i) * 2
              ]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial 
                  color="#ffd700"
                  transparent
                  opacity={0.6}
                />
              </mesh>
            ))}
          </group>
        )}
      </group>
      
      {/* Food indicator */}
      {model.isFood && (
        <mesh position={[model.position.x, model.position.y + 2, model.position.z]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#ff6b6b" />
        </mesh>
      )}
    </group>
  );
};

export default PlacedModelComponent;