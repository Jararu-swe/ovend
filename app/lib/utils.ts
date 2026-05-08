import { Revenue } from './definitions';

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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
    yAxisLabels.push(`₦${i / 1000}K`);
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

/**
 * Standardized border radius utility
 */
export function getBorderRadiusClass(radius: 'sharp' | 'rounded' | 'pill'): string {
  switch (radius) {
    case 'sharp': return 'rounded-none';
    case 'pill': return 'rounded-3xl';
    case 'rounded':
    default: return 'rounded-2xl';
  }
}

/**
 * Standardized button style utility
 */
export function getButtonStyles(theme: any) {
  const radiusClass = getBorderRadiusClass(theme.button_radius);
  
  const style = (() => {
    switch (theme.button_style) {
      case 'outline': return { border: `2px solid ${theme.primary_color}`, color: theme.primary_color, backgroundColor: 'transparent' };
      case 'soft': return { backgroundColor: `${theme.primary_color}18`, color: theme.primary_color, border: 'none' };
      case 'glass': return { backgroundColor: `${theme.surface_color || '#fff'}cc`, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${theme.border_color || '#e2e8f0'}`, color: theme.primary_color };
      default: return { 
        background: theme.primary_gradient || theme.primary_color, 
        color: '#ffffff', 
        border: 'none' 
      };
    }
  })();

  const hover = (() => {
    switch (theme.animation_style) {
      case 'zoom': return 'hover:scale-105 active:scale-95';
      case 'slide': return 'hover:-translate-y-1 active:translate-y-0';
      case 'bounce': return 'hover:-translate-y-1.5 hover:scale-[1.03] active:scale-95';
      case 'fade': return 'hover:opacity-80 active:opacity-60';
      default: return 'hover:opacity-90';
    }
  })();

  return { radiusClass, style, hover, className: `transition-all duration-300 ${radiusClass} ${hover} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2` };
}

/**
 * Returns Tailwind classes for product cards based on card_style and border_radius
 */
export function getCardStyleClasses(
  cardStyle: 'modern' | 'classic' | 'minimal' | 'bold',
  borderRadius: 'sharp' | 'rounded' | 'pill'
): string {
  const radiusClass = getBorderRadiusClass(borderRadius);

  switch (cardStyle) {
    case 'modern':
      return `${radiusClass} border border-slate-100`;
    case 'classic':
      return `${radiusClass} border border-slate-200`;
    case 'minimal':
      return `${radiusClass} border border-transparent`;
    case 'bold':
      return `${radiusClass} border-4 shadow-[4px_4px_0px_rgba(0,0,0,0.1)]`;
    default:
      return radiusClass;
  }
}

/**
 * Returns shadow classes based on card_shadow property
 */
export function getCardShadowClass(
  shadow: 'none' | 'soft' | 'elevated' | 'hard'
): string {
  switch (shadow) {
    case 'none': return 'shadow-none';
    case 'elevated': return 'shadow-lg';
    case 'hard': return 'shadow-[4px_4px_0px_rgba(0,0,0,0.1)]';
    case 'soft':
    default: return 'shadow-sm';
  }
}

/**
 * Returns hover effect classes based on card_style
 */
export function getCardHoverEffect(
  cardStyle: 'modern' | 'classic' | 'minimal' | 'bold'
): string {
  const baseTransition = 'transition-all duration-300';
  switch (cardStyle) {
    case 'modern': return `${baseTransition} hover:shadow-xl hover:-translate-y-0.5`;
    case 'minimal': return `${baseTransition} hover:border-slate-300`;
    case 'bold': return `${baseTransition} hover:-translate-y-1`;
    case 'classic': return `${baseTransition} hover:scale-[1.02]`;
    default: return baseTransition;
  }
}

/**
 * Returns spacing values based on theme's spacing setting
 */
export function getSectionSpacing(
  spacing: 'compact' | 'comfortable' | 'spacious'
): { section: string; internal: string } {
  switch (spacing) {
    case 'compact': return { section: '2.5rem', internal: '1.25rem' };
    case 'spacious': return { section: '6rem', internal: '3rem' };
    case 'comfortable':
    default: return { section: '4rem', internal: '2rem' };
  }
}
