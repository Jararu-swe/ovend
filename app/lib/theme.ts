import postgres from 'postgres';
import { StoreTheme } from './definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export function getDefaultTheme(): Omit<StoreTheme, 'id' | 'vendor_id' | 'created_at' | 'updated_at'> {
  return {
    primary_color: '#10b981',
    secondary_color: '#059669',
    background_color: '#f8fafc',
    text_color: '#0f172a',
    accent_color: '#f59e0b',
    font_family: 'inter',
    heading_font: 'inter',
    font_size: 'medium',
    layout_style: 'grid',
    card_style: 'modern',
    border_radius: 'rounded',
    show_logo: true,
    logo_url: null,
    header_style: 'sticky',
    show_product_images: true,
    image_aspect_ratio: 'square',
    show_product_description: true,
    spacing: 'comfortable',
  };
}

export async function fetchVendorTheme(vendorId: string): Promise<StoreTheme | null> {
  try {
    const [theme] = await sql<StoreTheme[]>`
      SELECT * FROM store_theme
      WHERE vendor_id = ${vendorId}
      LIMIT 1
    `;
    return theme || null;
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

export async function createVendorTheme(vendorId: string): Promise<StoreTheme> {
  const defaultTheme = getDefaultTheme();
  const [theme] = await sql<StoreTheme[]>`
    INSERT INTO store_theme (
      vendor_id,
      primary_color,
      secondary_color,
      background_color,
      text_color,
      accent_color,
      font_family,
      heading_font,
      font_size,
      layout_style,
      card_style,
      border_radius,
      show_logo,
      logo_url,
      header_style,
      show_product_images,
      image_aspect_ratio,
      show_product_description,
      spacing
    ) VALUES (
      ${vendorId},
      ${defaultTheme.primary_color},
      ${defaultTheme.secondary_color},
      ${defaultTheme.background_color},
      ${defaultTheme.text_color},
      ${defaultTheme.accent_color},
      ${defaultTheme.font_family},
      ${defaultTheme.heading_font},
      ${defaultTheme.font_size},
      ${defaultTheme.layout_style},
      ${defaultTheme.card_style},
      ${defaultTheme.border_radius},
      ${defaultTheme.show_logo},
      ${defaultTheme.logo_url},
      ${defaultTheme.header_style},
      ${defaultTheme.show_product_images},
      ${defaultTheme.image_aspect_ratio},
      ${defaultTheme.show_product_description},
      ${defaultTheme.spacing}
    )
    RETURNING *
  `;
  return theme;
}

export async function updateVendorTheme(
  vendorId: string,
  themeData: Partial<Omit<StoreTheme, 'id' | 'vendor_id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.entries(themeData).forEach(([key, value]) => {
    updates.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  });

  if (updates.length === 0) return;

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(vendorId);

  await sql.unsafe(`
    UPDATE store_theme
    SET ${updates.join(', ')}
    WHERE vendor_id = $${paramIndex}
  `, values);
}

export async function getOrCreateVendorTheme(vendorId: string): Promise<StoreTheme> {
  let theme = await fetchVendorTheme(vendorId);
  if (!theme) {
    theme = await createVendorTheme(vendorId);
  }
  return theme;
}
