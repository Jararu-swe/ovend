# Design Document: Theme Styling Improvements

## Overview

This feature enhances the visual styling system for the 8 existing theme templates in the Vendle MVP storefront. The current implementation has several styling inconsistencies: hardcoded red headings throughout sections, hero banners not respecting theme heading colors, basic product cards lacking theme-specific personality, and unprofessional emoji usage in section headers.

The design addresses these issues by systematically applying theme properties (`heading_color`, `heading_font`, `card_style`, `button_style`, etc.) across all storefront sections. Each theme will maintain its distinctive personality while achieving professional polish comparable to Shopify themes.

### Goals

- Apply `heading_color` consistently to all section headings and product names
- Remove hardcoded colors and emoji characters from section headers
- Implement theme-specific card styling based on `card_style` property (modern/classic/minimal/bold)
- Ensure hero banner headings respect theme `heading_color` with proper contrast
- Apply consistent button styling using `button_style` and `button_radius`
- Enhance product cards with proper visual hierarchy and hover effects
- Maintain WCAG AA accessibility standards across all themes

### Non-Goals

- Creating new theme templates (working with existing 8 themes only)
- Modifying the theme data model or adding new theme properties
- Changing the overall layout structure or section ordering
- Implementing new animation types beyond existing `animation_style` options

## Architecture

### Component Structure

The storefront rendering system consists of two primary components:

1. **SectionRenderer** (`app/ui/store/section-renderer.tsx`)
   - Renders individual storefront sections (hero, testimonials, FAQs, etc.)
   - Currently has hardcoded styling that ignores theme properties
   - Needs systematic application of theme colors and styles

2. **Storefront** (`app/ui/store/storefront.tsx`)
   - Renders the product grid section
   - Contains product card rendering logic
   - Needs enhanced card styling based on `card_style` property

### Theme Property Application Strategy

The design follows a systematic approach to applying theme properties:

```
Theme Properties → Style Computation → Component Rendering
```

Each component will:
1. Receive the `theme` object as a prop
2. Compute styles based on theme properties using helper functions
3. Apply computed styles via inline styles or dynamic className generation
4. Ensure fallback values for optional properties

### Styling Layers

The implementation uses three styling layers:

1. **Base Styles**: Tailwind utility classes for layout and spacing
2. **Theme Styles**: Dynamic inline styles computed from theme properties
3. **Interactive Styles**: Hover and animation effects based on `animation_style`

## Components and Interfaces

### Modified Components

#### 1. Section Heading Component Pattern

All section headings will follow this pattern:

```tsx
<h3
  className="text-lg font-bold mb-4"
  style={{
    color: theme.heading_color || theme.text_color,
    fontFamily: FONT_MAP[theme.heading_font] || undefined
  }}
>
  {title}
</h3>
```

**Changes:**
- Remove hardcoded `text-red-600` and similar color classes
- Apply `theme.heading_color` with fallback to `theme.text_color`
- Apply `theme.heading_font` for typography consistency
- Remove all emoji characters from heading text

#### 2. Hero Banner Component

**Current Issues:**
- Heading uses hardcoded white color
- No consideration for `heading_color` property
- Potential contrast issues with gradient backgrounds

**Design Solution:**
```tsx
<h2
  className="text-3xl md:text-4xl font-bold tracking-tight leading-tight"
  style={{
    color: theme.heading_color || '#ffffff',
    fontFamily: FONT_MAP[theme.heading_font] || theme.heading_font,
    textShadow: '0 2px 8px rgba(0,0,0,0.3)' // Ensure readability
  }}
>
  {content.title}
</h2>
```

**Contrast Handling:**
- Apply text shadow for readability against gradient backgrounds
- Use `heading_color` when it provides sufficient contrast
- Fall back to white with shadow when `heading_color` is too light

#### 3. Product Card Component

**Current Issues:**
- Basic styling without theme personality
- Product name uses hardcoded colors
- No differentiation between card styles (modern/classic/minimal/bold)

**Design Solution:**

Product cards will implement four distinct visual styles:

**Modern Style:**
- Clean lines with soft shadows
- Rounded corners (`rounded-3xl`)
- Subtle border (`border-slate-100`)
- Smooth hover elevation increase

**Classic Style:**
- Traditional borders with balanced proportions
- Medium rounded corners (`rounded-xl`)
- Visible border (`border-slate-200`)
- Subtle scale transform on hover

**Minimal Style:**
- No shadows, minimal borders
- Small rounded corners (`rounded-lg`)
- Transparent or very light border
- Border color change on hover only

**Bold Style:**
- Strong borders with high contrast
- Hard shadows (`4px 4px 0 rgba(...)`)
- Border uses `primary_color`
- Lift transform on hover

**Product Name Styling:**
```tsx
<h4
  className="font-bold leading-snug mb-1 line-clamp-2"
  style={{
    color: theme.heading_color || theme.text_color,
    fontFamily: FONT_MAP[theme.heading_font] || undefined
  }}
>
  {product.name}
</h4>
```

#### 4. Button Component Pattern

All buttons will use the existing `useButtonProps` helper with consistent application:

```tsx
const btn = useButtonProps(theme);

<button
  className={`px-7 py-3.5 text-sm font-bold ${btn.className}`}
  style={btn.style}
>
  {buttonText}
</button>
```

The helper already handles four button styles correctly:
- **Solid**: Primary color background, white text
- **Outline**: Transparent background, primary color border and text
- **Soft**: 20% opacity primary color background, primary color text
- **Glass**: Backdrop blur, surface color background, subtle border

#### 5. Testimonial Cards

**Changes:**
- Customer name uses `heading_color` instead of hardcoded color
- Card background uses `surface_color`
- Star ratings use `accent_color`
- Apply `card_shadow` and `border_radius` from theme

#### 6. Trust Badges

**Changes:**
- Badge background uses `surface_color`
- Icon color uses `primary_color`
- Apply `border_radius` from theme
- Apply `card_shadow` for elevation

#### 7. FAQ Section

**Changes:**
- Question text uses `heading_color`
- Answer text uses `text_color`
- Item background uses `surface_color`
- Expand/collapse icon uses `primary_color`
- Apply `border_radius` and `card_shadow`

#### 8. Image Gallery

**Changes:**
- Apply `border_radius` to gallery images
- Use `card_shadow` for image elevation
- Hover effects consistent with `card_style`
- Caption background uses `surface_color`

### Helper Functions

#### Card Style Computation

```tsx
function getCardStyleClasses(cardStyle: string, borderRadius: string): string {
  const radiusClass = 
    borderRadius === 'sharp' ? 'rounded-none' :
    borderRadius === 'pill' ? 'rounded-3xl' : 'rounded-2xl';

  switch (cardStyle) {
    case 'modern':
      return `${radiusClass} border-slate-100`;
    case 'classic':
      return 'rounded-xl border-slate-200';
    case 'minimal':
      return 'rounded-lg border-transparent';
    case 'bold':
      return `${radiusClass} border-4`;
    default:
      return radiusClass;
  }
}
```

#### Card Shadow Computation

```tsx
function getCardShadowClass(shadow: string): string {
  switch (shadow) {
    case 'none': return 'shadow-none';
    case 'elevated': return 'shadow-lg';
    case 'hard': return 'shadow-[4px_4px_0px_rgba(0,0,0,0.1)]';
    case 'soft':
    default: return 'shadow-sm';
  }
}
```

#### Hover Effect Computation

```tsx
function getCardHoverEffect(cardStyle: string, animationStyle: string): string {
  const baseTransition = 'transition-all duration-300';
  
  if (cardStyle === 'modern') {
    return `${baseTransition} hover:shadow-xl hover:-translate-y-0.5`;
  } else if (cardStyle === 'minimal') {
    return `${baseTransition} hover:border-slate-300`;
  } else if (cardStyle === 'bold') {
    return `${baseTransition} hover:-translate-y-1`;
  } else if (cardStyle === 'classic') {
    return `${baseTransition} hover:scale-[1.02]`;
  }
  
  return baseTransition;
}
```

## Data Models

### StoreTheme Interface

The existing `StoreTheme` interface already contains all necessary properties:

```typescript
interface StoreTheme {
  // Colors
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  surface_color: string;
  heading_color: string;
  border_color: string;

  // Typography
  font_family: string;
  heading_font: string;
  font_size: 'small' | 'medium' | 'large';

  // Layout & Cards
  layout_style: 'grid' | 'list' | 'masonry';
  card_style: 'modern' | 'classic' | 'minimal' | 'bold';
  border_radius: 'sharp' | 'rounded' | 'pill';
  card_shadow: 'none' | 'soft' | 'elevated' | 'hard';

  // Buttons & Interactions
  button_style: 'solid' | 'outline' | 'soft' | 'glass';
  button_radius: 'sharp' | 'rounded' | 'pill';
  animation_style: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce';

  // Other properties...
}
```

No changes to the data model are required. The implementation will use existing properties that are currently underutilized.

### Theme Property Defaults

When optional properties are undefined, use these fallbacks:

- `heading_color`: Falls back to `text_color`
- `surface_color`: Falls back to `'#ffffff'`
- `border_color`: Falls back to `'#e2e8f0'`
- `card_shadow`: Falls back to `'soft'`
- `button_style`: Falls back to `'solid'`
- `button_radius`: Falls back to `'rounded'`
- `animation_style`: Falls back to `'fade'`

## Correctness Properties

