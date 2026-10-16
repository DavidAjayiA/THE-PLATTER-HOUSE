/* ==============================================================================
 * THE PLATTER HOUSE — CENTRAL CONFIGURATION
 * ==============================================================================
 * Manage your business contact details, email dispatches, and Paystack payment
 * credentials in this single file.
 * ============================================================================== */

// Store Information
export const STORE_NAME = "The Platter House";
export const STORE_TAGLINE = "Bespoke Nigerian Catering, Small Chops & Luxe Platters";

// Business Receiving Email (Where seller gets notified about new paid orders)
// ⚠️ To receive real emails, replace this with your active email address.
// FormSubmit will send you a one-time activation confirmation on your first order.
export const BUSINESS_EMAIL = "hello@theplatterhouse.com";

// Business WhatsApp Phone Number (International format without '+', spaces, or leading zeros)
// Example: Nigeria 07065058196 -> "2347065058196"
export const BUSINESS_WHATSAPP_PHONE = "2347065058196";
export const BUSINESS_PHONE_DISPLAY = "+234 706 505 8196";

// Business Pickup Address
export const BUSINESS_PICKUP_ADDRESS = "Plot 14, Admiralty Way, Lekki Phase 1, Lagos, Nigeria";

// Fixed Delivery Fee in Naira
export const DELIVERY_FEE = 5000;

// Paystack Public Key
// Get your test or live public key from: https://dashboard.paystack.com/#/settings/developer
// Test keys start with "pk_test_...", live keys start with "pk_live_..."
export const PAYSTACK_PUBLIC_KEY = "pk_test_89f7f07020c3ff8ef32922590af98e98ef77a9ad";

// Direct Bank Transfer Fallback Details
export const BANK_DETAILS = {
  bankName: "Guaranty Trust Bank (GTBank)",
  accountNumber: "0123456789",
  accountName: "The Platter House Catering Services",
};

// Vendor Security Access PIN (Change this anytime to your private code)
export const ADMIN_PIN = "1234";


