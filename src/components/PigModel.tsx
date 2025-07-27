import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, AnimationMixer, AnimationAction } from 'three';
import { PigState } from '../types';

interface PigModelProps {
  pigState: PigState;
  onClick?: () => void;
}

const PigModel = ({ pigState, onClick }: PigModelProps) => {
  const groupRef = useRef<Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionsRef = useRef<{ [key: string]: AnimationAction }>({});
  
  // Load the GLB model
  const { scene, animations } = useGLTF('/Pig.glb');

  // Initialize animations
  useEffect(() => {
    if (scene && animations.length > 0) {
      const mixer = new AnimationMixer(scene);
      mixerRef.current = mixer;
      
      // Setup animation actions
      animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        actionsRef.current[clip.name] = action;
      });
      
      // Start with idle animation if available
      const idleAction = actionsRef.current['idle'] || actionsRef.current['Idle'] || Object.values(actionsRef.current)[0];
      if (idleAction) {
        idleAction.play();
      }
    }
    
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [scene, animations]);

  // Update position and rotation based on pig state
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(
        pigState.position.x,
        pigState.position.y,
        pigState.position.z
      );
      groupRef.current.rotation.y = pigState.rotation.y;
      groupRef.current.scale.setScalar(pigState.size);
    }
  }, [pigState.position, pigState.rotation, pigState.size]);

  // Update animations and mixer
  useFrame((state, deltaTime) => {
    // Update animation mixer
    if (mixerRef.current) {
      mixerRef.current.update(deltaTime);
    }

    // Switch animations based on pig state
    const isMoving = pigState.state === 'wandering';
    const walkAction = actionsRef.current['walk'] || actionsRef.current['Walk'];
    const idleAction = actionsRef.current['idle'] || actionsRef.current['Idle'];
    
    if (isMoving && walkAction && !walkAction.isRunning()) {
      // Transition to walk animation
      if (idleAction?.isRunning()) {
        walkAction.reset().fadeIn(0.3);
        idleAction.fadeOut(0.3);
      } else {
        walkAction.play();
      }
    } else if (!isMoving && idleAction && !idleAction.isRunning()) {
      // Transition to idle animation
      if (walkAction?.isRunning()) {
        idleAction.reset().fadeIn(0.3);
        walkAction.fadeOut(0.3);
      } else {
        idleAction.play();
      }
    }
  });

  return (
    <group 
      ref={groupRef} 
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
      castShadow
      receiveShadow
    >
      {scene && <primitive object={scene.clone()} />}
    </group>
  );
};

// Preload the model
useGLTF.preload('/Pig.glb');

export default PigModel;