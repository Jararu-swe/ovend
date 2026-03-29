const postgres = require('postgres');

const sql = postgres({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.lbhrbwpvwwwtftlhlupf',
  password: 'Cn76atRygV2TuiEb',
  ssl: 'require'
});

async function createTable() {
  try {
    console.log('Connecting to database...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS store_theme (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES users(id) UNIQUE,
        
        -- Colors
        primary_color VARCHAR(7) DEFAULT '#10b981',
        secondary_color VARCHAR(7) DEFAULT '#059669',
        background_color VARCHAR(7) DEFAULT '#f8fafc',
        text_color VARCHAR(7) DEFAULT '#0f172a',
        accent_color VARCHAR(7) DEFAULT '#f59e0b',
        
        -- Typography
        font_family VARCHAR(50) DEFAULT 'inter',
        heading_font VARCHAR(50) DEFAULT 'inter',
        font_size VARCHAR(20) DEFAULT 'medium',
        
        -- Layout
        layout_style VARCHAR(20) DEFAULT 'grid',
        card_style VARCHAR(20) DEFAULT 'modern',
        border_radius VARCHAR(20) DEFAULT 'rounded',
        
        -- Header
        show_logo BOOLEAN DEFAULT true,
        logo_url TEXT,
        logo_position VARCHAR(20) DEFAULT 'left',
        logo_frame VARCHAR(20) DEFAULT 'profile',
        header_style VARCHAR(20) DEFAULT 'sticky',
        
        -- Product Cards
        show_product_images BOOLEAN DEFAULT true,
        image_aspect_ratio VARCHAR(20) DEFAULT 'square',
        show_product_description BOOLEAN DEFAULT true,
        
        -- Spacing
        spacing VARCHAR(20) DEFAULT 'comfortable',
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Store theme table created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating store theme table:', err);
    process.exit(1);
  }
}

createTable();
