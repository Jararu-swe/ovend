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
