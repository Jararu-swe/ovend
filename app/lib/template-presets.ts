// Premade template presets that vendors can pick with one click
// Each template provides a full "design recipe" — colors, fonts, layouts, and sections.

// ─── Shared font family map ──────────────────────────────────
export const FONT_MAP: Record<string, string> = {
  inter: "'Inter', sans-serif",
  poppins: "'Poppins', sans-serif",
  roboto: "'Roboto', sans-serif",
  playfair: "'Playfair Display', serif",
  montserrat: "'Montserrat', sans-serif",
  outfit: "'Outfit', sans-serif",
  dmSans: "'DM Sans', sans-serif",
  spaceGrotesk: "'Space Grotesk', sans-serif",
};
export type TemplateSection = {
  id: string;
  enabled: boolean;
  order: number;
};

export type TemplateSectionContent = {
  [sectionId: string]: Record<string, any>;
};

export type Template = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
  tags: string[];
  theme: {
    primary_color: string;
    secondary_color: string;
    background_color: string;
    text_color: string;
    accent_color: string;
    surface_color: string;
    heading_color: string;
    border_color: string;
    font_family: string;
    heading_font: string;
    font_size: 'small' | 'medium' | 'large';
    layout_style: 'grid' | 'list' | 'masonry';
    card_style: 'modern' | 'classic' | 'minimal' | 'bold';
    border_radius: 'sharp' | 'rounded' | 'pill';
    card_shadow: 'none' | 'soft' | 'elevated' | 'hard';
    button_style: 'solid' | 'outline' | 'soft' | 'glass';
    button_radius: 'sharp' | 'rounded' | 'pill';
    animation_style: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce';
    spacing: 'compact' | 'comfortable' | 'spacious';
    header_style: 'sticky' | 'static' | 'transparent';
    image_aspect_ratio: 'square' | 'portrait' | 'landscape';
  };
  sections: TemplateSection[];
  sectionContent: TemplateSectionContent;
};

// ─── Available section types ─────────────────────────────────
export const SECTION_TYPES = [
  { id: 'hero-banner',       label: 'Hero Banner',       icon: '🖼️', description: 'Full-width banner with store name and tagline', removable: true },
  { id: 'announcement-bar',  label: 'Announcement Bar',  icon: '📢', description: 'Scrolling promo text marquee', removable: true },
  { id: 'featured-products', label: 'Featured Products', icon: '⭐', description: 'Hand-picked product highlights', removable: true },
  { id: 'product-grid',      label: 'Product Grid',      icon: '📦', description: 'Main product listing', removable: false },
  { id: 'trust-badges',      label: 'Trust Badges',      icon: '🛡️', description: 'Secure checkout, fast delivery badges', removable: true },
  { id: 'image-gallery',     label: 'Image Gallery',     icon: '🎨', description: 'Photo gallery with lightbox', removable: true },
  { id: 'faqs',              label: 'FAQs',              icon: '❓', description: 'Frequently asked questions', removable: true },
  { id: 'testimonials',      label: 'Testimonials',      icon: '💬', description: 'Customer quotes and reviews', removable: true },
  { id: 'about-section',     label: 'About Us',          icon: '🏪', description: 'Your store\'s story', removable: true },
  { id: 'contact-cta',       label: 'Contact / CTA',     icon: '📲', description: '"Order on WhatsApp" call-to-action', removable: true },
] as const;

// ─── Template categories ─────────────────────────────────────
export const TEMPLATE_CATEGORIES = [
  { id: 'all',      label: 'All Themes' },
  { id: 'fashion',  label: 'Fashion' },
  { id: 'food',     label: 'Food & Drink' },
  { id: 'tech',     label: 'Tech' },
  { id: 'beauty',   label: 'Beauty' },
  { id: 'artisan',  label: 'Artisan' },
  { id: 'premium',  label: 'Premium' },
] as const;

// ─── Default section set ─────────────────────────────────────
const DEFAULT_SECTIONS: TemplateSection[] = [
  { id: 'hero-banner',       enabled: true,  order: 0 },
  { id: 'announcement-bar',  enabled: false, order: 1 },
  { id: 'featured-products', enabled: false, order: 2 },
  { id: 'product-grid',      enabled: true,  order: 3 },
  { id: 'trust-badges',      enabled: true,  order: 4 },
  { id: 'image-gallery',     enabled: false, order: 5 },
  { id: 'faqs',              enabled: false, order: 6 },
  { id: 'testimonials',      enabled: false, order: 7 },
  { id: 'about-section',     enabled: false, order: 8 },
  { id: 'contact-cta',       enabled: true,  order: 9 },
];

const DEFAULT_SECTION_CONTENT: TemplateSectionContent = {
  'hero-banner': {
    title: 'Welcome to our store',
    subtitle: 'Browse our collection and order directly via WhatsApp.',
    cta_text: 'Shop Now',
    cta_link: '#item-list',
    text_align: 'left',
  },
  'announcement-bar': {
    text: '🎉 Free delivery on orders over ₦5,000!',
    bg_color: '#10b981',
    text_color: '#ffffff',
  },
  'featured-products': {
    title: '⭐ Featured',
    product_ids: [],
  },
  'trust-badges': {
    badges: [
      { icon: '🔒', label: 'Secure Checkout' },
      { icon: '🚚', label: 'Fast Delivery' },
      { icon: '↩️', label: 'Easy Returns' },
      { icon: '💬', label: 'WhatsApp Support' },
    ],
  },
  'image-gallery': {
    title: '📸 Gallery',
    images: [
      { url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop', caption: 'Our Store' },
      { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop', caption: 'Shopping Experience' },
      { url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=400&fit=crop', caption: 'New Arrivals' },
      { url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop', caption: 'Fashion Forward' },
      { url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=600&fit=crop', caption: 'Premium Collection' },
    ],
  },
  'faqs': {
    title: 'Frequently Asked Questions',
    items: [
      { question: 'Do you offer delivery?', answer: 'Yes! We deliver across the country. Delivery fees may vary.' },
      { question: 'What is your return policy?', answer: 'We offer a 7-day return policy for unused products in their original packaging.' }
    ]
  },
  'testimonials': {
    quotes: [
      { name: 'Happy Customer', text: 'Great products and fast delivery!', rating: 5 },
    ],
  },
  'about-section': {
    title: 'About Us',
    text: 'We are passionate about providing the best products to our customers.',
  },
  'contact-cta': {
    title: 'Have questions?',
    subtitle: 'Reach us directly on WhatsApp for faster response.',
    button_text: 'Chat on WhatsApp',
  },
};

// ─── Template Library ────────────────────────────────────────
export const TEMPLATES: Template[] = [
  // ── 1. Fresh Market (preserved ID) ─────────────────────────
  {
    id: 'fresh-market',
    name: 'Fresh Market',
    description: 'Vibrant and lively — perfect for food, groceries & produce vendors.',
    emoji: '🥬',
    category: 'food',
    tags: ['food', 'grocery', 'colourful'],
    theme: {
      primary_color: '#16a34a',
      secondary_color: '#15803d',
      background_color: '#f0fdf4',
      text_color: '#14532d',
      accent_color: '#eab308',
      surface_color: '#ffffff',
      heading_color: '#052e16',
      border_color: '#bbf7d0',
      font_family: 'poppins',
      heading_font: 'poppins',
      font_size: 'medium',
      layout_style: 'grid',
      card_style: 'modern',
      border_radius: 'rounded',
      card_shadow: 'soft',
      button_style: 'solid',
      button_radius: 'pill',
      animation_style: 'bounce',
      spacing: 'comfortable',
      header_style: 'sticky',
      image_aspect_ratio: 'square',
    },
    sections: [
      { id: 'hero-banner',       enabled: true,  order: 0 },
      { id: 'announcement-bar',  enabled: true,  order: 1 },
      { id: 'product-grid',      enabled: true,  order: 2 },
      { id: 'trust-badges',      enabled: true,  order: 3 },
      { id: 'contact-cta',       enabled: true,  order: 4 },
    ],
    sectionContent: {
      ...DEFAULT_SECTION_CONTENT,
      'hero-banner': {
        title: 'Fresh picks, delivered fast 🚀',
        subtitle: 'Farm-fresh groceries and produce at your fingertips.',
        cta_text: 'Browse Products',
        cta_link: '#item-list',
        text_align: 'left',
      },
      'announcement-bar': {
        text: '🥬 New stock just arrived — order before it\'s gone!',
        bg_color: '#16a34a',
        text_color: '#ffffff',
      },
    },
  },

  // ── 2. Luxe Boutique (preserved ID) ────────────────────────
  {
    id: 'luxe-boutique',
    name: 'Luxe Boutique',
    description: 'Sleek and elegant — ideal for fashion, jewellery & luxury lifestyle.',
    emoji: '✨',
    category: 'fashion',
    tags: ['fashion', 'luxury', 'minimal'],
    theme: {
      primary_color: '#18181b',
      secondary_color: '#27272a',
      background_color: '#fafafa',
      text_color: '#18181b',
      accent_color: '#c59b3f',
      surface_color: '#ffffff',
      heading_color: '#09090b',
      border_color: '#e4e4e7',
      font_family: 'inter',
      heading_font: 'playfair',
      font_size: 'medium',
      layout_style: 'masonry',
      card_style: 'minimal',
      border_radius: 'sharp',
      card_shadow: 'none',
      button_style: 'outline',
      button_radius: 'sharp',
      animation_style: 'fade',
      spacing: 'spacious',
      header_style: 'transparent',
      image_aspect_ratio: 'portrait',
    },
    sections: [
      { id: 'hero-banner',       enabled: true,  order: 0 },
      { id: 'product-grid',      enabled: true,  order: 1 },
      { id: 'image-gallery',     enabled: true,  order: 2 },
      { id: 'trust-badges',      enabled: true,  order: 3 },
      { id: 'testimonials',      enabled: true,  order: 4 },
      { id: 'contact-cta',       enabled: true,  order: 5 },
    ],
    sectionContent: {
      ...DEFAULT_SECTION_CONTENT,
      'hero-banner': {
        title: 'Curated for you',
        subtitle: 'Discover exclusive pieces handpicked with care.',
        cta_text: 'Explore Collection',
        cta_link: '#item-list',
        text_align: 'center',
      },
      'trust-badges': {
        badges: [
          { icon: '✨', label: 'Authentic Products' },
          { icon: '🎁', label: 'Premium Packaging' },
          { icon: '🚚', label: 'Express Delivery' },
          { icon: '💬', label: '24/7 Support' },
        ],
      },
      'testimonials': {
        quotes: [
          { name: 'Chioma A.', text: 'Absolutely stunning quality. Will buy again!', rating: 5 },
          { name: 'Adaeze', text: 'Fast delivery and beautiful packaging.', rating: 5 },
        ],
      },
    },
  },

  // ── 3. Tech Store (preserved ID) ───────────────────────────
  {
    id: 'tech-store',
    name: 'Tech Store',
    description: 'Clean, bold & modern — built for electronics & gadgets.',
    emoji: '📱',
    category: 'tech',
    tags: ['electronics', 'gadgets', 'modern'],
    theme: {
      primary_color: '#2563eb',
      secondary_color: '#1d4ed8',
      background_color: '#f8fafc',
      text_color: '#1e293b',
      accent_color: '#06b6d4',
      surface_color: '#ffffff',
      heading_color: '#0f172a',
      border_color: '#e2e8f0',
      font_family: 'inter',
      heading_font: 'spaceGrotesk',
      font_size: 'medium',
      layout_style: 'grid',
      card_style: 'modern',
      border_radius: 'rounded',
      card_shadow: 'elevated',
      button_style: 'solid',
      button_radius: 'rounded',
      animation_style: 'slide',
      spacing: 'comfortable',
      header_style: 'sticky',
      image_aspect_ratio: 'landscape',
    },
    sections: [
      { id: 'hero-banner',       enabled: true,  order: 0 },
      { id: 'featured-products', enabled: true,  order: 1 },
      { id: 'product-grid',      enabled: true,  order: 2 },
      { id: 'trust-badges',      enabled: true,  order: 3 },
      { id: 'contact-cta',       enabled: true,  order: 4 },
    ],
    sectionContent: {
      ...DEFAULT_SECTION_CONTENT,
      'hero-banner': {
        title: 'Power up your tech 🔋',
        subtitle: 'Genuine gadgets, accessories, and electronics.',
        cta_text: 'Shop Now',
        cta_link: '#item-list',
        text_align: 'left',
      },
      'featured-products': {
        title: '🔥 Hot Deals',
        product_ids: [],
      },
    },
  },

  // ── 4. Beauty & Glow (preserved ID) ────────────────────────
  {
    id: 'beauty-glow',
    name: 'Beauty & Glow',
    description: 'Soft pastels and feminine elegance — for skincare & beauty brands.',
    emoji: '🌸',
    category: 'beauty',
    tags: ['beauty', 'skincare', 'feminine'],
    theme: {
      primary_color: '#db2777',
      secondary_color: '#be185d',
      background_color: '#fdf2f8',
      text_color: '#831843',
      accent_color: '#f472b6',
      surface_color: '#ffffff',
      heading_color: '#701a3c',
      border_color: '#fbcfe8',
      font_family: 'dmSans',
      heading_font: 'playfair',
      font_size: 'medium',
      layout_style: 'grid',
      card_style: 'modern',
      border_radius: 'pill',
      card_shadow: 'soft',
      button_style: 'soft',
      button_radius: 'pill',
      animation_style: 'zoom',
      spacing: 'spacious',
      header_style: 'sticky',
      image_aspect_ratio: 'square',
    },
    sections: [
      { id: 'hero-banner',       enabled: true,  order: 0 },
      { id: 'product-grid',      enabled: true,  order: 1 },
      { id: 'testimonials',      enabled: true,  order: 2 },
      { id: 'about-section',     enabled: true,  order: 3 },
      { id: 'contact-cta',       enabled: true,  order: 4 },
    ],
    sectionContent: {
      ...DEFAULT_SECTION_CONTENT,
      'hero-banner': {
        title: 'Glow from within 🌸',
        subtitle: 'Premium skincare and beauty essentials curated for radiant skin.',
        cta_text: 'Browse Collection',
        cta_link: '#item-list',
        text_align: 'center',
      },
      'about-section': {
        title: 'Our Story',
        text: 'We believe everyone deserves to feel beautiful. Our curated collection brings the best skincare straight to your doorstep.',
      },
    },
  },

  // ── 5. Quick Bites (preserved ID) ──────────────────────────
  {
    id: 'quick-bites',
    name: 'Quick Bites',
    description: 'Fast, bold & appetising — for food vendors & restaurants.',
    emoji: '🍔',
    category: 'food',
    tags: ['food', 'restaurant', 'bold'],
    theme: {
      primary_color: '#dc2626',
      secondary_color: '#b91c1c',
      background_color: '#fffbeb',
      text_color: '#451a03',
      accent_color: '#f59e0b',
      surface_color: '#ffffff',
      heading_color: '#3b0a02',
      border_color: '#fde68a',
      font_family: 'montserrat',
      heading_font: 'montserrat',
      font_size: 'large',
      layout_style: 'list',
      card_style: 'bold',
      border_radius: 'rounded',
      card_shadow: 'hard',
      button_style: 'solid',
      button_radius: 'rounded',
      animation_style: 'bounce',
      spacing: 'compact',
      header_style: 'sticky',
      image_aspect_ratio: 'landscape',
    },
    sections: [
      { id: 'hero-banner',       enabled: true,  order: 0 },
      { id: 'announcement-bar',  enabled: true,  order: 1 },
      { id: 'featured-products', enabled: true,  order: 2 },
      { id: 'product-grid',      enabled: true,  order: 3 },
      { id: 'trust-badges',      enabled: true,  order: 4 },
      { id: 'contact-cta',       enabled: true,  order: 5 },
    ],
    sectionContent: {
      ...DEFAULT_SECTION_CONTENT,
      'hero-banner': {
        title: 'Hungry? Order now 🍔',
        subtitle: 'Delicious meals ready in minutes — straight to your door.',
        cta_text: 'See Menu',
        cta_link: '#item-list',
        text_align: 'left',
      },
      'featured-products': {
        title: '🔥 Most Popular',
        product_ids: [],
      },
      'announcement-bar': {
        text: '🔥 Free delivery for orders above ₦3,000 today!',
        bg_color: '#dc2626',
        text_color: '#ffffff',
      },
      'trust-badges': {
        badges: [
          { icon: '⏱️', label: '30min Delivery' },
          { icon: '🍽️', label: 'Fresh Daily' },
          { icon: '💸', label: 'Best Prices' },
          { icon: '📲', label: 'Order via WhatsApp' },
        ],
      },
    },
  },

  // ── 6. Handmade & Craft (preserved ID) ─────────────────────
  {
    id: 'handmade-craft',
    name: 'Handmade & Craft',
    description: 'Warm, earthy & artisanal — for makers, artisans and creatives.',
    emoji: '🧶',
    category: 'artisan',
    tags: ['handmade', 'craft', 'artisan'],
    theme: {
      primary_color: '#92400e',
      secondary_color: '#78350f',
      background_color: '#fefce8',
      text_color: '#422006',
      accent_color: '#d97706',
      surface_color: '#fffef2',
      heading_color: '#351c05',
      border_color: '#fde68a',
      font_family: 'inter',
      heading_font: 'playfair',
      font_size: 'medium',
      layout_style: 'masonry',
      card_style: 'classic',
      border_radius: 'rounded',
      card_shadow: 'soft',
      button_style: 'outline',
      button_radius: 'rounded',
      animation_style: 'fade',
      spacing: 'spacious',
      header_style: 'static',
      image_aspect_ratio: 'square',
    },
    sections: [
      { id: 'hero-banner',       enabled: true,  order: 0 },
      { id: 'product-grid',      enabled: true,  order: 1 },
      { id: 'about-section',     enabled: true,  order: 2 },
      { id: 'testimonials',      enabled: true,  order: 3 },
      { id: 'image-gallery',     enabled: true,  order: 4 },
      { id: 'contact-cta',       enabled: true,  order: 5 },
    ],
    sectionContent: {
      ...DEFAULT_SECTION_CONTENT,
      'hero-banner': {
        title: 'Made with love 🤍',
        subtitle: 'Handcrafted pieces, each one unique — made just for you.',
        cta_text: 'Discover',
        cta_link: '#item-list',
        text_align: 'center',
      },
      'about-section': {
        title: 'The maker\u0027s story',
        text: 'Every piece in our store is handmade with care and attention to detail, bringing a personal touch to everything we create.',
      },
    },
  },

  // ── 7. Midnight Luxe (NEW) ─────────────────────────────────
  {
    id: 'midnight-luxe',
    name: 'Midnight Luxe',
    description: 'Dark, sophisticated & premium — for brands that demand attention.',
    emoji: '🌙',
    category: 'premium',
    tags: ['dark', 'premium', 'luxury'],
    theme: {
      primary_color: '#a78bfa',
      secondary_color: '#7c3aed',
      background_color: '#0f0f14',
      text_color: '#e2e0ea',
      accent_color: '#fbbf24',
      surface_color: '#1a1a24',
      heading_color: '#f5f3ff',
      border_color: '#2e2e3a',
      font_family: 'inter',
      heading_font: 'outfit',
      font_size: 'medium',
      layout_style: 'grid',
      card_style: 'modern',
      border_radius: 'rounded',
      card_shadow: 'elevated',
      button_style: 'glass',
      button_radius: 'rounded',
      animation_style: 'fade',
      spacing: 'spacious',
      header_style: 'transparent',
      image_aspect_ratio: 'portrait',
    },
    sections: [
      { id: 'hero-banner',       enabled: true,  order: 0 },
      { id: 'featured-products', enabled: true,  order: 1 },
      { id: 'product-grid',      enabled: true,  order: 2 },
      { id: 'testimonials',      enabled: true,  order: 3 },
      { id: 'trust-badges',      enabled: true,  order: 4 },
      { id: 'contact-cta',       enabled: true,  order: 5 },
    ],
    sectionContent: {
      ...DEFAULT_SECTION_CONTENT,
      'hero-banner': {
        title: 'Elevate your style ✦',
        subtitle: 'Premium collections for those who appreciate the finer things.',
        cta_text: 'Explore',
        cta_link: '#item-list',
        text_align: 'center',
      },
      'trust-badges': {
        badges: [
          { icon: '💎', label: 'Premium Quality' },
          { icon: '🔐', label: 'Secure Payment' },
          { icon: '🚀', label: 'Priority Shipping' },
          { icon: '👑', label: 'VIP Support' },
        ],
      },
      'testimonials': {
        quotes: [
          { name: 'David K.', text: 'The quality is unmatched. Absolutely premium experience.', rating: 5 },
          { name: 'Kemi O.', text: 'Sleek packaging and fast delivery. Love this brand!', rating: 5 },
        ],
      },
    },
  },

  // ── 8. Studio Clean (NEW) ──────────────────────────────────
  {
    id: 'studio-clean',
    name: 'Studio Clean',
    description: 'Ultra-minimal whitespace design — let your products speak for themselves.',
    emoji: '◻️',
    category: 'premium',
    tags: ['minimal', 'clean', 'modern'],
    theme: {
      primary_color: '#0a0a0a',
      secondary_color: '#262626',
      background_color: '#ffffff',
      text_color: '#404040',
      accent_color: '#0a0a0a',
      surface_color: '#fafafa',
      heading_color: '#0a0a0a',
      border_color: '#f0f0f0',
      font_family: 'dmSans',
      heading_font: 'dmSans',
      font_size: 'medium',
      layout_style: 'grid',
      card_style: 'minimal',
      border_radius: 'sharp',
      card_shadow: 'none',
      button_style: 'solid',
      button_radius: 'sharp',
      animation_style: 'fade',
      spacing: 'spacious',
      header_style: 'static',
      image_aspect_ratio: 'portrait',
    },
    sections: [
      { id: 'hero-banner',       enabled: true,  order: 0 },
      { id: 'product-grid',      enabled: true,  order: 1 },
      { id: 'about-section',     enabled: true,  order: 2 },
      { id: 'contact-cta',       enabled: true,  order: 3 },
    ],
    sectionContent: {
      ...DEFAULT_SECTION_CONTENT,
      'hero-banner': {
        title: 'Less is more.',
        subtitle: 'A carefully curated selection of products you\'ll love.',
        cta_text: 'Shop',
        cta_link: '#item-list',
        text_align: 'left',
      },
      'about-section': {
        title: 'Our Philosophy',
        text: 'Quality over quantity. Every product in our store is thoughtfully selected to meet the highest standards.',
      },
    },
  },
];

// Helper to get a template by ID
export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

// Helper to get default template
export function getDefaultTemplate(): Template {
  return TEMPLATES[0]; // fresh-market
}

// All default sections (for creating new themes)
export function getDefaultSections(): TemplateSection[] {
  return [...DEFAULT_SECTIONS];
}

export function getDefaultSectionContent(): TemplateSectionContent {
  return JSON.parse(JSON.stringify(DEFAULT_SECTION_CONTENT));
}
