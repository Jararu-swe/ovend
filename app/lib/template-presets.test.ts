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

    it('should use zoom animation for dynamic modern feel', () => {
      expect(theme?.theme.animation_style).toBe('zoom');
    });

    it('should use square image aspect ratio for product display', () => {
      expect(theme?.theme.image_aspect_ratio).toBe('square');
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

  // ── Premium (Pro-Tier) Theme Tests ─────────────────────────
  //
  // These themes are gated behind the Pro subscription tier (minTier: 'pro').
  // They provide advanced styling, glassmorphism, and luxury design elements
  // that are exclusive to paying subscribers.
  //

  describe('9.9: Monochrome Pro Theme (strict black/white, minimal, ultra-clean)', () => {
    const theme = TEMPLATES.find(t => t.id === 'monochrome-pro');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Monochrome Pro');
      expect(theme?.category).toBe('premium');
      expect(theme?.minTier).toBe('pro');
    });

    it('should have strict black and white color palette', () => {
      expect(theme?.theme.primary_color).toBe('#000000');
      expect(theme?.theme.secondary_color).toBe('#000000');
      expect(theme?.theme.background_color).toBe('#ffffff');
      expect(theme?.theme.accent_color).toBe('#000000');
    });

    it('should use Inter font for both headings and body', () => {
      expect(theme?.theme.font_family).toBe('inter');
      expect(theme?.theme.heading_font).toBe('inter');
    });

    it('should have minimal card style with no shadows', () => {
      expect(theme?.theme.card_style).toBe('minimal');
      expect(theme?.theme.card_shadow).toBe('none');
    });

    it('should have sharp border radius for precise architectural edges', () => {
      expect(theme?.theme.border_radius).toBe('sharp');
      expect(theme?.theme.button_radius).toBe('sharp');
    });

    it('should have no animation for ultra-clean minimalism', () => {
      expect(theme?.theme.animation_style).toBe('none');
    });

    it('should use full layout width with spacious spacing', () => {
      expect(theme?.theme.layout_width).toBe('full');
      expect(theme?.theme.spacing).toBe('spacious');
    });

    it('should use transparent header with centered logo', () => {
      expect(theme?.theme.header_style).toBe('transparent');
      expect(theme?.theme.logo_position).toBe('center');
      expect(theme?.theme.logo_frame).toBe('none');
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Monochrome Pro', theme?.theme);
    });
  });

  describe('9.10: Gold Reserve Theme (navy/gold, glassmorphism, luxury)', () => {
    const theme = TEMPLATES.find(t => t.id === 'gold-reserve');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Gold Reserve');
      expect(theme?.category).toBe('premium');
      expect(theme?.minTier).toBe('pro');
    });

    it('should have deep navy and gold color palette', () => {
      expect(theme?.theme.primary_color).toBe('#fbbf24');
      expect(theme?.theme.secondary_color).toBe('#d97706');
      expect(theme?.theme.background_color).toBe('#020617');
      expect(theme?.theme.accent_color).toBe('#fbbf24');
    });

    it('should use Playfair Display for headings and Outfit for body', () => {
      expect(theme?.theme.heading_font).toBe('playfair');
      expect(theme?.theme.font_family).toBe('outfit');
    });

    it('should have modern card style with elevated shadows', () => {
      expect(theme?.theme.card_style).toBe('modern');
      expect(theme?.theme.card_shadow).toBe('elevated');
    });

    it('should use glass button style for premium glassmorphism effects', () => {
      expect(theme?.theme.button_style).toBe('glass');
      expect(theme?.theme.glass_effect).toBe(true);
    });

    it('should use pill button radius for luxurious rounded buttons', () => {
      expect(theme?.theme.button_radius).toBe('pill');
    });

    it('should use zoom animation with spacious spacing', () => {
      expect(theme?.theme.animation_style).toBe('zoom');
      expect(theme?.theme.spacing).toBe('spacious');
    });

    it('should use masonry layout for editorial feel', () => {
      expect(theme?.theme.layout_style).toBe('masonry');
    });

    it('should have gold gradient background', () => {
      expect(theme?.theme.primary_gradient).toContain('fbbf24');
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Gold Reserve', theme?.theme);
    });
  });

  describe('9.11: Crystal Diamond Theme (iridescent, glass, elegant)', () => {
    const theme = TEMPLATES.find(t => t.id === 'crystal-diamond');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Crystal Diamond');
      expect(theme?.category).toBe('premium');
      expect(theme?.minTier).toBe('pro');
    });

    it('should have iridescent purple/pink color palette', () => {
      expect(theme?.theme.primary_color).toBe('#c084fc');
      expect(theme?.theme.secondary_color).toBe('#a855f7');
      expect(theme?.theme.accent_color).toBe('#f472b6');
    });

    it('should use DM Sans for headings and Inter for body', () => {
      expect(theme?.theme.heading_font).toBe('dmSans');
      expect(theme?.theme.font_family).toBe('inter');
    });

    it('should have modern card style with elevated shadows and glass effect', () => {
      expect(theme?.theme.card_style).toBe('modern');
      expect(theme?.theme.card_shadow).toBe('elevated');
      expect(theme?.theme.glass_effect).toBe(true);
    });

    it('should use glass button style with pill radius', () => {
      expect(theme?.theme.button_style).toBe('glass');
      expect(theme?.theme.button_radius).toBe('pill');
    });

    it('should use fade animation for smooth transitions', () => {
      expect(theme?.theme.animation_style).toBe('fade');
    });

    it('should use spacious spacing with portrait aspect ratio', () => {
      expect(theme?.theme.spacing).toBe('spacious');
      expect(theme?.theme.image_aspect_ratio).toBe('portrait');
    });

    it('should have Lucide icon library with outline fill', () => {
      expect(theme?.theme.icon_library).toBe('lucide');
      expect(theme?.theme.icon_fill).toBe('outline');
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Crystal Diamond', theme?.theme);
    });
  });

  describe('9.12: Noir Luxe Theme (all-black, gold accents, ultra-premium)', () => {
    const theme = TEMPLATES.find(t => t.id === 'noir-luxe');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Noir Luxe');
      expect(theme?.category).toBe('premium');
      expect(theme?.minTier).toBe('pro');
    });

    it('should have all-black with gold accent color palette', () => {
      expect(theme?.theme.primary_color).toBe('#d4a574');
      expect(theme?.theme.background_color).toBe('#0a0a0a');
      expect(theme?.theme.accent_color).toBe('#d4a574');
      expect(theme?.theme.surface_color).toBe('#141414');
    });

    it('should use Playfair Display for headings and Outfit for body', () => {
      expect(theme?.theme.heading_font).toBe('playfair');
      expect(theme?.theme.font_family).toBe('outfit');
    });

    it('should have minimal card style with no shadows', () => {
      expect(theme?.theme.card_style).toBe('minimal');
      expect(theme?.theme.card_shadow).toBe('none');
    });

    it('should use outline button style with sharp radius', () => {
      expect(theme?.theme.button_style).toBe('outline');
      expect(theme?.theme.button_radius).toBe('sharp');
    });

    it('should use fade animation with spacious spacing', () => {
      expect(theme?.theme.animation_style).toBe('fade');
      expect(theme?.theme.spacing).toBe('spacious');
    });

    it('should use full layout width with glass effect', () => {
      expect(theme?.theme.layout_width).toBe('full');
      expect(theme?.theme.glass_effect).toBe(true);
    });

    it('should have Lucide icon library with light weight', () => {
      expect(theme?.theme.icon_library).toBe('lucide');
      expect(theme?.theme.icon_weight).toBe('light');
      expect(theme?.theme.cart_icon).toBe('shopping-bag');
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Noir Luxe', theme?.theme);
    });
  });

  describe('9.13: Neon Nights Theme (cyberpunk, neon, animated)', () => {
    const theme = TEMPLATES.find(t => t.id === 'neon-nights');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Neon Nights');
      expect(theme?.category).toBe('premium');
      expect(theme?.minTier).toBe('pro');
    });

    it('should have cyberpunk neon color palette', () => {
      expect(theme?.theme.primary_color).toBe('#22d3ee');
      expect(theme?.theme.accent_color).toBe('#e879f9');
      expect(theme?.theme.background_color).toBe('#09090b');
    });

    it('should use Space Grotesk for headings and Inter for body', () => {
      expect(theme?.theme.heading_font).toBe('spaceGrotesk');
      expect(theme?.theme.font_family).toBe('inter');
    });

    it('should have bold card style with elevated shadows', () => {
      expect(theme?.theme.card_style).toBe('bold');
      expect(theme?.theme.card_shadow).toBe('elevated');
    });

    it('should use glass button style with sharp radius', () => {
      expect(theme?.theme.button_style).toBe('glass');
      expect(theme?.theme.button_radius).toBe('sharp');
      expect(theme?.theme.glass_effect).toBe(true);
    });

    it('should use zoom animation for energetic transitions', () => {
      expect(theme?.theme.animation_style).toBe('zoom');
    });

    it('should use compact spacing with landscape aspect ratio', () => {
      expect(theme?.theme.spacing).toBe('compact');
      expect(theme?.theme.image_aspect_ratio).toBe('landscape');
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Neon Nights', theme?.theme);
    });
  });

  describe('9.14: Tropical Paradise Theme (vibrant, lush, tropical)', () => {
    const theme = TEMPLATES.find(t => t.id === 'tropical-paradise');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Tropical Paradise');
      expect(theme?.category).toBe('premium');
      expect(theme?.minTier).toBe('pro');
    });

    it('should have vibrant tropical green/orange color palette', () => {
      expect(theme?.theme.primary_color).toBe('#059669');
      expect(theme?.theme.accent_color).toBe('#f97316');
      expect(theme?.theme.background_color).toBe('#fefce8');
    });

    it('should use Poppins font for body and Montserrat for headings', () => {
      expect(theme?.theme.font_family).toBe('poppins');
      expect(theme?.theme.heading_font).toBe('montserrat');
    });

    it('should have modern card style with soft shadows', () => {
      expect(theme?.theme.card_style).toBe('modern');
      expect(theme?.theme.card_shadow).toBe('soft');
    });

    it('should use solid button style with pill radius', () => {
      expect(theme?.theme.button_style).toBe('solid');
      expect(theme?.theme.button_radius).toBe('pill');
    });

    it('should use bounce animation for energetic tropical feel', () => {
      expect(theme?.theme.animation_style).toBe('bounce');
    });

    it('should have announcement bar enabled and tropical gradient', () => {
      expect(theme?.theme.primary_gradient).toContain('059669');
      expect(theme?.sections.some(s => s.id === 'announcement-bar' && s.enabled)).toBe(true);
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Tropical Paradise', theme?.theme);
    });
  });

  // ── Business Tier Theme Tests ────────────────────────────
  describe('9.15: Elite Reserve Theme (dark, platinum, ultra-luxury, business tier)', () => {
    const theme = TEMPLATES.find(t => t.id === 'elite-reserve');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Elite Reserve');
      expect(theme?.category).toBe('premium');
      expect(theme?.minTier).toBe('business');
    });

    it('should have platinum silver and navy color palette', () => {
      expect(theme?.theme.primary_color).toBe('#e2e8f0');
      expect(theme?.theme.secondary_color).toBe('#0f172a');
      expect(theme?.theme.background_color).toBe('#020617');
      expect(theme?.theme.accent_color).toBe('#94a3b8');
    });

    it('should use Outfit for body and Playfair for headings', () => {
      expect(theme?.theme.font_family).toBe('outfit');
      expect(theme?.theme.heading_font).toBe('playfair');
    });

    it('should have minimal card style with no shadows', () => {
      expect(theme?.theme.card_style).toBe('minimal');
      expect(theme?.theme.card_shadow).toBe('none');
    });

    it('should use glass button style with sharp radius', () => {
      expect(theme?.theme.button_style).toBe('glass');
      expect(theme?.theme.button_radius).toBe('sharp');
    });

    it('should use masonry layout with spacious spacing', () => {
      expect(theme?.theme.layout_style).toBe('masonry');
      expect(theme?.theme.spacing).toBe('spacious');
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Elite Reserve', theme?.theme);
    });
  });

  describe('9.16: Aura Theme (ethereal, light, pastel, business tier)', () => {
    const theme = TEMPLATES.find(t => t.id === 'aura');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Aura');
      expect(theme?.category).toBe('premium');
      expect(theme?.minTier).toBe('business');
    });

    it('should have purple pastel color palette', () => {
      expect(theme?.theme.primary_color).toBe('#a78bfa');
      expect(theme?.theme.secondary_color).toBe('#c084fc');
      expect(theme?.theme.accent_color).toBe('#f472b6');
    });

    it('should use DM Sans for both headings and body', () => {
      expect(theme?.theme.font_family).toBe('dmSans');
      expect(theme?.theme.heading_font).toBe('dmSans');
    });

    it('should have modern card style with soft shadows', () => {
      expect(theme?.theme.card_style).toBe('modern');
      expect(theme?.theme.card_shadow).toBe('soft');
    });

    it('should use glass button style with pill radius', () => {
      expect(theme?.theme.button_style).toBe('glass');
      expect(theme?.theme.button_radius).toBe('pill');
    });

    it('should use portrait image aspect ratio with spacious spacing', () => {
      expect(theme?.theme.image_aspect_ratio).toBe('portrait');
      expect(theme?.theme.spacing).toBe('spacious');
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Aura', theme?.theme);
    });
  });

  describe('9.17: Nexus Theme (futuristic, dark, neon, business tier)', () => {
    const theme = TEMPLATES.find(t => t.id === 'nexus');

    it('should exist and have correct metadata', () => {
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('Nexus');
      expect(theme?.category).toBe('premium');
      expect(theme?.minTier).toBe('business');
    });

    it('should have cyan and purple neon color palette', () => {
      expect(theme?.theme.primary_color).toBe('#06b6d4');
      expect(theme?.theme.secondary_color).toBe('#0891b2');
      expect(theme?.theme.accent_color).toBe('#8b5cf6');
    });

    it('should use Space Grotesk for both headings and body', () => {
      expect(theme?.theme.font_family).toBe('spaceGrotesk');
      expect(theme?.theme.heading_font).toBe('spaceGrotesk');
    });

    it('should have modern card style with elevated shadows', () => {
      expect(theme?.theme.card_style).toBe('modern');
      expect(theme?.theme.card_shadow).toBe('elevated');
    });

    it('should use glass button style with rounded radius', () => {
      expect(theme?.theme.button_style).toBe('glass');
      expect(theme?.theme.button_radius).toBe('rounded');
    });

    it('should use zoom animation for dynamic feel', () => {
      expect(theme?.theme.animation_style).toBe('zoom');
    });

    it('should have all required theme properties', () => {
      verifyThemeProperties('Nexus', theme?.theme);
    });
  });

  // ── Premium Tier Access & Feature Gate Tests ──────────────
  describe('Premium Tier Access Verification', () => {
    const allGatedThemes = TEMPLATES.filter(t => t.minTier && t.minTier !== 'starter');
    const proThemes = TEMPLATES.filter(t => t.minTier === 'pro');
    const businessThemes = TEMPLATES.filter(t => t.minTier === 'business');
    const allPremiumCategories = TEMPLATES.filter(t => t.category === 'premium');

    it('should have all premium-category themes gated behind pro or business tier', () => {
      // Every theme with category 'premium' must have minTier set
      allPremiumCategories.forEach(theme => {
        expect(theme.minTier, `${theme.id}: premium themes must have minTier set`).toBeDefined();
      });
    });

    it('should have business-tier themes with minTier="business"', () => {
      businessThemes.forEach(theme => {
        expect(theme.minTier, `${theme.id}: should require business tier`).toBe('business');
      });
    });

    it('should have correct minTier value for all pro-gated themes', () => {
      proThemes.forEach(theme => {
        expect(theme.minTier, `${theme.id}: should require pro tier`).toBe('pro');
      });
    });

    it('should have all gated themes with advanced styling properties configured', () => {
      allGatedThemes.forEach(theme => {
        expect(theme.theme.glass_effect, `${theme.id}: glass_effect should be defined`).toBeDefined();
        expect(theme.theme.button_style, `${theme.id}: button_style should be defined`).toBeDefined();
        expect(theme.theme.card_shadow, `${theme.id}: card_shadow should be defined`).toBeDefined();
        expect(theme.theme.layout_width, `${theme.id}: layout_width should be defined`).toBeDefined();
      });
    });

    it('should have all pro/business-tier themes with icon fields consistent when set', () => {
      allGatedThemes.forEach(theme => {
        const hasIconLibrary = theme.theme.icon_library !== undefined;
        const hasIconFill = theme.theme.icon_fill !== undefined;
        const hasIconWeight = theme.theme.icon_weight !== undefined;
        if (hasIconLibrary || hasIconFill || hasIconWeight) {
          expect(theme.theme.icon_library, `${theme.id}: icon_library should be set when any icon field is set`).toBeDefined();
          expect(theme.theme.icon_fill, `${theme.id}: icon_fill should be set when any icon field is set`).toBeDefined();
          expect(theme.theme.icon_weight, `${theme.id}: icon_weight should be set when any icon field is set`).toBeDefined();
        }
      });
    });

    it('should have no non-premium themes with minTier set', () => {
      TEMPLATES.filter(t => t.category !== 'premium').forEach(theme => {
        expect(theme.minTier, `${theme.id}: non-premium themes should not have minTier`).toBeUndefined();
      });
    });

    it('should have unique IDs for all gated themes', () => {
      const gatedIds = allGatedThemes.map(t => t.id);
      const uniqueIds = new Set(gatedIds);
      expect(uniqueIds.size).toBe(allGatedThemes.length);
    });
  });

  describe('Overall Theme System Verification', () => {
    it('should have exactly 34 themes defined', () => {
      expect(TEMPLATES.length).toBe(34);
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

    it('should have all themes with valid minTier values', () => {
      const validTiers = ['starter', 'pro', 'business', undefined];
      TEMPLATES.forEach(template => {
        expect(validTiers).toContain(template.minTier);
      });
    });

    it('should have correct distribution of free vs gated themes', () => {
      const freeThemes = TEMPLATES.filter(t => !t.minTier || t.minTier === 'starter').length;
      const proThemes = TEMPLATES.filter(t => t.minTier === 'pro').length;
      const businessThemes = TEMPLATES.filter(t => t.minTier === 'business').length;
      // 23 free themes + 8 pro-gated + 3 business-gated = 34 total
      expect(freeThemes).toBe(23);
      expect(proThemes).toBe(8);
      expect(businessThemes).toBe(3);
    });
  });
});
