import { GradientDefinition, ColorOverlay, DesignTokens, StoreTheme, SpacingValue, Texture, Pattern, ShapeDivider } from './definitions';

/**
 * Converts a hex color to RGB components
 * @param hex - Hex color string (e.g., "#ff5733")
 * @returns Object with r, g, b numeric components (0-255)
 */
export function hexToRGB(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  // Handle 3-digit hex shorthand (e.g., #f00 -> #ff0000)
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(char => char + char).join('')
    : cleanHex;
  
  const r = parseInt(fullHex.slice(0, 2), 16);
  const g = parseInt(fullHex.slice(2, 4), 16);
  const b = parseInt(fullHex.slice(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Converts a GradientDefinition object to a CSS gradient string
 * @param gradient - Gradient definition with type, angle/position, and color stops
 * @returns CSS gradient string (e.g., "linear-gradient(45deg, #ff0000 0%, #0000ff 100%)")
 */
export function gradientToCSS(gradient: GradientDefinition): string {
  if (gradient.type === 'linear') {
    const angle = gradient.angle ?? 180;
    const stopsStr = gradient.stops
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');
    return `linear-gradient(${angle}deg, ${stopsStr})`;
  } else {
    // Radial gradient
    const position = gradient.position ?? 'center';
    const stopsStr = gradient.stops
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');
    return `radial-gradient(circle at ${position}, ${stopsStr})`;
  }
}

/**
 * Converts a ColorOverlay object to a CSS rgba() string
 * @param overlay - Color overlay with hex color and opacity (0-100)
 * @returns CSS rgba() string (e.g., "rgba(255, 87, 51, 0.4)")
 */
export function overlayToCSS(overlay: ColorOverlay): string {
  const alpha = overlay.opacity / 100;
  const rgb = hexToRGB(overlay.color);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Generates CSS custom properties from design tokens and theme
 * @param theme - StoreTheme object with color and style settings
 * @param designTokens - Optional design tokens for advanced customization (Pro/Business tier)
 * @returns CSS string with :root selector and custom properties
 */
export function generateCSSCustomProperties(
  theme: StoreTheme,
  designTokens: DesignTokens | null = null
): string {
  const tokens = designTokens || {};
  const cssVars: string[] = [':root {'];
  
  // Spacing scale
  if (tokens.spacing_scale) {
    Object.entries(tokens.spacing_scale).forEach(([key, value]) => {
      if (value) cssVars.push(`  --spacing-${key}: ${value};`);
    });
  }
  
  // Font sizes
  if (tokens.font_sizes) {
    Object.entries(tokens.font_sizes).forEach(([key, value]) => {
      if (value) cssVars.push(`  --font-size-${key}: ${value};`);
    });
  }
  
  // Border radii
  if (tokens.border_radii) {
    Object.entries(tokens.border_radii).forEach(([key, value]) => {
      if (value) cssVars.push(`  --border-radius-${key}: ${value};`);
    });
  }
  
  // Shadows
  if (tokens.shadows) {
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      if (value) cssVars.push(`  --shadow-${key}: ${value};`);
    });
  }
  
  // Transitions
  if (tokens.transitions) {
    Object.entries(tokens.transitions).forEach(([key, value]) => {
      if (value) cssVars.push(`  --transition-${key}: ${value};`);
    });
  }
  
  // Z-index values
  if (tokens.z_index) {
    Object.entries(tokens.z_index).forEach(([key, value]) => {
      if (value !== undefined) cssVars.push(`  --z-index-${key}: ${value};`);
    });
  }
  
  // Breakpoints
  if (tokens.breakpoints) {
    Object.entries(tokens.breakpoints).forEach(([key, value]) => {
      if (value) cssVars.push(`  --breakpoint-${key}: ${value};`);
    });
  }
  
  // Container widths
  if (tokens.container_widths) {
    Object.entries(tokens.container_widths).forEach(([key, value]) => {
      if (value) cssVars.push(`  --container-${key}: ${value};`);
    });
  }
  
  // Icon sizes
  if (tokens.icon_sizes) {
    Object.entries(tokens.icon_sizes).forEach(([key, value]) => {
      if (value) cssVars.push(`  --icon-size-${key}: ${value};`);
    });
  }
  
  // Line heights
  if (tokens.line_heights) {
    Object.entries(tokens.line_heights).forEach(([key, value]) => {
      if (value !== undefined) cssVars.push(`  --line-height-${key}: ${value};`);
    });
  }
  
  // Letter spacing
  if (tokens.letter_spacing) {
    Object.entries(tokens.letter_spacing).forEach(([key, value]) => {
      if (value) cssVars.push(`  --letter-spacing-${key}: ${value};`);
    });
  }
  
  // Opacity scale
  if (tokens.opacity_scale) {
    Object.entries(tokens.opacity_scale).forEach(([key, value]) => {
      if (value) cssVars.push(`  --opacity-${key}: ${value};`);
    });
  }
  
  // Theme colors as RGB components (for alpha channel control)
  const primaryRGB = hexToRGB(theme.primary_color);
  cssVars.push(`  --primary-rgb: ${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b};`);
  cssVars.push(`  --primary-color: ${theme.primary_color};`);
  
  const secondaryRGB = hexToRGB(theme.secondary_color);
  cssVars.push(`  --secondary-rgb: ${secondaryRGB.r}, ${secondaryRGB.g}, ${secondaryRGB.b};`);
  cssVars.push(`  --secondary-color: ${theme.secondary_color};`);
  
  const accentRGB = hexToRGB(theme.accent_color);
  cssVars.push(`  --accent-rgb: ${accentRGB.r}, ${accentRGB.g}, ${accentRGB.b};`);
  cssVars.push(`  --accent-color: ${theme.accent_color};`);
  
  cssVars.push(`  --background-color: ${theme.background_color};`);
  cssVars.push(`  --text-color: ${theme.text_color};`);
  cssVars.push(`  --heading-color: ${theme.heading_color};`);
  cssVars.push(`  --surface-color: ${theme.surface_color};`);
  cssVars.push(`  --border-color: ${theme.border_color};`);

  // Extra typography properties if defined
  if (theme.line_height) cssVars.push(`  --line-height: ${theme.line_height};`);
  if (theme.letter_spacing !== null && theme.letter_spacing !== undefined) cssVars.push(`  --letter-spacing: ${theme.letter_spacing}em;`);
  if (theme.text_transform) cssVars.push(`  --text-transform: ${theme.text_transform};`);
  if (theme.body_font_weight) cssVars.push(`  --body-font-weight: ${theme.body_font_weight};`);
  if (theme.heading_font_weight) cssVars.push(`  --heading-font-weight: ${theme.heading_font_weight};`);
  if (theme.secondary_gradient) cssVars.push(`  --secondary-gradient: ${theme.secondary_gradient};`);
  
  cssVars.push('}');
  return cssVars.join('\n');
}

/**
 * Priority: Section Override > Global Theme > Default
 */
export function resolveStyleValue<T>(
  globalValue: T | undefined | null,
  sectionOverride: T | undefined | null,
  defaultValue: T
): T {
  if (sectionOverride !== undefined && sectionOverride !== null && sectionOverride !== '') {
    return sectionOverride;
  }
  if (globalValue !== undefined && globalValue !== null && globalValue !== '') {
    return globalValue;
  }
  return defaultValue;
}

/**
 * Parses a gradient string or JSON definition into a CSS gradient background.
 */
export function parseAndApplyGradient(
  gradientString: string | null | undefined,
  fallbackColor: string
): { background: string; isGradient: boolean } {
  if (!gradientString) {
    return { background: fallbackColor, isGradient: false };
  }
  
  const trimmed = gradientString.trim();
  if (trimmed.startsWith('linear-gradient') || trimmed.startsWith('radial-gradient')) {
    return { background: trimmed, isGradient: true };
  }

  try {
    const gradient = JSON.parse(trimmed) as GradientDefinition;
    const cssGradient = gradientToCSS(gradient);
    return { background: cssGradient, isGradient: true };
  } catch (e) {
    return { background: fallbackColor, isGradient: false };
  }
}

export const SPACING_MAP: Record<SpacingValue, string> = {
  'none': '0px',
  'xs': '0.5rem',   // 8px
  'sm': '1rem',     // 16px
  'md': '1.5rem',   // 24px
  'lg': '2rem',     // 32px
  'xl': '3rem',     // 48px
  '2xl': '4rem',    // 64px
  '3xl': '6rem',    // 96px
};

/**
 * Extracts spacing values for margins and paddings
 */
export function getSectionSpacing(section: any): {
  paddingTop: string;
  paddingBottom: string;
  paddingX: string;
  marginTop: string;
  marginBottom: string;
} {
  const mapValue = (val: any): any => {
    if (val === 'small') return 'sm';
    if (val === 'medium') return 'md';
    if (val === 'large') return 'lg';
    return val;
  };

  const pTop = mapValue(section?.padding_top);
  const pBottom = mapValue(section?.padding_bottom);
  const pX = mapValue(section?.padding_x);
  const mTop = mapValue(section?.margin_top);
  const mBottom = mapValue(section?.margin_bottom);

  return {
    paddingTop: SPACING_MAP[(pTop as SpacingValue) || 'md'] || '1.5rem',
    paddingBottom: SPACING_MAP[(pBottom as SpacingValue) || 'md'] || '1.5rem',
    paddingX: SPACING_MAP[(pX as SpacingValue) || 'lg'] || '2rem',
    marginTop: SPACING_MAP[(mTop as SpacingValue) || 'none'] || '0px',
    marginBottom: SPACING_MAP[(mBottom as SpacingValue) || 'none'] || '0px',
  };
}

// ─── Texture Presets SVG URIs ──────────────────────────────────────────
export const TEXTURE_SVG: Record<Texture, string> = {
  'paper': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/%3E%3CfeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"/%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)"/%3E%3C/svg%3E',
  'fabric': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"%3E%3Cpath d="M5 0v10M0 5h10" stroke="%23000" stroke-width="0.5" stroke-opacity="0.05" fill="none"/%3E%3C/svg%3E',
  'concrete': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Cfilter id="c"%3E%3CfeTurbulence baseFrequency="0.9" numOctaves="4"/%3E%3CfeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0"/%3E%3C/filter%3E%3Crect width="60" height="60" filter="url(%23c)"/%3E%3C/svg%3E',
  'wood': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="20" viewBox="0 0 100 20"%3E%3Cpath d="M0 5 Q 25 8, 50 5 T 100 5 M0 15 Q 25 12, 50 15 T 100 15" fill="none" stroke="%23000" stroke-width="0.5" stroke-opacity="0.03"/%3E%3C/svg%3E',
  'dots': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"%3E%3Ccircle cx="6" cy="6" r="1.5" fill="%23000" fill-opacity="0.04"/%3E%3C/svg%3E',
  'stripes': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"%3E%3Cpath d="M0 20 L20 0 M-5 5 L5 -5 M15 25 L25 15" stroke="%23000" stroke-width="1.5" stroke-opacity="0.03" fill="none"/%3E%3C/svg%3E',
  'grid': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"%3E%3Crect width="20" height="20" fill="none" stroke="%23000" stroke-width="0.75" stroke-opacity="0.03"/%3E%3C/svg%3E',
  'noise': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Cfilter id="n"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.99"/%3E%3CfeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"/%3E%3C/filter%3E%3Crect width="120" height="120" filter="url(%23n)"/%3E%3C/svg%3E',
  'none': '',
};

// ─── Geometric Patterns SVG Generator ──────────────────────────────────
export const PATTERN_SVG: Record<Pattern, (color: string) => string> = {
  'dots': (color) => {
    const encColor = encodeURIComponent(color);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='2' fill='${encColor}'/%3E%3C/svg%3E`;
  },
  'diagonal-stripes': (color) => {
    const encColor = encodeURIComponent(color);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M-1,1 l2,-2 M0,20 l20,-20 M19,21 l2,-2' stroke='${encColor}' stroke-width='2' fill='none'/%3E%3C/svg%3E`;
  },
  'horizontal-stripes': (color) => {
    const encColor = encodeURIComponent(color);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='10' viewBox='0 0 20 10'%3E%3Cline x1='0' y1='5' x2='20' y2='5' stroke='${encColor}' stroke-width='2' fill='none'/%3E%3C/svg%3E`;
  },
  'grid': (color) => {
    const encColor = encodeURIComponent(color);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Crect width='30' height='30' fill='none' stroke='${encColor}' stroke-width='1'/%3E%3C/svg%3E`;
  },
  'triangles': (color) => {
    const encColor = encodeURIComponent(color);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpolygon points='12,2 2,22 22,22' fill='none' stroke='${encColor}' stroke-width='1.5'/%3E%3C/svg%3E`;
  },
  'hexagons': (color) => {
    const encColor = encodeURIComponent(color);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='48' viewBox='0 0 28 48'%3E%3Cpath d='M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z M0 40 L14 48 L28 40' fill='none' stroke='${encColor}' stroke-width='1.5'/%3E%3C/svg%3E`;
  },
  'waves': (color) => {
    const encColor = encodeURIComponent(color);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='12' viewBox='0 0 40 12'%3E%3Cpath d='M0,6 Q10,0 20,6 T40,6' fill='none' stroke='${encColor}' stroke-width='2'/%3E%3C/svg%3E`;
  },
  'circuits': (color) => {
    const encColor = encodeURIComponent(color);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M10,10 L30,10 L30,30 M10,30 L10,10 M5,5 h10 M25,25 h10' fill='none' stroke='${encColor}' stroke-width='1'/%3E%3Ccircle cx='10' cy='10' r='2' fill='${encColor}'/%3E%3Ccircle cx='30' cy='10' r='2' fill='${encColor}'/%3E%3C/svg%3E`;
  },
  'none': () => '',
};

// ─── Shape Divider SVGs ───────────────────────────────────────────────
export interface ShapeDividerSVG {
  viewBox: string;
  path: string;
  preserveAspectRatio: string;
}

export const DIVIDER_PATHS: Record<ShapeDivider, ShapeDividerSVG> = {
  'wave': {
    viewBox: '0 0 1200 120',
    path: 'M0,0 C300,90 900,30 1200,80 L1200,120 L0,120 Z',
    preserveAspectRatio: 'none',
  },
  'angle': {
    viewBox: '0 0 1200 120',
    path: 'M0,0 L1200,90 L1200,120 L0,120 Z',
    preserveAspectRatio: 'none',
  },
  'curve': {
    viewBox: '0 0 1200 120',
    path: 'M0,0 Q600,100 1200,0 L1200,120 L0,120 Z',
    preserveAspectRatio: 'none',
  },
  'triangle': {
    viewBox: '0 0 1200 120',
    path: 'M0,0 L600,80 L1200,0 L1200,120 L0,120 Z',
    preserveAspectRatio: 'none',
  },
  'arrow': {
    viewBox: '0 0 1200 120',
    path: 'M0,0 L570,0 L600,30 L630,0 L1200,0 L1200,120 L0,120 Z',
    preserveAspectRatio: 'none',
  },
  'split': {
    viewBox: '0 0 1200 120',
    path: 'M0,0 L600,110 L1200,0 L1200,120 L0,120 Z',
    preserveAspectRatio: 'none',
  },
  'none': { viewBox: '', path: '', preserveAspectRatio: '' },
};

/**
 * Composes section background styling based on section content overrides
 */
export function composeSectionBackground(
  section: any,
  theme: StoreTheme
): React.CSSProperties {
  const styles: React.CSSProperties = {};
  
  // Base background color
  const bgColor = section?.style_bg_color || section?.style_overrides?.background_color || theme.background_color;
  styles.backgroundColor = bgColor;
  
  const bgLayers: string[] = [];
  const bgSizes: string[] = [];
  const bgPositions: string[] = [];
  const bgRepeats: string[] = [];

  // Pattern overlay
  if (section?.pattern && section.pattern !== 'none') {
    const patColor = section.pattern_color || theme.primary_color;
    const patOpacity = (section.pattern_opacity !== undefined ? section.pattern_opacity : 30) / 100;
    const patternURI = PATTERN_SVG[section.pattern as Pattern](patColor);
    
    // Pattern uses data URI. We need to wrap it with url()
    bgLayers.push(`linear-gradient(rgba(255,255,255,${1 - patOpacity}), rgba(255,255,255,${1 - patOpacity})), url("${patternURI}")`);
    bgSizes.push('auto');
    bgPositions.push('center');
    bgRepeats.push('repeat');
  }

  // Texture overlay
  if (section?.texture && section.texture !== 'none') {
    const texOpacity = (section.texture_opacity !== undefined ? section.texture_opacity : 50) / 100;
    const textureURI = TEXTURE_SVG[section.texture as Texture];
    
    bgLayers.push(`linear-gradient(rgba(255,255,255,${1 - texOpacity}), rgba(255,255,255,${1 - texOpacity})), url("${textureURI}")`);
    bgSizes.push('auto');
    bgPositions.push('center');
    bgRepeats.push('repeat');
  }

  // Color overlay
  if (section?.background_overlay) {
    const overlay = section.background_overlay as ColorOverlay;
    if (overlay.color && overlay.opacity > 0) {
      const overlayColor = overlayToCSS(overlay);
      bgLayers.push(`linear-gradient(${overlayColor}, ${overlayColor})`);
      bgSizes.push('auto');
      bgPositions.push('center');
      bgRepeats.push('repeat');
    }
  }

  // Background image
  const bgImage = section?.style_bg_image || section?.background_image;
  if (bgImage) {
    bgLayers.push(`url("${bgImage}")`);
    bgSizes.push(section.background_size || 'cover');
    bgPositions.push(section.background_position || 'center');
    bgRepeats.push(section.background_size === 'tile' ? 'repeat' : 'no-repeat');
  }

  if (bgLayers.length > 0) {
    styles.backgroundImage = bgLayers.join(', ');
    styles.backgroundSize = bgSizes.join(', ');
    styles.backgroundPosition = bgPositions.join(', ');
    styles.backgroundRepeat = bgRepeats.join(', ');
  }

  return styles;
}
