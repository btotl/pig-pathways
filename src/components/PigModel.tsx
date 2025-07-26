import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { PigState } from '../types';
import { COLORS } from '../utils/constants';

interface PigModelProps {
  pigState: PigState;
  onClick?: () => void;
}

const PigModel = ({ pigState, onClick }: PigModelProps) => {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const headRef = useRef<Mesh>(null);
  const tailRef = useRef<Mesh>(null);

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

  // Animate pig parts
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const isMoving = pigState.state === 'wandering';
    
    if (bodyRef.current) {
      // Subtle breathing/idle animation
      const breathe = Math.sin(time * 2) * 0.02;
      bodyRef.current.scale.y = 1 + breathe;
      
      // Bobbing when walking
      if (isMoving) {
        const bob = Math.sin(time * 8) * 0.05;
        bodyRef.current.position.y = bob;
      } else {
        bodyRef.current.position.y = 0;
      }
    }

    if (headRef.current) {
      // Head movement
      const headBob = isMoving ? Math.sin(time * 6) * 0.1 : Math.sin(time * 1.5) * 0.05;
      headRef.current.rotation.x = headBob;
      
      // Occasional head turns when resting
      if (pigState.state === 'resting') {
        const lookAround = Math.sin(time * 0.5) * 0.3;
        headRef.current.rotation.y = lookAround;
      }
    }

    if (tailRef.current) {
      // Tail wagging
      const wagSpeed = isMoving ? 12 : 4;
      const wagIntensity = isMoving ? 0.8 : 0.3;
      tailRef.current.rotation.z = Math.sin(time * wagSpeed) * wagIntensity;
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
    >
      {/* Body */}
      <mesh ref={bodyRef} castShadow receiveShadow>
        <sphereGeometry args={[0.8, 16, 12]} />
        <meshLambertMaterial color={COLORS.pig.primary} />
      </mesh>

      {/* Head */}
      <mesh 
        ref={headRef} 
        position={[1.0, 0.2, 0]} 
        castShadow 
        receiveShadow
      >
        <sphereGeometry args={[0.5, 12, 10]} />
        <meshLambertMaterial color={COLORS.pig.secondary} />
        
        {/* Snout */}
        <mesh position={[0.4, -0.1, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.3, 8]} />
          <meshLambertMaterial color={COLORS.pig.dark} />
          
          {/* Nostrils */}
          <mesh position={[0.1, 0, 0.1]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshLambertMaterial color="#2c1810" />
          </mesh>
          <mesh position={[0.1, 0, -0.1]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshLambertMaterial color="#2c1810" />
          </mesh>
        </mesh>

        {/* Eyes */}
        <mesh position={[0.2, 0.1, 0.25]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshLambertMaterial color="#000" />
        </mesh>
        <mesh position={[0.2, 0.1, -0.25]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshLambertMaterial color="#000" />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.1, 0.3, 0.2]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.15, 0.3, 6]} />
          <meshLambertMaterial color={COLORS.pig.primary} />
        </mesh>
        <mesh position={[-0.1, 0.3, -0.2]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.15, 0.3, 6]} />
          <meshLambertMaterial color={COLORS.pig.primary} />
        </mesh>
      </mesh>

      {/* Legs */}
      {([
        [-0.4, -0.6, 0.4] as const,
        [-0.4, -0.6, -0.4] as const,
        [0.4, -0.6, 0.4] as const,
        [0.4, -0.6, -0.4] as const
      ]).map((position, index) => (
        <mesh key={index} position={position} castShadow>
          <cylinderGeometry args={[0.15, 0.12, 0.6, 8]} />
          <meshLambertMaterial color={COLORS.pig.secondary} />
          
          {/* Hooves */}
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.12, 0.15, 0.1, 8]} />
            <meshLambertMaterial color="#2c1810" />
          </mesh>
        </mesh>
      ))}

      {/* Tail */}
      <mesh 
        ref={tailRef}
        position={[-0.7, 0.3, 0]} 
        rotation={[0, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.05, 0.08, 0.4, 6]} />
        <meshLambertMaterial color={COLORS.pig.primary} />
        
        {/* Tail curl */}
        <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[0.1, 0.03, 6, 12]} />
          <meshLambertMaterial color={COLORS.pig.primary} />
        </mesh>
      </mesh>
    </group>
  );
};

export default PigModel;