'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

export type NotificationType = 'order';

interface SoundPreferences {
  enabled: boolean;
  volume: number; // 0 to 100
}

interface SoundContextType {
  preferences: SoundPreferences;
  updatePreferences: (prefs: Partial<SoundPreferences>) => void;
  playSound: (type: NotificationType) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: SoundPreferences = {
  enabled: true,
  volume: 50,
};

/**
 * Programmatically synthesizes minimalist "monochrome" sounds using Web Audio API.
 * This provides a clean, electronic aesthetic similar to modern IDE notifications.
 */
const synthesizeMonochromeSound = (ctx: AudioContext, type: NotificationType, volume: number) => {
  const gainNode = ctx.createGain();
  gainNode.gain.value = volume / 100;
  gainNode.connect(ctx.destination);

  const now = ctx.currentTime;

  switch (type) {
    case 'order': {
      // Clean ascending double-ping (Trae-like)
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1); // E6
      
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.2, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.connect(g);
      g.connect(gainNode);

      osc.start(now);
      osc.stop(now + 0.3);
      break;
    }
  }
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<SoundPreferences>(DEFAULT_PREFERENCES);
  const [isInitialized, setIsInitialized] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vendle_sound_preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse sound preferences', e);
      }
    } else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Requirement 7.4: Respect prefers-reduced-motion by defaulting to disabled
      setPreferences(prev => ({ ...prev, enabled: false }));
    }
    setIsInitialized(true);
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('vendle_sound_preferences', JSON.stringify(preferences));
    }
  }, [preferences, isInitialized]);

  // Initialize Web Audio API
  const initAudio = useCallback(async () => {
    if (audioContextRef.current) return audioContextRef.current;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported');
        return null;
      }

      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      return ctx;
    } catch (e) {
      console.error('Failed to initialize AudioContext', e);
      return null;
    }
  }, []);

  const playSound = useCallback(async (type: NotificationType) => {
    if (!preferences.enabled || preferences.volume === 0) return;

    try {
      let ctx = audioContextRef.current;
      if (!ctx || ctx.state === 'suspended') {
        ctx = await initAudio();
        if (!ctx) return;
        if (ctx.state === 'suspended') await ctx.resume();
      }

      // Use synthesized monochrome sounds
      synthesizeMonochromeSound(ctx, type, preferences.volume);

      // Requirement 7.1: Update ARIA live region
      const announcer = document.getElementById('notification-announcer');
      if (announcer) {
        announcer.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} notification`;
        // Clear after a delay so subsequent identical notifications are announced
        setTimeout(() => {
          if (announcer.textContent === `${type.charAt(0).toUpperCase() + type.slice(1)} notification`) {
            announcer.textContent = '';
          }
        }, 3000);
      }
    } catch (e) {
      console.error('Error playing sound', e);
    }
  }, [preferences, initAudio]);

  const updatePreferences = useCallback((newPrefs: Partial<SoundPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  }, []);

  return (
    <SoundContext.Provider value={{ preferences, updatePreferences, playSound }}>
      {children}
      {/* Requirement 7.1: ARIA live region for screen readers */}
      <div 
        aria-live="polite" 
        className="sr-only" 
        id="notification-announcer"
      />
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
