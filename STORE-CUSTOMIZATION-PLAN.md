# Store Customization Implementation Plan

## Overview
Allow vendors to customize their storefront appearance with colors, fonts, and layout options to match their brand identity.

---

## 1. Database Schema

### Add `store_theme` table
```sql
CREATE TABLE store_theme (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  
  -- Colors
  primary_color VARCHAR(7) DEFAULT '#10b981', -- emerald-500
  secondary_color VARCHAR(7) DEFAULT '#059669', -- emerald-600
  background_color VARCHAR(7) DEFAULT '#f8fafc', -- slate-50
  text_color VARCHAR(7) DEFAULT '#0f172a', -- slate-900
  accent_color VARCHAR(7) DEFAULT '#f59e0b', -- amber-500
  
  -- Typography
  font_family VARCHAR(50) DEFAULT 'inter', -- inter, poppins, roboto, playfair, montserrat
  heading_font VARCHAR(50) DEFAULT 'inter',
  font_size VARCHAR(20) DEFAULT 'medium', -- small, medium, large
  
  -- Layout
  layout_style VARCHAR(20) DEFAULT 'grid', -- grid, list, masonry
  card_style VARCHAR(20) DEFAULT 'modern', -- modern, classic, minimal, bold
  border_radius VARCHAR(20) DEFAULT 'rounded', -- sharp, rounded, pill
  
  -- Header
  show_logo BOOLEAN DEFAULT true,
  logo_url TEXT,
  header_style VARCHAR(20) DEFAULT 'sticky', -- sticky, static, transparent
  
  -- Product Cards
  show_product_images BOOLEAN DEFAULT true,
  image_aspect_ratio VARCHAR(20) DEFAULT 'square', -- square, portrait, landscape
  show_product_description BOOLEAN DEFAULT true,
  
  -- Spacing
  spacing VARCHAR(20) DEFAULT 'comfortable', -- compact, comfortable, spacious
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. Implementation Phases

### Phase 1: Backend Setup (30 mins)
1. Create database migration script
2. Add theme types to `definitions.ts`
3. Create `app/lib/theme.ts` with:
   - `fetchVendorTheme(vendorId)` - Get theme settings
   - `updateVendorTheme(vendorId, themeData)` - Save theme
   - `getDefaultTheme()` - Return default theme
4. Add server action `updateThemeAction` in `actions.ts`

### Phase 2: Theme Customization UI (1-2 hours)
Create `/dashboard/customize` page with sections:

**A. Color Picker Section**
- Primary color (buttons, links, accents)
- Secondary color (hover states)
- Background color
- Text color
- Accent color (badges, highlights)
- Live preview panel showing changes

**B. Typography Section**
- Font family dropdown (5-6 options)
- Heading font dropdown
- Font size selector (small/medium/large)
- Preview text samples

**C. Layout Section**
- Layout style: Grid / List / Masonry
- Card style: Modern / Classic / Minimal / Bold
- Border radius: Sharp / Rounded / Pill
- Spacing: Compact / Comfortable / Spacious

**D. Header Section**
- Logo upload (Cloudinary)
- Header style: Sticky / Static / Transparent
- Toggle show/hide logo

**E. Product Display Section**
- Toggle product images
- Image aspect ratio selector
- Toggle product descriptions

**F. Preview & Actions**
- Live preview iframe showing storefront
- Save button
- Reset to defaults button
- Preview on mobile toggle

### Phase 3: Storefront Theme Application (1 hour)
Modify `app/s/[slug]/page.tsx` and `storefront.tsx`:

1. Fetch theme data alongside vendor/products
2. Generate CSS variables from theme
3. Apply dynamic styles using:
   - CSS custom properties (--primary-color, etc.)
   - Conditional className based on layout/card style
   - Dynamic font loading (Google Fonts)

**Implementation approach:**
```tsx
// In storefront component
<div 
  style={{
    '--primary': theme.primary_color,
    '--secondary': theme.secondary_color,
    '--background': theme.background_color,
    '--text': theme.text_color,
    '--accent': theme.accent_color,
  } as React.CSSProperties}
  className={`theme-${theme.card_style} layout-${theme.layout_style}`}
>
```

### Phase 4: Theme Presets (Optional - 30 mins)
Create 4-5 pre-made themes:
- **Default** - Emerald green (current)
- **Sunset** - Orange/pink gradient
- **Ocean** - Blue/teal
- **Minimal** - Black/white
- **Bold** - High contrast colors

Allow one-click application of presets.

---

## 3. Technical Implementation Details

### A. Color System
Use CSS custom properties for dynamic theming:
```css
:root {
  --color-primary: #10b981;
  --color-secondary: #059669;
  --color-background: #f8fafc;
  --color-text: #0f172a;
  --color-accent: #f59e0b;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}
```

### B. Font Loading
```tsx
// Load Google Fonts dynamically
useEffect(() => {
  if (theme.font_family !== 'inter') {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${theme.font_family}:wght@400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
}, [theme.font_family]);
```

### C. Layout Variants
Create CSS classes for each layout:
```css
.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.layout-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.layout-masonry {
  column-count: 2;
  column-gap: 1.5rem;
}
```

### D. Card Style Variants
```css
.card-modern {
  border-radius: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.card-classic {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.card-minimal {
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.card-bold {
  border: 3px solid var(--color-primary);
  border-radius: 1rem;
  box-shadow: 4px 4px 0 var(--color-primary);
}
```

---

## 4. UI/UX Considerations

### Color Picker Component
Use a library like `react-color` or build custom:
- Show color preview
- Hex input field
- Predefined color swatches
- Contrast checker (ensure text is readable)

### Live Preview
- Embed iframe showing actual storefront
- Update in real-time as user changes settings
- Toggle between desktop/mobile view

### Validation
- Ensure colors have sufficient contrast (WCAG AA)
- Validate hex color format
- Prevent saving invalid combinations

---

## 5. File Structure

```
app/
├── dashboard/
│   └── customize/
│       ├── page.tsx (main customization page)
│       └── loading.tsx
├── ui/
│   └── customize/
│       ├── color-picker.tsx
│       ├── font-selector.tsx
│       ├── layout-selector.tsx
│       ├── theme-preview.tsx
│       └── preset-themes.tsx
├── lib/
│   ├── theme.ts (theme data functions)
│   └── theme-presets.ts (predefined themes)
└── s/
    └── [slug]/
        └── page.tsx (apply theme here)
```

---

## 6. Implementation Steps

1. **Database** (15 mins)
   - Create `create-store-theme-table.js`
   - Run migration
   - Add default theme for existing vendors

2. **Backend** (30 mins)
   - Add types to `definitions.ts`
   - Create `theme.ts` with CRUD functions
   - Add `updateThemeAction` to `actions.ts`

3. **Navigation** (5 mins)
   - Add "Customize" link to dashboard nav

4. **Customization Page** (2 hours)
   - Build color picker section
   - Build typography section
   - Build layout section
   - Build preview panel
   - Wire up save functionality

5. **Storefront Integration** (1 hour)
   - Fetch theme in `[slug]/page.tsx`
   - Pass theme to storefront component
   - Apply CSS variables
   - Add conditional classes
   - Test all combinations

6. **Polish** (30 mins)
   - Add loading states
   - Add success/error messages
   - Add reset to defaults
   - Add theme presets
   - Mobile responsive

---

## 7. Future Enhancements

- **Advanced**: Custom CSS editor for power users
- **Templates**: Marketplace of community themes
- **A/B Testing**: Test different themes for conversion
- **Seasonal**: Auto-switch themes for holidays
- **Dark Mode**: Toggle for dark theme
- **Animations**: Customize transitions and effects
- **Social**: Share theme codes with other vendors

---

## 8. Estimated Time

- **Minimum Viable**: 3-4 hours (colors + basic layout)
- **Full Implementation**: 6-8 hours (all features)
- **With Presets & Polish**: 10-12 hours

---

## 9. Priority Features (MVP)

If time is limited, implement in this order:
1. ✅ Colors (primary, background, text) - Most impactful
2. ✅ Layout style (grid/list) - Visual variety
3. ✅ Card style (modern/minimal) - Brand personality
4. Font family - Brand consistency
5. Logo upload - Brand identity
6. Presets - Quick setup

---

## 10. Testing Checklist

- [ ] Theme saves correctly to database
- [ ] Storefront applies theme on load
- [ ] Colors display correctly
- [ ] Fonts load properly
- [ ] Layout switches work
- [ ] Mobile responsive
- [ ] Preview updates in real-time
- [ ] Reset to defaults works
- [ ] Multiple vendors don't interfere
- [ ] Performance (no layout shift)
