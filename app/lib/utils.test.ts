import { describe, it, expect } from 'vitest';
import {
  getCardStyleClasses,
  getCardShadowClass,
  getCardHoverEffect,
  getSectionSpacing,
  validatePickupLocation,
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

  describe('validatePickupLocation', () => {
    describe('Requirement 8.1: Null location validation', () => {
      it('should reject null location', () => {
        const result = validatePickupLocation(null);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Location is required');
      });
    });

    describe('Requirement 8.2: Latitude validation', () => {
      it('should reject latitude below -90', () => {
        const result = validatePickupLocation({ lat: -91, lng: 0 });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid latitude');
      });

      it('should reject latitude above 90', () => {
        const result = validatePickupLocation({ lat: 91, lng: 0 });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid latitude');
      });

      it('should accept latitude at -90 boundary', () => {
        const result = validatePickupLocation({ lat: -90, lng: 0 });
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should accept latitude at 90 boundary', () => {
        const result = validatePickupLocation({ lat: 90, lng: 0 });
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should accept latitude within valid range', () => {
        const result = validatePickupLocation({ lat: 6.5244, lng: 3.3792 });
        expect(result.valid).toBe(true);
      });
    });

    describe('Requirement 8.3: Longitude validation', () => {
      it('should reject longitude below -180', () => {
        const result = validatePickupLocation({ lat: 0, lng: -181 });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid longitude');
      });

      it('should reject longitude above 180', () => {
        const result = validatePickupLocation({ lat: 0, lng: 181 });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid longitude');
      });

      it('should accept longitude at -180 boundary', () => {
        const result = validatePickupLocation({ lat: 0, lng: -180 });
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should accept longitude at 180 boundary', () => {
        const result = validatePickupLocation({ lat: 0, lng: 180 });
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should accept longitude within valid range', () => {
        const result = validatePickupLocation({ lat: 6.5244, lng: 3.3792 });
        expect(result.valid).toBe(true);
      });
    });

    describe('Requirement 8.4: Address details validation', () => {
      it('should accept location without address details', () => {
        const result = validatePickupLocation({ lat: 6.5244, lng: 3.3792 });
        expect(result.valid).toBe(true);
      });

      it('should accept address details with 500 characters', () => {
        const details = 'a'.repeat(500);
        const result = validatePickupLocation({ 
          lat: 6.5244, 
          lng: 3.3792, 
          details 
        });
        expect(result.valid).toBe(true);
      });

      it('should reject address details exceeding 500 characters', () => {
        const details = 'a'.repeat(501);
        const result = validatePickupLocation({ 
          lat: 6.5244, 
          lng: 3.3792, 
          details 
        });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Address details too long');
      });

      it('should accept valid address details', () => {
        const result = validatePickupLocation({ 
          lat: 6.5244, 
          lng: 3.3792, 
          details: '123 Market Street, Ikeja, Lagos'
        });
        expect(result.valid).toBe(true);
      });
    });

    describe('Requirement 8.5: Complete validation success', () => {
      it('should accept valid location with all fields', () => {
        const result = validatePickupLocation({
          lat: 6.5244,
          lng: 3.3792,
          details: '123 Market Street, Ikeja, Lagos'
        });
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should validate multiple correct examples', () => {
        const validLocations = [
          { lat: 0, lng: 0, details: 'Null Island' },
          { lat: 6.4281, lng: 3.4219, details: 'Victoria Island, Lagos' },
          { lat: -33.8688, lng: 151.2093, details: 'Sydney, Australia' },
          { lat: 51.5074, lng: -0.1278, details: 'London, UK' },
        ];

        validLocations.forEach(location => {
          const result = validatePickupLocation(location);
          expect(result.valid).toBe(true);
          expect(result.error).toBeUndefined();
        });
      });
    });
  });
});
