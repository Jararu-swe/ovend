// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  store_slug: string;
  store_name: string;
  store_description?: string | null;
  whatsapp_number?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  account_name?: string | null;
  category?: string | null;
  location_state?: string | null;
  role?: string;
  // Delivery address (where the store delivers to)
  delivery_address?: string | null;
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  delivery_address_details?: string | null;
  // Pickup location (where customers pick up from)
  offers_pickup?: boolean | null;
  pickup_address?: string | null;
  pickup_latitude?: number | null;
  pickup_longitude?: number | null;
  pickup_address_details?: string | null;
  // Sound/notification preferences
  sound_enabled?: boolean | null;
  sound_volume?: number | null;
  // Subscription
  subscription_status?: 'active' | 'past_due' | 'inactive' | 'trial' | string | null;
  subscription_expires_at?: string | null;
  subscription_last_payment_reference?: string | null;
  subscription_updated_at?: string | null;
  /** IANA timezone for store hours (e.g. Africa/Lagos) */
  store_timezone?: string | null;
  /** Weekly schedule JSON; shape defined in store-availability helpers */
  store_hours?: unknown;
  /** When false, storefront shows as closed / not accepting orders */
  accepting_orders?: boolean | null;
  store_closed_note?: string | null;
  /** Custom domain (e.g. mybrand.com) for Business tier */
  custom_domain?: string | null;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: 'pending' | 'paid';
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid';
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
};

export type Product = {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  status: 'active' | 'inactive';
  category: string | null;
  stock_quantity: number | null;
  image_url: string | null;
  gallery_images: string; // JSON stringified array of URLs
  options: string; // JSON stringified array of variant options
  created_at: string;
};

export type ProductForm = {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  status: 'active' | 'inactive';
  category: string | null;
  stock_quantity: number | null;
  image_url: string | null;
  gallery_images: string;
  options: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  vendor_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  delivery_type: 'pickup' | 'delivery';
  total_amount: number;
  status: 'new' | 'in_progress' | 'fulfilled' | 'cancelled';
  items: OrderItem[];
  payment_method: 'cash' | 'card' | 'transfer';
  payment_reference: string | null;
  payment_status: 'pending' | 'paid' | 'failed';
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  delivery_address_details: string | null;
  vendor_pickup_latitude: number | null;
  vendor_pickup_longitude: number | null;
  vendor_pickup_address_details: string | null;
  discount_code?: string | null;
  discount_amount?: number;
  created_at: string;
};

export type DiscountCode = {
  id: string;
  vendor_id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_uses: number | null;
  uses_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
};

export type TeamMemberPermissions = {
  products: boolean;
  orders: boolean;
  settings: boolean;
};

export type TeamMember = {
  id: string;
  vendor_id: string;
  user_id: string;
  email: string;
  role: 'owner' | 'admin' | 'assistant';
  permissions: TeamMemberPermissions;
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};



export type StoreTheme = {
  id: string;
  vendor_id: string;

  // Template
  template_id: string;

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
  spacing: 'compact' | 'comfortable' | 'spacious';

  // Buttons & Interactions
  button_style: 'solid' | 'outline' | 'soft' | 'glass';
  button_radius: 'sharp' | 'rounded' | 'pill';
  animation_style: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce';

  // Logo & header
  show_logo: boolean;
  logo_url: string | null;
  logo_position: 'left' | 'center' | 'right';
  logo_frame: 'plain' | 'none' | 'profile' | 'rounded' | 'minimal';
  header_style: 'sticky' | 'static' | 'transparent';

  // Product display
  show_product_images: boolean;
  image_aspect_ratio: 'square' | 'portrait' | 'landscape';
  show_product_description: boolean;

  // Sections (JSON)
  sections: string; // JSON stringified TemplateSection[]
  section_content: string; // JSON stringified TemplateSectionContent

  // Advanced Styling
  primary_gradient: string | null;
  glass_effect: boolean;
  layout_width: 'standard' | 'wide' | 'full';
  show_mobile_checkout_bar: boolean;
  custom_css: string | null;

  // Iconography
  icon_library: 'heroicons' | 'lucide';
  icon_fill: 'solid' | 'outline';
  icon_weight: 'light' | 'regular' | 'bold';
  cart_icon: 'shopping-bag' | 'shopping-cart' | 'basket' | 'tote';
  user_icon: 'user' | 'face' | 'smile';
  share_icon: 'dots' | 'paper-plane' | 'arrow-curve' | 'arrow-square' | 'nodes';
  add_icon: 'plus' | 'bag' | 'cart' | 'arrow';

  // NEW: Enhanced Typography (Requirement 3)
  line_height: number | null;
  letter_spacing: number | null;
  text_transform: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | null;
  body_font_weight: number | null;
  heading_font_weight: number | null;

  // NEW: Container Width (Requirement 4)
  container_width: 'narrow' | 'standard' | 'wide' | 'full' | null;

  // NEW: Design Tokens (Requirement 11)
  design_tokens: string | null;

  // NEW: Secondary Gradient (Requirement 1)
  secondary_gradient: string | null;

  created_at: string;
  updated_at: string;
  draft_config: string | null;
};

// ─── Custom Domain Types ────────────────────────────────────────────

export type VendorDomainStatus = 'pending' | 'verifying' | 'verified' | 'failed' | 'removed';

export type VendorDomainSSLStatus = 'pending' | 'provisioning' | 'active' | 'failed';

export type VerificationMethod = 'cname' | 'txt';

export type VendorDomain = {
  id: string;
  vendor_id: string;
  domain: string;
  verification_method: VerificationMethod;
  verification_token: string;
  vercel_domain_id: string | null;
  status: VendorDomainStatus;
  ssl_status: VendorDomainSSLStatus;
  is_primary: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

// ─── Subscription Types ────────────────────────────────────────────

export type SubscriptionTier = 'starter' | 'pro' | 'business';

export type SubscriptionStatus = 'active' | 'past_due' | 'inactive' | 'trial' | 'cancelled';

export type SubscriptionFeatures = {
  analytics: boolean;
  advanced_analytics?: boolean;
  team_members: boolean;
  custom_domain: boolean;
  priority_support: boolean;
  theme_level: 'basic' | 'premium' | 'exclusive';
  hide_branding?: boolean;
};

export type SubscriptionPlan = {
  id: string;
  tier: SubscriptionTier;
  name: string;
  price_kobo: number;
  transaction_fee_percentage: number;
  product_limit: number;
  features: SubscriptionFeatures;
  created_at: string;
  updated_at: string;
};

export type VendorSubscriptionInfo = {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expires_at: string | null;
  last_payment_reference: string | null;
  updated_at: string | null;
  plan: SubscriptionPlan;
  grace_days_remaining: number | null;
  is_trial: boolean;
  trial_days_remaining: number | null;
  scheduled_tier_change?: SubscriptionTier | null;
  scheduled_tier_change_at?: string | null;
};

export type SubscriptionPayment = {
  id: string;
  vendor_id: string;
  amount_kobo: number;
  reference: string;
  tier: string | null;
  status: string;
  billing_period_start: string | null;
  billing_period_end: string | null;
  paid_at: string | null;
  created_at: string | null;
};

// ─── Guide Types ────────────────────────────────────────────────

export type VendorGuide = {
  id: number;
  slug: string;
  title: string;
  content: string;
  description: string | null;
  category: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  reading_time: number;
  trigger_type: string | null;
  applies_to_categories: string[] | null;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

// ─── Deep Storefront Customization Types ────────────────────────────────────────────

// Gradient definition (Requirement 1)
export type GradientDefinition = {
  type: 'linear' | 'radial';
  angle?: number;  // For linear gradients (0-360)
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';  // For radial
  stops: Array<{
    color: string;  // Hex color
    position: number;  // 0-100 (percentage)
  }>;
};

// Overlay definition
export type ColorOverlay = {
  color: string;
  opacity: number;  // 0-100
};

// Spacing values
export type SpacingValue = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

// Hero section variants (Requirement 5)
export type HeroLayoutVariant = 
  | 'centered'      // Content centered, full-width
  | 'left-aligned'  // Content left, image right
  | 'right-aligned' // Content right, image left
  | 'split-screen'  // 50/50 split
  | 'full-bleed';   // Background image, text overlay

// Feature section variants
export type FeatureLayoutVariant =
  | 'horizontal-cards'  // Cards in horizontal row
  | 'vertical-cards'    // Cards in vertical stack
  | 'alternating';      // Alternating image-text layout

// Gallery section variants
export type GalleryLayoutVariant =
  | 'grid'      // Even grid layout
  | 'masonry'   // Pinterest-style masonry
  | 'carousel'; // Horizontal scrolling carousel

// Product grid columns
export type ProductGridColumns = 2 | 3 | 4 | 5 | 6;

// Animation types
export type ScrollAnimation = 'fade-in' | 'slide-up' | 'slide-left' | 'slide-right' | 'zoom-in' | 'none';
export type HoverEffect = 'lift' | 'grow' | 'glow' | 'tilt' | 'none';
export type TransitionSpeed = 'instant' | 'fast' | 'normal' | 'slow';

// Texture and Pattern types
export type Texture = 'paper' | 'fabric' | 'concrete' | 'wood' | 'dots' | 'stripes' | 'grid' | 'noise' | 'none';
export type Pattern = 'dots' | 'diagonal-stripes' | 'horizontal-stripes' | 'grid' | 
               'triangles' | 'hexagons' | 'waves' | 'circuits' | 'none';
export type ShapeDivider = 'wave' | 'angle' | 'curve' | 'triangle' | 'arrow' | 'split' | 'none';

// Content block definition
export type ContentBlock = {
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
};

// Section content schema (expanded)
export type TemplateSectionContent = {
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
    padding_top?: SpacingValue;
    padding_bottom?: SpacingValue;
    padding_x?: SpacingValue;
    margin_top?: SpacingValue;
    margin_bottom?: SpacingValue;
    
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
    background_overlay?: ColorOverlay;
    texture?: Texture;
    texture_opacity?: number;  // 0-100
    parallax?: 'none' | 'slow' | 'medium' | 'fast';
    
    // NEW: Brand Identity Elements (Requirement 7)
    pattern?: Pattern;
    pattern_color?: string;
    pattern_opacity?: number;  // 0-100
    divider_top?: ShapeDivider;
    divider_bottom?: ShapeDivider;
    divider_color?: string;
    divider_flip?: boolean;
    divider_invert?: boolean;
    
    // NEW: Animations (Requirement 8)
    scroll_animation?: ScrollAnimation;
    card_hover_effect?: HoverEffect;
    
    // NEW: Flexible Content Blocks (Requirement 9)
    content_blocks?: ContentBlock[];
  };
};

// Design Tokens (Requirement 11) - Available only for Pro/Business tiers
export type DesignTokens = {
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
