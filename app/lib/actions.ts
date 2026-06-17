"use server";

import { z } from "zod";
import { sql } from "./db";
import { revalidatePath } from "next/cache";
import { getStoreAvailability } from "./store-availability";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureLogoLayoutColumns } from "@/app/lib/theme";
import {
  ensureProductColumns,
  ensureStoreColumns,
  ensureVendorSubscriptionSchema,
  ensureDiscountSchema,
} from "@/app/lib/data";
import {
  validateDiscountCode,
  incrementDiscountUse,
} from "@/app/lib/discounts";
import { getTransactionFeePercentage } from "@/app/lib/subscriptions";
import { deleteCloudinaryImage, deleteCloudinaryImages } from "./cloudinary";
import { signOut } from "@/auth";
import bcrypt from "bcryptjs";
import { triggerGuideForEvent } from "@/app/lib/guide-triggers";
import { requireFeature } from "@/app/lib/feature-gate";
import { ensureTeamSchema } from "@/app/lib/team";

async function requireActiveVendorSubscription() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user?.id || role !== "vendor") {
    throw new Error("Unauthorized.");
  }

  await ensureVendorSubscriptionSchema();
  const [row] = await sql<{ subscription_expires_at: string | null }[]>`
    SELECT subscription_expires_at
    FROM users
    WHERE id = ${session.user.id}
    LIMIT 1
  `;

  const expiresAt = row?.subscription_expires_at
    ? new Date(row.subscription_expires_at)
    : null;
  const active = !!expiresAt && expiresAt.getTime() > Date.now();
  if (!active) {
    throw new Error("Subscription required. Please pay ₦3,000 to continue.");
  }

  return { vendorId: session.user.id };
}

const FormSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(3, { message: "Product name must be at least 3 characters." }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters." }),
  price: z.coerce
    .number()
    .gt(0, { message: "Please enter a price greater than 0." }),
  status: z.enum(["active", "inactive"], {
    invalid_type_error: "Please select a product status.",
  }),
  category: z.string().optional().nullable(),
  compare_at_price: z.coerce.number().optional().nullable(),
  stock_quantity: z.coerce.number().optional().nullable(),
  gallery_images: z.string().optional().default("[]"),
  options: z.string().optional().default("[]"),
  image_url: z.string().optional().nullable(),
  is_digital: z
    .preprocess((v) => v === "on" || v === true, z.boolean())
    .optional()
    .default(false),
});

const CreateProduct = FormSchema.omit({ id: true });
const UpdateProduct = FormSchema.omit({ id: true });

const ProfileSchema = z.object({
  store_name: z
    .string()
    .min(2, { message: "Store name must be at least 2 characters." }),
  store_slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens.",
    }),
  store_description: z
    .string()
    .max(200, { message: "Description must be 200 characters or less." })
    .optional()
    .nullable(),
  whatsapp_number: z.string().optional().nullable(),
  bank_name: z.string().optional().nullable(),
  account_number: z.string().optional().nullable(),
  account_name: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  location_state: z.string().optional().nullable(),
  store_timezone: z.preprocess(
    (v) => (v === null ? undefined : v),
    z.string().optional().default("Africa/Lagos"),
  ),
  accepting_orders: z
    .preprocess((v) => v === "on" || v === true, z.boolean())
    .optional()
    .default(true),
  store_closed_note: z.string().max(280).optional().nullable(),
  store_hours_json: z.string().optional().nullable(),
  delivery_latitude: z.coerce.number().optional().nullable(),
  delivery_longitude: z.coerce.number().optional().nullable(),
  delivery_address_details: z
    .string()
    .max(500, { message: "Address details must be 500 characters or less." })
    .optional()
    .nullable(),
  delivery_address: z.string().optional().nullable(),
  // Pickup location / offers_pickup (new)
  offers_pickup: z
    .preprocess((v) => v === "on" || v === true, z.boolean())
    .optional()
    .nullable(),
  pickup_latitude: z.coerce.number().optional().nullable(),
  pickup_longitude: z.coerce.number().optional().nullable(),
  pickup_address_details: z
    .string()
    .max(500, { message: "Address details must be 500 characters or less." })
    .optional()
    .nullable(),
  pickup_address: z.string().optional().nullable(),
  // Sound/notification preferences
  sound_enabled: z
    .preprocess((v) => v === "on" || v === true, z.boolean())
    .optional()
    .nullable(),
  sound_volume: z.coerce.number().min(0).max(100).optional().nullable(),
});

const ThemeSchema = z.object({
  template_id: z.string().optional(),
  primary_color: z.string(),
  secondary_color: z.string(),
  background_color: z.string(),
  text_color: z.string(),
  accent_color: z.string(),
  surface_color: z.string().optional(),
  heading_color: z.string().optional(),
  border_color: z.string().optional(),
  layout_style: z.enum(["grid", "list", "masonry"]),
  card_style: z.enum(["modern", "classic", "minimal", "bold"]),
  border_radius: z.enum(["sharp", "rounded", "pill"]),
  card_shadow: z.enum(["none", "soft", "elevated", "hard"]).optional(),
  button_style: z.enum(["solid", "outline", "soft", "glass"]).optional(),
  button_radius: z.enum(["sharp", "rounded", "pill"]).optional(),
  animation_style: z
    .enum(["none", "fade", "slide", "zoom", "bounce"])
    .optional(),
  font_family: z.string(),
  heading_font: z.string(),
  font_size: z.enum(["small", "medium", "large"]),
  header_style: z.enum(["sticky", "static", "transparent"]),
  show_product_images: z.coerce.boolean(),
  show_product_description: z.coerce.boolean(),
  image_aspect_ratio: z.enum(["square", "portrait", "landscape"]),
  spacing: z.enum(["compact", "comfortable", "spacious"]),
  custom_css: z.string().optional().nullable(),
  primary_gradient: z.string().optional().nullable(),
  glass_effect: z.coerce.boolean().optional().default(false),
  layout_width: z.enum(["standard", "wide", "full"]).optional().default("wide"),
  show_mobile_checkout_bar: z.coerce.boolean().optional().default(false),
  show_logo: z.preprocess((v) => v === "true" || v === true, z.boolean()),
  logo_position: z.enum(["left", "center", "right"]),
  logo_frame: z.enum(["plain", "none", "profile", "rounded", "minimal"]),
  logo_url: z.preprocess(
    (v) => {
      if (v === null || v === undefined) return null;
      const s = String(v).trim();
      return s === "" ? null : s;
    },
    z.union([
      z.null(),
      z.string().url(),
      z
        .string()
        .regex(/^\/uploads\//, "Must be an uploaded file path or https URL"),
    ]),
  ),
  icon_library: z.enum(["heroicons", "lucide"]).optional().default("heroicons"),
  icon_fill: z.enum(["solid", "outline"]).optional().default("outline"),
  icon_weight: z
    .enum(["light", "regular", "bold"])
    .optional()
    .default("regular"),
  cart_icon: z
    .enum(["shopping-bag", "shopping-cart", "basket", "tote"])
    .optional()
    .default("shopping-bag"),
  user_icon: z.enum(["user", "face", "smile"]).optional().default("user"),
  share_icon: z
    .enum(["dots", "paper-plane", "arrow-curve", "arrow-square", "nodes"])
    .optional()
    .default("arrow-square"),
  add_icon: z.enum(["plus", "bag", "cart", "arrow"]).optional().default("plus"),
  sections: z.string().optional(), // JSON string
  section_content: z.string().optional(), // JSON string
  line_height: z.preprocess((v) => (!v ? null : Number(v)), z.number().min(1.0).max(2.5).optional().nullable()),
  letter_spacing: z.preprocess((v) => (!v ? null : Number(v)), z.number().min(-0.1).max(0.5).optional().nullable()),
  text_transform: z.preprocess((v) => (!v ? null : v), z.enum(["none", "uppercase", "lowercase", "capitalize"]).optional().nullable()),
  body_font_weight: z.preprocess((v) => (!v ? null : Number(v)), z.number().optional().nullable()),
  heading_font_weight: z.preprocess((v) => (!v ? null : Number(v)), z.number().optional().nullable()),
  container_width: z.preprocess((v) => (!v ? null : v), z.enum(["narrow", "standard", "wide", "full"]).optional().nullable()),
  design_tokens: z.string().optional().nullable(),
  secondary_gradient: z.string().optional().nullable(),
  is_publish: z
    .preprocess((v) => v === "true" || v === true, z.boolean())
    .optional()
    .default(true),
});

export type State = {
  errors?: {
    name?: string[];
    description?: string[];
    price?: string[];
    status?: string[];
    store_name?: string[];
    store_slug?: string[];
    whatsapp_number?: string[];
    customer_name?: string[];
    customer_phone?: string[];
    delivery_type?: string[];
    [key: string]: string[] | undefined;
  };
  message?: string | null;
  values?: Record<string, any>;
};

export type OrderState = State;
export type DiscountState = State;

const StoreHoursDayKeyZ = z.enum([
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
]);
const StoreHoursSchema = z
  .record(
    StoreHoursDayKeyZ,
    z
      .array(
        z.object({
          open: z.string().regex(/^\d{2}:\d{2}$/),
          close: z.string().regex(/^\d{2}:\d{2}$/),
        }),
      )
      .max(3),
  )
  .nullable();

function isValidIanaTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export async function updateProfile(
  prevState: State | undefined,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized. Please log in." };
  }

  const validatedFields = ProfileSchema.safeParse({
    store_name: formData.get("store_name"),
    store_slug: formData.get("store_slug"),
    store_description: formData.get("store_description"),
    whatsapp_number: formData.get("whatsapp_number"),
    bank_name: formData.get("bank_name"),
    account_number: formData.get("account_number"),
    account_name: formData.get("account_name"),
    category: formData.get("category"),
    location_state: formData.get("location_state"),
    store_timezone: formData.get("store_timezone"),
    accepting_orders: formData.get("accepting_orders"),
    store_closed_note: formData.get("store_closed_note"),
    store_hours_json: formData.get("store_hours_json"),
    delivery_latitude: formData.get("delivery_latitude"),
    delivery_longitude: formData.get("delivery_longitude"),
    delivery_address_details: formData.get("delivery_address_details"),
    delivery_address: formData.get("delivery_address"),
    // Pickup fields
    offers_pickup: formData.get("offers_pickup"),
    pickup_latitude:
      formData.get("pickup_latitude") || formData.get("delivery_latitude"),
    pickup_longitude:
      formData.get("pickup_longitude") || formData.get("delivery_longitude"),
    pickup_address_details:
      formData.get("pickup_address_details") ||
      formData.get("delivery_address_details"),
    pickup_address:
      formData.get("pickup_address") || formData.get("delivery_address"),
    sound_enabled: formData.get("sound_enabled"),
    sound_volume: formData.get("sound_volume"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Profile.",
    };
  }

  const {
    store_name,
    store_slug,
    store_description,
    whatsapp_number,
    bank_name,
    account_number,
    account_name,
    category,
    location_state,
    store_timezone,
    accepting_orders,
    store_closed_note,
    store_hours_json,
    delivery_latitude,
    delivery_longitude,
    delivery_address_details,
    delivery_address,
    offers_pickup,
    pickup_latitude,
    pickup_longitude,
    pickup_address_details,
    pickup_address,
    sound_enabled,
    sound_volume,
  } = validatedFields.data;

  // Validate timezone
  if (store_timezone && !isValidIanaTimeZone(store_timezone)) {
    return {
      message: "Invalid timezone.",
      errors: { store_timezone: ["Invalid timezone."] },
    };
  }

  // Parse hours
  let store_hours: any = null;
  if (store_hours_json) {
    try {
      const parsed = JSON.parse(store_hours_json);
      const hoursCheck = StoreHoursSchema.safeParse(parsed);
      if (hoursCheck.success) {
        store_hours = hoursCheck.data;
      }
    } catch (e) {
      console.error("Failed to parse store_hours_json", e);
    }
  }

  try {
    await ensureStoreColumns();
    // Check if slug is already taken by another user
    const existingUser = await sql`
      SELECT id FROM users 
      WHERE store_slug = ${store_slug} AND id != ${session.user.id}
      LIMIT 1
    `;

    if (existingUser.length > 0) {
      return {
        errors: {
          store_slug: [
            "This slug is already in use. Please choose another one.",
          ],
        },
        message: "Slug taken.",
      };
    }

    await sql`
      UPDATE users
      SET store_name = ${store_name}, 
          store_slug = ${store_slug},
          store_description = ${store_description ?? null},
          whatsapp_number = ${whatsapp_number ?? null},
          bank_name = ${bank_name ?? null},
          account_number = ${account_number ?? null},
          account_name = ${account_name ?? null},
          category = ${category ?? null},
          location_state = ${location_state ?? null},
          store_timezone = ${store_timezone},
          accepting_orders = ${accepting_orders},
          store_closed_note = ${store_closed_note ?? null},
          store_hours = ${store_hours ? sql.json(store_hours) : null},
          delivery_latitude = ${delivery_latitude ?? null},
          delivery_longitude = ${delivery_longitude ?? null},
          delivery_address_details = ${delivery_address_details ?? null},
          delivery_address = ${delivery_address ?? null},
          offers_pickup = ${offers_pickup ?? false},
          pickup_latitude = ${pickup_latitude ?? null},
          pickup_longitude = ${pickup_longitude ?? null},
          pickup_address_details = ${pickup_address_details ?? null},
          pickup_address = ${pickup_address ?? null},
          sound_enabled = ${sound_enabled ?? true},
          sound_volume = ${sound_volume ?? 50}
      WHERE id = ${session.user.id}
    `;

    revalidatePath("/dashboard/settings");
    revalidatePath("/explore");
    revalidatePath("/");
    revalidatePath(`/s/${store_slug}`);

    return { message: "Success! Settings updated." };
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Database Error: Failed to Update Settings." };
  }
}

export async function createProduct(
  prevState: State | undefined,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized. Please log in." };
  }
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || "Subscription required." };
  }

  const validatedFields = CreateProduct.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    compare_at_price: formData.get("compare_at_price") || null,
    status: formData.get("status"),
    category: formData.get("category") || null,
    stock_quantity: formData.get("stock_quantity") || null,
    image_url: formData.get("image_url") || "",
    gallery_images: formData.get("gallery_images") || "[]",
    options: formData.get("options") || "[]",
    is_digital: formData.get("is_digital"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Product.",
      values: {
        name: formData.get("name")?.toString() || "",
        description: formData.get("description")?.toString() || "",
        price: formData.get("price")?.toString() || "",
        compare_at_price: formData.get("compare_at_price")?.toString() || "",
        category: formData.get("category")?.toString() || "",
        stock_quantity: formData.get("stock_quantity")?.toString() || "",
        status: formData.get("status")?.toString() || "active",
      },
    };
  }

  const {
    name,
    description,
    price,
    compare_at_price,
    status,
    category,
    stock_quantity,
    image_url,
    gallery_images,
    options,
    is_digital,
  } = validatedFields.data;

  // Convert prices to Kobo (multiply by 100)
  const priceKobo = Math.round(price * 100);
  const compareAtPriceKobo = compare_at_price
    ? Math.round(compare_at_price * 100)
    : null;

  // Convert option prices to Kobo
  let finalOptions = options;
  try {
    const parsedOptions = JSON.parse(options);
    const koboOptions = parsedOptions.map((opt: any) => ({
      ...opt,
      price: opt.price ? Math.round(Number(opt.price) * 100).toString() : "",
    }));
    finalOptions = JSON.stringify(koboOptions);
  } catch (e) {
    console.error("Error processing options prices:", e);
  }

  console.log("Creating product with price (Kobo):", priceKobo);

  try {
    await ensureProductColumns();

    // Enforce product limit based on subscription tier
    const { getProductLimit } = await import("@/app/lib/subscriptions");
    const productLimit = await getProductLimit(session.user.id);
    const [countResult] = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text as count FROM products WHERE vendor_id = ${session.user.id}
    `;
    const currentCount = Number(countResult?.count || 0);
    if (currentCount >= productLimit) {
      return {
        message: `You've reached your plan's limit of ${productLimit} products. Please upgrade your subscription to add more.`,
      };
    }

    await sql`
      INSERT INTO products (vendor_id, name, description, price, compare_at_price, status, category, stock_quantity, image_url, gallery_images, options, is_digital)
      VALUES (${session.user.id}, ${name}, ${description}, ${priceKobo}, ${compareAtPriceKobo}, ${status}, ${category ?? null}, ${stock_quantity ?? null}, ${image_url || null}, ${gallery_images}, ${finalOptions}, ${is_digital})
    `;

    const [productCount] = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text as count FROM products WHERE vendor_id = ${session.user.id}
    `;
    if (Number(productCount?.count) === 1) {
      await triggerGuideForEvent(session.user.id, "first-product");
    }
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Database Error: Failed to Create Product." };
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export async function updateProduct(
  id: string,
  prevState: State | undefined,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized. Please log in." };
  }
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || "Subscription required." };
  }

  const validatedFields = UpdateProduct.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    compare_at_price: formData.get("compare_at_price") || null,
    status: formData.get("status"),
    category: formData.get("category") || null,
    stock_quantity: formData.get("stock_quantity") || null,
    image_url: formData.get("image_url") || "",
    gallery_images: formData.get("gallery_images") || "[]",
    options: formData.get("options") || "[]",
    is_digital: formData.get("is_digital"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Product.",
      values: {
        name: formData.get("name")?.toString() || "",
        description: formData.get("description")?.toString() || "",
        price: formData.get("price")?.toString() || "",
        compare_at_price: formData.get("compare_at_price")?.toString() || "",
        category: formData.get("category")?.toString() || "",
        stock_quantity: formData.get("stock_quantity")?.toString() || "",
        status: formData.get("status")?.toString() || "active",
      },
    };
  }

  const {
    name,
    description,
    price,
    compare_at_price,
    status,
    category,
    stock_quantity,
    image_url,
    gallery_images,
    options,
  } = validatedFields.data;

  // Convert prices to Kobo (multiply by 100)
  const priceKobo = Math.round(price * 100);
  const compareAtPriceKobo = compare_at_price
    ? Math.round(compare_at_price * 100)
    : null;

  // Convert option prices to Kobo
  let finalOptions = options;
  try {
    const parsedOptions = JSON.parse(options);
    const koboOptions = parsedOptions.map((opt: any) => ({
      ...opt,
      price: opt.price ? Math.round(Number(opt.price) * 100).toString() : "",
    }));
    finalOptions = JSON.stringify(koboOptions);
  } catch (e) {
    console.error("Error processing options prices:", e);
  }

  try {
    await ensureProductColumns();

    // Fetch old images to check for changes
    const [oldProduct] = await sql`
      SELECT image_url, gallery_images FROM products 
      WHERE id = ${id} AND vendor_id = ${session.user.id}
    `;

    if (oldProduct) {
      // If main image changed, delete old one
      if (oldProduct.image_url && oldProduct.image_url !== image_url) {
        await deleteCloudinaryImage(oldProduct.image_url);
      }

      // If gallery images changed, delete those no longer present
      const oldGallery: string[] = JSON.parse(
        oldProduct.gallery_images || "[]",
      );
      const newGallery: string[] = JSON.parse(gallery_images);
      const toDelete = oldGallery.filter((url) => !newGallery.includes(url));
      if (toDelete.length > 0) {
        await deleteCloudinaryImages(toDelete);
      }
    }

    await sql`
      UPDATE products
      SET name = ${name}, description = ${description}, price = ${priceKobo}, compare_at_price = ${compareAtPriceKobo}, status = ${status}, 
          category = ${category ?? null}, stock_quantity = ${stock_quantity ?? null}, image_url = ${image_url || null}, gallery_images = ${gallery_images}, options = ${finalOptions}, is_digital = ${validatedFields.data.is_digital}
      WHERE id = ${id} AND vendor_id = ${session.user.id}
    `;
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Database Error: Failed to Update Product." };
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized.");
  }
  await requireActiveVendorSubscription();

  try {
    // Fetch product to get image URLs before deleting
    const [product] = await sql`
      SELECT image_url, gallery_images FROM products 
      WHERE id = ${id} AND vendor_id = ${session.user.id}
    `;

    if (product) {
      // Delete main image
      if (product.image_url) {
        await deleteCloudinaryImage(product.image_url);
      }
      // Delete gallery images
      let gallery: string[] = [];
      try {
        gallery = JSON.parse(product.gallery_images || "[]");
        if (!Array.isArray(gallery)) {
          gallery = [];
        }
      } catch (e) {
        console.error("Error parsing gallery images:", e);
        gallery = [];
      }
      if (gallery.length > 0) {
        await deleteCloudinaryImages(gallery);
      }
    }

    await sql`DELETE FROM products WHERE id = ${id} AND vendor_id = ${session.user.id}`;
    revalidatePath("/dashboard/products");
  } catch (error) {
    console.error("Database Error:", error);
  }
}

export async function createOrder(
  vendorId: string,
  items: any[],
  totalAmount: number,
  formData: FormData,
  paymentMethod: "cash" | "card" | "transfer" = "cash",
  paymentReference?: string,
  discountCode?: string,
  discountAmount?: number,
) {
  await ensureDiscountSchema();

  // Check store availability before allowing order and fetch pickup location
  const [vendor] = await sql`
    SELECT accepting_orders, store_hours, store_timezone, store_closed_note,
           pickup_latitude, pickup_longitude, pickup_address_details, offers_pickup,
           location_state
    FROM users WHERE id = ${vendorId} LIMIT 1
  `;

  const productIds = items
    .map((item: any) => item.productId)
    .filter(Boolean);

  // Fetch all product details in one query
  let hasPhysicalProducts = false;
  let products: any[] = [];
  if (productIds.length > 0) {
    products = await sql<{ id: string, is_digital: boolean, stock_quantity: number | null, name: string }[]>`
      SELECT id, is_digital, stock_quantity, name FROM products WHERE id IN ${sql(productIds)}
    `;
    hasPhysicalProducts = products.some(p => !p.is_digital);
    
    // Check stock for each product
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product && product.stock_quantity !== null) {
        if (product.stock_quantity < item.quantity) {
          throw new Error(`Not enough stock for "${product.name}". Only ${product.stock_quantity} left.`);
        }
      }
    }
  }

  if (vendor) {
    const availability = getStoreAvailability({
      accepting_orders: vendor.accepting_orders,
      store_hours: vendor.store_hours,
      timeZone: vendor.store_timezone,
      store_closed_note: vendor.store_closed_note,
    });

    if (availability.state === "closed" && hasPhysicalProducts) {
      throw new Error(
        availability.label ||
          "This store is currently closed and not accepting orders for physical products.",
      );
    }
  }

  const customer_name = formData.get("customer_name") as string;
  const customer_phone = formData.get("customer_phone") as string;
  const customer_address = formData.get("customer_address") as string;
  const delivery_type = formData.get("delivery_type") as string;
  const customer_state = formData.get("customer_state") as string;
  const delivery_latitude = formData.get("delivery_latitude")
    ? parseFloat(formData.get("delivery_latitude") as string)
    : null;
  const delivery_longitude = formData.get("delivery_longitude")
    ? parseFloat(formData.get("delivery_longitude") as string)
    : null;
  const delivery_address_details = formData.get(
    "delivery_address_details",
  ) as string;

  // Extract vendor pickup location for pickup orders
  let vendor_pickup_latitude = null;
  let vendor_pickup_longitude = null;
  let vendor_pickup_address_details = null;

  if (delivery_type === "pickup" && vendor && vendor.offers_pickup) {
    vendor_pickup_latitude = vendor.pickup_latitude;
    vendor_pickup_longitude = vendor.pickup_longitude;
    vendor_pickup_address_details = vendor.pickup_address_details;
  }

  const session = await auth();
  const customer_account_id =
    session?.user?.id && (session.user as any).role === "customer"
      ? session.user.id
      : null;

  if (!customer_name || !delivery_type) {
    throw new Error("Missing required customer information.");
  }

  if (hasPhysicalProducts) {
    if (!customer_state) {
      throw new Error("Please select your state to complete the order.");
    }
    if (!vendor?.location_state) {
      throw new Error("This store has not set their location yet. Please contact them directly.");
    }
    if (customer_state !== vendor.location_state) {
      throw new Error(`This store only delivers to ${vendor.location_state}. You selected ${customer_state}.`);
    }
  }

  try {
    const paymentStatus =
      paymentMethod === "card" && paymentReference ? "paid" : "pending";

    const feePercentage = await getTransactionFeePercentage(vendorId);
    const transactionFeeKobo = Math.round(totalAmount * (feePercentage / 100));

    const result = await sql`
      INSERT INTO orders (
        vendor_id, 
        customer_name, 
        customer_phone, 
        customer_address, 
        delivery_type, 
        total_amount, 
        transaction_fee_kobo,
        items, 
        status,
        payment_method,
        payment_reference,
        payment_status,
        discount_code,
        discount_amount,
        delivery_latitude,
        delivery_longitude,
        delivery_address_details,
        vendor_pickup_latitude,
        vendor_pickup_longitude,
        vendor_pickup_address_details,
        customer_account_id
      )
      VALUES (
        ${vendorId}, 
        ${customer_name}, 
        ${customer_phone}, 
        ${customer_address || null}, 
        ${delivery_type}, 
        ${totalAmount}, 
        ${transactionFeeKobo},
        ${JSON.stringify(items)}, 
        'new',
        ${paymentMethod},
        ${paymentReference || null},
        ${paymentStatus},
        ${discountCode || null},
        ${discountAmount || 0},
        ${delivery_latitude},
        ${delivery_longitude},
        ${delivery_address_details || null},
        ${vendor_pickup_latitude},
        ${vendor_pickup_longitude},
        ${vendor_pickup_address_details || null},
        ${customer_account_id}
      )
      RETURNING id
    `;

    // Update analytics (non-blocking)
    const netRevenueKobo = totalAmount - transactionFeeKobo;
    sql`
      INSERT INTO store_analytics (vendor_id, date, orders_count, revenue, net_revenue)
      VALUES (${vendorId}, CURRENT_DATE, 1, ${totalAmount}, ${netRevenueKobo})
      ON CONFLICT (vendor_id, date)
      DO UPDATE SET 
        orders_count = store_analytics.orders_count + 1,
        revenue = store_analytics.revenue + ${totalAmount},
        net_revenue = COALESCE(store_analytics.net_revenue, 0) + ${netRevenueKobo}
    `.catch(() => {});

    // Auto-decrement Stock
    for (const item of items) {
      if (item.productId && item.quantity) {
        sql`
          UPDATE products
          SET stock_quantity = stock_quantity - ${item.quantity}
          WHERE id = ${item.productId} AND stock_quantity IS NOT NULL
        `.catch((err) => console.error("Error decrementing stock:", err));
      }
    }

    // Identify and increment discount use
    if (discountCode) {
      try {
        const [discount] = await sql`
          SELECT id FROM discount_codes WHERE vendor_id = ${vendorId} AND UPPER(code) = UPPER(${discountCode}) LIMIT 1
        `;
        if (discount) {
          await incrementDiscountUse(discount.id);
        }
      } catch (err) {
        console.error("Error tracking discount:", err);
      }
    }

    const [orderCount] = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text as count FROM orders WHERE vendor_id = ${vendorId}
    `;
    if (Number(orderCount?.count) === 1) {
      await triggerGuideForEvent(vendorId, "first-order");
    }

    revalidatePath("/dashboard/orders");
    return { id: result[0].id, success: true };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to create order.");
  }
}

export async function updateOrderStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized.");
  }
  await requireActiveVendorSubscription();

  try {
    // If marking order as fulfilled, set the fulfilled_at timestamp
    if (status === 'fulfilled') {
      await sql`
        UPDATE orders
        SET status = ${status}, fulfilled_at = NOW()
        WHERE id = ${id} AND vendor_id = ${session.user.id}
      `;
    } else {
      await sql`
        UPDATE orders
        SET status = ${status}
        WHERE id = ${id} AND vendor_id = ${session.user.id}
      `;
    }
    revalidatePath("/dashboard/orders");
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to update order status.");
  }
}

// Discount actions
const DiscountSchema = z.object({
  code: z
    .string()
    .min(2, { message: "Code must be at least 2 characters." })
    .max(20),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.coerce
    .number()
    .gt(0, { message: "Discount value must be greater than 0." }),
  min_purchase: z.coerce.number().optional(),
  max_uses: z.coerce.number().optional(),
  expires_at: z.string().optional(),
});

export async function createDiscountAction(
  vendorId: string,
  prevState: State | undefined,
  formData: FormData,
): Promise<State> {
  await ensureDiscountSchema();
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || "Subscription required." };
  }
  const rawCode = formData.get("code") as string;
  const rawDiscountType = formData.get("discount_type") as string;
  const rawDiscountValue = formData.get("discount_value") as string;
  const rawMinPurchase = formData.get("min_purchase") as string;
  const rawMaxUses = formData.get("max_uses") as string;
  const rawExpiresAt = formData.get("expires_at") as string;

  const validatedFields = DiscountSchema.safeParse({
    code: rawCode ? rawCode.trim() : undefined,
    discount_type: rawDiscountType || undefined,
    discount_value: rawDiscountValue || undefined,
    min_purchase: rawMinPurchase ? parseFloat(rawMinPurchase) : undefined,
    max_uses: rawMaxUses ? parseInt(rawMaxUses, 10) : undefined,
    expires_at: rawExpiresAt || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to create discount code.",
    };
  }

  const {
    code,
    discount_type,
    discount_value,
    min_purchase,
    max_uses,
    expires_at,
  } = validatedFields.data;

  try {
    const valueInKobo =
      discount_type === "fixed"
        ? Math.round(discount_value * 100)
        : discount_value;
    const minPurchaseInKobo = min_purchase ? Math.round(min_purchase * 100) : 0;

    await sql`
      INSERT INTO discount_codes (vendor_id, code, discount_type, discount_value, min_purchase, max_uses, expires_at)
      VALUES (${vendorId}, ${code.toUpperCase()}, ${discount_type}, ${valueInKobo}, ${minPurchaseInKobo}, ${max_uses || null}, ${expires_at || null})
    `;
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Database Error: Failed to create discount code.",
    };
  }

  revalidatePath("/dashboard/discounts");
  redirect("/dashboard/discounts");
}

export async function toggleDiscountAction(
  discountId: string,
  active: boolean,
  prevState: State | undefined,
  formData: FormData,
): Promise<State> {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized" };
  }
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || "Subscription required." };
  }

  try {
    await ensureDiscountSchema();
    await sql`
      UPDATE discount_codes
      SET active = ${!active}
      WHERE id = ${discountId} AND vendor_id = ${session.user.id}
    `;
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Database Error: Failed to update discount status.",
    };
  }

  revalidatePath("/dashboard/discounts");
  redirect("/dashboard/discounts");
}

export async function deleteDiscountAction(discountId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized.");
  }
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    throw new Error(e?.message || "Subscription required.");
  }

  try {
    await ensureDiscountSchema();
    await sql`
      DELETE FROM discount_codes
      WHERE id = ${discountId} AND vendor_id = ${session.user.id}
    `;
    revalidatePath("/dashboard/discounts");
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to delete discount code.");
  }
}

export async function updateDiscountAction(
  discountId: string,
  prevState: State | undefined,
  formData: FormData,
): Promise<State> {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized" };
  }
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || "Subscription required." };
  }

  const rawCode = formData.get("code") as string;
  const rawDiscountType = formData.get("discount_type") as string;
  const rawDiscountValue = formData.get("discount_value") as string;
  const rawMinPurchase = formData.get("min_purchase") as string;
  const rawMaxUses = formData.get("max_uses") as string;
  const rawExpiresAt = formData.get("expires_at") as string;

  const validatedFields = DiscountSchema.safeParse({
    code: rawCode ? rawCode.trim() : undefined,
    discount_type: rawDiscountType || undefined,
    discount_value: rawDiscountValue || undefined,
    min_purchase: rawMinPurchase ? parseFloat(rawMinPurchase) : undefined,
    max_uses: rawMaxUses ? parseInt(rawMaxUses, 10) : undefined,
    expires_at: rawExpiresAt || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to update discount code.",
    };
  }

  const {
    code,
    discount_type,
    discount_value,
    min_purchase,
    max_uses,
    expires_at,
  } = validatedFields.data;

  try {
    await ensureDiscountSchema();
    const valueInKobo =
      discount_type === "fixed"
        ? Math.round(discount_value * 100)
        : discount_value;
    const minPurchaseInKobo = min_purchase ? Math.round(min_purchase * 100) : 0;

    await sql`
      UPDATE discount_codes
      SET code = ${code.toUpperCase()},
          discount_type = ${discount_type},
          discount_value = ${valueInKobo},
          min_purchase = ${minPurchaseInKobo},
          max_uses = ${max_uses || null},
          expires_at = ${expires_at || null}
      WHERE id = ${discountId} AND vendor_id = ${session.user.id}
    `;
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Database Error: Failed to update discount code.",
    };
  }

  revalidatePath("/dashboard/discounts");
  redirect("/dashboard/discounts");
}

export async function validateDiscountAction(
  vendorId: string,
  code: string,
  orderTotal: number,
) {
  await ensureDiscountSchema();
  try {
    return await validateDiscountCode(vendorId, code, orderTotal);
  } catch (err) {
    return { valid: false, error: "Failed to validate code" };
  }
}

// Vendor pickup location action
export async function getVendorPickupLocationAction(vendorId: string) {
  try {
    const { fetchVendorPickupLocation } = await import("@/app/lib/data");
    return await fetchVendorPickupLocation(vendorId);
  } catch (err) {
    console.error("Failed to fetch vendor pickup location:", err);
    return null;
  }
}

// Team management actions
export async function inviteTeamMemberAction(
  vendorId: string,
  prevState: State | undefined,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized" };
  }
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || "Subscription required." };
  }
  try {
    await requireFeature('team_members');
  } catch (e: any) {
    return { message: e.message || "Team management requires Business tier." };
  }

  // Ensure team schema is up to date (idempotent)
  await ensureTeamSchema();

  const emailValue = formData.get("email") as string;
  const role = formData.get("role") as "admin" | "assistant";
  const permissionsStr = formData.get("permissions") as string;

  if (!emailValue || !role) {
    return { message: "Email and role are required." };
  }

  let permissions;
  try {
    permissions = permissionsStr ? JSON.parse(permissionsStr) : { products: true, orders: true, settings: false };
  } catch (err) {
    console.error('Failed to parse permissions:', err, 'Raw value:', permissionsStr);
    permissions = { products: true, orders: true, settings: false };
  }

  try {
    // Check if user already exists
    const [existingUser] = await sql`
      SELECT id, name FROM users WHERE email = ${emailValue}
    `;

    // Check if already a team member
    const [existing] = await sql`
      SELECT id FROM team_members 
      WHERE vendor_id = ${vendorId} AND email = ${emailValue}
    `;

    if (existing) {
      return { message: "This user is already on your team." };
    }

    // Get vendor info for email
    const [vendor] = await sql<{ name: string; store_name: string }[]>`
      SELECT name, store_name FROM users WHERE id = ${vendorId}
    `;

    const storeName = vendor?.store_name || vendor?.name || 'Store';

    if (existingUser) {
      // User exists - add them directly as active
      await sql`
        INSERT INTO team_members (vendor_id, user_id, email, role, permissions, invited_by, status)
        VALUES (${vendorId}, ${existingUser.id}, ${emailValue}, ${role}, ${JSON.stringify(permissions)}, ${session.user.id}, 'active')
      `;

      // Send notification email (fire-and-forget, don't block on email)
      const { sendEmail } = await import('@/app/lib/notifications');
      const roleDisplay = role === 'admin' ? 'Administrator' : 'Assistant';
      const subject = `You've been added to ${storeName}`;
      const text = `Hi ${existingUser.name || 'there'},\n\nYou've been added as a ${roleDisplay} to ${storeName} on Vendle.\n\nYou can now access the dashboard at ${process.env.NEXT_PUBLIC_BASE_URL || 'https://vendle.app'}/dashboard\n\nBest regards,\nThe Vendle Team`;
      
      // Fire and forget in background - truly non-blocking
      Promise.resolve().then(() => {
        sendEmail(emailValue, subject, text).catch(err => {
          console.error('Failed to send team invitation email:', err);
        });
      });
    } else {
      // User doesn't exist - create pending invitation
      await sql`
        INSERT INTO team_members (vendor_id, email, role, permissions, invited_by, status)
        VALUES (${vendorId}, ${emailValue}, ${role}, ${JSON.stringify(permissions)}, ${session.user.id}, 'pending')
      `;

      // Send invitation email (fire-and-forget, don't block on email)
      const { sendEmail } = await import('@/app/lib/notifications');
      const roleDisplay = role === 'admin' ? 'Administrator' : 'Assistant';
      const signupUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vendle.app'}/signup?email=${encodeURIComponent(emailValue)}`;
      const subject = `You've been invited to join ${storeName}`;
      const text = `Hi,\n\nYou've been invited to join ${storeName} as a ${roleDisplay} on Vendle.\n\nTo accept this invitation:\n1. Sign up at: ${signupUrl}\n2. Use this email address: ${emailValue}\n3. Once signed up, you'll automatically have access to the store dashboard\n\nBest regards,\nThe Vendle Team`;
      
      // Fire and forget in background - truly non-blocking
      Promise.resolve().then(() => {
        sendEmail(emailValue, subject, text).catch(err => {
          console.error('Failed to send team invitation email:', err);
        });
      });
    }

    await triggerGuideForEvent(vendorId, "team-member-invited");
    
    // Success!
    revalidatePath("/dashboard/team");
    return { 
      message: "", 
      success: true,
      successMessage: existingUser 
        ? `${emailValue} has been added to your team and notified via email.`
        : `Invitation sent to ${emailValue}. They'll receive an email with signup instructions.`
    };
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Database Error: Failed to invite team member." };
  }
}

export async function removeTeamMemberAction(
  memberId: string,
  prevState: State | undefined,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized" };
  }
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || "Subscription required." };
  }
  try {
    await requireFeature('team_members');
  } catch (e: any) {
    return { message: e.message || "Team management requires Business tier." };
  }

  try {
    await sql`
      DELETE FROM team_members
      WHERE id = ${memberId} AND vendor_id = ${session.user.id}
    `;
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Database Error: Failed to remove team member." };
  }

  revalidatePath("/dashboard/team");
  return { message: null, errors: {} };
}

export async function updateTeamMemberRoleAndPermissionsAction(
  memberId: string,
  prevState: State | undefined,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized" };
  }
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || "Subscription required." };
  }
  try {
    await requireFeature('team_members');
  } catch (e: any) {
    return { message: e.message || "Team management requires Business tier." };
  }

  await ensureTeamSchema();

  const rawRole = formData.get("role") as string | null;
  const rawPermissions = formData.get("permissions");

  if (!rawPermissions) {
    return { message: "Permissions are required." };
  }

  let permissions: { products: boolean; orders: boolean; settings: boolean };
  try {
    permissions = JSON.parse(rawPermissions as string);
  } catch {
    return { message: "Invalid permissions format." };
  }

  if (
    typeof permissions.products !== 'boolean' ||
    typeof permissions.orders !== 'boolean' ||
    typeof permissions.settings !== 'boolean'
  ) {
    return { message: "Each permission must be true or false." };
  }

  try {
    let result;
    if (rawRole === 'admin' || rawRole === 'assistant') {
      result = await sql`
        UPDATE team_members
        SET role = ${rawRole}, permissions = ${sql.json(permissions)}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${memberId} AND vendor_id = ${session.user.id}
        RETURNING id
      `;
    } else {
      result = await sql`
        UPDATE team_members
        SET permissions = ${sql.json(permissions)}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${memberId} AND vendor_id = ${session.user.id}
        RETURNING id
      `;
    }

    if (result.length === 0) {
      return { message: "Team member not found." };
    }
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Database Error: Failed to update permissions." };
  }

  revalidatePath("/dashboard/team");
  return { message: null, errors: {} };
}

// Theme customization action
export async function updateThemeAction(
  prevState: State | undefined,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized" };
  }
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || "Subscription required." };
  }

  try {
    await ensureLogoLayoutColumns();
    const getV = (key: string) => {
      const v = formData.get(key);
      if (v === null || v === "") return undefined;
      return v as string;
    };

    const getBool = (key: string) => {
      const v = formData.get(key);
      return v === "true";
    };

    const parsed = ThemeSchema.safeParse({
      template_id: getV("template_id"),
      primary_color: getV("primary_color"),
      secondary_color: getV("secondary_color"),
      background_color: getV("background_color"),
      text_color: getV("text_color"),
      accent_color: getV("accent_color"),
      surface_color: getV("surface_color"),
      heading_color: getV("heading_color"),
      border_color: getV("border_color"),
      layout_style: getV("layout_style"),
      card_style: getV("card_style"),
      border_radius: getV("border_radius"),
      card_shadow: getV("card_shadow"),
      font_family: getV("font_family"),
      heading_font: getV("heading_font"),
      font_size: getV("font_size"),
      button_style: getV("button_style"),
      button_radius: getV("button_radius"),
      animation_style: getV("animation_style"),
      header_style: getV("header_style"),
      show_product_images: getBool("show_product_images"),
      show_product_description: getBool("show_product_description"),
      image_aspect_ratio: getV("image_aspect_ratio"),
      spacing: getV("spacing"),
      primary_gradient: getV("primary_gradient"),
      glass_effect: getBool("glass_effect"),
      layout_width: getV("layout_width"),
      show_mobile_checkout_bar: getBool("show_mobile_checkout_bar"),
      show_logo: formData.get("show_logo"),
      logo_position: getV("logo_position"),
      logo_frame: getV("logo_frame"),
      logo_url: getV("logo_url"),
      icon_library: getV("icon_library"),
      icon_fill: getV("icon_fill"),
      icon_weight: getV("icon_weight"),
      cart_icon: getV("cart_icon"),
      user_icon: getV("user_icon"),
      share_icon: getV("share_icon"),
      add_icon: getV("add_icon"),
      custom_css: getV("custom_css"),
      sections: getV("sections"),
      section_content: getV("section_content"),
      line_height: getV("line_height"),
      letter_spacing: getV("letter_spacing"),
      text_transform: getV("text_transform"),
      body_font_weight: getV("body_font_weight"),
      heading_font_weight: getV("heading_font_weight"),
      container_width: getV("container_width"),
      design_tokens: getV("design_tokens"),
      secondary_gradient: getV("secondary_gradient"),
      is_publish: getBool("is_publish"),
    });

    if (!parsed.success) {
      console.error(
        "Theme validation error:",
        JSON.stringify(parsed.error.flatten(), null, 2),
      );
      return { message: "Invalid customization values submitted.", errors: {} };
    }

    const { is_publish, ...themeData } = parsed.data;

    // Check if the selected template requires a higher tier
    if (themeData.template_id) {
      const { getTemplateById } = await import('@/app/lib/template-presets');
      const selectedTemplate = getTemplateById(themeData.template_id);
      if (selectedTemplate?.minTier && selectedTemplate.minTier !== 'starter') {
        const { getVendorSubscription } = await import('@/app/lib/subscriptions');
        const vendorSub = await getVendorSubscription(session.user.id);
        const vendorTier = vendorSub?.tier || 'starter';
        const TIER_ORDER = ['starter', 'pro', 'business'] as const;
        const userIdx = TIER_ORDER.indexOf(vendorTier as typeof TIER_ORDER[number]);
        const requiredIdx = TIER_ORDER.indexOf(selectedTemplate.minTier);
        if (userIdx < requiredIdx) {
          return {
            message: `The "${selectedTemplate.name}" theme requires the ${selectedTemplate.minTier === 'pro' ? 'Pro' : 'Business'} plan. Please upgrade to use it.`,
            errors: {},
          };
        }
      }
    }

    if (is_publish) {
      // PUBLISH: Update all columns and clear draft_config
      await sql`
        UPDATE store_theme
        SET 
          template_id = ${themeData.template_id ?? "fresh-market"},
          primary_color = ${themeData.primary_color},
          secondary_color = ${themeData.secondary_color},
          background_color = ${themeData.background_color},
          text_color = ${themeData.text_color},
          accent_color = ${themeData.accent_color},
          surface_color = ${themeData.surface_color ?? "#ffffff"},
          heading_color = ${themeData.heading_color ?? "#0f172a"},
          border_color = ${themeData.border_color ?? "#e2e8f0"},
          layout_style = ${themeData.layout_style},
          card_style = ${themeData.card_style},
          border_radius = ${themeData.border_radius},
          card_shadow = ${themeData.card_shadow ?? "soft"},
          button_style = ${themeData.button_style ?? "solid"},
          button_radius = ${themeData.button_radius ?? "rounded"},
          animation_style = ${themeData.animation_style ?? "fade"},
          font_family = ${themeData.font_family},
          heading_font = ${themeData.heading_font},
          font_size = ${themeData.font_size},
          header_style = ${themeData.header_style},
          show_product_images = ${themeData.show_product_images},
          show_product_description = ${themeData.show_product_description},
          image_aspect_ratio = ${themeData.image_aspect_ratio},
          spacing = ${themeData.spacing},
          show_logo = ${themeData.show_logo},
          logo_position = ${themeData.logo_position},
          logo_frame = ${themeData.logo_frame},
          logo_url = ${themeData.logo_url},
          icon_library = ${themeData.icon_library},
          icon_fill = ${themeData.icon_fill},
          icon_weight = ${themeData.icon_weight},
          cart_icon = ${themeData.cart_icon},
          user_icon = ${themeData.user_icon},
          share_icon = ${themeData.share_icon},
          add_icon = ${themeData.add_icon},
          custom_css = ${themeData.custom_css ?? null},
          primary_gradient = ${themeData.primary_gradient ?? null},
          glass_effect = ${themeData.glass_effect ?? false},
          layout_width = ${themeData.layout_width ?? "wide"},
          show_mobile_checkout_bar = ${themeData.show_mobile_checkout_bar ?? false},
          sections = ${themeData.sections ?? "[]"},
          section_content = ${themeData.section_content ?? "{}"},
          line_height = ${themeData.line_height ?? null},
          letter_spacing = ${themeData.letter_spacing ?? null},
          text_transform = ${themeData.text_transform ?? null},
          body_font_weight = ${themeData.body_font_weight ?? null},
          heading_font_weight = ${themeData.heading_font_weight ?? null},
          container_width = ${themeData.container_width ?? null},
          design_tokens = ${themeData.design_tokens ?? null},
          secondary_gradient = ${themeData.secondary_gradient ?? null},
          draft_config = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE vendor_id = ${session.user.id}
      `;
    } else {
      // SAVE DRAFT: Only update draft_config
      const draftConfig = JSON.stringify(themeData);
      await sql`
        UPDATE store_theme
        SET 
          draft_config = ${draftConfig},
          updated_at = CURRENT_TIMESTAMP
        WHERE vendor_id = ${session.user.id}
      `;
    }

    revalidatePath("/dashboard/customize");
    const [slugRow] = await sql<{ store_slug: string }[]>`
      SELECT store_slug FROM users WHERE id = ${session.user.id} LIMIT 1
    `;
    if (slugRow?.store_slug) {
      revalidatePath(`/s/${slugRow.store_slug}`);
    }

    return {
      message: is_publish
        ? "Theme published successfully!"
        : "Draft saved successfully!",
      errors: {},
    };
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Database Error: Failed to update theme." };
  }
}

export async function deleteStore() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized.");
  }

  // Block team members from deleting the store — only the actual owner can
  if ((session.user as any).teamMemberId) {
    throw new Error("Only the store owner can delete the store.");
  }

  const vendorId = session.user.id;

  try {
    // 1. Fetch all products to delete images from Cloudinary
    const products =
      await sql`SELECT image_url, gallery_images FROM products WHERE vendor_id = ${vendorId}`;
    for (const product of products) {
      try {
        if (product.image_url) {
          await deleteCloudinaryImage(product.image_url);
        }
        const gallery: string[] = JSON.parse(product.gallery_images || "[]");
        if (gallery.length > 0) {
          await deleteCloudinaryImages(gallery);
        }
      } catch (e) {
        // Best-effort cleanup: a Cloudinary failure should not block deleting the store.
        console.error("Cloudinary cleanup error (product):", e);
      }
    }

    // 2. Fetch theme to delete logo
    const [theme] =
      await sql`SELECT logo_url FROM store_theme WHERE vendor_id = ${vendorId}`;
    if (theme?.logo_url) {
      try {
        await deleteCloudinaryImage(theme.logo_url);
      } catch (e) {
        console.error("Cloudinary cleanup error (logo):", e);
      }
    }

    // 3. Delete everything associated with the vendor
    // Note: We use a transaction to ensure all or nothing
    await sql.begin(async (sql) => {
      // Optional tables (may not exist in older DBs) - delete best-effort.
      try {
        await sql`DELETE FROM vendor_subscription_payments WHERE vendor_id = ${vendorId}`;
      } catch (e) {
        console.error("Delete vendor_subscription_payments error:", e);
      }

      try {
        await sql`DELETE FROM team_members WHERE vendor_id = ${vendorId} OR user_id = ${vendorId}`;
      } catch (e) {
        console.error("Delete team_members error:", e);
      }

      await sql`DELETE FROM products WHERE vendor_id = ${vendorId}`;
      await sql`DELETE FROM orders WHERE vendor_id = ${vendorId}`;
      await sql`DELETE FROM store_theme WHERE vendor_id = ${vendorId}`;
      await sql`DELETE FROM store_analytics WHERE vendor_id = ${vendorId}`;
      try {
        await sql`DELETE FROM discount_codes WHERE vendor_id = ${vendorId}`;
      } catch (e) {
        console.error("Delete discount_codes error:", e);
      }
      await sql`DELETE FROM users WHERE id = ${vendorId}`;
    });
  } catch (error: any) {
    console.error("Database Error during store deletion:", error);
    throw new Error(
      `Failed to delete store: ${error?.message || String(error)}`,
    );
  }

  // 4. Sign out
  await signOut({ redirectTo: "/" });
}
