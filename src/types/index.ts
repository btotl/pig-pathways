export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface PigState {
  id: string;
  position: Vector3;
  rotation: Vector3;
  velocity: Vector3;
  target: Vector3;
  state: 'wandering' | 'resting' | 'socializing';
  speed: number;
  size: number;
  personality: {
    restChance: number;
    socialDistance: number;
    wanderRadius: number;
    aggressiveness: number;
  };
  timers: {
    stateChange: number;
    lastDirection: number;
  };
}

export interface SceneSettings {
  fieldSize: number;
  pigCount: number;
  cameraPosition: Vector3;
  lighting: {
    ambientIntensity: number;
    sunIntensity: number;
    sunPosition: Vector3;
  };
  performance: {
    shadowQuality: 'low' | 'medium' | 'high';
    renderDistance: number;
    targetFPS: number;
  };
}

export interface LoadingProgress {
  loaded: number;
  total: number;
  stage: string;
  percentage: number;
}