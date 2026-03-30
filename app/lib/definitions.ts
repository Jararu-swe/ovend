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
  whatsapp_number?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
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

export type TeamMember = {
  id: string;
  vendor_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'assistant';
  permissions: {
    products: boolean;
    orders: boolean;
    settings: boolean;
  };
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
  status: 'pending' | 'active' | 'inactive';
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
  logo_frame: 'plain' | 'profile' | 'rounded' | 'minimal';
  header_style: 'sticky' | 'static' | 'transparent';

  // Product display
  show_product_images: boolean;
  image_aspect_ratio: 'square' | 'portrait' | 'landscape';
  show_product_description: boolean;

  // Sections (JSON)
  sections: string; // JSON stringified TemplateSection[]
  section_content: string; // JSON stringified TemplateSectionContent

  // Advanced
  custom_css: string | null;

  created_at: string;
  updated_at: string;
};
