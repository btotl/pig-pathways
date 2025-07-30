import { useState, useEffect, useCallback, useRef } from 'react';
import { PigState, PlacedModel } from '../types';
import { createInitialPigState, updatePigAI } from '../utils/aiHelpers';
import { SCENE_SETTINGS } from '../utils/constants';

export const usePigAI = (placedModels: PlacedModel[] = [], foodModels: PlacedModel[] = [], pigSizeMultiplier: number = 1, speedMultiplier: number = 1) => {
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
      currentPigs.map(pig => {
        const updatedPig = updatePigAI(pig, currentPigs, deltaTime, placedModels, foodModels);
        // Apply size and speed multipliers
        return {
          ...updatedPig,
          size: updatedPig.size * pigSizeMultiplier,
          speed: updatedPig.speed * speedMultiplier
        };
      })
    );

    animationRef.current = requestAnimationFrame(updatePigs);
  }, [placedModels, foodModels, pigSizeMultiplier, speedMultiplier]);

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

  const addPig = useCallback((customSize?: number) => {
    setPigs(currentPigs => {
      const newId = `pig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newPig = createInitialPigState(newId);
      if (customSize) {
        newPig.size = customSize;
      }
      return [...currentPigs, newPig];
    });
  }, []);

  const removePig = useCallback((pigId: string) => {
    setPigs(currentPigs => currentPigs.filter(pig => pig.id !== pigId));
  }, []);

  const updatePigUrl = useCallback((pigId: string, url?: string) => {
    setPigs(currentPigs => currentPigs.map(pig => 
      pig.id === pigId ? { ...pig, urlAssignment: url } : pig
    ));
  }, []);

  const updatePigColor = useCallback((pigId: string, color?: string) => {
    setPigs(currentPigs => currentPigs.map(pig => 
      pig.id === pigId ? { ...pig, color } : pig
    ));
  }, []);

  return {
    pigs,
    resetPigs,
    addPig,
    removePig,
    updatePigUrl,
    updatePigColor
  };
};