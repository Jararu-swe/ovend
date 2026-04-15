import { describe, it, expect } from 'vitest';
import {
  getCardStyleClasses,
  getCardShadowClass,
  getCardHoverEffect,
  getSectionSpacing,
} from './utils';

describe('Theme Styling Helper Functions', () => {
  describe('getCardStyleClasses', () => {
    it('should return modern style with rounded border', () => {
      const result = getCardStyleClasses('modern', 'rounded');
      expect(result).toBe('rounded-2xl border border-slate-100');
    });

    it('should return modern style with pill border', () => {
      const result = getCardStyleClasses('modern', 'pill');
      expect(result).toBe('rounded-3xl border border-slate-100');
    });

    it('should return modern style with sharp border', () => {
      const result = getCardStyleClasses('modern', 'sharp');
      expect(result).toBe('rounded-none border border-slate-100');
    });

    it('should return classic style', () => {
      const result = getCardStyleClasses('classic', 'rounded');
      expect(result).toBe('rounded-xl border border-slate-200');
    });

    it('should return minimal style', () => {
      const result = getCardStyleClasses('minimal', 'rounded');
      expect(result).toBe('rounded-lg border border-transparent');
    });

    it('should return bold style with rounded border', () => {
      const result = getCardStyleClasses('bold', 'rounded');
      expect(result).toBe('rounded-2xl border-4');
    });

    it('should return bold style with pill border', () => {
      const result = getCardStyleClasses('bold', 'pill');
      expect(result).toBe('rounded-3xl border-4');
    });
  });

  describe('getCardShadowClass', () => {
    it('should return no shadow', () => {
      expect(getCardShadowClass('none')).toBe('shadow-none');
    });

    it('should return soft shadow', () => {
      expect(getCardShadowClass('soft')).toBe('shadow-sm');
    });

    it('should return elevated shadow', () => {
      expect(getCardShadowClass('elevated')).toBe('shadow-lg');
    });

    it('should return hard shadow', () => {
      expect(getCardShadowClass('hard')).toBe('shadow-[4px_4px_0px_rgba(0,0,0,0.1)]');
    });
  });

  describe('getCardHoverEffect', () => {
    it('should return modern hover effect', () => {
      const result = getCardHoverEffect('modern');
      expect(result).toContain('transition-all duration-300');
      expect(result).toContain('hover:shadow-xl');
      expect(result).toContain('hover:-translate-y-0.5');
    });

    it('should return minimal hover effect', () => {
      const result = getCardHoverEffect('minimal');
      expect(result).toContain('transition-all duration-300');
      expect(result).toContain('hover:border-slate-300');
    });

    it('should return bold hover effect', () => {
      const result = getCardHoverEffect('bold');
      expect(result).toContain('transition-all duration-300');
      expect(result).toContain('hover:-translate-y-1');
    });

    it('should return classic hover effect', () => {
      const result = getCardHoverEffect('classic');
      expect(result).toContain('transition-all duration-300');
      expect(result).toContain('hover:scale-[1.02]');
    });
  });

  describe('getSectionSpacing', () => {
    it('should return compact spacing', () => {
      const result = getSectionSpacing('compact');
      expect(result).toEqual({ section: '3rem', internal: '1.5rem' });
    });

    it('should return comfortable spacing', () => {
      const result = getSectionSpacing('comfortable');
      expect(result).toEqual({ section: '4rem', internal: '2rem' });
    });

    it('should return spacious spacing', () => {
      const result = getSectionSpacing('spacious');
      expect(result).toEqual({ section: '6rem', internal: '3rem' });
    });
  });
});
