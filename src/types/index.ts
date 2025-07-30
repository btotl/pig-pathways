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
  state: 'wandering' | 'resting' | 'eating' | 'socializing';
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
    eatCooldown: number;
  };
  urlAssignment?: string;
  color?: string;
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

export interface PlacedModel {
  id: string;
  name: string;
  url: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  attractiveness: number;
  isFood: boolean;
  foodTimer: number; // seconds after page load before available
  urlAssignment?: string;
  schedule?: {
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    daysOfWeek?: number[]; // 0-6, Sunday-Saturday
  };
  isVisible?: boolean;
}

export interface EnvironmentSettings {
  skyImage?: string;
  grassColor: string;
  grassDensity: number;
  windStrength: number;
  grassHeight: [number, number]; // min, max
  ambientLightColor: string;
  ambientLightIntensity: number;
  sunColor: string;
  sunIntensity: number;
  sunPosition: Vector3;
  shadowsEnabled: boolean;
  fogEnabled: boolean;
  fogColor: string;
  fogNear: number;
  fogFar: number;
}

export interface AdminSettings {
  isAdminMode: boolean;
  defaultPigSize: number;
  pigColorTint: string;
  pigSpawnRate: number;
  pigSpeedMultiplier: number;
  environment: EnvironmentSettings;
  hideInterface: boolean;
}