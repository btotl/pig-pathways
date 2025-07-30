import { Vector3, PigState, PlacedModel } from '../types';
import { FIELD_BOUNDARIES, PIG_DEFAULTS } from './constants';
import { 
  distance, 
  normalize, 
  multiply, 
  add, 
  subtract, 
  randomInRange, 
  createVector3,
  clamp
} from './mathUtils';
import { isPointInLipsField, getLipsFieldBoundaries } from '../components/LipsGrassField';

export const generateRandomPigPersonality = () => ({
  restChance: randomInRange(0.05, 0.15),
  socialDistance: randomInRange(2, 5),
  wanderRadius: randomInRange(10, 20),
  aggressiveness: randomInRange(0.1, 0.5)
});

export const createInitialPigState = (id: string, position?: Vector3): PigState => ({
  id,
  position: position || createVector3(
    randomInRange(FIELD_BOUNDARIES.minX + 5, FIELD_BOUNDARIES.maxX - 5),
    0,
    randomInRange(FIELD_BOUNDARIES.minZ + 5, FIELD_BOUNDARIES.maxZ - 5)
  ),
  rotation: createVector3(0, randomInRange(0, Math.PI * 2), 0),
  velocity: createVector3(),
  target: createVector3(),
  state: 'wandering',
  speed: PIG_DEFAULTS.baseSpeed + randomInRange(-PIG_DEFAULTS.speedVariation, PIG_DEFAULTS.speedVariation),
  size: PIG_DEFAULTS.baseSizeScale + randomInRange(-PIG_DEFAULTS.sizeVariation, PIG_DEFAULTS.sizeVariation),
  personality: generateRandomPigPersonality(),
  timers: {
    stateChange: Date.now() + randomInRange(2000, 8000),
    lastDirection: Date.now(),
    eatCooldown: 0
  }
});

export const calculateWanderTarget = (pig: PigState): Vector3 => {
  const angle = randomInRange(0, Math.PI * 2);
  const radius = randomInRange(3, pig.personality.wanderRadius);
  
  return {
    x: pig.position.x + Math.cos(angle) * radius,
    y: 0,
    z: pig.position.z + Math.sin(angle) * radius
  };
};

export const enforceFieldBoundaries = (position: Vector3): Vector3 => {
  const lipsBoundaries = getLipsFieldBoundaries();
  
  // First, clamp to basic boundaries
  let clampedPosition = {
    x: clamp(position.x, lipsBoundaries.minX + PIG_DEFAULTS.boundaryBuffer, lipsBoundaries.maxX - PIG_DEFAULTS.boundaryBuffer),
    y: position.y,
    z: clamp(position.z, lipsBoundaries.minZ + PIG_DEFAULTS.boundaryBuffer, lipsBoundaries.maxZ - PIG_DEFAULTS.boundaryBuffer)
  };
  
  // Check if still within lips shape, if not, find nearest valid point
  if (!isPointInLipsField(clampedPosition.x, clampedPosition.z)) {
    // Simple approach: move towards center
    const centerDirection = normalize(subtract(createVector3(0, 0, 0), clampedPosition));
    clampedPosition = add(clampedPosition, multiply(centerDirection, 2));
  }
  
  return clampedPosition;
};

export const calculateAvoidanceVector = (pig: PigState, otherPigs: PigState[]): Vector3 => {
  let avoidanceVector = createVector3();
  
  for (const other of otherPigs) {
    if (other.id === pig.id) continue;
    
    const dist = distance(pig.position, other.position);
    if (dist < PIG_DEFAULTS.avoidanceDistance && dist > 0) {
      const avoidDirection = normalize(subtract(pig.position, other.position));
      const force = (PIG_DEFAULTS.avoidanceDistance - dist) / PIG_DEFAULTS.avoidanceDistance;
      avoidanceVector = add(avoidanceVector, multiply(avoidDirection, force));
    }
  }
  
  return multiply(avoidanceVector, 0.5);
};

export const calculateSeekVector = (pig: PigState, target: Vector3): Vector3 => {
  const direction = subtract(target, pig.position);
  const dist = distance(pig.position, target);
  
  if (dist < 0.5) return createVector3();
  
  return multiply(normalize(direction), pig.speed);
};

export const calculateAttractionVector = (pig: PigState, attractiveModels: PlacedModel[]): Vector3 => {
  let attractionVector = createVector3();
  
  for (const model of attractiveModels) {
    const dist = distance(pig.position, model.position);
    if (dist < 20 && model.attractiveness > 0) {
      const attractDirection = normalize(subtract(model.position, pig.position));
      const force = (model.attractiveness / 100) * (20 - dist) / 20;
      attractionVector = add(attractionVector, multiply(attractDirection, force));
    }
  }
  
  return multiply(attractionVector, 0.3);
};

export const checkFoodInteraction = (pig: PigState, foodModels: PlacedModel[]): { foundFood: boolean; foodModel?: PlacedModel } => {
  const now = Date.now();
  
  // Check eating cooldown
  if (now < pig.timers.eatCooldown) {
    return { foundFood: false };
  }
  
  for (const model of foodModels) {
    const dist = distance(pig.position, model.position);
    if (dist < 1.5) {
      return { foundFood: true, foodModel: model };
    }
  }
  
  return { foundFood: false };
};

export const updatePigAI = (pig: PigState, otherPigs: PigState[], deltaTime: number, attractiveModels: PlacedModel[] = [], foodModels: PlacedModel[] = []): PigState => {
  const now = Date.now();
  let newState = { ...pig };

  // Check for food interaction first
  const foodInteraction = checkFoodInteraction(pig, foodModels);
  if (foodInteraction.foundFood && pig.state !== 'eating') {
    newState.state = 'eating';
    newState.timers.stateChange = now + randomInRange(2000, 4000);
    newState.timers.eatCooldown = now + 10000; // 10 second cooldown
  }

  // State transitions
  if (now > pig.timers.stateChange) {
    const rand = Math.random();
    if (pig.state === 'eating') {
      newState.state = 'wandering';
      newState.target = calculateWanderTarget(pig);
      newState.timers.stateChange = now + randomInRange(5000, 15000);
    } else if (pig.state === 'wandering' && rand < pig.personality.restChance) {
      newState.state = 'resting';
      newState.timers.stateChange = now + randomInRange(3000, 8000);
    } else if (pig.state === 'resting' && rand < 0.7) {
      newState.state = 'wandering';
      newState.target = calculateWanderTarget(pig);
      newState.timers.stateChange = now + randomInRange(5000, 15000);
    }
  }

  // Direction changes for wandering pigs
  if (pig.state === 'wandering' && now > pig.timers.lastDirection) {
    newState.target = calculateWanderTarget(pig);
    newState.timers.lastDirection = now + randomInRange(1000, 4000);
  }

  // Calculate movement forces
  if (pig.state === 'wandering') {
    const seekForce = calculateSeekVector(pig, pig.target);
    const avoidanceForce = calculateAvoidanceVector(pig, otherPigs);
    const attractionForce = calculateAttractionVector(pig, attractiveModels);
    
    // Combine forces
    newState.velocity = add(add(seekForce, avoidanceForce), attractionForce);
    
    // Apply movement
    const newPosition = add(pig.position, multiply(newState.velocity, deltaTime));
    newState.position = enforceFieldBoundaries(newPosition);
    
    // Update rotation to face movement direction
    if (newState.velocity.x !== 0 || newState.velocity.z !== 0) {
      newState.rotation.y = Math.atan2(newState.velocity.x, newState.velocity.z);
    }
  } else if (pig.state === 'eating') {
    // Eating - no movement
    newState.velocity = multiply(newState.velocity, 0.1);
  } else {
    // Resting - minimal movement
    newState.velocity = multiply(newState.velocity, 0.9);
  }

  return newState;
};