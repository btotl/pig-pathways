import { useState, useEffect, useCallback, useRef } from 'react';
import { PlacedModel, AdminSettings, EnvironmentSettings } from '../types';

const DEFAULT_ENVIRONMENT: EnvironmentSettings = {
  grassColor: '#4ade80',
  grassDensity: 1000,
  windStrength: 1,
  grassHeight: [0.5, 2],
  ambientLightColor: '#ffffff',
  ambientLightIntensity: 0.4,
  sunColor: '#ffd700',
  sunIntensity: 1,
  sunPosition: { x: 10, y: 20, z: 5 },
  shadowsEnabled: true,
  fogEnabled: false,
  fogColor: '#87ceeb',
  fogNear: 50,
  fogFar: 200
};

const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  isAdminMode: false,
  defaultPigSize: 1,
  pigColorTint: '#ffffff',
  pigSpawnRate: 1,
  pigSpeedMultiplier: 1,
  environment: DEFAULT_ENVIRONMENT,
  hideInterface: true
};

export const useAdminSystem = () => {
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [placedModels, setPlacedModels] = useState<PlacedModel[]>([]);
  const [urlAssignments, setUrlAssignments] = useState<Record<string, string>>({});
  const passwordBufferRef = useRef('');
  const pageLoadTimeRef = useRef(Date.now());

  // Load saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    const savedModels = localStorage.getItem('placedModels');
    const savedUrls = localStorage.getItem('urlAssignments');

    if (savedSettings) {
      try {
        setAdminSettings({ ...DEFAULT_ADMIN_SETTINGS, ...JSON.parse(savedSettings) });
      } catch (error) {
        console.error('Failed to load admin settings:', error);
      }
    }

    if (savedModels) {
      try {
        setPlacedModels(JSON.parse(savedModels));
      } catch (error) {
        console.error('Failed to load placed models:', error);
      }
    }

    if (savedUrls) {
      try {
        setUrlAssignments(JSON.parse(savedUrls));
      } catch (error) {
        console.error('Failed to load URL assignments:', error);
      }
    }
  }, []);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
  }, [adminSettings]);

  useEffect(() => {
    localStorage.setItem('placedModels', JSON.stringify(placedModels));
  }, [placedModels]);

  useEffect(() => {
    localStorage.setItem('urlAssignments', JSON.stringify(urlAssignments));
  }, [urlAssignments]);

  // Hidden admin access via password
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      passwordBufferRef.current += event.key.toLowerCase();
      
      if (passwordBufferRef.current.includes('thecure93')) {
        setAdminSettings(prev => ({ ...prev, isAdminMode: !prev.isAdminMode }));
        passwordBufferRef.current = '';
      }
      
      // Clear buffer if too long
      if (passwordBufferRef.current.length > 30) {
        passwordBufferRef.current = passwordBufferRef.current.slice(-15);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update model visibility based on schedules
  useEffect(() => {
    const updateModelVisibility = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const currentDay = now.getDay();
      const pageLoadElapsed = (Date.now() - pageLoadTimeRef.current) / 1000;

      setPlacedModels(prev => prev.map(model => {
        let isVisible = true;

        // Check food timer
        if (model.isFood && pageLoadElapsed < model.foodTimer) {
          isVisible = false;
        }

        // Check schedule
        if (model.schedule && isVisible) {
          const { startDate, endDate, startTime, endTime, daysOfWeek } = model.schedule;

          // Check date range
          if (startDate || endDate) {
            const currentDate = now.toISOString().split('T')[0];
            if (startDate && currentDate < startDate) isVisible = false;
            if (endDate && currentDate > endDate) isVisible = false;
          }

          // Check time range
          if (startTime || endTime) {
            const [startHour, startMin] = (startTime || '00:00').split(':').map(Number);
            const [endHour, endMin] = (endTime || '23:59').split(':').map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            
            if (currentTime < startMinutes || currentTime > endMinutes) {
              isVisible = false;
            }
          }

          // Check days of week
          if (daysOfWeek && daysOfWeek.length > 0) {
            if (!daysOfWeek.includes(currentDay)) {
              isVisible = false;
            }
          }
        }

        return { ...model, isVisible };
      }));
    };

    updateModelVisibility();
    const interval = setInterval(updateModelVisibility, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const updateAdminSettings = useCallback((updates: Partial<AdminSettings>) => {
    setAdminSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const addPlacedModel = useCallback((model: Omit<PlacedModel, 'id'>) => {
    const newModel: PlacedModel = {
      ...model,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      isVisible: true
    };
    setPlacedModels(prev => [...prev, newModel]);
  }, []);

  const updatePlacedModel = useCallback((id: string, updates: Partial<PlacedModel>) => {
    setPlacedModels(prev => prev.map(model => 
      model.id === id ? { ...model, ...updates } : model
    ));
  }, []);

  const removePlacedModel = useCallback((id: string) => {
    setPlacedModels(prev => prev.filter(model => model.id !== id));
  }, []);

  const assignUrl = useCallback((objectId: string, url: string) => {
    setUrlAssignments(prev => ({ ...prev, [objectId]: url }));
  }, []);

  const removeUrlAssignment = useCallback((objectId: string) => {
    setUrlAssignments(prev => {
      const updated = { ...prev };
      delete updated[objectId];
      return updated;
    });
  }, []);

  const getVisibleModels = useCallback(() => {
    return placedModels.filter(model => model.isVisible);
  }, [placedModels]);

  const getFoodModels = useCallback(() => {
    const pageLoadElapsed = (Date.now() - pageLoadTimeRef.current) / 1000;
    return placedModels.filter(model => 
      model.isFood && 
      model.isVisible && 
      pageLoadElapsed >= model.foodTimer
    );
  }, [placedModels]);

  return {
    adminSettings,
    placedModels,
    urlAssignments,
    updateAdminSettings,
    addPlacedModel,
    updatePlacedModel,
    removePlacedModel,
    assignUrl,
    removeUrlAssignment,
    getVisibleModels,
    getFoodModels
  };
};