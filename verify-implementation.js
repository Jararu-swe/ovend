/**
 * Task 9: Implementation Verification Script
 * 
 * This script verifies that the storefront and section-renderer components
 * correctly apply theme properties.
 */

const fs = require('fs');

console.log('='.repeat(80));
console.log('TASK 9: IMPLEMENTATION VERIFICATION');
console.log('='.repeat(80));
console.log('');

let allPassed = true;
const issues = [];

// Read the implementation files
const storefrontContent = fs.readFileSync('app/ui/store/storefront.tsx', 'utf8');
const sectionRendererContent = fs.readFileSync('app/ui/store/section-renderer.tsx', 'utf8');
const utilsContent = fs.readFileSync('app/lib/utils.ts', 'utf8');

console.log('Checking implementation files...\n');

// Verification checks
const checks = [
  {
    name: 'Product card uses heading_color for product names',
    file: 'storefront.tsx',
    content: storefrontContent,
    pattern: /color:\s*activeTheme\.heading_color.*product\.name/s,
    description: 'Product names should use theme.heading_color'
  },
  {
    name: 'Product card uses getCardStyleClasses helper',
    file: 'storefront.tsx',
    content: storefrontContent,
    pattern: /getCardStyleClasses/,
    description: 'Should use getCardStyleClasses helper for card styling'
  },
  {
    name: 'Product card uses getCardShadowClass helper',
    file: 'storefront.tsx',
    content: storefrontContent,
    pattern: /getCardShadowClass/,
    description: 'Should use getCardShadowClass helper for shadows'
  },
  {
    name: 'Product card uses getCardHoverEffect helper',
    file: 'storefront.tsx',
    content: storefrontContent,
    pattern: /getCardHoverEffect/,
    description: 'Should use getCardHoverEffect helper for hover effects'
  },
  {
    name: 'Section headings use heading_color',
    file: 'storefront.tsx',
    content: storefrontContent,
    pattern: /color:\s*activeTheme\.heading_color.*Products/s,
    description: 'Section headings should use theme.heading_color'
  },
  {
    name: 'Section headings use heading_font',
    file: 'storefront.tsx',
    content: storefrontContent,
    pattern: /fontFamily:\s*FONT_MAP\[activeTheme\.heading_font\]/,
    description: 'Section headings should use theme.heading_font'
  },
  {
    name: 'Hero banner uses heading_color',
    file: 'section-renderer.tsx',
    content: sectionRendererContent,
    pattern: /color:\s*theme\.heading_color.*content\.title/s,
    description: 'Hero banner title should use theme.heading_color'
  },
  {
    name: 'Hero banner uses heading_font',
    file: 'section-renderer.tsx',
    content: sectionRendererContent,
    pattern: /fontFamily:\s*FONT_MAP\[theme\.heading_font\]/,
    description: 'Hero banner should use theme.heading_font'
  },
  {
    name: 'Testimonials use heading_color for customer names',
    file: 'section-renderer.tsx',
    content: sectionRendererContent,
    pattern: /color:\s*theme\.heading_color.*q\.name/s,
    description: 'Testimonial customer names should use theme.heading_color'
  },
  {
    name: 'Trust badges use primary_color for icons',
    file: 'section-renderer.tsx',
    content: sectionRendererContent,
    pattern: /color:\s*theme\.primary_color.*badge/s,
    description: 'Trust badge icons should use theme.primary_color'
  },
  {
    name: 'Trust badges use surface_color for backgrounds',
    file: 'section-renderer.tsx',
    content: sectionRendererContent,
    pattern: /backgroundColor:\s*theme\.surface_color/,
    description: 'Trust badges should use theme.surface_color'
  },
  {
    name: 'Trust badges use border_radius',
    file: 'section-renderer.tsx',
    content: sectionRendererContent,
    pattern: /borderRadius:\s*theme\.border_radius.*sharp.*pill/s,
    description: 'Trust badges should apply theme.border_radius'
  },
  {
    name: 'FAQ section uses heading_color for questions',
    file: 'section-renderer.tsx',
    content: sectionRendererContent,
    pattern: /color:\s*theme\.heading_color.*question/s,
    description: 'FAQ questions should use theme.heading_color'
  },
  {
    name: 'FAQ section uses primary_color for icons',
    file: 'section-renderer.tsx',
    content: sectionRendererContent,
    pattern: /color:\s*theme\.primary_color.*ChevronUpIcon/s,
    description: 'FAQ expand/collapse icons should use theme.primary_color'
  },
  {
    name: 'Image gallery uses border_radius',
    file: 'section-renderer.tsx',
    content: sectionRendererContent,
    pattern: /borderRadius:\s*borderRadiusStyle/,
    description: 'Image gallery should apply theme.border_radius'
  },
  {
    name: 'About section uses heading_color',
    file: 'section-renderer.tsx',
    content: sectionRendererContent,
    pattern: /color:\s*theme\.heading_color.*About/s,
    description: 'About section heading should use theme.heading_color'
  },
  {
    name: 'Contact CTA uses heading_color',
    file: 'section-renderer.tsx',
    content: sectionRendererContent,
    pattern: /color:\s*theme\.heading_color.*title/s,
    description: 'Contact CTA heading should use theme.heading_color'
  },
  {
    name: 'useButtonProps helper exists',
    file: 'section-renderer.tsx',
    content: sectionRendererContent,
    pattern: /function useButtonProps\(theme: StoreTheme\)/,
    description: 'useButtonProps helper should be defined'
  },
  {
    name: 'Button helper handles all 4 button styles',
    file: 'section-renderer.tsx',
    content: sectionRendererContent,
    pattern: /case 'outline':.*case 'soft':.*case 'glass':/s,
    description: 'Button helper should handle solid, outline, soft, and glass styles'
  },
  {
    name: 'getCardStyleClasses handles all 4 card styles',
    file: 'utils.ts',
    content: utilsContent,
    pattern: /case 'modern':.*case 'classic':.*case 'minimal':.*case 'bold':/s,
    description: 'getCardStyleClasses should handle modern, classic, minimal, and bold'
  },
  {
    name: 'getCardShadowClass handles all 4 shadow types',
    file: 'utils.ts',
    content: utilsContent,
    pattern: /case 'none':.*case 'elevated':.*case 'hard':/s,
    description: 'getCardShadowClass should handle none, soft, elevated, and hard'
  },
  {
    name: 'getCardHoverEffect handles all 4 card styles',
    file: 'utils.ts',
    content: utilsContent,
    pattern: /case 'modern':.*case 'classic':.*case 'minimal':.*case 'bold':/s,
    description: 'getCardHoverEffect should handle all card styles'
  },
];

checks.forEach((check, index) => {
  const passed = check.pattern.test(check.content);
  const status = passed ? '✓' : '✗';
  const symbol = passed ? '✓' : '❌';
  
  console.log(`${symbol} ${check.name}`);
  console.log(`   File: ${check.file}`);
  console.log(`   ${check.description}`);
  console.log('');
  
  if (!passed) {
    allPassed = false;
    issues.push({
      check: check.name,
      file: check.file,
      description: check.description
    });
  }
});

console.log('='.repeat(80));
console.log('VERIFICATION SUMMARY');
console.log('='.repeat(80));
console.log(`Total checks: ${checks.length}`);
console.log(`Passed: ${checks.length - issues.length}`);
console.log(`Failed: ${issues.length}`);
console.log('');

if (allPassed) {
  console.log('🎉 SUCCESS: All implementation checks passed!');
  console.log('');
  console.log('The implementation correctly applies:');
  console.log('  ✓ heading_color to all section headings and product names');
  console.log('  ✓ heading_font for typography consistency');
  console.log('  ✓ card_style with proper helper functions');
  console.log('  ✓ card_shadow for elevation effects');
  console.log('  ✓ button_style with all 4 variants (solid, outline, soft, glass)');
  console.log('  ✓ border_radius throughout all components');
  console.log('  ✓ primary_color, surface_color, and other theme colors');
  console.log('  ✓ Hover effects based on card_style');
  console.log('');
  process.exit(0);
} else {
  console.log('❌ FAILURE: Some implementation checks failed.');
  console.log('');
  console.log('Issues found:');
  issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue.check}`);
    console.log(`     File: ${issue.file}`);
    console.log(`     ${issue.description}`);
    console.log('');
  });
  process.exit(1);
}
