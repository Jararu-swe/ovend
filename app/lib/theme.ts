import postgres from 'postgres';
import { StoreTheme } from './definitions';
import { getDefaultSections, getDefaultSectionContent } from './template-presets';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

let ensureNewColumnsPromise: Promise<void> | null = null;

/** Idempotently adds all new columns to store_theme (safe to call repeatedly). */
export async function ensureNewColumns() {
  if (!ensureNewColumnsPromise) {
    ensureNewColumnsPromise = (async () => {
      const alters = [
        `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS logo_position VARCHAR(20) DEFAULT 'left'`,
        `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS logo_frame VARCHAR(20) DEFAULT 'profile'`,
        `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS template_id VARCHAR(50) DEFAULT 'fresh-market'`,
        `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS surface_color VARCHAR(7) DEFAULT '#ffffff'`,
        `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS heading_color VARCHAR(7) DEFAULT '#0f172a'`,
        `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS border_color VARCHAR(7) DEFAULT '#e2e8f0'`,
        `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS card_shadow VARCHAR(20) DEFAULT 'soft'`,
        `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]'`,
        `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS section_content JSONB DEFAULT '{}'`,
      ];
      try {
        for (const stmt of alters) {
          await sql.unsafe(stmt);
        }
      } catch (e) {
        console.error('ensureNewColumns:', e);
      }
    })();
  }
  await ensureNewColumnsPromise;
}

// Keep backward-compat alias
export const ensureLogoLayoutColumns = ensureNewColumns;

export function getDefaultTheme(): Omit<StoreTheme, 'id' | 'vendor_id' | 'created_at' | 'updated_at'> {
  return {
    template_id: 'fresh-market',
    primary_color: '#10b981',
    secondary_color: '#059669',
    background_color: '#f8fafc',
    text_color: '#0f172a',
    accent_color: '#f59e0b',
    surface_color: '#ffffff',
    heading_color: '#0f172a',
    border_color: '#e2e8f0',
    font_family: 'inter',
    heading_font: 'inter',
    font_size: 'medium',
    layout_style: 'grid',
    card_style: 'modern',
    border_radius: 'rounded',
    card_shadow: 'soft',
    show_logo: true,
    logo_url: null,
    logo_position: 'left',
    logo_frame: 'profile',
    header_style: 'sticky',
    show_product_images: true,
    image_aspect_ratio: 'square',
    show_product_description: true,
    spacing: 'comfortable',
    sections: JSON.stringify(getDefaultSections()),
    section_content: JSON.stringify(getDefaultSectionContent()),
  };
}

/** Fill any missing fields on a row with safe defaults. */
function normalizeTheme(row: any): StoreTheme {
  // JSONB columns arrive as parsed JS objects, not strings.
  // Empty array [] or empty object {} should fall back to defaults.
  const rawSections = row.sections;
  const rawContent = row.section_content;

  const hasSections =
    rawSections &&
    (typeof rawSections === 'string'
      ? rawSections.length > 2 // not just "[]"
      : Array.isArray(rawSections) && rawSections.length > 0);

  const hasContent =
    rawContent &&
    (typeof rawContent === 'string'
      ? rawContent.length > 2 // not just "{}"
      : typeof rawContent === 'object' && Object.keys(rawContent).length > 0);

  return {
    ...row,
    template_id: row.template_id ?? 'fresh-market',
    logo_position: row.logo_position ?? 'left',
    logo_frame: row.logo_frame ?? 'profile',
    surface_color: row.surface_color ?? '#ffffff',
    heading_color: row.heading_color ?? '#0f172a',
    border_color: row.border_color ?? '#e2e8f0',
    card_shadow: row.card_shadow ?? 'soft',
    sections: hasSections
      ? (typeof rawSections === 'string' ? rawSections : JSON.stringify(rawSections))
      : JSON.stringify(getDefaultSections()),
    section_content: hasContent
      ? (typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent))
      : JSON.stringify(getDefaultSectionContent()),
  };
}

export async function fetchVendorTheme(vendorId: string): Promise<StoreTheme | null> {
  await ensureNewColumns();
  try {
    const [theme] = await sql<StoreTheme[]>`
      SELECT * FROM store_theme
      WHERE vendor_id = ${vendorId}
      LIMIT 1
    `;
    if (!theme) return null;
    return normalizeTheme(theme);
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

export async function createVendorTheme(vendorId: string): Promise<StoreTheme> {
  await ensureNewColumns();
  const d = getDefaultTheme();
  const [theme] = await sql<StoreTheme[]>`
    INSERT INTO store_theme (
      vendor_id,
      template_id,
      primary_color,
      secondary_color,
      background_color,
      text_color,
      accent_color,
      surface_color,
      heading_color,
      border_color,
      font_family,
      heading_font,
      font_size,
      layout_style,
      card_style,
      border_radius,
      card_shadow,
      show_logo,
      logo_url,
      logo_position,
      logo_frame,
      header_style,
      show_product_images,
      image_aspect_ratio,
      show_product_description,
      spacing,
      sections,
      section_content
    ) VALUES (
      ${vendorId},
      ${d.template_id},
      ${d.primary_color},
      ${d.secondary_color},
      ${d.background_color},
      ${d.text_color},
      ${d.accent_color},
      ${d.surface_color},
      ${d.heading_color},
      ${d.border_color},
      ${d.font_family},
      ${d.heading_font},
      ${d.font_size},
      ${d.layout_style},
      ${d.card_style},
      ${d.border_radius},
      ${d.card_shadow},
      ${d.show_logo},
      ${d.logo_url},
      ${d.logo_position},
      ${d.logo_frame},
      ${d.header_style},
      ${d.show_product_images},
      ${d.image_aspect_ratio},
      ${d.show_product_description},
      ${d.spacing},
      ${d.sections},
      ${d.section_content}
    )
    RETURNING *
  `;
  return normalizeTheme(theme);
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
