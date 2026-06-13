# Implementation Plan: Deep Storefront Customization

## Overview

This implementation plan transforms the storefront editor from basic template styling into a comprehensive visual design platform. The feature enables vendors using the same template to create completely unique, distinctive storefronts through 15 major capability areas including advanced color systems, rich media customization, enhanced typography, flexible layouts, per-section overrides, brand identity elements, animations, and design tokens for advanced users.

The implementation follows 12 phases aligned with the design document, building incrementally from database schema to advanced features like flexible content blocks and design tokens. All code will be written in TypeScript with React/Next.js, building on the existing theme editor architecture.

## Tasks

- [ ] 1. Phase 1: Database Schema & Core Types
  - [x] 1.1 Create database migration script for store_themes table
    - Add new columns: line_height, letter_spacing, text_transform, body_font_weight, heading_font_weight, container_width, design_tokens, secondary_gradient
    - Add CHECK constraints for enum columns
    - Add backward compatibility defaults with UPDATE statement
    - Test migration on development database
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.3, 11.1, 14.1, 14.2_

  - [ ] 1.2 Extend TypeScript definitions in app/lib/definitions.ts
    - Add new fields to StoreTheme type
    - Create TemplateSectionContent type with expanded schema
    - Create DesignTokens type for Pro/Business tier
    - Create GradientDefinition, ColorOverlay, and other utility types
    - _Requirements: 3.6, 14.1, 14.2, 14.3_

  - [-] 1.3 Create style resolution helper functions
    - Implement resolveStyleValue<T>() for cascading style resolution
    - Implement parseAndApplyGradient() for gradient parsing
    - Implement composeSectionBackground() for background composition
    - Implement getSectionSpacing() for spacing calculation
    - Add unit tests for all helper functions
    - _Requirements: 1.7, 4.6, 6.9, 13.1, 13.2_

  - [ ] 1.4 Create CSS generation utilities
    - Implement generateCSSCustomProperties() for design tokens
    - Implement hexToRGB() color conversion
    - Implement gradientToCSS() for gradient conversion
    - Implement overlayToCSS() for overlay styles
    - Add unit tests for CSS generation functions
    - _Requirements: 1.7, 11.7, 14.8_

- [ ] 2. Checkpoint - Verify schema and types
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Phase 2: Advanced Color System
  - [ ] 3.1 Create GradientEditor component
    - Build UI for linear and radial gradient creation
    - Add color stop controls with position sliders (0-100%)
    - Add angle control for linear gradients (0-360°)
    - Add position control for radial gradients
    - Support minimum 2 color stops per gradient
    - Integrate with color picker component
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 3.2 Implement gradient parsing and conversion
    - Update parseAndApplyGradient() to support JSON and CSS formats
    - Add validation for gradient definitions
    - Handle malformed gradient data gracefully
    - Store gradients as CSS-compatible strings in database
    - _Requirements: 1.7, 13.4, 13.8_

  - [ ] 3.3 Create ColorOverlay component
    - Build UI for overlay color picker
    - Add opacity slider (0-100%)
    - Implement overlayToCSS() conversion
    - Apply overlay using ::before pseudo-element
    - _Requirements: 1.4, 1.5_

  - [ ] 3.4 Build per-section color override UI
    - Add color override controls to section editor panel
    - Implement override indicators (colored badge)
    - Add "Reset to global" button for each color field
    - Update section_content JSON with style_overrides
    - _Requirements: 1.6, 1.8, 6.1, 6.2, 6.3, 6.7, 6.8_

  - [ ]* 3.5 Write unit tests for color system
    - Test gradient parsing with valid and invalid inputs
    - Test overlay CSS generation with edge cases
    - Test color override resolution cascade
    - Test real-time preview updates for color changes
    - _Requirements: 1.3, 12.1_

- [ ] 4. Phase 3: Enhanced Typography & Spacing
  - [ ] 4.1 Create TypographyControls component
    - Add line-height slider (1.0 to 2.5 in 0.1 increments)
    - Add letter-spacing slider (-0.1em to 0.5em in 0.01em increments)
    - Add text-transform dropdown (none, uppercase, lowercase, capitalize)
    - Add font-weight selectors for body and headings (300-900)
    - Add per-section font size override dropdown (xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 4.2 Create SpacingControls component
    - Add per-section padding controls (top, right, bottom, left)
    - Add per-section margin controls (top, bottom)
    - Use spacing scale: none, xs, sm, md, lg, xl, 2xl, 3xl
    - Implement SPACING_MAP for px conversion
    - Add visual spacing indicators in preview
    - _Requirements: 4.1, 4.2, 4.6_

  - [ ] 4.3 Create ContainerWidthSelector component
    - Add container width options: narrow (960px), standard (1280px), wide (1536px), full (100%)
    - Store in theme.container_width
    - Apply globally to storefront layout
    - _Requirements: 4.3_

  - [ ] 4.4 Create TypographyPreview component
    - Show sample text with all typography settings applied
    - Display body text and heading samples
    - Add "Preview text styles" button to typography panel
    - _Requirements: 3.7_

  - [ ]* 4.5 Write integration tests for typography and spacing
    - Test typography controls update theme state correctly
    - Test spacing controls update section_content correctly
    - Test preview reflects typography changes within 200ms
    - Test spacing changes apply without layout shift
    - _Requirements: 12.2, 12.3_

- [ ] 5. Phase 4: Rich Media & Visual Customization
  - [ ] 5.1 Create BackgroundImageUploader component
    - Add image upload with file validation (jpg, png, webp)
    - Add background-size dropdown (cover, contain, tile)
    - Add background-position selector (center, top, bottom, left, right)
    - Store image URL in section_content.background_image
    - Implement lazy loading with blur placeholders
    - _Requirements: 2.1, 2.2, 2.3, 15.3_

  - [ ] 5.2 Create TextureOverlay system
    - Define TEXTURE_SVG constants with 8 preset textures (paper, fabric, concrete, wood, dots, stripes, grid, noise)
    - Build TextureSelector UI component
    - Add opacity slider for texture overlay (0-100%)
    - Apply texture as additional background layer with blend modes
    - Store in section_content.texture and texture_opacity
    - _Requirements: 2.4, 2.5, 2.10, 15.6_

  - [ ] 5.3 Create VideoBackgroundUploader component
    - Add video file upload with validation (mp4, webm, max 10MB)
    - Implement file size check and error messaging
    - Add video preview in uploader
    - Store video URL in section_content.background_video
    - Render video with autoplay, loop, muted attributes in storefront
    - _Requirements: 2.6, 2.7, 15.4_

  - [ ] 5.4 Implement ParallaxEffect system
    - Add parallax toggle for background images
    - Add speed control dropdown (slow, medium, fast)
    - Implement parallax using CSS transform with GPU acceleration
    - Store in section_content.parallax
    - Ensure 60fps performance with requestAnimationFrame
    - _Requirements: 2.8, 15.5, 15.8_

  - [ ] 5.5 Create PatternOverlay system
    - Define PATTERN_SVG functions for 6 geometric patterns (dots, stripes, waves, triangles, hexagons, circles)
    - Build PatternSelector UI component
    - Add pattern foreground color picker
    - Add pattern opacity slider (0-100%)
    - Apply as data URI background layer
    - Store in section_content.pattern, pattern_color, pattern_opacity
    - _Requirements: 2.9, 2.10, 15.6_

  - [ ]* 5.6 Write performance tests for media features
    - Benchmark background image load times with lazy loading
    - Test video file size validation rejects >10MB files
    - Measure parallax scroll performance (target 60fps)
    - Test texture/pattern rendering doesn't block main thread
    - _Requirements: 15.3, 15.4, 15.5, 15.8_

- [ ] 6. Checkpoint - Test rich media features
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Phase 5: Layout Variants & Section Overrides
  - [ ] 7.1 Create LayoutVariantSelector component
    - Generate visual thumbnails for each layout variant
    - Display applicable variants per section type (hero, features, gallery, product_grid)
    - Add hero variants: centered, left-aligned, right-aligned, split-screen, full-bleed
    - Add feature variants: horizontal-cards, vertical-cards, alternating
    - Add gallery variants: grid, masonry, carousel
    - Add product grid column selector (2, 3, 4, 5, 6 columns)
    - Store in section_content.layout_variant
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.8_

  - [ ] 7.2 Implement section layout rendering logic
    - Create SectionRenderer component with variant support
    - Implement conditional layout logic for each variant
    - Apply alignment options (left, center, right) to text and images
    - Ensure responsive behavior across viewports
    - _Requirements: 5.6, 5.7_

  - [ ] 7.3 Create SectionOverridePanel component
    - Build "Customize this section" toggle/accordion
    - Add per-section background color override
    - Add per-section text color override
    - Add per-section heading color override
    - Add per-section card style override (modern, classic, minimal, bold, none)
    - Add per-section border radius override (sharp, rounded, pill)
    - Add per-section glass effect toggle
    - Store all overrides in section_content.style_overrides
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.9_

  - [ ] 7.4 Add visual override indicators
    - Display colored badge on sections with custom styling
    - Show indicator in section list sidebar
    - Add "Reset to global theme" button
    - Implement reset functionality to remove style_overrides
    - _Requirements: 6.7, 6.8_

  - [ ]* 7.5 Write integration tests for layout variants
    - Test each layout variant renders correctly
    - Test section overrides supersede global theme values
    - Test override indicators display when customizations applied
    - Test reset functionality removes all overrides
    - _Requirements: 12.2, 12.3_

- [ ] 8. Phase 6: Brand Identity Elements
  - [ ] 8.1 Create PatternOverlayEditor component
    - Define PATTERN_SVG with 8 pattern types (dots, diagonal-stripes, horizontal-stripes, grid, triangles, hexagons, waves, circuits)
    - Build pattern selector with visual previews
    - Add pattern color customization
    - Add opacity slider (0-100%)
    - Generate SVG data URIs with encodeURIComponent for colors
    - Store in section_content.pattern, pattern_color, pattern_opacity
    - _Requirements: 7.1, 7.2, 7.3, 7.8_

  - [ ] 8.2 Create ShapeDivider component
    - Define DIVIDER_PATHS with 6 shape types (wave, angle, curve, triangle, arrow, split)
    - Create SVG path definitions with viewBox and preserveAspectRatio
    - Build divider selector UI with visual previews
    - Add position options (top, bottom, both)
    - Add color picker to match section background
    - Add flip and invert transformation controls
    - Render as positioned SVG elements at section boundaries
    - Store in section_content.divider_top, divider_bottom, divider_color, divider_flip, divider_invert
    - _Requirements: 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ]* 8.3 Write visual regression tests for brand elements
    - Test each pattern renders with correct color and opacity
    - Test each shape divider renders at correct position
    - Test flip and invert transformations work correctly
    - Test dividers scale responsively across viewports
    - _Requirements: 12.3, 12.4_

- [ ] 9. Phase 7: Animation & Interaction Effects
  - [ ] 9.1 Create AnimationControls component
    - Add scroll animation selector with 5 types (fade-in, slide-up, slide-left, slide-right, zoom-in, none)
    - Define SCROLL_ANIMATION_CLASSES constant
    - Add hover effect selector for cards (lift, grow, glow, tilt, none)
    - Define HOVER_EFFECT_CLASSES constant
    - Add transition speed selector (instant, fast, normal, slow)
    - Define TRANSITION_DURATION constant
    - Store in theme.animation_style and section_content.scroll_animation, card_hover_effect
    - _Requirements: 8.1, 8.3, 8.4, 8.5, 8.7_

  - [ ] 9.2 Implement scroll animation system
    - Add Intersection Observer for scroll trigger detection
    - Apply animation classes when sections enter viewport
    - Demonstrate animations in preview on scroll
    - Ensure animations maintain 60fps performance
    - _Requirements: 8.2, 8.7, 15.8_

  - [ ] 9.3 Implement hover effect system
    - Apply hover effect classes to cards and buttons
    - Ensure hover effects don't cause layout shift
    - Add performance warning tooltip for intensive animations
    - _Requirements: 8.3, 8.4, 8.8_

  - [ ] 9.4 Add parallax depth control
    - Add parallax depth options (subtle, moderate, dramatic)
    - Implement depth multiplier for transform values
    - Store in section_content.parallax
    - _Requirements: 8.6_

  - [ ]* 9.5 Write performance benchmarks for animations
    - Measure scroll animation frame rate (target 60fps)
    - Test hover effects don't block main thread
    - Verify transition speeds apply correctly
    - Test parallax performance with multiple sections
    - _Requirements: 12.4, 15.8_

- [ ] 10. Phase 8: Flexible Content Blocks
  - [ ] 10.1 Create ContentBlockEditor component
    - Build add content block menu with types: text, image, button, spacer, divider
    - Implement drag-and-drop reordering with React DnD or similar
    - Add delete button for individual blocks
    - Add duplicate button for individual blocks
    - Store blocks in section_content.content_blocks array
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.8_

  - [ ] 10.2 Create RichTextEditor component
    - Integrate rich text editor library (TipTap, Slate, or Quill)
    - Add formatting toolbar (bold, italic, underline, headings, lists, links)
    - Add text alignment controls (left, center, right, justify)
    - Implement HTML sanitization to prevent XSS attacks
    - Store sanitized HTML in content_blocks[].content
    - _Requirements: 9.1, 9.6, 9.8_

  - [ ] 10.3 Create ContentBlock type components
    - Implement TextBlock component with alignment
    - Implement ImageBlock component with URL input
    - Implement ButtonBlock component with text, link, style (primary, secondary, outline, ghost)
    - Implement SpacerBlock component with height options (xs, sm, md, lg, xl)
    - Implement DividerBlock component
    - _Requirements: 9.7, 9.8_

  - [ ] 10.4 Implement content block rendering
    - Create renderContentBlocks() function
    - Sort blocks by order property
    - Apply correct styling per block type
    - Update preview in real-time as blocks change
    - _Requirements: 9.9_

  - [ ]* 10.5 Write security tests for content blocks
    - Test HTML sanitization prevents XSS injection
    - Test malicious script tags are stripped
    - Test safe HTML (bold, italic, links) is preserved
    - Test block reordering updates order property correctly
    - _Requirements: 12.1_

- [ ] 11. Checkpoint - Test content block system
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Phase 9: Progressive Disclosure UI
  - [ ] 12.1 Redesign EditorSidebar with progressive disclosure
    - Implement tabbed navigation for major sections (Colors, Typography, Layout, Spacing, Effects, Brand Elements)
    - Group basic controls (visible by default)
    - Create collapsible accordion sections for advanced controls
    - Use clear visual separation between groups
    - _Requirements: 10.1, 10.7_

  - [ ] 12.2 Create AdvancedControls accordion components
    - Wrap gradient controls in "Advanced Colors" accordion
    - Wrap texture/pattern controls in "Advanced Visuals" accordion
    - Wrap animation controls in "Advanced Effects" accordion
    - Wrap spacing controls in "Advanced Spacing" accordion
    - Implement smooth expand/collapse animations
    - _Requirements: 10.2, 10.3_

  - [ ] 12.3 Add section override toggles
    - Wrap section-specific overrides in "Customize this section" accordion
    - Hide overrides by default until expanded
    - Show when editing a specific section
    - _Requirements: 10.4_

  - [ ] 12.4 Implement session state persistence
    - Store expanded accordion state in sessionStorage
    - Restore expanded state on component mount
    - Remember state during editing session
    - _Requirements: 10.5_

  - [ ] 12.5 Add help tooltips
    - Create Tooltip component with "?" icon trigger
    - Add explanatory tooltips for complex controls (gradients, design tokens, parallax, etc.)
    - Show tooltips on hover
    - _Requirements: 10.6_

  - [ ] 12.6 Add visual indicators for advanced features
    - Display colored dot on collapsed sections with customizations
    - Show indicator count (e.g., "3 customizations")
    - _Requirements: 10.8_

- [ ] 13. Phase 10: Design Tokens (Pro/Business)
  - [ ] 13.1 Create DesignTokensEditor component
    - Check subscription tier (Pro or Business)
    - Hide design tokens section for Starter tier
    - Build tabbed interface for token categories
    - Add "Reset to defaults" button for all tokens
    - _Requirements: 11.1, 11.4, 11.5_

  - [ ] 13.2 Create token category editors
    - Build spacing_scale editor (xs, sm, md, lg, xl, 2xl, 3xl)
    - Build font_sizes editor (xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
    - Build border_radii editor (sharp, rounded, pill)
    - Build shadows editor (soft, elevated, hard)
    - Build transitions editor (fast, normal, slow)
    - Build z_index editor (base, dropdown, modal, tooltip)
    - Build breakpoints editor (sm, md, lg, xl)
    - Build container_widths editor (narrow, standard, wide)
    - Build icon_sizes editor (sm, md, lg, xl)
    - Build line_heights editor (tight, normal, relaxed, loose)
    - Build letter_spacing editor (tight, normal, wide, wider)
    - Build opacity_scale editor (10, 20, 50, 75, 90)
    - _Requirements: 11.2_

  - [ ] 13.3 Implement token validation
    - Validate CSS unit values (rem, px, em, %)
    - Validate numeric values for z-index and line-height
    - Show validation errors inline
    - _Requirements: 11.2_

  - [ ] 13.4 Update generateCSSCustomProperties function
    - Generate CSS custom properties for all token categories
    - Include theme colors as RGB components
    - Store tokens in theme.design_tokens as JSON string
    - _Requirements: 11.6, 11.7_

  - [ ] 13.5 Apply design tokens in storefront
    - Inject generated CSS custom properties into <style> tag
    - Reference tokens with var() in component styles
    - Apply tokens globally across all sections
    - _Requirements: 11.3, 11.7_

  - [ ]* 13.6 Write integration tests for design tokens
    - Test design tokens hidden for Starter tier
    - Test token changes apply globally via CSS variables
    - Test reset restores default values
    - Test generated CSS includes all custom properties
    - _Requirements: 12.2_

- [ ] 14. Phase 11: Performance Optimization
  - [ ] 14.1 Implement CSS compilation and caching
    - Create CSS compilation function for theme styles
    - Cache compiled CSS in memory or localStorage
    - Invalidate cache when theme changes
    - Reduce runtime CSS generation overhead
    - _Requirements: 15.10_

  - [ ] 14.2 Optimize preview update debouncing
    - Update PreviewUpdateManager with configurable debounce delays
    - Use 150ms debounce for most controls
    - Use 100ms debounce for simple color changes
    - Use 300ms debounce for layout changes
    - Target <200ms preview update for color/typography changes
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 15.1, 15.2_

  - [ ] 14.3 Implement image lazy loading
    - Add loading="lazy" attribute to all images
    - Add blur placeholder data URIs for backgrounds
    - Implement progressive image loading
    - _Requirements: 15.3_

  - [ ] 14.4 Implement code splitting
    - Split editor components by phase (color editor, typography, etc.)
    - Use React.lazy() and Suspense for component loading
    - Load advanced components on-demand when accordions expand
    - Reduce initial bundle size
    - _Requirements: 15.7_

  - [ ] 14.5 Add JSON size validation
    - Check section_content JSON size before saving
    - Display warning if exceeds 50KB
    - Recommend simplification if too large
    - _Requirements: 15.9_

  - [ ]* 14.6 Write performance benchmarks
    - Measure editor load time (target <3s on fast connection)
    - Benchmark preview update latency for each control type
    - Test debouncing prevents excessive re-renders
    - Measure compiled CSS cache hit rate
    - _Requirements: 12.4, 15.7_

- [ ] 15. Phase 12: Testing & Documentation
  - [ ]* 15.1 Write comprehensive unit tests
    - Test all helper functions (style resolution, CSS generation, gradient parsing)
    - Test color system functions (overlay, gradient conversion)
    - Test spacing calculation functions
    - Achieve 80%+ code coverage for utilities
    - _Requirements: 12.1_

  - [ ]* 15.2 Write integration tests
    - Test theme update flow from editor to database
    - Test preview update postMessage communication
    - Test section reordering and content updates
    - Test save and publish workflows
    - _Requirements: 12.2_

  - [ ]* 15.3 Create visual regression test suite
    - Set up visual testing framework (Percy, Chromatic, or Playwright)
    - Capture baseline screenshots for each customization feature
    - Test gradient rendering across browsers
    - Test layout variants render correctly
    - Test animations and transitions
    - _Requirements: 12.3_

  - [ ]* 15.4 Run performance benchmarks
    - Benchmark preview update latency (<200ms for colors/typography, <300ms for layouts)
    - Test editor load time (<3s on fast connection)
    - Test storefront load time with heavy customizations
    - Test scroll performance with parallax and animations (60fps)
    - Document performance results
    - _Requirements: 12.4_

  - [ ] 15.5 Create user documentation
    - Write feature overview documentation
    - Create tutorials for each major feature (gradients, layout variants, content blocks, design tokens)
    - Document subscription tier restrictions
    - Add screenshots and examples
    - _Requirements: 12.5_

  - [ ] 15.6 Create video tutorials
    - Record video walkthrough of basic customization
    - Record advanced features video (design tokens, animations)
    - Record section override and layout variants demo
    - Upload to documentation platform
    - _Requirements: 12.5_

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Implementation follows 12 phases from design document
- Checkpoints ensure incremental validation after major phases
- All code uses TypeScript with React/Next.js
- Backward compatibility maintained through database defaults and graceful fallbacks
- Progressive disclosure pattern keeps UI intuitive while exposing advanced features
- Design tokens feature gated to Pro/Business tiers via subscription check
- Performance targets: preview updates <200ms, editor load <3s, 60fps animations

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2"]
    },
    {
      "id": 1,
      "tasks": ["1.3", "1.4"]
    },
    {
      "id": 2,
      "tasks": ["3.1", "3.2", "3.3"]
    },
    {
      "id": 3,
      "tasks": ["3.4", "3.5", "4.1", "4.2", "4.3", "4.4"]
    },
    {
      "id": 4,
      "tasks": ["4.5", "5.1", "5.2"]
    },
    {
      "id": 5,
      "tasks": ["5.3", "5.4", "5.5"]
    },
    {
      "id": 6,
      "tasks": ["5.6", "7.1", "7.2"]
    },
    {
      "id": 7,
      "tasks": ["7.3", "7.4"]
    },
    {
      "id": 8,
      "tasks": ["7.5", "8.1", "8.2"]
    },
    {
      "id": 9,
      "tasks": ["8.3", "9.1", "9.2", "9.3", "9.4"]
    },
    {
      "id": 10,
      "tasks": ["9.5", "10.1"]
    },
    {
      "id": 11,
      "tasks": ["10.2", "10.3"]
    },
    {
      "id": 12,
      "tasks": ["10.4", "10.5"]
    },
    {
      "id": 13,
      "tasks": ["12.1", "12.2", "12.3"]
    },
    {
      "id": 14,
      "tasks": ["12.4", "12.5", "12.6"]
    },
    {
      "id": 15,
      "tasks": ["13.1", "13.2", "13.3"]
    },
    {
      "id": 16,
      "tasks": ["13.4", "13.5", "13.6"]
    },
    {
      "id": 17,
      "tasks": ["14.1", "14.2", "14.3", "14.4", "14.5"]
    },
    {
      "id": 18,
      "tasks": ["14.6", "15.1", "15.2", "15.3", "15.4"]
    },
    {
      "id": 19,
      "tasks": ["15.5", "15.6"]
    }
  ]
}
```
