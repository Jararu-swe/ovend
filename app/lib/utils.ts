import { Revenue } from './definitions';

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-US',
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generateYAxis = (revenue: Revenue[]) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record and in 1000s
  const yAxisLabels = [];
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));
  const topLabel = Math.ceil(highestRecord / 1000) * 1000;

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`$${i / 1000}K`);
  }

  return { yAxisLabels, topLabel };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};

// Theme styling helper functions

/**
 * Returns Tailwind classes for product cards based on card_style and border_radius
 * @param cardStyle - The card style from theme (modern, classic, minimal, bold)
 * @param borderRadius - The border radius setting from theme (sharp, rounded, pill)
 * @returns Tailwind CSS classes as a string
 */
export function getCardStyleClasses(
  cardStyle: 'modern' | 'classic' | 'minimal' | 'bold',
  borderRadius: 'sharp' | 'rounded' | 'pill'
): string {
  // Determine radius class based on border_radius setting
  const radiusClass =
    borderRadius === 'sharp' ? 'rounded-none' :
    borderRadius === 'pill' ? 'rounded-3xl' : 'rounded-2xl';

  // Apply card-style-specific classes
  switch (cardStyle) {
    case 'modern':
      return `${radiusClass} border border-slate-100`;
    case 'classic':
      return 'rounded-xl border border-slate-200';
    case 'minimal':
      return 'rounded-lg border border-transparent';
    case 'bold':
      return `${radiusClass} border-4`;
    default:
      return radiusClass;
  }
}

/**
 * Returns shadow classes based on card_shadow property
 * @param shadow - The shadow setting from theme (none, soft, elevated, hard)
 * @returns Tailwind CSS shadow class as a string
 */
export function getCardShadowClass(
  shadow: 'none' | 'soft' | 'elevated' | 'hard'
): string {
  switch (shadow) {
    case 'none':
      return 'shadow-none';
    case 'elevated':
      return 'shadow-lg';
    case 'hard':
      return 'shadow-[4px_4px_0px_rgba(0,0,0,0.1)]';
    case 'soft':
    default:
      return 'shadow-sm';
  }
}

/**
 * Returns hover effect classes based on card_style
 * @param cardStyle - The card style from theme (modern, classic, minimal, bold)
 * @returns Tailwind CSS hover classes as a string
 */
export function getCardHoverEffect(
  cardStyle: 'modern' | 'classic' | 'minimal' | 'bold'
): string {
  const baseTransition = 'transition-all duration-300';

  switch (cardStyle) {
    case 'modern':
      return `${baseTransition} hover:shadow-xl hover:-translate-y-0.5`;
    case 'minimal':
      return `${baseTransition} hover:border-slate-300`;
    case 'bold':
      return `${baseTransition} hover:-translate-y-1`;
    case 'classic':
      return `${baseTransition} hover:scale-[1.02]`;
    default:
      return baseTransition;
  }
}

/**
 * Returns spacing values based on theme's spacing setting
 * @param spacing - The spacing setting from theme (compact, comfortable, spacious)
 * @returns Object with section and internal spacing values
 */
export function getSectionSpacing(
  spacing: 'compact' | 'comfortable' | 'spacious'
): { section: string; internal: string } {
  switch (spacing) {
    case 'compact':
      return { section: '3rem', internal: '1.5rem' }; // 48px, 24px
    case 'spacious':
      return { section: '6rem', internal: '3rem' }; // 96px, 48px
    case 'comfortable':
    default:
      return { section: '4rem', internal: '2rem' }; // 64px, 32px
  }
}
