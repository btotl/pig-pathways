import { SceneSettings } from '../types';

export const SCENE_SETTINGS: SceneSettings = {
  fieldSize: 50,
  pigCount: 3,
  cameraPosition: { x: 0, y: 15, z: 25 },
  lighting: {
    ambientIntensity: 0.4,
    sunIntensity: 1.2,
    sunPosition: { x: 10, y: 20, z: 5 }
  },
  performance: {
    shadowQuality: 'medium',
    renderDistance: 100,
    targetFPS: 60
  }
};

export const PIG_DEFAULTS = {
  baseSpeed: 0.5,
  speedVariation: 0.3,
  baseSizeScale: 1.0,
  sizeVariation: 0.2,
  wanderRadius: 15,
  avoidanceDistance: 3,
  boundaryBuffer: 5,
  stateChangeInterval: 5000, // milliseconds
  directionChangeInterval: 2000
};

export const FIELD_BOUNDARIES = {
  minX: -SCENE_SETTINGS.fieldSize / 2,
  maxX: SCENE_SETTINGS.fieldSize / 2,
  minZ: -SCENE_SETTINGS.fieldSize / 2,
  maxZ: SCENE_SETTINGS.fieldSize / 2
};

export const COLORS = {
  grass: {
    primary: '#4a7c59',
    secondary: '#2d5b3a',
    light: '#6b9677'
  },
  pig: {
    primary: '#e6a4a0',
    secondary: '#d48e89',
    dark: '#c2746f'
  },
  sky: {
    primary: '#87ceeb',
    secondary: '#6fa8dc'
  }
};