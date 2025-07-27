import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCENE_SETTINGS } from '../utils/constants';

const RealisticGrassField = () => {
  const grassRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const startTimeRef = useRef(Date.now());

  // Grass parameters
  const BLADE_COUNT = 50000;
  const BLADE_WIDTH = 0.1;
  const BLADE_HEIGHT = 0.8;
  const BLADE_HEIGHT_VARIATION = 0.6;

  // Vertex shader for grass animation
  const vertexShader = `
    varying vec2 vUv;
    varying vec2 cloudUV;
    varying vec3 vColor;
    uniform float iTime;

    void main() {
      vUv = uv;
      cloudUV = uv;
      vColor = color;
      vec3 cpos = position;

      float waveSize = 10.0;
      float tipDistance = 0.3;
      float centerDistance = 0.1;

      if (color.x > 0.6) {
        cpos.x += sin((iTime / 500.0) + (uv.x * waveSize)) * tipDistance;
      } else if (color.x > 0.0) {
        cpos.x += sin((iTime / 500.0) + (uv.x * waveSize)) * centerDistance;
      }

      cloudUV.x += iTime / 20000.0;
      cloudUV.y += iTime / 10000.0;

      vec4 worldPosition = vec4(cpos, 1.0);
      vec4 mvPosition = projectionMatrix * modelViewMatrix * vec4(cpos, 1.0);
      gl_Position = mvPosition;
    }
  `;

  // Fragment shader for grass appearance
  const fragmentShader = `
    uniform sampler2D grassTexture;
    uniform sampler2D cloudTexture;
    
    varying vec2 vUv;
    varying vec2 cloudUV;
    varying vec3 vColor;

    void main() {
      float contrast = 1.5;
      float brightness = 0.1;
      
      // Base grass color - use green if no texture
      vec3 grassColor = vec3(0.2, 0.6, 0.3);
      vec3 color = grassColor * contrast;
      color = color + vec3(brightness, brightness, brightness);
      
      // Add some cloud-like variation
      vec3 cloudColor = vec3(0.8, 0.9, 0.7);
      color = mix(color, cloudColor, 0.2 * sin(cloudUV.x * 5.0) * sin(cloudUV.y * 5.0));
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // Create grass geometry
  const grassGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const uvs = [];
    const indices = [];

    const grassBaseWidth = BLADE_WIDTH;
    
    for (let i = 0; i < BLADE_COUNT; i++) {
      const surfaceMin = SCENE_SETTINGS.fieldSize / 2 * -1;
      const surfaceMax = SCENE_SETTINGS.fieldSize / 2;
      const radius = SCENE_SETTINGS.fieldSize / 2;

      const r = radius * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);

      const blade = [];
      const bladeHeight = BLADE_HEIGHT + (Math.random() * BLADE_HEIGHT_VARIATION);
      
      // Create blade vertices (triangle strip)
      blade.push(x - grassBaseWidth / 2, 0, z);  // Bottom left
      blade.push(x + grassBaseWidth / 2, 0, z);  // Bottom right
      blade.push(x - grassBaseWidth / 4, bladeHeight / 2, z);  // Middle left
      blade.push(x + grassBaseWidth / 4, bladeHeight / 2, z);  // Middle right
      blade.push(x, bladeHeight, z);  // Top

      const currentVertexCount = vertices.length / 3;

      // Add vertices
      for (let j = 0; j < blade.length; j += 3) {
        vertices.push(blade[j], blade[j + 1], blade[j + 2]);
      }

      // Add colors (for wind animation - higher values = more movement)
      colors.push(0.0, 0.0, 0.0);  // Bottom left - no movement
      colors.push(0.0, 0.0, 0.0);  // Bottom right - no movement
      colors.push(0.5, 0.5, 0.5);  // Middle left - some movement
      colors.push(0.5, 0.5, 0.5);  // Middle right - some movement
      colors.push(1.0, 1.0, 1.0);  // Top - max movement

      // Add UVs
      uvs.push(0, 0);
      uvs.push(1, 0);
      uvs.push(0, 0.5);
      uvs.push(1, 0.5);
      uvs.push(0.5, 1);

      // Add indices for triangles
      indices.push(
        currentVertexCount, currentVertexCount + 1, currentVertexCount + 2,
        currentVertexCount + 1, currentVertexCount + 3, currentVertexCount + 2,
        currentVertexCount + 2, currentVertexCount + 3, currentVertexCount + 4
      );
    }

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();

    return geometry;
  }, []);

  // Create shader material
  const grassMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0.0 },
        grassTexture: { value: null },
        cloudTexture: { value: null }
      },
      vertexShader,
      fragmentShader,
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: false
    });
  }, [vertexShader, fragmentShader]);

  // Update time uniform for animation
  useFrame(() => {
    if (materialRef.current) {
      const elapsedTime = Date.now() - startTimeRef.current;
      materialRef.current.uniforms.iTime.value = elapsedTime;
    }
  });

  // Ground plane
  const groundGeometry = useMemo(() => 
    new THREE.PlaneGeometry(SCENE_SETTINGS.fieldSize, SCENE_SETTINGS.fieldSize), []
  );

  const groundMaterial = useMemo(() => 
    new THREE.MeshLambertMaterial({ 
      color: '#3a5f3a',
      transparent: true,
      opacity: 0.8
    }), []
  );

  return (
    <group>
      {/* Ground plane */}
      <mesh 
        geometry={groundGeometry}
        material={groundMaterial}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]}
        receiveShadow
      />

      {/* Realistic grass blades */}
      <mesh
        ref={grassRef}
        geometry={grassGeometry}
        material={grassMaterial}
        castShadow
        receiveShadow
      >
        <shaderMaterial
          ref={materialRef}
          attach="material"
          args={[{
            uniforms: {
              iTime: { value: 0.0 },
              grassTexture: { value: null },
              cloudTexture: { value: null }
            },
            vertexShader,
            fragmentShader,
            vertexColors: true,
            side: THREE.DoubleSide
          }]}
        />
      </mesh>
    </group>
  );
};

export default RealisticGrassField;