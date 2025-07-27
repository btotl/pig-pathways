import { useState, useEffect, useCallback, useRef } from 'react';
import { PigState } from '../types';
import { createInitialPigState, updatePigAI } from '../utils/aiHelpers';
import { SCENE_SETTINGS } from '../utils/constants';

export const usePigAI = () => {
  const [pigs, setPigs] = useState<PigState[]>([]);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());

  // Initialize pigs
  useEffect(() => {
    const initialPigs: PigState[] = [];
    for (let i = 0; i < SCENE_SETTINGS.pigCount; i++) {
      initialPigs.push(createInitialPigState(`pig-${i}`));
    }
    setPigs(initialPigs);
  }, []);

  // Animation loop
  const updatePigs = useCallback(() => {
    const now = Date.now();
    const deltaTime = (now - lastTimeRef.current) / 1000; // Convert to seconds
    lastTimeRef.current = now;

    setPigs(currentPigs => 
      currentPigs.map(pig => updatePigAI(pig, currentPigs, deltaTime))
    );

    animationRef.current = requestAnimationFrame(updatePigs);
  }, []);

  // Start/stop animation
  useEffect(() => {
    if (pigs.length > 0) {
      animationRef.current = requestAnimationFrame(updatePigs);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pigs.length, updatePigs]);

  const resetPigs = useCallback(() => {
    const newPigs: PigState[] = [];
    for (let i = 0; i < SCENE_SETTINGS.pigCount; i++) {
      newPigs.push(createInitialPigState(`pig-${i}`));
    }
    setPigs(newPigs);
  }, []);

  const addPig = useCallback(() => {
    setPigs(currentPigs => {
      const newId = `pig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newPig = createInitialPigState(newId);
      return [...currentPigs, newPig];
    });
  }, []);

  const removePig = useCallback((pigId: string) => {
    setPigs(currentPigs => currentPigs.filter(pig => pig.id !== pigId));
  }, []);

  return {
    pigs,
    resetPigs,
    addPig,
    removePig
  };
};