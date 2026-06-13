import { describe, expect, test } from 'vitest';
import {
  resolveStyleValue,
  parseAndApplyGradient,
  getSectionSpacing,
  composeSectionBackground,
  hexToRGB,
  gradientToCSS,
  overlayToCSS,
  SPACING_MAP
} from './customization-helpers';
import { StoreTheme } from './definitions';

describe('Customization Helpers', () => {
  describe('hexToRGB', () => {
    test('converts standard 6-digit hex color', () => {
      const rgb = hexToRGB('#ff5733');
      expect(rgb).toEqual({ r: 255, g: 87, b: 51 });
    });

    test('converts shorthand 3-digit hex color', () => {
      const rgb = hexToRGB('#f00');
      expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
    });

    test('handles hex without hash sign', () => {
      const rgb = hexToRGB('00ff00');
      expect(rgb).toEqual({ r: 0, g: 255, b: 0 });
    });
  });

  describe('resolveStyleValue', () => {
    test('prioritizes section override', () => {
      const val = resolveStyleValue('#111', '#222', '#333');
      expect(val).toBe('#222');
    });

    test('falls back to global theme when override is null or empty', () => {
      const val1 = resolveStyleValue('#111', null, '#333');
      expect(val1).toBe('#111');

      const val2 = resolveStyleValue('#111', '', '#333');
      expect(val2).toBe('#111');
    });

    test('falls back to default value when both global and override are null/empty', () => {
      const val = resolveStyleValue(null, null, '#333');
      expect(val).toBe('#333');
    });
  });

  describe('parseAndApplyGradient', () => {
    test('returns CSS gradient if already starting with linear-gradient', () => {
      const css = 'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)';
      const result = parseAndApplyGradient(css, '#fff');
      expect(result.isGradient).toBe(true);
      expect(result.background).toBe(css);
    });

    test('parses JSON gradient definitions', () => {
      const json = JSON.stringify({
        type: 'linear',
        angle: 45,
        stops: [
          { color: '#ff0000', position: 0 },
          { color: '#0000ff', position: 100 }
        ]
      });
      const result = parseAndApplyGradient(json, '#fff');
      expect(result.isGradient).toBe(true);
      expect(result.background).toBe('linear-gradient(45deg, #ff0000 0%, #0000ff 100%)');
    });

    test('falls back to color string on parse failure', () => {
      const result = parseAndApplyGradient('invalid-json', '#fff');
      expect(result.isGradient).toBe(false);
      expect(result.background).toBe('#fff');
    });
  });

  describe('getSectionSpacing', () => {
    test('correctly maps SpacingValues using SPACING_MAP', () => {
      const section = {
        padding_top: 'xs',
        padding_bottom: 'xl',
        padding_x: 'md',
        margin_top: 'none',
        margin_bottom: 'sm',
      };
      const spacing = getSectionSpacing(section);
      expect(spacing.paddingTop).toBe(SPACING_MAP['xs']);
      expect(spacing.paddingBottom).toBe(SPACING_MAP['xl']);
      expect(spacing.paddingX).toBe(SPACING_MAP['md']);
      expect(spacing.marginTop).toBe(SPACING_MAP['none']);
      expect(spacing.marginBottom).toBe(SPACING_MAP['sm']);
    });

    test('provides sensible defaults for missing values', () => {
      const spacing = getSectionSpacing({});
      expect(spacing.paddingTop).toBe(SPACING_MAP['md']); // md is default top
      expect(spacing.paddingBottom).toBe(SPACING_MAP['md']); // md is default bottom
      expect(spacing.paddingX).toBe(SPACING_MAP['lg']); // lg is default X
      expect(spacing.marginTop).toBe('0px');
      expect(spacing.marginBottom).toBe('0px');
    });

    test('maps small, medium, large values to sm, md, lg', () => {
      const section = {
        padding_top: 'small',
        padding_bottom: 'medium',
        padding_x: 'large',
      };
      const spacing = getSectionSpacing(section);
      expect(spacing.paddingTop).toBe(SPACING_MAP['sm']);
      expect(spacing.paddingBottom).toBe(SPACING_MAP['md']);
      expect(spacing.paddingX).toBe(SPACING_MAP['lg']);
    });
  });

  describe('composeSectionBackground', () => {
    const mockTheme = {
      primary_color: '#ff0000',
      secondary_color: '#00ff00',
      accent_color: '#0000ff',
      background_color: '#ffffff',
      surface_color: '#fafafa',
      text_color: '#333333',
      heading_color: '#111111',
      border_color: '#eeeeee',
    } as StoreTheme;

    test('composes solid background color override', () => {
      const section = {
        style_overrides: {
          background_color: '#000000',
        }
      };
      const styles = composeSectionBackground(section, mockTheme);
      expect(styles.backgroundColor).toBe('#000000');
      expect(styles.backgroundImage).toBeUndefined();
    });

    test('composes background with style_bg_color and style_bg_image override keys', () => {
      const section = {
        style_bg_color: '#112233',
        style_bg_image: 'https://example.com/other-bg.png',
      };
      const styles = composeSectionBackground(section, mockTheme);
      expect(styles.backgroundColor).toBe('#112233');
      expect(styles.backgroundImage).toContain('https://example.com/other-bg.png');
    });

    test('composes complex layer styles: bg image, overlay, texture, pattern', () => {
      const section = {
        background_image: 'https://example.com/bg.jpg',
        background_size: 'cover',
        background_position: 'top',
        background_overlay: {
          color: '#ff0000',
          opacity: 50
        },
        texture: 'fabric',
        texture_opacity: 20,
        pattern: 'dots',
        pattern_color: '#0000ff',
        pattern_opacity: 40,
        style_overrides: {
          background_color: '#000000',
        }
      };

      const styles = composeSectionBackground(section, mockTheme);
      expect(styles.backgroundColor).toBe('#000000');
      expect(styles.backgroundImage).toBeDefined();
      
      const bgImg = styles.backgroundImage || '';
      expect(bgImg).toContain('circle'); // pattern is included
      expect(bgImg).toContain('M5 0v10M0 5h10'); // fabric texture is included
      expect(bgImg).toContain('rgba(255, 0, 0, 0.5)'); // overlay is included
      expect(bgImg).toContain('https://example.com/bg.jpg'); // bg image is included
    });
  });
});
