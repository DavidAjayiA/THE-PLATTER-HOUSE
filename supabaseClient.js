import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

// Check if credentials are valid
export const isSupabaseConfigured =
  Boolean(SUPABASE_URL) &&
  Boolean(SUPABASE_ANON_KEY) &&
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("your-supabase");

// Initialize client
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/* ==============================================================================
 * ORDERS SERVICE
 * ============================================================================== */

/**
 * Insert a new paid / pending order into Supabase
 */
export async function createSupabaseOrder(order) {
  if (!supabase) return null;

  try {
    const payload = {
      order_number: order.orderNumber,
      customer_name: order.customerName,
      phone: order.phone,
      email: order.email || null,
      fulfillment_type: order.fulfillmentType || "delivery",
      address: order.address || null,
      preferred_date: order.preferredDate || null,
      notes: order.notes || null,
      items: order.items || [],
      subtotal: Number(order.subtotal) || 0,
      delivery_fee: Number(order.deliveryFee) || 0,
      total_amount: Number(order.totalAmount) || 0,
      payment_method: order.paymentMethod || "paystack",
      payment_status: order.paymentStatus || "paid",
      payment_reference: order.paymentReference || null,
      order_status: order.orderStatus || "confirmed",
      status_history: order.statusHistory || [
        {
          stage: order.orderStatus || "confirmed",
          timestamp: new Date().toISOString(),
          note: "Order created successfully",
        },
      ],
    };

    const { data, error } = await supabase
      .from("orders")
      .upsert([payload], { onConflict: "order_number" })
      .select()
      .single();

    if (error) {
      console.warn("Supabase order insert warning:", error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn("Supabase network error creating order:", err);
    return null;
  }
}

/**
 * Fetch all orders from Supabase (for Admin Dashboard)
 */
export async function fetchSupabaseOrders() {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error fetching Supabase orders:", error.message);
      return null;
    }

    // Map table schema back to app camelCase properties
    return (data || []).map(mapOrderRowToApp);
  } catch (err) {
    console.warn("Supabase network error fetching orders:", err);
    return null;
  }
}

/**
 * Fetch a single order by its orderNumber (for Order Tracking)
 */
export async function fetchSupabaseOrderByNumber(orderNumber) {
  if (!supabase || !orderNumber) return null;

  try {
    const cleanNum = orderNumber.trim().toUpperCase();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .ilike("order_number", cleanNum)
      .maybeSingle();

    if (error) {
      console.warn("Error fetching single order:", error.message);
      return null;
    }

    return data ? mapOrderRowToApp(data) : null;
  } catch (err) {
    console.warn("Supabase network error fetching order:", err);
    return null;
  }
}

/**
 * Update an order's fulfillment status (for Admin Dashboard)
 */
export async function updateSupabaseOrderStatus(orderNumber, newStatus) {
  if (!supabase || !orderNumber) return null;

  try {
    // First get existing history
    const existing = await fetchSupabaseOrderByNumber(orderNumber);
    const updatedHistory = existing?.statusHistory ? [...existing.statusHistory] : [];
    updatedHistory.push({
      stage: newStatus,
      timestamp: new Date().toISOString(),
      note: `Status updated to ${newStatus}`,
    });

    const { data, error } = await supabase
      .from("orders")
      .update({
        order_status: newStatus,
        status_history: updatedHistory,
      })
      .ilike("order_number", orderNumber.trim().toUpperCase())
      .select()
      .single();

    if (error) {
      console.warn("Error updating Supabase order status:", error.message);
      return null;
    }

    return data ? mapOrderRowToApp(data) : null;
  } catch (err) {
    console.warn("Supabase error updating status:", err);
    return null;
  }
}

/**
 * Real-time subscription to orders table
 * Automatically triggers callback on new orders or status updates
 */
export function subscribeToSupabaseOrders(onOrderChange) {
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel("realtime-orders-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.new) {
            onOrderChange({
              eventType: payload.eventType, // 'INSERT' | 'UPDATE' | 'DELETE'
              order: mapOrderRowToApp(payload.new),
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn("Failed to subscribe to Supabase orders realtime:", err);
    return () => {};
  }
}

/* ==============================================================================
 * PRODUCTS (MENU) SERVICE
 * ============================================================================== */

/**
 * Fetch all products from Supabase
 */
export async function fetchSupabaseProducts() {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Error fetching Supabase products:", error.message);
      return null;
    }

    return (data || []).map((row) => ({
      id: row.id,
      name: row.title,
      title: row.title,
      category: row.category,
      price: Number(row.price),
      inStock: row.in_stock ?? true,
      description: row.description || "",
      image: row.image || "",
      serves: row.serves || "",
    }));
  } catch (err) {
    console.warn("Supabase network error fetching products:", err);
    return null;
  }
}

/**
 * Upsert (save/update) product in Supabase
 */
export async function upsertSupabaseProduct(prod) {
  if (!supabase) return null;

  try {
    const payload = {
      id: String(prod.id),
      title: prod.name || prod.title || "Dish",
      category: prod.category || "Small Chops",
      price: Number(prod.price) || 0,
      in_stock: prod.inStock ?? true,
      description: prod.description || "",
      image: prod.image || "",
      serves: prod.serves || "",
    };

    const { data, error } = await supabase
      .from("products")
      .upsert([payload])
      .select()
      .single();

    if (error) {
      console.warn("Error upserting Supabase product:", error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn("Supabase error upserting product:", err);
    return null;
  }
}

/**
 * Delete product from Supabase
 */
export async function deleteSupabaseProduct(productId) {
  if (!supabase || !productId) return false;

  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", String(productId));

    return !error;
  } catch (err) {
    console.warn("Supabase error deleting product:", err);
    return false;
  }
}

/**
 * Real-time subscription to products table
 */
export function subscribeToSupabaseProducts(onProductChange) {
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel("realtime-products-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          onProductChange({
            eventType: payload.eventType,
            product: payload.new
              ? {
                  id: payload.new.id,
                  name: payload.new.title,
                  title: payload.new.title,
                  category: payload.new.category,
                  price: Number(payload.new.price),
                  inStock: payload.new.in_stock ?? true,
                  description: payload.new.description || "",
                  image: payload.new.image || "",
                  serves: payload.new.serves || "",
                }
              : null,
            deletedId: payload.old?.id,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn("Failed to subscribe to products realtime:", err);
    return () => {};
  }
}

/* ==============================================================================
 * HELPER: Mapper from DB row to App Model
 * ============================================================================== */
function mapOrderRowToApp(row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email || "",
    fulfillmentType: row.fulfillment_type || "delivery",
    address: row.address || "",
    preferredDate: row.preferred_date || "",
    notes: row.notes || "",
    items: row.items || [],
    subtotal: Number(row.subtotal) || 0,
    deliveryFee: Number(row.delivery_fee) || 0,
    totalAmount: Number(row.total_amount) || 0,
    paymentMethod: row.payment_method || "paystack",
    paymentStatus: row.payment_status || "paid",
    paymentReference: row.payment_reference || "",
    orderStatus: row.order_status || "confirmed",
    statusHistory: row.status_history || [],
  };
}
