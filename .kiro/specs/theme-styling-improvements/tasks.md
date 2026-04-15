# Implementation Plan: Theme Styling Improvements

## Overview

This implementation plan systematically applies theme properties across all storefront sections to achieve professional, theme-specific styling. The work focuses on removing hardcoded colors, applying `heading_color` consistently, implementing theme-specific card styles, and ensuring all 8 themes have distinctive personalities while maintaining professional polish.

## Tasks

- [x] 1. Create helper functions for theme styling
  - [x] 1.1 Create `getCardStyleClasses` helper function
    - Implement function that returns Tailwind classes based on `card_style` and `border_radius`
    - Handle four card styles: modern, classic, minimal, bold
    - Apply appropriate border radius based on theme setting
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 1.2 Create `getCardShadowClass` helper function
    - Implement function that returns shadow classes based on `card_shadow` property
    - Handle four shadow types: none, soft, elevated, hard
    - _Requirements: 4.6_
  
  - [x] 1.3 Create `getCardHoverEffect` helper function
    - Implement function that returns hover effect classes based on `card_style`
    - Modern: increase shadow elevation and slight lift
    - Classic: subtle scale transform
    - Minimal: border color change only
    - Bold: lift transform
    - _Requirements: 4.7, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_
  
  - [x] 1.4 Create `getSectionSpacing` helper function
    - Implement function that returns spacing values based on theme's `spacing` setting
    - Compact: 3rem (48px), Comfortable: 4rem (64px), Spacious: 6rem (96px)
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [x] 2. Fix section heading styling in section-renderer.tsx
  - [x] 2.1 Update all section headings to use `heading_color`
    - Remove hardcoded `text-red-600` and similar color classes from all section headings
    - Apply `theme.heading_color` with fallback to `theme.text_color`
    - Apply `theme.heading_font` using FONT_MAP
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 2.2 Remove emoji characters from section headers
    - Remove all emoji characters from section heading text
    - Ensure professional presentation using typography and spacing only
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 2.3 Apply consistent section spacing
    - Use `getSectionSpacing` helper to apply vertical spacing between sections
    - Apply consistent internal padding within sections
    - _Requirements: 16.1, 16.5, 16.6_

- [x] 3. Update hero banner heading styling
  - [x] 3.1 Apply `heading_color` to hero banner title
    - Update hero banner heading to use `theme.heading_color`
    - Apply `theme.heading_font` for typography
    - Add text shadow for readability: `0 2px 8px rgba(0,0,0,0.3)`
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [x] 3.2 Ensure WCAG AA contrast compliance
    - Verify contrast ratio between heading and background meets 4.5:1
    - Apply background overlay if needed for dark heading colors
    - _Requirements: 2.3_

- [x] 4. Implement theme-specific product card styling in storefront.tsx
  - [x] 4.1 Update product card container styling
    - Apply `getCardStyleClasses` to product card container
    - Apply `getCardShadowClass` for elevation
    - Apply `getCardHoverEffect` for interactive feedback
    - Use theme's `border_radius` setting
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [x] 4.2 Update product name styling
    - Apply `theme.heading_color` to product name
    - Apply `theme.heading_font` for typography
    - Ensure proper line clamping for long names
    - _Requirements: 5.1_
  
  - [x] 4.3 Update product price styling
    - Apply `theme.primary_color` or `theme.accent_color` for visual prominence
    - Add strikethrough styling for discounted original prices
    - _Requirements: 5.2, 5.3_
  
  - [x] 4.4 Update "Add to Cart" button styling
    - Use existing `useButtonProps` helper for consistent button styling
    - Apply theme's `button_style` and `button_radius`
    - _Requirements: 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [x] 4.5 Add out-of-stock indicator styling
    - Display clear status indicator using muted colors
    - Apply theme-appropriate styling
    - _Requirements: 5.5_
  
  - [x] 4.6 Apply consistent product image aspect ratio
    - Use theme's `image_aspect_ratio` for product images
    - Ensure consistent sizing across all cards
    - _Requirements: 5.6_

- [x] 5. Update testimonials section styling
  - [x] 5.1 Apply theme styling to testimonial cards
    - Use `getCardStyleClasses` for card container
    - Apply `theme.surface_color` for card background
    - Apply `theme.border_radius` and `theme.card_shadow`
    - _Requirements: 18.1, 18.2, 18.6_
  
  - [x] 5.2 Update testimonial text styling
    - Apply `theme.heading_color` to customer names
    - Apply `theme.text_color` to testimonial text
    - Apply `theme.accent_color` to star ratings
    - _Requirements: 18.3, 18.4, 18.5_

- [x] 6. Update trust badges section styling
  - [x] 6.1 Apply theme styling to trust badge containers
    - Use `theme.surface_color` for badge backgrounds
    - Apply `theme.border_radius` to badge containers
    - Apply `theme.card_shadow` for elevation
    - _Requirements: 17.1, 17.4, 17.5_
  
  - [x] 6.2 Update trust badge content styling
    - Apply `theme.text_color` for badge text
    - Apply `theme.primary_color` or `theme.accent_color` for icons
    - Implement responsive grid layout
    - _Requirements: 17.2, 17.3, 17.6_

- [x] 7. Update FAQ section styling
  - [x] 7.1 Apply theme styling to FAQ items
    - Use `theme.surface_color` for FAQ item backgrounds
    - Apply `theme.border_radius` to FAQ items
    - Apply `theme.card_shadow` for elevation
    - _Requirements: 20.3, 20.4, 20.6_
  
  - [x] 7.2 Update FAQ text styling
    - Apply `theme.heading_color` to question text
    - Apply `theme.text_color` to answer text
    - Apply `theme.primary_color` to expand/collapse icons
    - _Requirements: 20.1, 20.2, 20.5_

- [x] 8. Update image gallery section styling
  - [x] 8.1 Apply theme styling to gallery images
    - Apply `theme.border_radius` to gallery images
    - Use `theme.card_shadow` for image elevation
    - Implement hover effects consistent with `card_style`
    - _Requirements: 19.1, 19.2, 19.3_
  
  - [x] 8.2 Update image caption styling
    - Use `theme.surface_color` for caption backgrounds
    - Arrange images in responsive grid matching `layout_style`
    - _Requirements: 19.4, 19.5_

- [x] 9. Verify theme-specific refinements
  - [ ] 9.1 Verify Fresh Market theme (green, modern, bouncy)
    - Confirm green color palette (#16a34a) applied consistently
    - Verify "bounce" animations and "modern" card style
    - Check "pill" button radius and Poppins font
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 9.2 Verify Luxe Boutique theme (black/gold, minimal, elegant)
    - Confirm black/gold palette (#18181b, #c59b3f) applied consistently
    - Verify "fade" animations and "minimal" card style
    - Check "sharp" border radius and Playfair Display headings
    - Verify "masonry" layout style
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ] 9.3 Verify Tech Store theme (blue, modern, dynamic)
    - Confirm blue palette (#2563eb) applied consistently
    - Verify "slide" animations and "modern" card style with "elevated" shadows
    - Check Space Grotesk headings and "landscape" image aspect ratio
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 9.4 Verify Beauty & Glow theme (pink, soft, feminine)
    - Confirm pink palette (#db2777) applied consistently
    - Verify "zoom" animations and "modern" card style with "soft" shadows
    - Check "pill" border radius and Playfair Display headings
    - Verify "spacious" spacing
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [ ] 9.5 Verify Quick Bites theme (red/yellow, bold, energetic)
    - Confirm red/yellow palette (#dc2626, #f59e0b) applied consistently
    - Verify "bounce" animations and "bold" card style with "hard" shadows
    - Check Montserrat font, "large" font size, and "compact" spacing
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  
  - [ ] 9.6 Verify Handmade & Craft theme (brown/earth, classic, warm)
    - Confirm brown/earth palette (#92400e) applied consistently
    - Verify "fade" animations and "classic" card style with "soft" shadows
    - Check Playfair Display headings and "masonry" layout
    - Verify warm surface color (#fffef2)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
  
  - [ ] 9.7 Verify Midnight Luxe theme (dark purple, sophisticated, premium)
    - Confirm dark purple palette (#a78bfa, #0f0f14) applied consistently
    - Verify "fade" animations and "modern" card style with "elevated" shadows
    - Check "glass" button style and Outfit headings
    - Verify WCAG AA contrast on dark backgrounds
    - Verify subtle border color (#2e2e3a)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_
  
  - [ ] 9.8 Verify Studio Clean theme (monochrome, minimal, architectural)
    - Confirm monochrome palette (#0a0a0a, #ffffff) applied consistently
    - Verify "fade" animations and "minimal" card style with no shadows
    - Check "sharp" border radius and DM Sans font consistency
    - Verify "spacious" spacing and minimal border color (#f0f0f0)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

- [x] 10. Accessibility and keyboard navigation
  - [x] 10.1 Ensure keyboard focus states match hover states
    - Apply focus-visible styles to all interactive elements
    - Ensure focus states are visible and match hover effects
    - _Requirements: 15.7_
  
  - [x] 10.2 Verify WCAG AA contrast compliance across all themes
    - Test all text/background combinations for 4.5:1 contrast ratio
    - Verify button text readability across all button styles
    - _Requirements: 2.3, 6.7, 13.6_

- [x] 11. Final checkpoint - Ensure all styling is applied correctly
  - Verify all hardcoded colors are removed
  - Test all 8 themes for visual consistency and personality
  - Ensure all sections respect theme properties
  - Ask the user if questions arise

## Notes

- All helper functions should be created in a shared utilities file for reusability
- The existing `useButtonProps` helper already handles button styling correctly
- Each theme verification task should include visual inspection of all sections
- Focus on systematic application of theme properties rather than creating new styling patterns
- Maintain backward compatibility with existing theme data
