import { sql } from "./db";
// Forced refresh
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
  Product,
  User,
  Order,
} from "./definitions";
import { formatCurrency } from "./utils";
import {
  getStoreAvailability,
  type StoreAvailability,
} from "./store-availability";

let ensureProductColumnsPromise: Promise<void> | null = null;
export async function ensureProductColumns() {
  if (!ensureProductColumnsPromise) {
    ensureProductColumnsPromise = (async () => {
      const alters = [
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price INTEGER DEFAULT NULL`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT NULL`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT NULL`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'`,
      ];
      try {
        for (const stmt of alters) {
          await sql.unsafe(stmt);
        }
      } catch (e) {
        console.error("ensureProductColumns error:", e);
      }
    })();
  }
  await ensureProductColumnsPromise;
}

let ensureStoreColumnsPromise: Promise<void> | null = null;
export async function ensureStoreColumns() {
  if (!ensureStoreColumnsPromise) {
    ensureStoreColumnsPromise = (async () => {
      try {
        await sql.unsafe(
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT NULL`,
        );
        await sql.unsafe(
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS location_state VARCHAR(100) DEFAULT NULL`,
        );
        await sql.unsafe(
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS store_description VARCHAR(200) DEFAULT NULL`,
        );
        await sql.unsafe(
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100) DEFAULT NULL`,
        );
        await sql.unsafe(
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS account_number VARCHAR(100) DEFAULT NULL`,
        );
        await sql.unsafe(
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS account_name VARCHAR(100) DEFAULT NULL`,
        );
        await sql.unsafe(
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS store_timezone VARCHAR(100) NOT NULL DEFAULT 'Africa/Lagos'`,
        );
        await sql.unsafe(
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS store_hours JSONB DEFAULT NULL`,
        );
        await sql.unsafe(
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS accepting_orders BOOLEAN NOT NULL DEFAULT true`,
        );
        await sql.unsafe(
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS store_closed_note VARCHAR(280) DEFAULT NULL`,
        );
      } catch (e) {
        console.error("ensureStoreColumns error:", e);
      }
    })();
  }
  await ensureStoreColumnsPromise;
}

let ensureVendorSubscriptionSchemaPromise: Promise<void> | null = null;
export async function ensureVendorSubscriptionSchema() {
  if (!ensureVendorSubscriptionSchemaPromise) {
    ensureVendorSubscriptionSchemaPromise = (async () => {
      try {
        await sql.unsafe(
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) NOT NULL DEFAULT 'inactive'`,
        );
        await sql.unsafe(
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ DEFAULT NULL`,
        );
        await sql.unsafe(
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_last_payment_reference VARCHAR(255) DEFAULT NULL`,
        );
        await sql.unsafe(
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`,
        );

        await sql.unsafe(`
          CREATE TABLE IF NOT EXISTS vendor_subscription_payments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            amount_kobo INTEGER NOT NULL,
            reference VARCHAR(255) NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'paid',
            paid_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (vendor_id, reference)
          )
        `);
      } catch (e) {
        console.error("ensureVendorSubscriptionSchema error:", e);
      }
    })();
  }
  await ensureVendorSubscriptionSchemaPromise;
}

let ensureDiscountSchemaPromise: Promise<void> | null = null;
export async function ensureDiscountSchema() {
  if (!ensureDiscountSchemaPromise) {
    ensureDiscountSchemaPromise = (async () => {
      try {
        await sql.unsafe(`
          CREATE TABLE IF NOT EXISTS discount_codes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            code VARCHAR(50) NOT NULL,
            discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
            discount_value INT NOT NULL,
            min_purchase INT DEFAULT 0,
            max_uses INT,
            uses_count INT DEFAULT 0,
            active BOOLEAN DEFAULT true,
            expires_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(vendor_id, code)
          )
        `);

        await sql.unsafe(
          `ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50) DEFAULT NULL`,
        );
        await sql.unsafe(
          `ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INT DEFAULT 0`,
        );
      } catch (e) {
        console.error("ensureDiscountSchema error:", e);
      }
    })();
  }
  await ensureDiscountSchemaPromise;
}

export async function fetchProductsList(vendorId: string) {
  console.log("fetchProductsList called with vendorId:", vendorId);
  if (!vendorId) {
    console.warn(
      "fetchProductsList: vendorId is missing. Returning empty list.",
    );
    return [];
  }
  await ensureProductColumns();
  try {
    const products = await sql<Product[]>`
      SELECT * FROM products
      WHERE vendor_id = ${vendorId}
      ORDER BY created_at DESC
    `;
    return products;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch products.");
  }
}

export async function fetchProductById(id: string) {
  if (!id) {
    console.warn("fetchProductById: id is missing.");
    return undefined;
  }
  await ensureProductColumns();
  try {
    const data = await sql<Product[]>`
      SELECT * FROM products
      WHERE id = ${id}
    `;
    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch product.");
  }
}

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // console.log('Fetching revenue data...');
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    // console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? "0");
    const numberOfCustomers = Number(data[1][0].count ?? "0");
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? "0");
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? "0");

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  try {
    const customers = await sql<CustomerField[]>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType[]>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}

export async function fetchVendorBySlug(slug: string) {
  try {
    await ensureStoreColumns();
    const data = await sql<User[]>`
      SELECT
        id,
        name,
        store_slug,
        store_name,
        whatsapp_number,
        store_timezone,
        store_hours,
        accepting_orders,
        store_closed_note
      FROM users
      WHERE store_slug = ${slug}
      LIMIT 1
    `;
    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    return null;
  }
}

export async function fetchProducts(vendorId: string) {
  return fetchProductsList(vendorId);
}

export async function fetchUserById(id: string) {
  try {
    await ensureVendorSubscriptionSchema();
    await ensureStoreColumns();
    const user = await sql<User[]>`
      SELECT
        id,
        name,
        email,
        store_slug,
        store_name,
        store_description,
        whatsapp_number,
        bank_name,
        account_number,
        account_name,
        category,
        location_state,
        subscription_status,
        subscription_expires_at,
        subscription_last_payment_reference,
        subscription_updated_at,
        store_timezone,
        store_hours,
        accepting_orders,
        store_closed_note
      FROM users
      WHERE id = ${id}
    `;
    return user[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch user.");
  }
}

export async function fetchOrdersList(vendorId: string) {
  if (!vendorId) return [];
  await ensureDiscountSchema();
  try {
    const orders = await sql<Order[]>`
      SELECT * FROM orders
      WHERE vendor_id = ${vendorId}
      ORDER BY created_at DESC
    `;
    return orders;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch orders.");
  }
}

export async function fetchOrderById(id: string) {
  await ensureDiscountSchema();
  try {
    const data = await sql<Order[]>`
      SELECT * FROM orders
      WHERE id = ${id}
    `;
    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch order.");
  }
}
export async function fetchVendorStats(vendorId: string) {
  try {
    const data = await Promise.all([
      sql`SELECT COUNT(*) FROM orders WHERE vendor_id = ${vendorId}`,
      sql`SELECT COALESCE(SUM(total_amount), 0) as sum FROM orders WHERE vendor_id = ${vendorId} AND status = 'fulfilled'`,
      sql`SELECT COUNT(*) FROM products WHERE vendor_id = ${vendorId} AND status = 'active'`,
      sql`SELECT COUNT(*) FROM orders WHERE vendor_id = ${vendorId} AND status IN ('new', 'in_progress')`,
    ]);

    const numberOfOrders = Number(data[0][0].count ?? "0");
    const totalRevenue = Number(data[1][0].sum ?? "0");
    const numberOfProducts = Number(data[2][0].count ?? "0");
    const numberOfPendingOrders = Number(data[3][0].count ?? "0");

    return {
      numberOfOrders,
      totalRevenue,
      numberOfProducts,
      numberOfPendingOrders,
    };
  } catch (error) {
    console.error("Database Error:", error);
    // Return zeros instead of throwing to prevent page crash
    return {
      numberOfOrders: 0,
      totalRevenue: 0,
      numberOfProducts: 0,
      numberOfPendingOrders: 0,
    };
  }
}

export async function trackStoreVisit(vendorId: string) {
  try {
    await sql`
      INSERT INTO store_analytics (vendor_id, date, visits)
      VALUES (${vendorId}, CURRENT_DATE, 1)
      ON CONFLICT (vendor_id, date)
      DO UPDATE SET visits = store_analytics.visits + 1
    `;
  } catch (error) {
    console.error("Analytics Error:", error);
    // Don't throw - analytics shouldn't break the app
  }
}

export async function fetchWeeklyAnalytics(vendorId: string) {
  try {
    const data = await sql`
      SELECT
        date,
        visits,
        orders_count,
        revenue
      FROM store_analytics
      WHERE vendor_id = ${vendorId}
        AND date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY date DESC
    `;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

// ─── Public Store Directory ──────────────────────────────────
export type PublicStore = {
  id: string;
  store_name: string;
  store_slug: string;
  store_description: string | null;
  logo_url: string | null;
  product_count: number;
  category: string | null;
  location_state: string | null;
  top_products: { name: string; image_url: string | null; price: number }[];
  availability: StoreAvailability;
};

export async function fetchAvailableLocations(): Promise<string[]> {
  try {
    await ensureStoreColumns();
    const locations = await sql<{ location_state: string }[]>`
      SELECT DISTINCT location_state
      FROM users
      WHERE location_state IS NOT NULL
        AND location_state != ''
        AND store_name IS NOT NULL
        AND store_name != ''
      ORDER BY location_state ASC
    `;
    return locations.map((l) => l.location_state);
  } catch (error) {
    console.error("Database Error (fetchAvailableLocations):", error);
    return [];
  }
}

export async function fetchAllPublicStores(
  search?: string,
  category?: string,
  sort?: string,
  location?: string,
): Promise<PublicStore[]> {
  try {
    await ensureStoreColumns();
    const searchFilter = search ? `%${search}%` : "%";
    const categoryFilter = category && category !== "All" ? category : null;
    const locationFilter = location && location !== "All" ? location : null;

    const stores = await sql<
      {
        id: string;
        store_name: string;
        store_slug: string;
        store_description: string | null;
        category: string | null;
        location_state: string | null;
        product_count: string;
        store_timezone: string | null;
        store_hours: unknown;
        accepting_orders: boolean | null;
        store_closed_note: string | null;
      }[]
    >`
      SELECT
        u.id,
        u.store_name,
        u.store_slug,
        u.store_description,
        u.category,
        u.location_state,
        u.store_timezone,
        u.store_hours,
        u.accepting_orders,
        u.store_closed_note,
        COUNT(DISTINCT p.id)::text AS product_count
      FROM users u
      LEFT JOIN products p ON p.vendor_id = u.id AND p.status = 'active'
      WHERE u.store_name IS NOT NULL
        AND u.store_name != ''
        -- Filter out stores with expired subscriptions
        AND (
          u.subscription_status = 'active'
          OR u.subscription_status = 'trial'
          OR (u.subscription_expires_at IS NOT NULL AND u.subscription_expires_at > CURRENT_TIMESTAMP)
        )
        -- Inclusive Search: Name, Category, Owner, or Products
        AND (
          u.store_name ILIKE ${searchFilter}
          OR u.category ILIKE ${searchFilter}
          OR u.name ILIKE ${searchFilter}
          OR EXISTS (
            SELECT 1 FROM products p_search
            WHERE p_search.vendor_id = u.id
            AND p_search.status = 'active'
            AND (
              p_search.name ILIKE ${searchFilter}
              OR p_search.category ILIKE ${searchFilter}
            )
          )
        )
        -- Robust Category Filter: Store Category OR Product Category
        ${
          categoryFilter
            ? sql`AND (
          u.category = ${categoryFilter}
          OR EXISTS (
            SELECT 1 FROM products p_cat
            WHERE p_cat.vendor_id = u.id
            AND p_cat.status = 'active'
            AND p_cat.category = ${categoryFilter}
          )
        )`
            : sql``
        }
        -- Location Filter
        ${locationFilter ? sql`AND u.location_state = ${locationFilter}` : sql``}
      GROUP BY u.id, u.store_name, u.store_slug, u.store_description, u.category, u.location_state, u.store_timezone, u.store_hours, u.accepting_orders, u.store_closed_note
      HAVING COUNT(p.id) > 0
      ${
        sort === "location"
          ? sql`ORDER BY u.location_state ASC NULLS LAST, u.store_name ASC`
          : sort === "name"
            ? sql`ORDER BY u.store_name ASC`
            : sql`ORDER BY COUNT(p.id) DESC, u.store_name ASC`
      }
      LIMIT 50
    `;

    // Fetch logo + top 3 products for each store
    const results: PublicStore[] = await Promise.all(
      stores.map(async (store) => {
        const [logoRow] = await sql<{ logo_url: string | null }[]>`
          SELECT logo_url FROM store_theme WHERE vendor_id = ${store.id} LIMIT 1
        `;

        const topProducts = await sql<
          { name: string; image_url: string | null; price: number }[]
        >`
          SELECT name, image_url, price FROM products
          WHERE vendor_id = ${store.id} AND status = 'active'
          ORDER BY created_at DESC
          LIMIT 3
        `;

        return {
          id: store.id,
          store_name: store.store_name,
          store_slug: store.store_slug,
          store_description: store.store_description,
          logo_url: logoRow?.logo_url || null,
          product_count: Number(store.product_count),
          category: store.category,
          location_state: store.location_state,
          top_products: topProducts,
          availability: getStoreAvailability({
            timeZone: store.store_timezone,
            store_hours: store.store_hours,
            accepting_orders: store.accepting_orders,
            store_closed_note: store.store_closed_note,
          }),
        };
      }),
    );

    return results;
  } catch (error) {
    console.error("Database Error (fetchAllPublicStores):", error);
    return [];
  }
}

// ─── Order Tracking ──────────────────────────────────────────
export async function fetchOrderByTracking(orderId: string, phone: string) {
  await ensureDiscountSchema();
  try {
    const [order] = await sql<Order[]>`
      SELECT o.*, u.store_name
      FROM orders o
      JOIN users u ON u.id = o.vendor_id
      WHERE o.id::text ILIKE ${orderId + "%"}
        AND o.customer_phone = ${phone}
      LIMIT 1
    `;
    return order ? { ...order, store_name: (order as any).store_name } : null;
  } catch (error) {
    console.error("Database Error (fetchOrderByTracking):", error);
    return null;
  }
}

// ==================== VENDOR GUIDES ====================

/**
 * Fetch all published guides
 */
export async function fetchPublishedGuides(limit?: number) {
  try {
    const query = sql`
      SELECT * FROM vendor_guides
      WHERE published_at IS NOT NULL
      ORDER BY published_at DESC
      ${limit ? sql`LIMIT ${limit}` : sql``}
    `;
    return await query;
  } catch (error) {
    console.error("Database Error (fetchPublishedGuides):", error);
    return [];
  }
}

/**
 * Fetch featured guides
 */
export async function fetchFeaturedGuides(limit = 3) {
  try {
    const guides = await sql`
      SELECT * FROM vendor_guides
      WHERE published_at IS NOT NULL
      AND featured = TRUE
      ORDER BY published_at DESC
      LIMIT ${limit}
    `;
    return guides || [];
  } catch (error) {
    console.error("Database Error (fetchFeaturedGuides):", error);
    return [];
  }
}

/**
 * Fetch guide by slug
 */
export async function fetchGuideBySlug(slug: string) {
  try {
    const guides = await sql`
      SELECT * FROM vendor_guides
      WHERE slug = ${slug}
      AND published_at IS NOT NULL
    `;
    return guides && guides.length > 0 ? guides[0] : null;
  } catch (error) {
    console.error("Database Error (fetchGuideBySlug):", error);
    return null;
  }
}

/**
 * Fetch guides by category
 */
export async function fetchGuidesByCategory(category: string) {
  try {
    const guides = await sql`
      SELECT * FROM vendor_guides
      WHERE category = ${category}
      AND published_at IS NOT NULL
      ORDER BY published_at DESC
    `;
    return guides || [];
  } catch (error) {
    console.error("Database Error (fetchGuidesByCategory):", error);
    return [];
  }
}

/**
 * Get vendor's viewed guides
 */
export async function getVendorViewedGuideIds(
  vendorId: string,
): Promise<number[]> {
  try {
    const views = await sql`
      SELECT DISTINCT guide_id FROM guide_views
      WHERE vendor_id = ${vendorId}
    `;
    return (views || []).map((v: any) => v.guide_id);
  } catch (error) {
    console.error("Database Error (getVendorViewedGuideIds):", error);
    return [];
  }
}

/**
 * Check if vendor completed a specific guide
 */
export async function isGuideCompleted(
  vendorId: string,
  guideId: number,
): Promise<boolean> {
  try {
    const views = await sql`
      SELECT completed FROM guide_views
      WHERE vendor_id = ${vendorId} AND guide_id = ${guideId}
      LIMIT 1
    `;
    return views?.[0]?.completed === true;
  } catch (error) {
    console.error("Database Error (isGuideCompleted):", error);
    return false;
  }
}

/**
 * Fetch related guides (same category, excluding current guide)
 */
export async function fetchRelatedGuides(
  currentGuideId: number,
  category: string | null,
  limit = 3,
) {
  try {
    if (!category) {
      const guides = await sql`
        SELECT id, title, slug, description, reading_time, difficulty, featured, category
        FROM vendor_guides
        WHERE published_at IS NOT NULL
          AND id != ${currentGuideId}
        ORDER BY featured DESC, published_at DESC
        LIMIT ${limit}
      `;
      return guides || [];
    }
    const guides = await sql`
      SELECT id, title, slug, description, reading_time, difficulty, featured, category
      FROM vendor_guides
      WHERE published_at IS NOT NULL
        AND id != ${currentGuideId}
        AND category = ${category}
      ORDER BY featured DESC, published_at DESC
      LIMIT ${limit}
    `;
    // If fewer than limit, fill with guides from any category
    if ((guides || []).length < limit) {
      const extra = await sql`
        SELECT id, title, slug, description, reading_time, difficulty, featured, category
        FROM vendor_guides
        WHERE published_at IS NOT NULL
          AND id != ${currentGuideId}
          AND (category != ${category} OR category IS NULL)
        ORDER BY featured DESC, published_at DESC
        LIMIT ${limit - (guides || []).length}
      `;
      return [...(guides || []), ...(extra || [])];
    }
    return guides || [];
  } catch (error) {
    console.error("Database Error (fetchRelatedGuides):", error);
    return [];
  }
}
