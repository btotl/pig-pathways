import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnvironmentSettings } from '../types';

interface LipsGrassFieldProps {
  environment: EnvironmentSettings;
}

const createLipsShape = () => {
  // Create lips-shaped path using bezier curves
  const shape = new THREE.Shape();
  
  // Scale factor for lips size
  const scale = 15;
  
  // Upper lip
  shape.moveTo(-scale * 0.8, 0);
  shape.bezierCurveTo(
    -scale * 0.8, scale * 0.3,
    -scale * 0.4, scale * 0.6,
    0, scale * 0.4
  );
  shape.bezierCurveTo(
    scale * 0.4, scale * 0.6,
    scale * 0.8, scale * 0.3,
    scale * 0.8, 0
  );
  
  // Lower lip
  shape.bezierCurveTo(
    scale * 0.8, -scale * 0.3,
    scale * 0.4, -scale * 0.6,
    0, -scale * 0.4
  );
  shape.bezierCurveTo(
    -scale * 0.4, -scale * 0.6,
    -scale * 0.8, -scale * 0.3,
    -scale * 0.8, 0
  );
  
  return shape;
};

// Check if point is inside lips shape
export const isPointInLipsField = (x: number, z: number): boolean => {
  const scale = 15;
  const normalizedX = x / scale;
  const normalizedZ = z / scale;
  
  // Simple elliptical approximation for collision detection
  const ellipseA = 0.8; // width
  const ellipseB = 0.6; // height
  
  return (normalizedX * normalizedX) / (ellipseA * ellipseA) + 
         (normalizedZ * normalizedZ) / (ellipseB * ellipseB) <= 1;
};

// Get lips field boundaries
export const getLipsFieldBoundaries = () => {
  const scale = 15;
  return {
    minX: -scale * 0.8,
    maxX: scale * 0.8,
    minZ: -scale * 0.6,
    maxZ: scale * 0.6
  };
};

const LipsGrassField = ({ environment }: LipsGrassFieldProps) => {
  const grassRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useRef(0);

  // Create grass instances
  const { grassCount, grassPositions, grassScales, grassRotations } = useMemo(() => {
    const count = Math.floor(environment.grassDensity);
    const positions: THREE.Vector3[] = [];
    const scales: number[] = [];
    const rotations: number[] = [];
    
    const shape = createLipsShape();
    const scale = 15;
    
    // Generate grass positions within lips shape
    for (let i = 0; i < count; i++) {
      let x, z;
      let attempts = 0;
      
      do {
        x = (Math.random() - 0.5) * scale * 1.6;
        z = (Math.random() - 0.5) * scale * 1.2;
        attempts++;
      } while (!isPointInLipsField(x, z) && attempts < 50);
      
      if (attempts < 50) {
        positions.push(new THREE.Vector3(x, 0, z));
        scales.push(
          environment.grassHeight[0] + 
          Math.random() * (environment.grassHeight[1] - environment.grassHeight[0])
        );
        rotations.push(Math.random() * Math.PI * 2);
      }
    }
    
    return {
      grassCount: positions.length,
      grassPositions: positions,
      grassScales: scales,
      grassRotations: rotations
    };
  }, [environment.grassDensity, environment.grassHeight]);

  // Create grass geometry and material
  const { grassGeometry, grassMaterial } = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(0.1, 1);
    geometry.translate(0, 0.5, 0);
    
    const material = new THREE.MeshLambertMaterial({
      color: environment.grassColor,
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.5
    });
    
    return { grassGeometry: geometry, grassMaterial: material };
  }, [environment.grassColor]);

  // Animate grass swaying
  useFrame((state, delta) => {
    timeRef.current += delta * environment.windStrength;
    
    if (grassRef.current) {
      const dummy = new THREE.Object3D();
      
      for (let i = 0; i < grassCount; i++) {
        const position = grassPositions[i];
        const scale = grassScales[i];
        const rotation = grassRotations[i];
        
        // Wind sway animation
        const windOffset = Math.sin(timeRef.current + i * 0.1) * 0.1 * environment.windStrength;
        
        dummy.position.set(
          position.x + windOffset,
          position.y,
          position.z
        );
        dummy.rotation.set(0, rotation, windOffset * 0.5);
        dummy.scale.set(0.8, scale, 0.8);
        dummy.updateMatrix();
        
        grassRef.current.setMatrixAt(i, dummy.matrix);
      }
      
      grassRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  // Create ground plane in lips shape
  const groundGeometry = useMemo(() => {
    const shape = createLipsShape();
    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, []);

  return (
    <group>
      {/* Ground */}
      <mesh geometry={groundGeometry} position={[0, -0.1, 0]} receiveShadow>
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Grass */}
      <instancedMesh
        ref={grassRef}
        args={[grassGeometry, grassMaterial, grassCount]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

export default LipsGrassField;