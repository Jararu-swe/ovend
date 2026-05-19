'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

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

const SOUND_ASSETS: Record<NotificationType, string> = {
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  warning: '/sounds/warning.mp3',
  info: '/sounds/info.mp3',
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<SoundPreferences>(DEFAULT_PREFERENCES);
  const [isInitialized, setIsInitialized] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Map<NotificationType, AudioBuffer>>(new Map());

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

      // Pre-load sounds
      await Promise.all(
        Object.entries(SOUND_ASSETS).map(async ([type, url]) => {
          try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch sound: ${url}`);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            audioBuffersRef.current.set(type as NotificationType, audioBuffer);
          } catch (e) {
            console.error(`Error loading sound ${type}:`, e);
          }
        })
      );

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

      const buffer = audioBuffersRef.current.get(type);
      if (!buffer) {
        // Fallback to HTML5 Audio if buffer not loaded
        const audio = new Audio(SOUND_ASSETS[type]);
        audio.volume = preferences.volume / 100;
        audio.play().catch(e => console.error('HTML5 Audio playback failed', e));

        // Requirement 7.1: Update ARIA live region for fallback
        const announcer = document.getElementById('notification-announcer');
        if (announcer) {
          announcer.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} notification`;
          setTimeout(() => {
            if (announcer.textContent === `${type.charAt(0).toUpperCase() + type.slice(1)} notification`) {
              announcer.textContent = '';
            }
          }, 3000);
        }
        return;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gainNode = ctx.createGain();
      gainNode.gain.value = preferences.volume / 100;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start(0);

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
