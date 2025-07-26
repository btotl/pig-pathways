import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, PlaneGeometry, MeshLambertMaterial, InstancedMesh, Object3D, Matrix4 } from 'three';
import { SCENE_SETTINGS, COLORS } from '../utils/constants';

const GrassField = () => {
  const groundRef = useRef<Mesh>(null);
  const grassRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);

  // Create grass blade instances
  const grassInstances = useMemo(() => {
    const instances = [];
    const grassCount = 2000;
    
    for (let i = 0; i < grassCount; i++) {
      instances.push({
        position: [
          (Math.random() - 0.5) * SCENE_SETTINGS.fieldSize,
          0,
          (Math.random() - 0.5) * SCENE_SETTINGS.fieldSize
        ],
        rotation: [0, Math.random() * Math.PI, 0],
        scale: [
          0.8 + Math.random() * 0.4,
          1.5 + Math.random() * 1.0,
          0.8 + Math.random() * 0.4
        ]
      });
    }
    
    return instances;
  }, []);

  // Animate grass swaying
  useFrame((state) => {
    if (grassRef.current) {
      const time = state.clock.getElapsedTime();
      
      grassInstances.forEach((grass, i) => {
        const [x, y, z] = grass.position;
        const [scaleX, scaleY, scaleZ] = grass.scale;
        
        // Create swaying motion
        const swayX = Math.sin(time * 2 + i * 0.1) * 0.1;
        const swayZ = Math.cos(time * 1.5 + i * 0.15) * 0.05;
        
        tempObject.position.set(x + swayX, y, z + swayZ);
        tempObject.rotation.set(0, grass.rotation[1], 0);
        tempObject.scale.set(scaleX, scaleY, scaleZ);
        tempObject.updateMatrix();
        
        grassRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      
      grassRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Ground plane */}
      <mesh 
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <planeGeometry args={[SCENE_SETTINGS.fieldSize, SCENE_SETTINGS.fieldSize]} />
        <meshLambertMaterial 
          color={COLORS.grass.secondary}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Grass blades */}
      <instancedMesh
        ref={grassRef}
        args={[undefined, undefined, grassInstances.length]}
        castShadow
      >
        <coneGeometry args={[0.02, 0.3, 3]} />
        <meshLambertMaterial 
          color={COLORS.grass.primary}
          transparent
          opacity={0.8}
        />
      </instancedMesh>

      {/* Additional ground details */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[SCENE_SETTINGS.fieldSize * 0.9, SCENE_SETTINGS.fieldSize * 0.9]} />
        <meshLambertMaterial 
          color={COLORS.grass.light}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
};

export default GrassField;