import { Vector3 } from '../types';

export const createVector3 = (x = 0, y = 0, z = 0): Vector3 => ({ x, y, z });

export const distance = (a: Vector3, b: Vector3): number => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
};

export const normalize = (vector: Vector3): Vector3 => {
  const length = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
  if (length === 0) return { x: 0, y: 0, z: 0 };
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length
  };
};

export const multiply = (vector: Vector3, scalar: number): Vector3 => ({
  x: vector.x * scalar,
  y: vector.y * scalar,
  z: vector.z * scalar
});

export const add = (a: Vector3, b: Vector3): Vector3 => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z
});

export const subtract = (a: Vector3, b: Vector3): Vector3 => ({
  x: a.x - b.x,
  y: a.y - b.y,
  z: a.z - b.z
});

export const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const randomVector3 = (minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number): Vector3 => ({
  x: randomInRange(minX, maxX),
  y: randomInRange(minY, maxY),
  z: randomInRange(minZ, maxZ)
});

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

export const lerpVector3 = (start: Vector3, end: Vector3, factor: number): Vector3 => ({
  x: lerp(start.x, end.x, factor),
  y: lerp(start.y, end.y, factor),
  z: lerp(start.z, end.z, factor)
});

export const angleToVector = (angle: number): Vector3 => ({
  x: Math.cos(angle),
  y: 0,
  z: Math.sin(angle)
});

export const vectorToAngle = (vector: Vector3): number => {
  return Math.atan2(vector.z, vector.x);
};