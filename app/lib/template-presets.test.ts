import { describe, it, expect } from 'vitest';
import { TEMPLATES, FONT_MAP } from './template-presets';

/**
 * Task 9: Verify theme-specific refinements
 * 
 * This test suite verifies that all 8 themes have their color palettes, fonts,
 * card styles, button styles, animations, and spacing settings properly defined.
 * 
 * Requirements: 7.1-7.5, 8.1-8.6, 9.1-9.5, 10.1-10.6, 11.1-11.6, 12.1-12.6, 13.1-13.7, 14.1-14.7
 */

describe('Task 9: Theme-Specific Refinements Verification', () => {
  
  // Helper to verify all required theme properties are defined
  const verifyThemeProperties = (themeName: string, theme: any) => {
    // Color palette (8 colors)
    expect(theme.primary_color, `${themeName}: primary_color`).toBeDefined();
    expect(theme.secondary_color, `${themeName}: secondary_color`).toBeDefined();
    expect(theme.background_color, `${themeName}: background_color`).toBeDefined();
    expect(theme.text_color, `${themeName}: text_color`).toBeDefined();
    expect(theme.accent_color, `${themeName}: accent_color`).toBeDefined();
    expect(theme.surface_color, `${themeName}: surface_color`).toBeDefined();
    expect(theme.heading_color, `${themeName}: heading_color`).toBeDefined();
    expect(theme.border_color, `${themeName}: border_color`).toBeDefined();

    // Typography
    expect(theme.font_family, `${themeName}: font_family`).toBeDefined();
    expect(theme.heading_font, `${themeName}: heading_font`).toBeDefined();
    expect(theme.font_size, `${themeName}: font_size`).toBeDefined();

    // Layout & Cards
    expect(theme.layout_style, `${themeName}: layout_style`).toBeDefined();
    expect(theme.card_style, `${themeName}: card_style`).toBeDefined();
    expect(theme.border_radius, `${themeName}: border_radius`).toBeDefined();
    expect(theme.card_shadow, `${themeName}: card_shadow`).toBeDefined();

    // Buttons & Interactions
    expect(theme.button_style, `${themeName}: button_style`).toBeDefined();
    expect(theme.button_radius, `${themeName}: button_radius`).toBeDefined();
    expect(theme.animation_style, `${themeName}: animation_style`).toBeDefined();

    // Other
    expect(theme.spacing, `${themeName}: spacing`).toBeDefined();
    expect(theme.header_style, `${themeName}: header_style`).toBeDefined();
    expect(theme.image_aspect_ratio, `${themeName}: image_aspect_ratio`).toBeDefined();
  };

  describe('9.1: Fresh Market Theme (green, modern, bouncy)', () => {
    const theme = TEMPLATES.find(t => t.id === 'fresh-market');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Fresh Market');
      expect(theme?.category).toBe('food');
    });

    it('should have green color palette with primary #16a34a', () => {
      expect(theme?.theme.primary_color).toBe('#16a34a');
      expect(theme?.theme.secondary_color).toBe('#15803d');
      expect(theme?.theme.accent_color).toBe('#eab308');
    });

    it('should use Poppins font for headings and body', () => {
      expect(theme?.theme.font_family).toBe('poppins');
      expect(theme?.theme.heading_font).toBe('poppins');
      expect(FONT_MAP[theme?.theme.font_family || '']).toBe("'Poppins', sans-serif");
    });

    it('should have modern card style with soft shadows', () => {
      expect(theme?.theme.card_style).toBe('modern');
      expect(theme?.theme.card_shadow).toBe('soft');
    });

    it('should have pill button radius for friendly rounded buttons', () => {
      expect(theme?.theme.button_radius).toBe('pill');
      expect(theme?.theme.button_style).toBe('solid');
    });

    it('should use bounce animation for energetic feel', () => {
      expect(theme?.theme.animation_style).toBe('bounce');
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Fresh Market', theme?.theme);
    });
  });

  describe('9.2: Luxe Boutique Theme (black/gold, minimal, elegant)', () => {
    const theme = TEMPLATES.find(t => t.id === 'luxe-boutique');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Luxe Boutique');
      expect(theme?.category).toBe('fashion');
    });

    it('should have black/gold color palette', () => {
      expect(theme?.theme.primary_color).toBe('#18181b');
      expect(theme?.theme.accent_color).toBe('#c59b3f');
    });

    it('should use Playfair Display for headings and Inter for body', () => {
      expect(theme?.theme.heading_font).toBe('playfair');
      expect(theme?.theme.font_family).toBe('inter');
    });

    it('should have minimal card style with no shadows', () => {
      expect(theme?.theme.card_style).toBe('minimal');
      expect(theme?.theme.card_shadow).toBe('none');
    });

    it('should have sharp border radius for contemporary angular edges', () => {
      expect(theme?.theme.border_radius).toBe('sharp');
    });

    it('should use fade animation for subtle elegant transitions', () => {
      expect(theme?.theme.animation_style).toBe('fade');
    });

    it('should use masonry layout for editorial presentation', () => {
      expect(theme?.theme.layout_style).toBe('masonry');
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Luxe Boutique', theme?.theme);
    });
  });

  describe('9.3: Tech Store Theme (blue, modern, dynamic)', () => {
    const theme = TEMPLATES.find(t => t.id === 'tech-store');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Tech Store');
      expect(theme?.category).toBe('tech');
    });

    it('should have blue color palette with primary #2563eb', () => {
      expect(theme?.theme.primary_color).toBe('#2563eb');
      expect(theme?.theme.secondary_color).toBe('#1d4ed8');
      expect(theme?.theme.accent_color).toBe('#06b6d4');
    });

    it('should use Space Grotesk for headings', () => {
      expect(theme?.theme.heading_font).toBe('spaceGrotesk');
      expect(FONT_MAP[theme?.theme.heading_font || '']).toBe("'Space Grotesk', sans-serif");
    });

    it('should have modern card style with elevated shadows', () => {
      expect(theme?.theme.card_style).toBe('modern');
      expect(theme?.theme.card_shadow).toBe('elevated');
    });

    it('should use slide animation for dynamic modern feel', () => {
      expect(theme?.theme.animation_style).toBe('slide');
    });

    it('should use landscape image aspect ratio', () => {
      expect(theme?.theme.image_aspect_ratio).toBe('landscape');
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Tech Store', theme?.theme);
    });
  });

  describe('9.4: Beauty & Glow Theme (pink, soft, feminine)', () => {
    const theme = TEMPLATES.find(t => t.id === 'beauty-glow');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Beauty & Glow');
      expect(theme?.category).toBe('beauty');
    });

    it('should have pink color palette with primary #db2777', () => {
      expect(theme?.theme.primary_color).toBe('#db2777');
      expect(theme?.theme.secondary_color).toBe('#be185d');
      expect(theme?.theme.accent_color).toBe('#f472b6');
    });

    it('should use Playfair Display for headings and DM Sans for body', () => {
      expect(theme?.theme.heading_font).toBe('playfair');
      expect(theme?.theme.font_family).toBe('dmSans');
    });

    it('should have modern card style with soft shadows', () => {
      expect(theme?.theme.card_style).toBe('modern');
      expect(theme?.theme.card_shadow).toBe('soft');
    });

    it('should have pill border radius for soft rounded edges', () => {
      expect(theme?.theme.border_radius).toBe('pill');
    });

    it('should use zoom animation for gentle engaging transitions', () => {
      expect(theme?.theme.animation_style).toBe('zoom');
    });

    it('should use spacious spacing for airy luxurious feel', () => {
      expect(theme?.theme.spacing).toBe('spacious');
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Beauty & Glow', theme?.theme);
    });
  });

  describe('9.5: Quick Bites Theme (red/yellow, bold, energetic)', () => {
    const theme = TEMPLATES.find(t => t.id === 'quick-bites');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Quick Bites');
      expect(theme?.category).toBe('food');
    });

    it('should have red/yellow color palette', () => {
      expect(theme?.theme.primary_color).toBe('#dc2626');
      expect(theme?.theme.accent_color).toBe('#f59e0b');
    });

    it('should use Montserrat font for bold impactful typography', () => {
      expect(theme?.theme.font_family).toBe('montserrat');
      expect(theme?.theme.heading_font).toBe('montserrat');
    });

    it('should have bold card style with hard shadows', () => {
      expect(theme?.theme.card_style).toBe('bold');
      expect(theme?.theme.card_shadow).toBe('hard');
    });

    it('should use bounce animation for energetic playful feel', () => {
      expect(theme?.theme.animation_style).toBe('bounce');
    });

    it('should use large font size for easy readability', () => {
      expect(theme?.theme.font_size).toBe('large');
    });

    it('should use compact spacing for efficient content presentation', () => {
      expect(theme?.theme.spacing).toBe('compact');
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Quick Bites', theme?.theme);
    });
  });

  describe('9.6: Handmade & Craft Theme (brown/earth, classic, warm)', () => {
    const theme = TEMPLATES.find(t => t.id === 'handmade-craft');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Handmade & Craft');
      expect(theme?.category).toBe('artisan');
    });

    it('should have brown/earth color palette with primary #92400e', () => {
      expect(theme?.theme.primary_color).toBe('#92400e');
      expect(theme?.theme.secondary_color).toBe('#78350f');
      expect(theme?.theme.accent_color).toBe('#d97706');
    });

    it('should use Playfair Display for headings and Inter for body', () => {
      expect(theme?.theme.heading_font).toBe('playfair');
      expect(theme?.theme.font_family).toBe('inter');
    });

    it('should have classic card style with soft shadows', () => {
      expect(theme?.theme.card_style).toBe('classic');
      expect(theme?.theme.card_shadow).toBe('soft');
    });

    it('should use fade animation for gentle organic transitions', () => {
      expect(theme?.theme.animation_style).toBe('fade');
    });

    it('should use masonry layout for organic gallery-like presentation', () => {
      expect(theme?.theme.layout_style).toBe('masonry');
    });

    it('should use warm surface color #fffef2', () => {
      expect(theme?.theme.surface_color).toBe('#fffef2');
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Handmade & Craft', theme?.theme);
    });
  });

  describe('9.7: Midnight Luxe Theme (dark purple, sophisticated, premium)', () => {
    const theme = TEMPLATES.find(t => t.id === 'midnight-luxe');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Midnight Luxe');
      expect(theme?.category).toBe('premium');
    });

    it('should have dark purple color palette', () => {
      expect(theme?.theme.primary_color).toBe('#a78bfa');
      expect(theme?.theme.secondary_color).toBe('#7c3aed');
      expect(theme?.theme.background_color).toBe('#0f0f14');
    });

    it('should use Outfit font for modern stylish headings', () => {
      expect(theme?.theme.heading_font).toBe('outfit');
      expect(FONT_MAP[theme?.theme.heading_font || '']).toBe("'Outfit', sans-serif");
    });

    it('should have modern card style with elevated shadows', () => {
      expect(theme?.theme.card_style).toBe('modern');
      expect(theme?.theme.card_shadow).toBe('elevated');
    });

    it('should use glass button style for contemporary premium feel', () => {
      expect(theme?.theme.button_style).toBe('glass');
    });

    it('should use fade animation for smooth premium transitions', () => {
      expect(theme?.theme.animation_style).toBe('fade');
    });

    it('should use subtle border color #2e2e3a for refined separation', () => {
      expect(theme?.theme.border_color).toBe('#2e2e3a');
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Midnight Luxe', theme?.theme);
    });
  });

  describe('9.8: Studio Clean Theme (monochrome, minimal, architectural)', () => {
    const theme = TEMPLATES.find(t => t.id === 'studio-clean');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Studio Clean');
      expect(theme?.category).toBe('premium');
    });

    it('should have monochrome color palette', () => {
      expect(theme?.theme.primary_color).toBe('#0a0a0a');
      expect(theme?.theme.background_color).toBe('#ffffff');
      expect(theme?.theme.accent_color).toBe('#0a0a0a');
    });

    it('should use DM Sans for both headings and body for typographic consistency', () => {
      expect(theme?.theme.font_family).toBe('dmSans');
      expect(theme?.theme.heading_font).toBe('dmSans');
    });

    it('should have minimal card style with no shadows', () => {
      expect(theme?.theme.card_style).toBe('minimal');
      expect(theme?.theme.card_shadow).toBe('none');
    });

    it('should have sharp border radius for precise architectural edges', () => {
      expect(theme?.theme.border_radius).toBe('sharp');
    });

    it('should use fade animation for subtle unobtrusive transitions', () => {
      expect(theme?.theme.animation_style).toBe('fade');
    });

    it('should use spacious spacing for generous whitespace', () => {
      expect(theme?.theme.spacing).toBe('spacious');
    });

    it('should use minimal border color #f0f0f0', () => {
      expect(theme?.theme.border_color).toBe('#f0f0f0');
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Studio Clean', theme?.theme);
    });
  });

  describe('Overall Theme System Verification', () => {
    it('should have exactly 8 themes defined', () => {
      expect(TEMPLATES.length).toBe(8);
    });

    it('should have all themes with unique IDs', () => {
      const ids = TEMPLATES.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(TEMPLATES.length);
    });

    it('should have all themes with valid card_style values', () => {
      const validCardStyles = ['modern', 'classic', 'minimal', 'bold'];
      TEMPLATES.forEach(template => {
        expect(validCardStyles).toContain(template.theme.card_style);
      });
    });

    it('should have all themes with valid button_style values', () => {
      const validButtonStyles = ['solid', 'outline', 'soft', 'glass'];
      TEMPLATES.forEach(template => {
        expect(validButtonStyles).toContain(template.theme.button_style);
      });
    });

    it('should have all themes with valid animation_style values', () => {
      const validAnimations = ['none', 'fade', 'slide', 'zoom', 'bounce'];
      TEMPLATES.forEach(template => {
        expect(validAnimations).toContain(template.theme.animation_style);
      });
    });

    it('should have all themes with valid border_radius values', () => {
      const validRadii = ['sharp', 'rounded', 'pill'];
      TEMPLATES.forEach(template => {
        expect(validRadii).toContain(template.theme.border_radius);
      });
    });

    it('should have all themes with valid card_shadow values', () => {
      const validShadows = ['none', 'soft', 'elevated', 'hard'];
      TEMPLATES.forEach(template => {
        expect(validShadows).toContain(template.theme.card_shadow);
      });
    });

    it('should have all fonts defined in FONT_MAP', () => {
      TEMPLATES.forEach(template => {
        if (template.theme.font_family !== 'inter') {
          expect(FONT_MAP[template.theme.font_family]).toBeDefined();
        }
        if (template.theme.heading_font !== 'inter') {
          expect(FONT_MAP[template.theme.heading_font]).toBeDefined();
        }
      });
    });
  });
});
