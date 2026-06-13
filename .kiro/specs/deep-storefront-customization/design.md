# Design Document: Deep Storefront Customization

## Overview

This feature transforms the Vendle storefront customization system from basic template styling into a comprehensive visual design platform. The goal is to enable vendors using the same template to create completely unique, distinctive storefronts through advanced styling controls, rich media options, flexible layouts, and per-section overrides—all while maintaining an intuitive, no-code interface.

The current system offers limited customization: basic color changes, font selection, and simple layout options. Vendors using the same template produce similar-looking stores. This design implements 15 major capability areas that enable deep visual differentiation, ensuring two vendors starting with the same template can produce stores so visually distinct that customers cannot tell they used the same starting point.

### Goals

- Implement advanced color systems (gradients, overlays, duotone effects)
- Enable rich image and visual customization per section (backgrounds, textures, patterns, video)
- Provide enhanced typography controls (line-height, letter-spacing, text-transform, font-weight)
- Add flexible spacing and sizing controls with per-section overrides
- Support multiple layout variants for each section type
- Implement per-section style overrides that supersede global theme settings
- Add brand identity elements (patterns, textures, shape dividers)
- Enable animation and interaction effect customization
- Support flexible content blocks within sections
- Implement progressive disclosure UI pattern to maintain simplicity
- Expose design tokens for Pro/Business tier subscribers
- Ensure real-time preview synchronization (< 200ms for most changes)
- Maintain backward compatibility with existing themes
- Optimize performance for fast editor and storefront experience

### Non-Goals

- Creating new section types beyond existing (hero, product_grid, features, gallery, testimonials, FAQs)
- Building a drag-and-drop page builder (section ordering is customizable but not free-form)
- Supporting custom code injection beyond CSS (security concern)
- Implementing A/B testing or analytics for customizations
- Creating a marketplace for third-party themes or extensions
- Mobile-specific customization separate from responsive design


## Architecture

### System Architecture Overview

The deep customization system extends the existing theme editor architecture with three major enhancements:

1. **Extended Data Layer**: Expands the `StoreTheme` data model with new columns for advanced typography, gradients, and design tokens, plus leverages the existing `section_content` JSON column for per-section customizations.

2. **Enhanced Editor UI**: Implements progressive disclosure pattern with basic and advanced control panels, organized into logical groups with visual feedback for overrides.

3. **Real-Time Preview Engine**: Optimizes postMessage-based preview updates with debouncing, CSS-only updates (no full reloads), and efficient JSON serialization.

```
┌─────────────────────────────────────────────────────────────┐
│                     Theme Editor Layer                       │
│  ┌──────────────────────┐      ┌──────────────────────────┐│
│  │  EditorSidebar       │      │    EditorPreview         ││
│  │  - Basic Controls    │◄────►│    - Live Iframe         ││
│  │  - Advanced Panels   │      │    - PostMessage Bridge  ││
│  │  - Section Overrides │      │    - CSS Injection       ││
│  └──────────────────────┘      └──────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data & State Layer                         │
│  ┌──────────────────────┐      ┌──────────────────────────┐│
│  │  StoreTheme Model    │      │   Section Content JSON   ││
│  │  - Global Styles     │      │   - Per-Section Styles   ││
│  │  - Typography        │      │   - Layout Variants      ││
│  │  - Design Tokens     │      │   - Content Blocks       ││
│  └──────────────────────┘      └──────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Rendering Layer                             │
│  ┌──────────────────────┐      ┌──────────────────────────┐│
│  │  Storefront Component│      │  SectionRenderer         ││
│  │  - Theme Application │      │  - Section Variants      ││
│  │  - CSS Generation    │      │  - Override Resolution   ││
│  └──────────────────────┘      └──────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Style Override Resolution

The system uses a cascading resolution system for styles:

```
1. Template Defaults → 2. Global Theme → 3. Section Overrides → 4. Applied Style
```

**Example**: For a hero section heading color:
- Template default: `#1a1a1a`
- Global theme `heading_color`: `#ff5733`
- Section override `heading_color`: `#00aaff`
- **Applied**: `#00aaff` (section override wins)

If section override is removed, it falls back to global theme color (`#ff5733`).


## Data Models

### Extended StoreTheme Schema

The existing `StoreTheme` type will be extended with new fields:

```typescript
export type StoreTheme = {
  // ... existing fields ...
  
  // NEW: Enhanced Typography (Requirement 3)
  line_height: number | null;              // 1.0 to 2.5, default 1.5
  letter_spacing: number | null;           // -0.1em to 0.5em, default 0
  text_transform: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | null;
  body_font_weight: number | null;         // 300-900, default 400
  heading_font_weight: number | null;      // 300-900, default 700
  
  // NEW: Container Width (Requirement 4)
  container_width: 'narrow' | 'standard' | 'wide' | 'full' | null;  // default 'standard'
  
  // NEW: Design Tokens (Requirement 11)
  design_tokens: string | null;            // JSON string of design token values
  
  // EXISTING: Gradients (expand usage in Requirement 1)
  primary_gradient: string | null;         // Already exists
  secondary_gradient: string | null;       // NEW: Additional gradient option
};
```

### Database Migration

```sql
-- Enhanced Typography Columns
ALTER TABLE store_themes ADD COLUMN line_height DECIMAL(3, 2) NULL;
ALTER TABLE store_themes ADD COLUMN letter_spacing DECIMAL(4, 3) NULL;
ALTER TABLE store_themes ADD COLUMN text_transform VARCHAR(20) NULL 
  CHECK (text_transform IN ('none', 'uppercase', 'lowercase', 'capitalize'));
ALTER TABLE store_themes ADD COLUMN body_font_weight INTEGER NULL 
  CHECK (body_font_weight IN (300, 400, 500, 600, 700, 800, 900));
ALTER TABLE store_themes ADD COLUMN heading_font_weight INTEGER NULL 
  CHECK (heading_font_weight IN (300, 400, 500, 600, 700, 800, 900));

-- Container Width Column
ALTER TABLE store_themes ADD COLUMN container_width VARCHAR(20) NULL 
  CHECK (container_width IN ('narrow', 'standard', 'wide', 'full'));

-- Design Tokens Column (JSON)
ALTER TABLE store_themes ADD COLUMN design_tokens TEXT NULL;

-- Secondary Gradient Column
ALTER TABLE store_themes ADD COLUMN secondary_gradient TEXT NULL;

-- Add defaults for backward compatibility
UPDATE store_themes 
SET line_height = 1.5, 
    letter_spacing = 0, 
    text_transform = 'none',
    body_font_weight = 400,
    heading_font_weight = 700,
    container_width = 'standard'
WHERE line_height IS NULL;
```


### Section Content JSON Schema

The `section_content` field stores per-section customizations. Schema is expanded to support new features:

```typescript
type TemplateSectionContent = {
  [sectionType: string]: {
    // Content fields (existing)
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
    testimonials?: Array<{ name: string; quote: string; rating: number }>;
    faqs?: Array<{ question: string; answer: string }>;
    images?: string[];
    
    // NEW: Layout & Alignment (Requirement 5)
    layout_variant?: 'centered' | 'left-aligned' | 'right-aligned' | 'split-screen' | 'full-bleed' | 
                     'horizontal-cards' | 'vertical-cards' | 'alternating' | 
                     'grid' | 'masonry' | 'carousel';
    alignment?: 'left' | 'center' | 'right';
    columns?: 2 | 3 | 4 | 5 | 6;  // For product grids
    
    // NEW: Spacing Overrides (Requirement 4)
    padding_top?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    padding_bottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    padding_x?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    margin_top?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    margin_bottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    
    // NEW: Style Overrides (Requirement 6)
    style_overrides?: {
      background_color?: string;
      text_color?: string;
      heading_color?: string;
      card_style?: 'modern' | 'classic' | 'minimal' | 'bold' | 'none';
      border_radius?: 'sharp' | 'rounded' | 'pill';
      glass_effect?: boolean;
      font_size_override?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    };
    
    // NEW: Background & Media (Requirement 2)
    background_image?: string;  // URL
    background_size?: 'cover' | 'contain' | 'tile';
    background_position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    background_video?: string;  // URL (mp4/webm, max 10MB)
    background_overlay?: {
      color: string;
      opacity: number;  // 0-100
    };
    texture?: 'paper' | 'fabric' | 'concrete' | 'wood' | 'dots' | 'stripes' | 'grid' | 'noise' | 'none';
    texture_opacity?: number;  // 0-100
    parallax?: 'none' | 'slow' | 'medium' | 'fast';
    
    // NEW: Brand Identity Elements (Requirement 7)
    pattern?: 'dots' | 'diagonal-stripes' | 'horizontal-stripes' | 'grid' | 
              'triangles' | 'hexagons' | 'waves' | 'circuits' | 'none';
    pattern_color?: string;
    pattern_opacity?: number;  // 0-100
    divider_top?: 'wave' | 'angle' | 'curve' | 'triangle' | 'arrow' | 'split' | 'none';
    divider_bottom?: 'wave' | 'angle' | 'curve' | 'triangle' | 'arrow' | 'split' | 'none';
    divider_color?: string;
    divider_flip?: boolean;
    divider_invert?: boolean;
    
    // NEW: Animations (Requirement 8)
    scroll_animation?: 'fade-in' | 'slide-up' | 'slide-left' | 'slide-right' | 'zoom-in' | 'none';
    card_hover_effect?: 'lift' | 'grow' | 'glow' | 'tilt' | 'none';
    
    // NEW: Flexible Content Blocks (Requirement 9)
    content_blocks?: Array<{
      id: string;
      type: 'text' | 'image' | 'button' | 'spacer' | 'divider';
      content?: string;  // For text blocks (supports rich text HTML)
      image_url?: string;  // For image blocks
      button_text?: string;
      button_link?: string;
      button_style?: 'primary' | 'secondary' | 'outline' | 'ghost';
      alignment?: 'left' | 'center' | 'right' | 'justify';
      spacer_height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
      order: number;  // For drag-and-drop ordering
    }>;
  };
};
```

**Example Section Content**:
```json
{
  "hero": {
    "title": "Welcome to Our Store",
    "subtitle": "Premium products at great prices",
    "buttonText": "Shop Now",
    "layout_variant": "split-screen",
    "background_image": "https://cdn.example.com/hero-bg.jpg",
    "background_overlay": {
      "color": "#000000",
      "opacity": 40
    },
    "parallax": "medium",
    "divider_bottom": "wave",
    "divider_color": "#ffffff",
    "style_overrides": {
      "heading_color": "#ffffff",
      "text_color": "#f0f0f0"
    }
  }
}
```


### Design Tokens Schema

Design tokens are stored as JSON in the `design_tokens` column. Available only for Pro/Business tiers.

```typescript
type DesignTokens = {
  spacing_scale?: {
    xs?: string;    // default: '0.25rem'
    sm?: string;    // default: '0.5rem'
    md?: string;    // default: '1rem'
    lg?: string;    // default: '1.5rem'
    xl?: string;    // default: '2rem'
    '2xl'?: string; // default: '3rem'
    '3xl'?: string; // default: '4rem'
  };
  font_sizes?: {
    xs?: string;    // default: '0.75rem'
    sm?: string;    // default: '0.875rem'
    base?: string;  // default: '1rem'
    lg?: string;    // default: '1.125rem'
    xl?: string;    // default: '1.25rem'
    '2xl'?: string; // default: '1.5rem'
    '3xl'?: string; // default: '1.875rem'
    '4xl'?: string; // default: '2.25rem'
  };
  border_radii?: {
    sharp?: string;   // default: '0'
    rounded?: string; // default: '0.5rem'
    pill?: string;    // default: '9999px'
  };
  shadows?: {
    soft?: string;     // default: '0 1px 3px rgba(0,0,0,0.1)'
    elevated?: string; // default: '0 10px 30px rgba(0,0,0,0.15)'
    hard?: string;     // default: '4px 4px 0 rgba(0,0,0,0.1)'
  };
  transitions?: {
    fast?: string;    // default: '150ms'
    normal?: string;  // default: '300ms'
    slow?: string;    // default: '500ms'
  };
  z_index?: {
    base?: number;      // default: 1
    dropdown?: number;  // default: 50
    modal?: number;     // default: 100
    tooltip?: number;   // default: 150
  };
  breakpoints?: {
    sm?: string;   // default: '640px'
    md?: string;   // default: '768px'
    lg?: string;   // default: '1024px'
    xl?: string;   // default: '1280px'
  };
  container_widths?: {
    narrow?: string;   // default: '960px'
    standard?: string; // default: '1280px'
    wide?: string;     // default: '1536px'
  };
  icon_sizes?: {
    sm?: string;  // default: '16px'
    md?: string;  // default: '24px'
    lg?: string;  // default: '32px'
    xl?: string;  // default: '48px'
  };
  line_heights?: {
    tight?: number;   // default: 1.25
    normal?: number;  // default: 1.5
    relaxed?: number; // default: 1.75
    loose?: number;   // default: 2.0
  };
  letter_spacing?: {
    tight?: string;   // default: '-0.025em'
    normal?: string;  // default: '0'
    wide?: string;    // default: '0.025em'
    wider?: string;   // default: '0.05em'
  };
  opacity_scale?: {
    '10'?: string;  // default: '0.1'
    '20'?: string;  // default: '0.2'
    '50'?: string;  // default: '0.5'
    '75'?: string;  // default: '0.75'
    '90'?: string;  // default: '0.9'
  };
};
```

**CSS Custom Properties Generation**:

When design tokens are present, the system generates CSS custom properties:

```css
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --font-size-base: 1rem;
  --border-radius-rounded: 0.5rem;
  /* ... etc */
}
```

Components reference these tokens: `padding: var(--spacing-md);`


## Core Interfaces and Types

### Color System Interfaces

```typescript
// Gradient definition (Requirement 1)
interface GradientDefinition {
  type: 'linear' | 'radial';
  angle?: number;  // For linear gradients (0-360)
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';  // For radial
  stops: Array<{
    color: string;  // Hex color
    position: number;  // 0-100 (percentage)
  }>;
}

// Convert to CSS string
function gradientToCSS(gradient: GradientDefinition): string {
  if (gradient.type === 'linear') {
    const stopsStr = gradient.stops
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');
    return `linear-gradient(${gradient.angle}deg, ${stopsStr})`;
  } else {
    const stopsStr = gradient.stops
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');
    return `radial-gradient(circle at ${gradient.position}, ${stopsStr})`;
  }
}

// Overlay definition
interface ColorOverlay {
  color: string;
  opacity: number;  // 0-100
}

function overlayToCSS(overlay: ColorOverlay): string {
  const alpha = overlay.opacity / 100;
  // Convert hex to rgba
  const r = parseInt(overlay.color.slice(1, 3), 16);
  const g = parseInt(overlay.color.slice(3, 5), 16);
  const b = parseInt(overlay.color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
```

### Layout Variant Types

```typescript
// Hero section variants (Requirement 5)
type HeroLayoutVariant = 
  | 'centered'      // Content centered, full-width
  | 'left-aligned'  // Content left, image right
  | 'right-aligned' // Content right, image left
  | 'split-screen'  // 50/50 split
  | 'full-bleed';   // Background image, text overlay

// Feature section variants
type FeatureLayoutVariant =
  | 'horizontal-cards'  // Cards in horizontal row
  | 'vertical-cards'    // Cards in vertical stack
  | 'alternating';      // Alternating image-text layout

// Gallery section variants
type GalleryLayoutVariant =
  | 'grid'      // Even grid layout
  | 'masonry'   // Pinterest-style masonry
  | 'carousel'; // Horizontal scrolling carousel

// Product grid columns
type ProductGridColumns = 2 | 3 | 4 | 5 | 6;
```

### Spacing Types

```typescript
type SpacingValue = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

const SPACING_MAP: Record<SpacingValue, string> = {
  'none': '0',
  'xs': '0.5rem',    // 8px
  'sm': '1rem',      // 16px
  'md': '1.5rem',    // 24px
  'lg': '2rem',      // 32px
  'xl': '3rem',      // 48px
  '2xl': '4rem',     // 64px
  '3xl': '6rem',     // 96px
};

function getSectionSpacing(section: TemplateSectionContent[string]): {
  paddingTop: string;
  paddingBottom: string;
  paddingX: string;
  marginTop: string;
  marginBottom: string;
} {
  return {
    paddingTop: SPACING_MAP[section.padding_top || 'md'],
    paddingBottom: SPACING_MAP[section.padding_bottom || 'md'],
    paddingX: SPACING_MAP[section.padding_x || 'lg'],
    marginTop: SPACING_MAP[section.margin_top || 'none'],
    marginBottom: SPACING_MAP[section.margin_bottom || 'none'],
  };
}
```


### Animation Types

```typescript
type ScrollAnimation = 'fade-in' | 'slide-up' | 'slide-left' | 'slide-right' | 'zoom-in' | 'none';
type HoverEffect = 'lift' | 'grow' | 'glow' | 'tilt' | 'none';
type TransitionSpeed = 'instant' | 'fast' | 'normal' | 'slow';

const SCROLL_ANIMATION_CLASSES: Record<ScrollAnimation, string> = {
  'fade-in': 'animate-fade-in',
  'slide-up': 'animate-slide-up',
  'slide-left': 'animate-slide-left',
  'slide-right': 'animate-slide-right',
  'zoom-in': 'animate-zoom-in',
  'none': '',
};

const HOVER_EFFECT_CLASSES: Record<HoverEffect, string> = {
  'lift': 'hover:-translate-y-2 hover:shadow-xl transition-all duration-300',
  'grow': 'hover:scale-105 transition-transform duration-300',
  'glow': 'hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-shadow duration-300',
  'tilt': 'hover:rotate-1 hover:scale-105 transition-transform duration-300',
  'none': '',
};

const TRANSITION_DURATION: Record<TransitionSpeed, string> = {
  'instant': '0ms',
  'fast': '150ms',
  'normal': '300ms',
  'slow': '500ms',
};
```

### Texture and Pattern Types

```typescript
type Texture = 'paper' | 'fabric' | 'concrete' | 'wood' | 'dots' | 'stripes' | 'grid' | 'noise' | 'none';
type Pattern = 'dots' | 'diagonal-stripes' | 'horizontal-stripes' | 'grid' | 
               'triangles' | 'hexagons' | 'waves' | 'circuits' | 'none';
type ShapeDivider = 'wave' | 'angle' | 'curve' | 'triangle' | 'arrow' | 'split' | 'none';

// Texture implementation uses SVG data URIs or CSS patterns
const TEXTURE_SVG: Record<Texture, string> = {
  'paper': 'data:image/svg+xml,...',  // Actual SVG data
  'fabric': 'data:image/svg+xml,...',
  'concrete': 'data:image/svg+xml,...',
  'wood': 'data:image/svg+xml,...',
  'dots': 'data:image/svg+xml,...',
  'stripes': 'data:image/svg+xml,...',
  'grid': 'data:image/svg+xml,...',
  'noise': 'data:image/svg+xml,...',
  'none': '',
};

// Pattern implementation
const PATTERN_SVG: Record<Pattern, (color: string) => string> = {
  'dots': (color) => `data:image/svg+xml,...${encodeURIComponent(color)}...`,
  'diagonal-stripes': (color) => `data:image/svg+xml,...`,
  // ... other patterns
  'none': () => '',
};

// Shape dividers use SVG paths
interface ShapeDividerSVG {
  viewBox: string;
  path: string;
  preserveAspectRatio: string;
}

const DIVIDER_PATHS: Record<ShapeDivider, ShapeDividerSVG> = {
  'wave': {
    viewBox: '0 0 1200 120',
    path: 'M0,0 C300,80 600,80 900,0 L1200,0 L1200,120 L0,120 Z',
    preserveAspectRatio: 'none',
  },
  // ... other dividers
  'none': { viewBox: '', path: '', preserveAspectRatio: '' },
};
```


## Key Algorithms and Functions

### Algorithm 1: Style Override Resolution

Resolves the final style value for a section considering global theme and section-specific overrides.

```typescript
function resolveStyleValue<T>(
  globalValue: T,
  sectionOverride: T | undefined,
  defaultValue: T
): T {
  // Priority: Section Override > Global Theme > Default
  if (sectionOverride !== undefined && sectionOverride !== null) {
    return sectionOverride;
  }
  if (globalValue !== undefined && globalValue !== null) {
    return globalValue;
  }
  return defaultValue;
}

// Example usage for heading color
const headingColor = resolveStyleValue(
  theme.heading_color,           // Global
  sectionContent.style_overrides?.heading_color,  // Section override
  theme.text_color               // Fallback
);
```

**Preconditions:**
- `globalValue` may be any type T or undefined/null
- `sectionOverride` may be any type T or undefined/null
- `defaultValue` must be a valid value of type T

**Postconditions:**
- Returns section override if present and non-null
- Otherwise returns global value if present and non-null
- Otherwise returns default value
- No side effects, pure function

### Algorithm 2: Gradient Parsing and Application

Converts gradient definition to CSS-compatible string.

```typescript
function parseAndApplyGradient(
  gradientString: string | null,
  fallbackColor: string
): { background: string; isGradient: boolean } {
  if (!gradientString) {
    return { background: fallbackColor, isGradient: false };
  }
  
  try {
    // Check if already CSS gradient string
    if (gradientString.startsWith('linear-gradient') || 
        gradientString.startsWith('radial-gradient')) {
      return { background: gradientString, isGradient: true };
    }
    
    // Parse JSON gradient definition
    const gradient: GradientDefinition = JSON.parse(gradientString);
    const cssGradient = gradientToCSS(gradient);
    return { background: cssGradient, isGradient: true };
  } catch (e) {
    console.error('Invalid gradient definition:', e);
    return { background: fallbackColor, isGradient: false };
  }
}
```

**Preconditions:**
- `gradientString` is either null, valid CSS gradient string, or valid JSON gradient definition
- `fallbackColor` is a valid CSS color string

**Postconditions:**
- If gradientString is null or invalid, returns fallback color with isGradient: false
- If gradientString is valid, returns CSS gradient string with isGradient: true
- Never throws exception, always returns valid result

### Algorithm 3: Section Background Composition

Composes multiple background layers (image, video, overlay, texture, pattern).

```typescript
function composeSectionBackground(
  section: TemplateSectionContent[string],
  theme: StoreTheme
): React.CSSProperties {
  const styles: React.CSSProperties = {};
  
  // Base background color
  const bgColor = section.style_overrides?.background_color || theme.background_color;
  styles.backgroundColor = bgColor;
  
  // Background image
  if (section.background_image) {
    styles.backgroundImage = `url(${section.background_image})`;
    styles.backgroundSize = section.background_size || 'cover';
    styles.backgroundPosition = section.background_position || 'center';
    styles.backgroundRepeat = section.background_size === 'tile' ? 'repeat' : 'no-repeat';
  }
  
  // Overlay (above image, below content)
  if (section.background_overlay) {
    const overlayCSS = overlayToCSS(section.background_overlay);
    // Use ::before pseudo-element or separate div for overlay
  }
  
  // Texture overlay
  if (section.texture && section.texture !== 'none') {
    const textureOpacity = (section.texture_opacity || 50) / 100;
    // Apply texture as additional background layer
    styles.backgroundImage = `${styles.backgroundImage || ''}, ${TEXTURE_SVG[section.texture]}`;
    styles.backgroundBlendMode = 'multiply';
  }
  
  // Pattern overlay
  if (section.pattern && section.pattern !== 'none') {
    const patternColor = section.pattern_color || theme.primary_color;
    const patternOpacity = (section.pattern_opacity || 30) / 100;
    // Apply pattern as additional background layer
  }
  
  return styles;
}
```

**Preconditions:**
- `section` is a valid section content object
- `theme` is a valid StoreTheme object
- All URLs in section.background_image are valid or empty

**Postconditions:**
- Returns CSSProperties object with composed background styles
- Layers are stacked in correct order: color < image < overlay < texture < pattern
- Invalid or missing values fall back to theme defaults
- No side effects


### Algorithm 4: Real-Time Preview Update

Debounces theme changes and sends updates to preview iframe.

```typescript
class PreviewUpdateManager {
  private updateTimeout: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_MS = 150;
  
  scheduleUpdate(
    theme: StoreTheme,
    sections: TemplateSection[],
    sectionContent: TemplateSectionContent,
    iframeRef: React.RefObject<HTMLIFrameElement>
  ): void {
    // Clear existing timeout
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    
    // Schedule new update
    this.updateTimeout = setTimeout(() => {
      this.sendUpdate(theme, sections, sectionContent, iframeRef);
    }, this.DEBOUNCE_MS);
  }
  
  private sendUpdate(
    theme: StoreTheme,
    sections: TemplateSection[],
    sectionContent: TemplateSectionContent,
    iframeRef: React.RefObject<HTMLIFrameElement>
  ): void {
    if (!iframeRef.current?.contentWindow) return;
    
    const payload = {
      ...theme,
      sections: JSON.stringify(sections),
      section_content: JSON.stringify(sectionContent),
    };
    
    iframeRef.current.contentWindow.postMessage(
      {
        type: 'VENDLE_PREVIEW_THEME_UPDATE',
        payload,
      },
      window.location.origin
    );
  }
}
```

**Preconditions:**
- `theme`, `sections`, `sectionContent` are valid objects
- `iframeRef` is a valid React ref
- Preview iframe exists and is same-origin

**Postconditions:**
- Update is debounced by DEBOUNCE_MS milliseconds
- Only the most recent update is sent if multiple updates occur within debounce window
- Message is sent via postMessage to iframe's contentWindow
- If iframe is not available, update is silently skipped

**Performance**: Limits preview updates to max 1 per 150ms (6.67 updates/sec), preventing excessive re-renders.

### Algorithm 5: CSS Custom Properties Generation

Generates CSS custom properties from design tokens.

```typescript
function generateCSSCustomProperties(
  theme: StoreTheme,
  designTokens: DesignTokens | null
): string {
  const tokens = designTokens || {};
  const cssVars: string[] = [':root {'];
  
  // Spacing scale
  if (tokens.spacing_scale) {
    Object.entries(tokens.spacing_scale).forEach(([key, value]) => {
      cssVars.push(`  --spacing-${key}: ${value};`);
    });
  }
  
  // Font sizes
  if (tokens.font_sizes) {
    Object.entries(tokens.font_sizes).forEach(([key, value]) => {
      cssVars.push(`  --font-size-${key}: ${value};`);
    });
  }
  
  // Border radii
  if (tokens.border_radii) {
    Object.entries(tokens.border_radii).forEach(([key, value]) => {
      cssVars.push(`  --border-radius-${key}: ${value};`);
    });
  }
  
  // Shadows
  if (tokens.shadows) {
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      cssVars.push(`  --shadow-${key}: ${value};`);
    });
  }
  
  // Theme colors as RGB components (for alpha channel control)
  const primaryRGB = hexToRGB(theme.primary_color);
  cssVars.push(`  --primary-rgb: ${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b};`);
  cssVars.push(`  --primary-color: ${theme.primary_color};`);
  
  cssVars.push('}');
  return cssVars.join('\n');
}

function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}
```

**Preconditions:**
- `theme` is a valid StoreTheme object
- `designTokens` may be null or a valid DesignTokens object
- All color values in theme are valid hex colors

**Postconditions:**
- Returns valid CSS string with :root selector
- All design token values are converted to CSS custom properties
- Theme colors are included as both hex and RGB components
- If designTokens is null, only theme colors are included
- Result can be safely injected into a <style> tag


### Algorithm 6: Content Block Rendering

Renders flexible content blocks within a section.

```typescript
function renderContentBlocks(
  blocks: Array<ContentBlock> | undefined,
  theme: StoreTheme
): React.ReactNode[] {
  if (!blocks || blocks.length === 0) return [];
  
  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
  
  return sortedBlocks.map(block => {
    switch (block.type) {
      case 'text':
        return (
          <div
            key={block.id}
            className={`text-block ${getAlignmentClass(block.alignment)}`}
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(block.content || '') }}
            style={{ color: theme.text_color }}
          />
        );
      
      case 'image':
        return (
          <div key={block.id} className="image-block">
            <img
              src={block.image_url}
              alt=""
              className={getBorderRadiusClass(theme.border_radius)}
            />
          </div>
        );
      
      case 'button':
        const btnStyles = getButtonStyles(theme, block.button_style);
        return (
          <div key={block.id} className={`button-block ${getAlignmentClass(block.alignment)}`}>
            <a href={block.button_link} className={btnStyles.className} style={btnStyles.style}>
              {block.button_text}
            </a>
          </div>
        );
      
      case 'spacer':
        const height = SPACING_MAP[block.spacer_height || 'md'];
        return <div key={block.id} style={{ height }} />;
      
      case 'divider':
        return (
          <hr
            key={block.id}
            className="divider-block"
            style={{ borderColor: theme.border_color }}
          />
        );
      
      default:
        return null;
    }
  });
}

function sanitizeHTML(html: string): string {
  // Use DOMPurify or similar library to sanitize HTML
  // Remove script tags, dangerous attributes, etc.
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}
```

**Preconditions:**
- `blocks` is an array of valid ContentBlock objects or undefined
- `theme` is a valid StoreTheme object
- All image_url values are valid URLs or empty
- HTML content in text blocks may contain untrusted user input

**Postconditions:**
- Returns array of React nodes in order specified by block.order
- Text blocks have HTML sanitized to prevent XSS
- All blocks apply theme styling appropriately
- Invalid block types are skipped (return null)
- Empty blocks array returns empty array

**Security**: HTML content is sanitized using DOMPurify to prevent XSS attacks.


## Component Architecture

### EditorSidebar Component Enhancement

The EditorSidebar component will be restructured to implement progressive disclosure:

```tsx
<EditorSidebar>
  {/* Top-level tabs */}
  <Tabs>
    <Tab label="Templates" />
    <Tab label="Global Styles" />
    <Tab label="Sections" />
    {isPro && <Tab label="Design Tokens" />}
  </Tabs>
  
  {/* Global Styles Tab */}
  <TabPanel value="global-styles">
    {/* Basic Controls - Always Visible */}
    <Section title="Colors">
      <ColorPicker label="Primary Color" />
      <ColorPicker label="Background Color" />
      {/* ... other basic colors */}
      
      <Accordion title="Advanced Color Options">
        <GradientEditor label="Primary Gradient" />
        <GradientEditor label="Secondary Gradient" />
        <Toggle label="Enable Glass Effect" />
      </Accordion>
    </Section>
    
    <Section title="Typography">
      <FontSelect label="Body Font" />
      <FontSelect label="Heading Font" />
      <Select label="Font Size" options={['small', 'medium', 'large']} />
      
      <Accordion title="Advanced Typography">
        <Slider label="Line Height" min={1.0} max={2.5} step={0.1} />
        <Slider label="Letter Spacing" min={-0.1} max={0.5} step={0.01} />
        <Select label="Text Transform" options={['none', 'uppercase', 'lowercase', 'capitalize']} />
        <Select label="Body Font Weight" options={[300, 400, 500, 600, 700]} />
        <Select label="Heading Font Weight" options={[600, 700, 800, 900]} />
      </Accordion>
    </Section>
    
    <Section title="Layout & Spacing">
      <Select label="Card Style" options={['modern', 'classic', 'minimal', 'bold']} />
      <Select label="Border Radius" options={['sharp', 'rounded', 'pill']} />
      <Select label="Spacing" options={['compact', 'comfortable', 'spacious']} />
      
      <Accordion title="Advanced Spacing">
        <Select label="Container Width" options={['narrow', 'standard', 'wide', 'full']} />
      </Accordion>
    </Section>
    
    <Section title="Effects & Animation">
      <Select label="Animation Style" options={['none', 'fade', 'slide', 'zoom', 'bounce']} />
      <Select label="Card Shadow" options={['none', 'soft', 'elevated', 'hard']} />
    </Section>
  </TabPanel>
  
  {/* Sections Tab */}
  <TabPanel value="sections">
    <SectionList>
      {sections.map(section => (
        <SectionItem key={section.id} section={section}>
          <SectionControls>
            {/* Section-specific controls */}
            <Select label="Layout Variant" options={getLayoutVariants(section.type)} />
            
            <Accordion title="Customize This Section">
              <ColorPicker label="Background Color Override" />
              <ColorPicker label="Heading Color Override" />
              <ImageUpload label="Background Image" />
              <Select label="Background Size" options={['cover', 'contain', 'tile']} />
              
              {/* Spacing overrides */}
              <SpacingControl label="Padding Top" />
              <SpacingControl label="Padding Bottom" />
              <SpacingControl label="Margin Top" />
              <SpacingControl label="Margin Bottom" />
              
              {/* Brand elements */}
              <Select label="Pattern Overlay" options={PATTERN_OPTIONS} />
              <Select label="Shape Divider Top" options={DIVIDER_OPTIONS} />
              <Select label="Shape Divider Bottom" options={DIVIDER_OPTIONS} />
              
              {/* Animation */}
              <Select label="Scroll Animation" options={SCROLL_ANIMATION_OPTIONS} />
              
              <Button variant="ghost" onClick={() => resetSectionOverrides(section.id)}>
                Reset to Global Theme
              </Button>
            </Accordion>
            
            <Accordion title="Content Blocks">
              <ContentBlockEditor blocks={sectionContent[section.type]?.content_blocks} />
            </Accordion>
          </SectionControls>
        </SectionItem>
      ))}
    </SectionList>
  </TabPanel>
  
  {/* Design Tokens Tab (Pro/Business only) */}
  {isPro && (
    <TabPanel value="design-tokens">
      <Alert>Design tokens provide fine-grained control over your store's design system.</Alert>
      
      <TokenCategory title="Spacing Scale">
        <TokenInput label="Extra Small (xs)" defaultValue="0.25rem" />
        <TokenInput label="Small (sm)" defaultValue="0.5rem" />
        {/* ... other spacing tokens */}
      </TokenCategory>
      
      <TokenCategory title="Font Sizes">
        <TokenInput label="Base" defaultValue="1rem" />
        <TokenInput label="Large" defaultValue="1.125rem" />
        {/* ... other font size tokens */}
      </TokenCategory>
      
      {/* ... other token categories */}
      
      <Button variant="outline" onClick={resetDesignTokens}>
        Reset All Tokens to Defaults
      </Button>
    </TabPanel>
  )}
</EditorSidebar>
```

### Visual Feedback for Overrides

When a section has custom overrides, display visual indicators:

```tsx
<SectionItem section={section}>
  {hasOverrides(section) && (
    <Badge variant="primary" size="sm">
      Customized
    </Badge>
  )}
  {/* ... rest of section item */}
</SectionItem>

function hasOverrides(section: TemplateSection): boolean {
  const content = sectionContent[section.type];
  return !!(
    content?.style_overrides ||
    content?.background_image ||
    content?.pattern ||
    content?.divider_top ||
    content?.divider_bottom ||
    content?.padding_top ||
    content?.margin_top
  );
}
```


### SectionRenderer Component Enhancement

The SectionRenderer component will be enhanced to apply all new customization options:

```tsx
function SectionRenderer({
  section,
  sectionContent,
  theme,
  products,
}: {
  section: TemplateSection;
  sectionContent: TemplateSectionContent[string];
  theme: StoreTheme;
  products?: Product[];
}) {
  const content = sectionContent || {};
  
  // Resolve styles with override cascade
  const backgroundColor = resolveStyleValue(
    theme.background_color,
    content.style_overrides?.background_color,
    '#ffffff'
  );
  
  const headingColor = resolveStyleValue(
    theme.heading_color,
    content.style_overrides?.heading_color,
    theme.text_color
  );
  
  const textColor = resolveStyleValue(
    theme.text_color,
    content.style_overrides?.text_color,
    '#1a1a1a'
  );
  
  // Compose background
  const backgroundStyles = composeSectionBackground(content, theme);
  
  // Get spacing
  const spacing = getSectionSpacing(content);
  
  // Get animation classes
  const scrollAnimation = content.scroll_animation || 'fade-in';
  const animationClass = SCROLL_ANIMATION_CLASSES[scrollAnimation];
  
  // Get layout variant
  const layoutVariant = content.layout_variant || 'default';
  
  return (
    <section
      className={`section-${section.type} ${animationClass}`}
      style={{
        ...backgroundStyles,
        paddingTop: spacing.paddingTop,
        paddingBottom: spacing.paddingBottom,
        paddingLeft: spacing.paddingX,
        paddingRight: spacing.paddingX,
        marginTop: spacing.marginTop,
        marginBottom: spacing.marginBottom,
      }}
    >
      {/* Shape divider top */}
      {content.divider_top && content.divider_top !== 'none' && (
        <ShapeDivider
          type={content.divider_top}
          color={content.divider_color || backgroundColor}
          flip={content.divider_flip}
          invert={content.divider_invert}
          position="top"
        />
      )}
      
      {/* Background video (if present) */}
      {content.background_video && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-10"
          src={content.background_video}
        />
      )}
      
      {/* Overlay layer */}
      {content.background_overlay && (
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundColor: overlayToCSS(content.background_overlay),
          }}
        />
      )}
      
      {/* Texture layer */}
      {content.texture && content.texture !== 'none' && (
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            backgroundImage: `url(${TEXTURE_SVG[content.texture]})`,
            opacity: (content.texture_opacity || 50) / 100,
          }}
        />
      )}
      
      {/* Pattern layer */}
      {content.pattern && content.pattern !== 'none' && (
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            backgroundImage: PATTERN_SVG[content.pattern](
              content.pattern_color || theme.primary_color
            ),
            opacity: (content.pattern_opacity || 30) / 100,
          }}
        />
      )}
      
      {/* Section content */}
      <div className="relative z-10">
        {renderSectionContent(
          section.type,
          content,
          theme,
          layoutVariant,
          { headingColor, textColor, backgroundColor },
          products
        )}
        
        {/* Flexible content blocks */}
        {content.content_blocks && content.content_blocks.length > 0 && (
          <div className="content-blocks">
            {renderContentBlocks(content.content_blocks, theme)}
          </div>
        )}
      </div>
      
      {/* Shape divider bottom */}
      {content.divider_bottom && content.divider_bottom !== 'none' && (
        <ShapeDivider
          type={content.divider_bottom}
          color={content.divider_color || backgroundColor}
          flip={content.divider_flip}
          invert={content.divider_invert}
          position="bottom"
        />
      )}
    </section>
  );
}
```

### ShapeDivider Component

```tsx
function ShapeDivider({
  type,
  color,
  flip = false,
  invert = false,
  position,
}: {
  type: ShapeDivider;
  color: string;
  flip?: boolean;
  invert?: boolean;
  position: 'top' | 'bottom';
}) {
  if (type === 'none') return null;
  
  const dividerSVG = DIVIDER_PATHS[type];
  const transform = `
    ${flip ? 'scaleX(-1)' : ''}
    ${invert ? 'scaleY(-1)' : ''}
  `.trim();
  
  return (
    <div
      className={`shape-divider shape-divider-${position} absolute left-0 right-0 w-full ${
        position === 'top' ? 'top-0' : 'bottom-0'
      }`}
      style={{
        transform,
        transformOrigin: 'center',
      }}
    >
      <svg
        viewBox={dividerSVG.viewBox}
        preserveAspectRatio={dividerSVG.preserveAspectRatio}
        className="w-full h-auto"
        fill={color}
      >
        <path d={dividerSVG.path} />
      </svg>
    </div>
  );
}
```


### GradientEditor Component

New component for visual gradient editing:

```tsx
function GradientEditor({
  value,
  onChange,
  label,
}: {
  value: string | null;
  onChange: (gradient: string | null) => void;
  label: string;
}) {
  const [type, setType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState(90);
  const [position, setPosition] = useState<'center' | 'top' | 'bottom' | 'left' | 'right'>('center');
  const [stops, setStops] = useState<Array<{ color: string; position: number }>>([
    { color: '#ff0000', position: 0 },
    { color: '#0000ff', position: 100 },
  ]);
  
  useEffect(() => {
    // Parse existing gradient value if present
    if (value) {
      parseGradient(value);
    }
  }, [value]);
  
  const handleUpdate = () => {
    const gradient: GradientDefinition = {
      type,
      ...(type === 'linear' ? { angle } : { position }),
      stops,
    };
    onChange(gradientToCSS(gradient));
  };
  
  const addStop = () => {
    setStops([...stops, { color: '#888888', position: 50 }]);
  };
  
  const removeStop = (index: number) => {
    if (stops.length > 2) {
      setStops(stops.filter((_, i) => i !== index));
    }
  };
  
  return (
    <div className="gradient-editor">
      <label className="block text-sm font-medium mb-2">{label}</label>
      
      <div className="gradient-preview mb-4 h-20 rounded-lg" style={{ background: value || 'transparent' }} />
      
      <div className="flex gap-2 mb-3">
        <Button
          variant={type === 'linear' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => { setType('linear'); handleUpdate(); }}
        >
          Linear
        </Button>
        <Button
          variant={type === 'radial' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => { setType('radial'); handleUpdate(); }}
        >
          Radial
        </Button>
      </div>
      
      {type === 'linear' && (
        <div className="mb-3">
          <label className="block text-xs mb-1">Angle</label>
          <input
            type="range"
            min="0"
            max="360"
            value={angle}
            onChange={(e) => { setAngle(Number(e.target.value)); handleUpdate(); }}
            className="w-full"
          />
          <span className="text-xs text-gray-600">{angle}°</span>
        </div>
      )}
      
      {type === 'radial' && (
        <div className="mb-3">
          <label className="block text-xs mb-1">Position</label>
          <select
            value={position}
            onChange={(e) => { setPosition(e.target.value as any); handleUpdate(); }}
            className="w-full px-2 py-1 border rounded"
          >
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      )}
      
      <div className="space-y-2 mb-3">
        <label className="block text-xs font-medium">Color Stops</label>
        {stops.map((stop, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="color"
              value={stop.color}
              onChange={(e) => {
                const newStops = [...stops];
                newStops[index].color = e.target.value;
                setStops(newStops);
                handleUpdate();
              }}
              className="w-10 h-8 rounded border"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={stop.position}
              onChange={(e) => {
                const newStops = [...stops];
                newStops[index].position = Number(e.target.value);
                setStops(newStops);
                handleUpdate();
              }}
              className="flex-1"
            />
            <span className="text-xs w-10">{stop.position}%</span>
            {stops.length > 2 && (
              <button onClick={() => { removeStop(index); handleUpdate(); }} className="text-red-600">
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => { addStop(); handleUpdate(); }}>
          Add Stop
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
          Clear
        </Button>
      </div>
    </div>
  );
}
```


## Server Actions

### updateThemeAction Enhancement

The existing `updateThemeAction` server action will be extended to handle new fields:

```typescript
export async function updateThemeAction(
  prevState: { message: string; errors: {} },
  formData: FormData
): Promise<{ message: string; errors: {} }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized', errors: {} };
  }
  
  try {
    // Extract new fields
    const lineHeight = formData.get('line_height') as string | null;
    const letterSpacing = formData.get('letter_spacing') as string | null;
    const textTransform = formData.get('text_transform') as string | null;
    const bodyFontWeight = formData.get('body_font_weight') as string | null;
    const headingFontWeight = formData.get('heading_font_weight') as string | null;
    const containerWidth = formData.get('container_width') as string | null;
    const secondaryGradient = formData.get('secondary_gradient') as string | null;
    const designTokens = formData.get('design_tokens') as string | null;
    
    const isPublish = formData.get('is_publish') === 'true';
    
    // Validate design tokens JSON if present
    if (designTokens) {
      try {
        JSON.parse(designTokens);
      } catch (e) {
        return {
          message: 'Invalid design tokens JSON',
          errors: { design_tokens: ['Must be valid JSON'] },
        };
      }
    }
    
    // Validate constraints
    if (lineHeight && (parseFloat(lineHeight) < 1.0 || parseFloat(lineHeight) > 2.5)) {
      return {
        message: 'Invalid line height',
        errors: { line_height: ['Must be between 1.0 and 2.5'] },
      };
    }
    
    if (letterSpacing && (parseFloat(letterSpacing) < -0.1 || parseFloat(letterSpacing) > 0.5)) {
      return {
        message: 'Invalid letter spacing',
        errors: { letter_spacing: ['Must be between -0.1 and 0.5'] },
      };
    }
    
    // Build update query
    if (isPublish) {
      // Publish: Update main theme columns and clear draft_config
      await sql`
        UPDATE store_themes
        SET
          -- Existing fields --
          primary_color = ${formData.get('primary_color')},
          secondary_color = ${formData.get('secondary_color')},
          -- ... other existing fields ...
          
          -- New fields --
          line_height = ${lineHeight ? parseFloat(lineHeight) : null},
          letter_spacing = ${letterSpacing ? parseFloat(letterSpacing) : null},
          text_transform = ${textTransform},
          body_font_weight = ${bodyFontWeight ? parseInt(bodyFontWeight) : null},
          heading_font_weight = ${headingFontWeight ? parseInt(headingFontWeight) : null},
          container_width = ${containerWidth},
          secondary_gradient = ${secondaryGradient},
          design_tokens = ${designTokens},
          
          draft_config = NULL,
          updated_at = NOW()
        WHERE vendor_id = ${session.user.id}
      `;
      
      return { message: 'Theme published successfully', errors: {} };
    } else {
      // Save draft: Store all changes in draft_config JSON
      const draftConfig = {
        primary_color: formData.get('primary_color'),
        // ... all other fields ...
        line_height: lineHeight ? parseFloat(lineHeight) : null,
        letter_spacing: letterSpacing ? parseFloat(letterSpacing) : null,
        text_transform: textTransform,
        body_font_weight: bodyFontWeight ? parseInt(bodyFontWeight) : null,
        heading_font_weight: headingFontWeight ? parseInt(headingFontWeight) : null,
        container_width: containerWidth,
        secondary_gradient: secondaryGradient,
        design_tokens: designTokens,
        sections: formData.get('sections'),
        section_content: formData.get('section_content'),
      };
      
      await sql`
        UPDATE store_themes
        SET
          draft_config = ${JSON.stringify(draftConfig)},
          updated_at = NOW()
        WHERE vendor_id = ${session.user.id}
      `;
      
      return { message: 'Draft saved', errors: {} };
    }
  } catch (error) {
    console.error('Theme update error:', error);
    return { message: 'Failed to update theme', errors: {} };
  }
}
```


## Performance Optimizations

### CSS Generation and Caching

To avoid runtime CSS generation on every storefront page load:

```typescript
// Generate compiled CSS from theme settings
function generateCompiledCSS(theme: StoreTheme, designTokens: DesignTokens | null): string {
  const css: string[] = [];
  
  // 1. CSS Custom Properties
  css.push(generateCSSCustomProperties(theme, designTokens));
  
  // 2. Typography Rules
  css.push(`
    body {
      font-family: ${FONT_MAP[theme.font_family]};
      font-size: ${theme.font_size === 'small' ? '14px' : theme.font_size === 'large' ? '18px' : '16px'};
      line-height: ${theme.line_height || 1.5};
      letter-spacing: ${theme.letter_spacing ? `${theme.letter_spacing}em` : 'normal'};
      font-weight: ${theme.body_font_weight || 400};
      color: ${theme.text_color};
      ${theme.text_transform ? `text-transform: ${theme.text_transform};` : ''}
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: ${FONT_MAP[theme.heading_font]};
      font-weight: ${theme.heading_font_weight || 700};
      color: ${theme.heading_color || theme.text_color};
    }
  `);
  
  // 3. Animation Keyframes
  css.push(`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slide-left {
      from { opacity: 0; transform: translateX(40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slide-right {
      from { opacity: 0; transform: translateX(-40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes zoom-in {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
  `);
  
  // 4. Custom CSS (if provided)
  if (theme.custom_css) {
    css.push(theme.custom_css);
  }
  
  return css.join('\n');
}

// Cache compiled CSS in database or Redis
async function getOrGenerateCompiledCSS(vendorId: string): Promise<string> {
  // Check cache first
  const cached = await redis.get(`compiled-css:${vendorId}`);
  if (cached) return cached;
  
  // Generate fresh CSS
  const theme = await fetchVendorTheme(vendorId);
  const designTokens = theme.design_tokens ? JSON.parse(theme.design_tokens) : null;
  const compiledCSS = generateCompiledCSS(theme, designTokens);
  
  // Cache for 1 hour
  await redis.set(`compiled-css:${vendorId}`, compiledCSS, 'EX', 3600);
  
  return compiledCSS;
}

// Invalidate cache when theme is updated
async function invalidateCompiledCSSCache(vendorId: string): Promise<void> {
  await redis.del(`compiled-css:${vendorId}`);
}
```

### Image Optimization

```typescript
// Lazy load section background images
<section
  className="section"
  style={{
    backgroundImage: `url(${backgroundImage})`,
  }}
  loading="lazy"  // Native lazy loading for background images (where supported)
/>

// Use Next.js Image component for content images
import Image from 'next/image';

<Image
  src={imageUrl}
  alt={altText}
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
  blurDataURL={blurDataURL}
/>
```

### Parallax Performance

Use CSS transforms for GPU acceleration:

```typescript
function applyParallaxEffect(element: HTMLElement, speed: 'slow' | 'medium' | 'fast') {
  const scrollSpeed = speed === 'slow' ? 0.3 : speed === 'fast' ? 0.7 : 0.5;
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const offset = scrollY * scrollSpeed;
    
    // Use transform instead of top/background-position for better performance
    element.style.transform = `translateY(${offset}px)`;
  }, { passive: true });  // Passive listener for better scroll performance
}
```

### Debouncing Strategy

```typescript
// Editor input debouncing
const DEBOUNCE_DELAYS = {
  color: 150,        // Fast feedback for color changes
  typography: 150,   // Fast feedback for typography
  spacing: 150,      // Fast feedback for spacing
  image: 300,        // Slower for image uploads
  section: 500,      // Slowest for section add/remove
};

function useDebouncedUpdate(
  value: any,
  delay: number,
  onUpdate: (value: any) => void
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onUpdate(value);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, onUpdate]);
}
```


## Backward Compatibility Strategy

### Migration Strategy for Existing Themes

```typescript
// Automatic migration on theme load
async function migrateThemeIfNeeded(theme: StoreTheme): Promise<StoreTheme> {
  const migrated = { ...theme };
  
  // Set defaults for new typography fields
  if (migrated.line_height === null) {
    migrated.line_height = 1.5;
  }
  if (migrated.letter_spacing === null) {
    migrated.letter_spacing = 0;
  }
  if (migrated.text_transform === null) {
    migrated.text_transform = 'none';
  }
  if (migrated.body_font_weight === null) {
    migrated.body_font_weight = 400;
  }
  if (migrated.heading_font_weight === null) {
    migrated.heading_font_weight = 700;
  }
  
  // Set default container width
  if (migrated.container_width === null) {
    migrated.container_width = 'standard';
  }
  
  // Migrate old gradient format to new format (if needed)
  if (migrated.primary_gradient && !migrated.primary_gradient.startsWith('linear-gradient')) {
    // Assume old format was JSON, convert to CSS string
    try {
      const gradient = JSON.parse(migrated.primary_gradient);
      migrated.primary_gradient = gradientToCSS(gradient);
    } catch {
      // Invalid format, clear it
      migrated.primary_gradient = null;
    }
  }
  
  return migrated;
}

// Section content migration
function migrateSectionContent(content: string): string {
  try {
    const parsed = JSON.parse(content);
    
    // Add default layout_variant for sections that don't have one
    Object.keys(parsed).forEach(sectionType => {
      if (!parsed[sectionType].layout_variant) {
        parsed[sectionType].layout_variant = 'default';
      }
    });
    
    return JSON.stringify(parsed);
  } catch {
    return content;
  }
}
```

### Fallback Rendering

When encountering invalid or missing data:

```typescript
function safeSectionRender(
  section: TemplateSection,
  sectionContent: TemplateSectionContent[string] | undefined,
  theme: StoreTheme
): React.ReactNode {
  try {
    // Attempt normal render
    return <SectionRenderer section={section} sectionContent={sectionContent} theme={theme} />;
  } catch (error) {
    console.error('Section render error:', error);
    
    // Fallback to basic render without advanced features
    return (
      <section className="section-fallback" style={{ padding: '2rem', backgroundColor: theme.background_color }}>
        <div className="container mx-auto">
          <h2 style={{ color: theme.heading_color || theme.text_color }}>
            {sectionContent?.title || 'Section'}
          </h2>
          <p style={{ color: theme.text_color }}>
            {sectionContent?.subtitle || ''}
          </p>
        </div>
      </section>
    );
  }
}
```

### Version Detection

Add version field to theme for future migrations:

```typescript
// Add to StoreTheme type
type StoreTheme = {
  // ... existing fields ...
  schema_version: number;  // Current: 2 (v1 = basic, v2 = deep customization)
};

// Migration dispatcher
async function migrateThemeToLatest(theme: StoreTheme): Promise<StoreTheme> {
  let migrated = { ...theme };
  const currentVersion = 2;
  
  if (!migrated.schema_version) {
    // v1 theme, needs full migration
    migrated = await migrateV1ToV2(migrated);
  }
  
  migrated.schema_version = currentVersion;
  return migrated;
}
```


## Security Considerations

### Content Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize user-provided HTML in content blocks
function sanitizeUserHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|sms):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

// Sanitize CSS (for custom_css field)
function sanitizeCustomCSS(css: string): string {
  // Remove dangerous patterns
  const dangerous = [
    /@import/gi,           // Prevent external imports
    /javascript:/gi,       // Prevent JS execution
    /expression\(/gi,      // Prevent IE expression()
    /<script/gi,           // Prevent script tags
    /on\w+=/gi,           // Prevent event handlers
  ];
  
  let sanitized = css;
  dangerous.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized;
}
```

### URL Validation

```typescript
// Validate image and video URLs
function validateMediaURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Only allow HTTPS
    if (parsed.protocol !== 'https:') {
      return false;
    }
    
    // Whitelist domains or use CDN
    const allowedDomains = [
      'res.cloudinary.com',
      'images.unsplash.com',
      'cdn.vendle.app',
      // Add other trusted CDNs
    ];
    
    const isAllowed = allowedDomains.some(domain => parsed.hostname.endsWith(domain));
    return isAllowed;
  } catch {
    return false;
  }
}

// Validate gradient JSON
function validateGradientJSON(json: string): boolean {
  try {
    const gradient = JSON.parse(json);
    
    // Validate structure
    if (!gradient.type || !['linear', 'radial'].includes(gradient.type)) {
      return false;
    }
    
    if (!Array.isArray(gradient.stops) || gradient.stops.length < 2) {
      return false;
    }
    
    // Validate each stop
    for (const stop of gradient.stops) {
      if (!stop.color || !stop.color.match(/^#[0-9A-Fa-f]{6}$/)) {
        return false;
      }
      if (typeof stop.position !== 'number' || stop.position < 0 || stop.position > 100) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}
```

### Rate Limiting

```typescript
// Limit preview updates to prevent abuse
class RateLimiter {
  private timestamps: Map<string, number[]> = new Map();
  private readonly maxRequests = 100;  // Max requests per window
  private readonly windowMs = 60000;   // 1 minute window
  
  isAllowed(userId: string): boolean {
    const now = Date.now();
    const userTimestamps = this.timestamps.get(userId) || [];
    
    // Remove old timestamps outside the window
    const recentTimestamps = userTimestamps.filter(ts => now - ts < this.windowMs);
    
    if (recentTimestamps.length >= this.maxRequests) {
      return false;
    }
    
    recentTimestamps.push(now);
    this.timestamps.set(userId, recentTimestamps);
    
    return true;
  }
}

// Apply rate limiting to theme updates
const themeSaveRateLimiter = new RateLimiter();

export async function updateThemeAction(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized', errors: {} };
  }
  
  // Check rate limit
  if (!themeSaveRateLimiter.isAllowed(session.user.id)) {
    return {
      message: 'Too many requests. Please wait a moment.',
      errors: { rate_limit: ['Rate limit exceeded'] },
    };
  }
  
  // ... rest of update logic
}
```

### File Size Limits

```typescript
// Validate section_content JSON size
const MAX_SECTION_CONTENT_SIZE = 50 * 1024;  // 50KB

function validateSectionContentSize(content: string): { valid: boolean; error?: string } {
  const sizeBytes = new Blob([content]).size;
  
  if (sizeBytes > MAX_SECTION_CONTENT_SIZE) {
    return {
      valid: false,
      error: `Section content too large (${Math.round(sizeBytes / 1024)}KB). Maximum is 50KB. Consider simplifying your customizations.`,
    };
  }
  
  return { valid: true };
}

// Video file size validation (client-side)
async function validateVideoFile(url: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    
    if (contentLength) {
      const sizeMB = parseInt(contentLength) / (1024 * 1024);
      if (sizeMB > 10) {
        return {
          valid: false,
          error: `Video file too large (${Math.round(sizeMB)}MB). Maximum is 10MB.`,
        };
      }
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Unable to validate video file size' };
  }
}
```


## Testing Strategy

### Unit Tests

```typescript
// Test style override resolution
describe('resolveStyleValue', () => {
  it('should return section override when present', () => {
    const result = resolveStyleValue('#ff0000', '#00ff00', '#0000ff');
    expect(result).toBe('#00ff00');
  });
  
  it('should return global value when section override is null', () => {
    const result = resolveStyleValue('#ff0000', null, '#0000ff');
    expect(result).toBe('#ff0000');
  });
  
  it('should return default value when both are null', () => {
    const result = resolveStyleValue(null, null, '#0000ff');
    expect(result).toBe('#0000ff');
  });
});

// Test gradient parsing
describe('parseAndApplyGradient', () => {
  it('should parse CSS gradient string', () => {
    const result = parseAndApplyGradient(
      'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)',
      '#ffffff'
    );
    expect(result.isGradient).toBe(true);
    expect(result.background).toBe('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)');
  });
  
  it('should return fallback color for invalid gradient', () => {
    const result = parseAndApplyGradient('invalid', '#ffffff');
    expect(result.isGradient).toBe(false);
    expect(result.background).toBe('#ffffff');
  });
});

// Test content sanitization
describe('sanitizeUserHTML', () => {
  it('should allow safe HTML tags', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    const output = sanitizeUserHTML(input);
    expect(output).toBe(input);
  });
  
  it('should remove script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    const output = sanitizeUserHTML(input);
    expect(output).not.toContain('<script');
  });
  
  it('should remove event handlers', () => {
    const input = '<p onclick="alert(1)">Click me</p>';
    const output = sanitizeUserHTML(input);
    expect(output).not.toContain('onclick');
  });
});
```

### Integration Tests

```typescript
// Test theme update flow
describe('updateThemeAction', () => {
  it('should save theme with new typography fields', async () => {
    const formData = new FormData();
    formData.set('line_height', '1.6');
    formData.set('letter_spacing', '0.05');
    formData.set('text_transform', 'uppercase');
    formData.set('is_publish', 'true');
    
    const result = await updateThemeAction({ message: '', errors: {} }, formData);
    
    expect(result.message).toContain('successfully');
    
    // Verify database update
    const theme = await fetchVendorTheme(testVendorId);
    expect(theme.line_height).toBe(1.6);
    expect(theme.letter_spacing).toBe(0.05);
    expect(theme.text_transform).toBe('uppercase');
  });
  
  it('should validate line height bounds', async () => {
    const formData = new FormData();
    formData.set('line_height', '3.0');  // Out of bounds
    formData.set('is_publish', 'true');
    
    const result = await updateThemeAction({ message: '', errors: {} }, formData);
    
    expect(result.message).toContain('Invalid');
    expect(result.errors).toHaveProperty('line_height');
  });
});

// Test preview update mechanism
describe('PreviewUpdateManager', () => {
  it('should debounce rapid updates', async () => {
    const manager = new PreviewUpdateManager();
    const mockIframe = { current: { contentWindow: { postMessage: jest.fn() } } };
    
    // Send 5 rapid updates
    for (let i = 0; i < 5; i++) {
      manager.scheduleUpdate(mockTheme, mockSections, mockContent, mockIframe);
    }
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Should only send 1 message
    expect(mockIframe.current.contentWindow.postMessage).toHaveBeenCalledTimes(1);
  });
});
```

### Visual Regression Tests

```typescript
// Using Playwright or similar
describe('Storefront Visual Tests', () => {
  it('should render gradient backgrounds correctly', async () => {
    await page.goto(`/s/${testSlug}?preview=true`);
    
    // Apply gradient
    await page.evaluate(() => {
      window.postMessage({
        type: 'VENDLE_PREVIEW_THEME_UPDATE',
        payload: {
          primary_gradient: 'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)',
        },
      }, '*');
    });
    
    await page.waitForTimeout(500);
    
    // Take screenshot and compare
    const screenshot = await page.screenshot();
    expect(screenshot).toMatchImageSnapshot();
  });
  
  it('should apply per-section style overrides', async () => {
    await page.goto(`/s/${testSlug}?preview=true`);
    
    const heroColor = await page.evaluate(() => {
      const heroSection = document.querySelector('.section-hero h2');
      return window.getComputedStyle(heroSection).color;
    });
    
    expect(heroColor).toBe('rgb(255, 255, 255)');  // Section override color
  });
});
```

### Performance Tests

```typescript
describe('Performance Tests', () => {
  it('should update preview within 200ms for color changes', async () => {
    const start = Date.now();
    
    await page.evaluate(() => {
      window.postMessage({
        type: 'VENDLE_PREVIEW_THEME_UPDATE',
        payload: { primary_color: '#ff0000' },
      }, '*');
    });
    
    await page.waitForSelector('[data-preview-updated="true"]');
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(200);
  });
  
  it('should handle large section_content JSON efficiently', async () => {
    const largeSectionContent = {
      hero: {
        content_blocks: Array(50).fill(null).map((_, i) => ({
          id: `block-${i}`,
          type: 'text',
          content: '<p>Test content</p>',
          order: i,
        })),
      },
    };
    
    const start = Date.now();
    const result = renderContentBlocks(largeSectionContent.hero.content_blocks, mockTheme);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(100);
    expect(result).toHaveLength(50);
  });
});
```


## Correctness Properties

*Properties serve as formal statements about system behavior that should hold true across all valid executions.*

### Property 1: Style Override Precedence

*For any* style property and section, the final applied value SHALL follow the precedence: Section Override > Global Theme > Template Default, where section overrides supersede global theme settings, and global theme settings supersede template defaults.

**Validates: Requirements 6.1-6.3, 6.8**

### Property 2: Gradient CSS Validity

*For any* gradient definition (linear or radial) with valid color stops, the system SHALL generate a valid CSS gradient string that browsers can render without errors.

**Validates: Requirements 1.1, 1.2, 1.7**

### Property 3: Preview Update Latency

*For any* color, typography, or spacing change in the editor, the preview iframe SHALL reflect the change within 200 milliseconds of the debounce period completing.

**Validates: Requirements 12.1, 12.2, 12.3**

### Property 4: Section Content Size Limit

*For any* section_content JSON exceeding 50KB, the editor SHALL display a warning and recommend simplification before allowing save.

**Validates: Requirements 15.9**

### Property 5: Backward Compatibility Preservation

*For any* existing theme without new customization fields, loading the theme SHALL apply default values for missing fields without data loss or rendering errors.

**Validates: Requirements 13.1, 13.2, 13.8**

### Property 6: Typography Constraint Validation

*For any* line-height value, the system SHALL accept values in range [1.0, 2.5], and for letter-spacing values in range [-0.1em, 0.5em], rejecting values outside these ranges with validation errors.

**Validates: Requirements 3.1, 3.2**

### Property 7: Design Token Tier Restriction

*For any* vendor with subscription tier "starter", the design tokens section SHALL be hidden in the editor, and attempts to save design token values SHALL be ignored.

**Validates: Requirements 11.1, 11.5**

### Property 8: Content Block Ordering

*For any* set of content blocks within a section, rendering SHALL display blocks in ascending order by their `order` field value, maintaining consistent sequencing.

**Validates: Requirements 9.3**

### Property 9: HTML Sanitization Safety

*For any* user-provided HTML content in text blocks, the system SHALL remove script tags, event handlers, and dangerous attributes before rendering to prevent XSS attacks.

**Validates: Requirements 9.1, Security**

### Property 10: Parallax Performance

*For any* section with parallax effect enabled, the system SHALL use CSS transform properties for GPU acceleration, achieving 60fps scroll performance on modern devices.

**Validates: Requirements 2.8, 15.5**

### Property 11: Video Size Validation

*For any* background video URL, the system SHALL enforce a maximum file size of 10MB, rejecting larger files with an error message.

**Validates: Requirements 2.6, 15.4**

### Property 12: Color Overlay Opacity

*For any* color overlay with opacity value between 0 and 100, the system SHALL convert the value to rgba() format with correct alpha channel (opacity/100).

**Validates: Requirements 1.4**

### Property 13: Pattern and Texture Layering

*For any* section with both pattern and texture overlays, the system SHALL stack layers in order: background color < background image < color overlay < texture < pattern, maintaining correct z-index hierarchy.

**Validates: Requirements 2.4, 2.5, 7.1, 7.2**

### Property 14: Shape Divider Positioning

*For any* shape divider applied to a section, the system SHALL position the divider at the specified location (top or bottom) with correct flip and invert transformations applied when enabled.

**Validates: Requirements 7.4, 7.5, 7.7**

### Property 15: Layout Variant Availability

*For any* section type, the system SHALL display only layout variants applicable to that section type (e.g., hero sections show centered, split-screen, full-bleed; galleries show grid, masonry, carousel).

**Validates: Requirements 5.1, 5.3, 5.4, 5.5**

### Property 16: Spacing Value Consistency

*For any* spacing value (none, xs, sm, md, lg, xl, 2xl, 3xl), the system SHALL consistently map to the same pixel/rem value throughout the application (e.g., 'md' always maps to 1.5rem/24px).

**Validates: Requirements 4.1, 4.2**

### Property 17: CSS Custom Property Generation

*For any* design token modification, the system SHALL generate corresponding CSS custom properties (e.g., --spacing-md, --font-size-lg) that can be referenced throughout the storefront.

**Validates: Requirements 11.3, 11.7**

### Property 18: Draft Config Isolation

*For any* draft save operation, changes SHALL be stored in draft_config JSON field without affecting published theme columns, allowing preview without publishing.

**Validates: Requirements 12.8, Requirement 13.2**

### Property 19: Progressive Disclosure State

*For any* advanced control accordion, the system SHALL remember expanded state during the editing session, collapsing only on page reload or explicit reset.

**Validates: Requirements 10.3, 10.5**

### Property 20: Real-Time Preview Synchronization

*For any* theme property change, the preview update SHALL use postMessage communication to apply changes without full page reload, except for section add/remove operations which may trigger reload.

**Validates: Requirements 12.4, 12.5, 12.8**


## Implementation Phases

### Phase 1: Database Schema & Core Types (Week 1)

**Deliverables:**
- Database migration script adding new columns to `store_themes` table
- Extended TypeScript types for `StoreTheme`, `TemplateSectionContent`, `DesignTokens`
- Helper functions for style resolution and CSS generation
- Unit tests for helper functions

**Success Criteria:**
- All new columns added without breaking existing themes
- Type definitions compile without errors
- Helper functions pass all unit tests

### Phase 2: Advanced Color System (Week 1-2)

**Deliverables:**
- `GradientEditor` component for visual gradient creation
- Gradient parsing and CSS conversion functions
- Color overlay system implementation
- Per-section color override UI

**Success Criteria:**
- Vendors can create linear and radial gradients with 2+ stops
- Gradients render correctly in preview within 200ms
- Color overlays apply with correct opacity
- Section color overrides supersede global theme colors

### Phase 3: Enhanced Typography & Spacing (Week 2)

**Deliverables:**
- Typography control panel with advanced options (line-height, letter-spacing, etc.)
- Spacing control UI for per-section padding/margin
- Container width selector
- Typography preview component

**Success Criteria:**
- Typography changes reflect in real-time preview
- Spacing controls apply to sections correctly
- Values validate within specified ranges
- Preview shows accurate spacing adjustments

### Phase 4: Rich Media & Visual Customization (Week 3)

**Deliverables:**
- Background image uploader with size/position controls
- Texture and pattern overlay system with 8+ presets each
- Video background support with file size validation
- Parallax effect implementation with GPU acceleration

**Success Criteria:**
- Background images load with lazy loading
- Textures and patterns render as SVG overlays
- Videos play with autoplay/loop/muted attributes
- Parallax maintains 60fps scroll performance

### Phase 5: Layout Variants & Section Overrides (Week 4)

**Deliverables:**
- Layout variant selector with visual thumbnails for each section type
- Section override panel with reset functionality
- Visual indicators for customized sections
- Override badge UI

**Success Criteria:**
- Each section type displays applicable layout variants
- Layout changes update preview instantly
- Override indicator shows when section has custom styles
- Reset button removes all overrides for a section

### Phase 6: Brand Identity Elements (Week 5)

**Deliverables:**
- Pattern overlay system with 8+ geometric patterns
- Shape divider component with 6+ divider types
- Divider customization controls (color, flip, invert)
- SVG path definitions for all dividers

**Success Criteria:**
- Patterns render with customizable color and opacity
- Shape dividers position correctly at section top/bottom
- Flip and invert transformations work correctly
- Dividers scale responsively across viewports

### Phase 7: Animation & Interaction Effects (Week 5-6)

**Deliverables:**
- Scroll animation system with 5+ animation types
- Hover effect system for cards with 4+ effects
- Transition speed controls
- Animation CSS keyframes

**Success Criteria:**
- Scroll animations trigger when sections enter viewport
- Hover effects apply without layout shift
- Animations maintain 60fps performance
- Transition speeds apply consistently

### Phase 8: Flexible Content Blocks (Week 6)

**Deliverables:**
- Content block editor with drag-and-drop reordering
- Block type components (text, image, button, spacer, divider)
- Rich text editor with formatting toolbar
- HTML sanitization for user content

**Success Criteria:**
- Vendors can add/remove/reorder content blocks
- Rich text supports bold, italic, headings, lists, links
- HTML sanitization prevents XSS attacks
- Blocks render in correct order

### Phase 9: Progressive Disclosure UI (Week 7)

**Deliverables:**
- Redesigned sidebar with tabbed navigation
- Accordion components for advanced controls
- Visual feedback for customized sections
- Help tooltips for complex controls

**Success Criteria:**
- Basic controls visible by default
- Advanced options hidden behind accordions
- Expanded state persists during session
- Tooltips provide helpful explanations

### Phase 10: Design Tokens (Pro/Business) (Week 8)

**Deliverables:**
- Design token editor for Pro/Business subscribers
- CSS custom property generation
- Token category UI (spacing, typography, colors, etc.)
- Reset to defaults functionality

**Success Criteria:**
- Design tokens section hidden for Starter tier
- Token changes apply globally via CSS variables
- Reset button restores default values
- Generated CSS includes all custom properties

### Phase 11: Performance Optimization (Week 9)

**Deliverables:**
- CSS compilation and caching system
- Preview update debouncing with configurable delays
- Image lazy loading implementation
- Code splitting for editor components

**Success Criteria:**
- Preview updates debounce correctly for each control type
- Compiled CSS cached to reduce runtime generation
- Images load lazily with blur placeholders
- Editor loads in <3 seconds on fast connection

### Phase 12: Testing & Documentation (Week 10)

**Deliverables:**
- Unit tests for all helper functions (80%+ coverage)
- Integration tests for theme update flow
- Visual regression test suite
- Performance benchmarks
- User documentation and video tutorials

**Success Criteria:**
- All tests pass consistently
- No visual regressions detected
- Performance meets targets (preview <200ms, load <3s)
- Documentation covers all features

## Rollout Strategy

### Beta Phase (Week 11)

- Enable feature for 10-20 beta vendors
- Monitor performance metrics and error rates
- Collect feedback on UI/UX
- Fix critical bugs

### Gradual Rollout (Week 12)

- Enable for Pro tier subscribers first
- Monitor system load and database performance
- Enable for Business tier subscribers
- Finally enable for all Starter tier users

### Post-Launch Monitoring

- Track usage metrics (which features are most used)
- Monitor preview update latency
- Track theme save success rates
- Collect user feedback for iteration
