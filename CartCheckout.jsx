import { useState, useMemo, useEffect } from "react";
import { useCart } from "./CartContext.jsx";
import {
  STORE_NAME,
  BUSINESS_EMAIL,
  BUSINESS_WHATSAPP_PHONE,
  DELIVERY_FEE,
  PAYSTACK_PUBLIC_KEY,
  BANK_DETAILS,
} from "./config.js";
import { createSupabaseOrder } from "./supabaseClient.js";

import assortedSmallChopsImg from "./IMG/assorted small chops.jpg";
import smallChops100Img from "./IMG/small chops assorted.jpg";
import sc2Img from "./IMG/SC2.jpg";
import chickenSkewersImg from "./IMG/chicken skiwer platter.jpg";
import puffPuffImg from "./IMG/puff puff.jpg";
import springRollSamosaImg from "./IMG/spring roll & samosa.jpg";
import meatPieImg from "./IMG/meat pie.jpg";
import chinChinImg from "./IMG/chin chin.jpg";
import birthdayCakeImg from "./IMG/birthday cake.jpg";
import platter1Img from "./IMG/platter1.jpg";
import platter3Img from "./IMG/platter3.jpg";
import brandLogo from "./IMG/the_platter_house_hq.jpg";

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@400;500;600&display=swap');
  .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
  .font-body { font-family: 'Work Sans', sans-serif; }
`;

const NAV_LINKS = [
  { label: "Shop", href: "#shop" },
  { label: "Collections", href: "#collections" },
  { label: "Events & Catering", href: "#events" },
  { label: "Track Order", href: "#track" },
];

const PRODUCT_IMAGES = {
  // Small Chops
  "Spring Roll & Samosa Mix (40pc)": springRollSamosaImg,
  "Puff-Puff & Chin Chin Mix": puffPuffImg,
  "Puff-Puff": puffPuffImg,
  "Chicken Skewer Platter (30pc)": chickenSkewersImg,
  "Assorted Small Chops (100pc)": smallChops100Img,

  // Platters & Trays
  "Jollof Rice Party Tray": "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80",
  "Small Chops Platter (50pc)": sc2Img,
  "Swallow & Soup Combo Tray": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  "Grilled Fish & Peppered Sauce Tray": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",

  // Pastries & Desserts
  "Meat Pie Box (24pc)": meatPieImg,
  "Chin Chin, Family Pack": chinChinImg,
  "Birthday Cake, 2-Tier": birthdayCakeImg,
  "Wedding Cake, 3-Tier": "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80",

  // Event Packages
  "Intimate Gathering Package (20 guests)": platter1Img,
  "Classic Wedding Package (100 guests)": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
  "Corporate Lunch Package (50 guests)": platter3Img,
};

function getProductImage(item) {
  if (item.image) return item.image;
  if (PRODUCT_IMAGES[item.name]) return PRODUCT_IMAGES[item.name];
  if (item.category === "Small Chops") return springRollSamosaImg;
  if (item.category === "Platters & Trays") return sc2Img;
  if (item.category === "Pastries & Desserts") return meatPieImg;
  if (item.category === "Event Packages") return platter1Img;
  return assortedSmallChopsImg;
}

function formatNaira(amount) {
  return `₦${(amount || 0).toLocaleString("en-NG")}`;
}

export default function CartCheckoutPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart, cartCount, updateQty, removeItem, clearCart, saveOrder, updateOrderStatus } = useCart();
  const [fulfillment, setFulfillment] = useState(() => {
    try {
      return sessionStorage.getItem("tph_checkout_fulfillment") || "delivery";
    } catch {
      return "delivery";
    }
  });

  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem("tph_checkout_form");
      return saved ? JSON.parse(saved) : {
        name: "",
        phone: "",
        email: "",
        address: "",
        preferredDate: "",
        notes: "",
      };
    } catch {
      return {
        name: "",
        phone: "",
        email: "",
        address: "",
        preferredDate: "",
        notes: "",
      };
    }
  });

  // Sync form inputs to sessionStorage so customer details are never lost if they return to shop
  useEffect(() => {
    try {
      sessionStorage.setItem("tph_checkout_form", JSON.stringify(form));
      sessionStorage.setItem("tph_checkout_fulfillment", fulfillment);
    } catch {}
  }, [form, fulfillment]);

  // Flow steps: "form" -> "payment" -> "success"
  const [checkoutStep, setCheckoutStep] = useState("form");
  const [placing, setPlacing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("card"); // "card" | "transfer" | "ussd" | "manual_bank" | "simulation"
  const [keyNotice, setKeyNotice] = useState(false);

  // Email dispatch status states
  const [customerEmailStatus, setCustomerEmailStatus] = useState("idle"); // "idle" | "sending" | "sent" | "error"
  const [sellerEmailStatus, setSellerEmailStatus] = useState("idle");     // "idle" | "sending" | "sent" | "error"
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedBank, setCopiedBank] = useState(false);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);
  const deliveryFee = fulfillment === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  function showToast(message) {
    setToastMessage(message);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToastMessage(null), 2500);
  }

  function handleUpdateQty(id, delta) {
    updateQty(id, delta);
    showToast(delta > 0 ? "Quantity increased" : "Quantity updated");
  }

  function handleRemoveItem(id) {
    removeItem(id);
    showToast("Item removed from cart");
  }

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  const canPlaceOrder =
    cart.length > 0 &&
    form.name.trim() &&
    form.phone.trim() &&
    form.email.trim() &&
    (fulfillment === "pickup" || form.address.trim());

  // Step 1: Create Order in "Pending Payment" state and transition to Payment Screen
  function handleInitiateOrder(e) {
    e.preventDefault();
    if (!canPlaceOrder) return;
    setPlacing(true);

    const orderNumber = "TPH-" + Math.floor(10000 + Math.random() * 90000);
    const placedOn = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newOrder = {
      orderNumber,
      placedOn,
      customerName: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      fulfillment: fulfillment === "delivery" ? "Delivery" : "Pickup",
      address: fulfillment === "delivery" ? form.address.trim() : "Lekki Phase 1, Lagos (Self Pickup)",
      preferredDate: form.preferredDate.trim() || "Immediate / Standard Delivery",
      notes: form.notes.trim(),
      items: cart.map((item) => ({ ...item })),
      subtotal,
      deliveryFee,
      total,
      status: "Pending Payment",
      paymentStatus: "Unpaid",
      isPaid: false,
      paymentMethod: "Pending",
      currentStageIndex: 0,
    };

    // Save order into persistent storage
    saveOrder(newOrder);
    setPlacedOrder(newOrder);

    // Sync to Supabase cloud database
    createSupabaseOrder({
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      phone: newOrder.phone,
      email: newOrder.email,
      fulfillmentType: newOrder.fulfillment,
      address: newOrder.address,
      preferredDate: newOrder.preferredDate,
      notes: newOrder.notes,
      items: newOrder.items,
      subtotal: newOrder.subtotal,
      deliveryFee: newOrder.deliveryFee,
      totalAmount: newOrder.total,
      paymentMethod: "Pending",
      paymentStatus: "unpaid",
      orderStatus: "pending",
    }).catch(() => {});

    // Keep cart items safely in state/storage until payment is actually verified!

    setTimeout(() => {
      setPlacing(false);
      setCheckoutStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 500);
  }

  // Dual Email Dispatch Function (Dispatches to both Customer and Seller via FormSubmit)
  async function dispatchDualConfirmationEmails(order, paymentRef, methodLabel) {
    setCustomerEmailStatus("sending");
    setSellerEmailStatus("sending");

    const itemsSummary = order.items
      .map((it) => `• ${it.name} (x${it.qty}) — ${formatNaira(it.price * it.qty)}`)
      .join("\n");

    // 1. Customer Email Payload
    const customerPayload = {
      _subject: `Payment Confirmed: Order #${order.orderNumber} — ${STORE_NAME}`,
      "Order Number": order.orderNumber,
      "Order Status": "PAID & CONFIRMED",
      "Customer Name": order.customerName,
      "Payment Method": `${methodLabel} (Ref: ${paymentRef})`,
      "Amount Paid": formatNaira(order.total),
      "Fulfillment Method": order.fulfillment,
      "Delivery / Pickup Address": order.address,
      "Preferred Date": order.preferredDate,
      "Items Ordered": itemsSummary,
      "Subtotal": formatNaira(order.subtotal),
      "Delivery Fee": formatNaira(order.deliveryFee),
      "Total Paid": formatNaira(order.total),
      "Order Notes": order.notes || "None",
      "Tracking Info": `Track your live order status anytime at: ${window.location.origin}${window.location.pathname}#track (Order ID: ${order.orderNumber})`,
      _template: "table",
      _captcha: "false",
    };

    // 2. Seller (Business Owner) Email Payload
    const sellerPayload = {
      _subject: `[NEW PAID ORDER] #${order.orderNumber} — ${formatNaira(order.total)} — ${STORE_NAME}`,
      "Order Status": "PAID & READY FOR PREPARATION",
      "Order Number": order.orderNumber,
      "Total Amount Paid": formatNaira(order.total),
      "Payment Reference": paymentRef,
      "Payment Gateway": methodLabel,
      "Customer Name": order.customerName,
      "Customer Phone": order.phone,
      "Customer Email": order.email,
      "Fulfillment Type": order.fulfillment,
      "Delivery Destination": order.address,
      "Requested Date": order.preferredDate,
      "Special Instructions": order.notes || "None",
      "Line Items": itemsSummary,
      "Subtotal": formatNaira(order.subtotal),
      "Delivery Fee": formatNaira(order.deliveryFee),
      "Grand Total": formatNaira(order.total),
      _template: "table",
      _captcha: "false",
    };

    // Dispatch to Customer
    try {
      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(order.email.trim())}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(customerPayload),
      })
        .then((res) => setCustomerEmailStatus(res.ok ? "sent" : "ready"))
        .catch(() => setCustomerEmailStatus("ready"));
    } catch {
      setCustomerEmailStatus("ready");
    }

    // Dispatch to Seller / Kitchen Desk
    try {
      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(BUSINESS_EMAIL.trim())}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(sellerPayload),
      })
        .then((res) => setSellerEmailStatus(res.ok ? "sent" : "ready"))
        .catch(() => setSellerEmailStatus("ready"));
    } catch {
      setSellerEmailStatus("ready");
    }
  }

  // Handle Successful Payment
  function handlePaymentSuccess(paymentRef, methodLabel) {
    if (!placedOrder) return;

    const paidOrder = {
      ...placedOrder,
      status: "Paid • Order Confirmed",
      paymentStatus: "Paid",
      isPaid: true,
      paymentReference: paymentRef,
      paymentMethod: methodLabel,
      currentStageIndex: 1, // "Order Confirmed" in tracking
      paidAt: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setPlacedOrder(paidOrder);
    updateOrderStatus(paidOrder.orderNumber, paidOrder);

    // Sync paid order to Supabase cloud database
    createSupabaseOrder({
      orderNumber: paidOrder.orderNumber,
      customerName: paidOrder.customerName,
      phone: paidOrder.phone,
      email: paidOrder.email,
      fulfillmentType: paidOrder.fulfillment,
      address: paidOrder.address,
      preferredDate: paidOrder.preferredDate,
      notes: paidOrder.notes,
      items: paidOrder.items,
      subtotal: paidOrder.subtotal,
      deliveryFee: paidOrder.deliveryFee,
      totalAmount: paidOrder.total,
      paymentMethod: methodLabel,
      paymentStatus: "paid",
      paymentReference: paymentRef,
      orderStatus: "confirmed",
    }).catch(() => {});
    clearCart(); // Cleanly empty the cart now that payment is approved
    try {
      sessionStorage.removeItem("tph_checkout_form");
      sessionStorage.removeItem("tph_checkout_fulfillment");
    } catch {}
    setCheckoutStep("success");
    setPaying(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Trigger dual email alerts
    dispatchDualConfirmationEmails(paidOrder, paymentRef, methodLabel);
  }

  // Trigger Paystack Inline Gateway
  function handlePaystackPayment(preferredChannel) {
    if (!placedOrder) return;
    setPaying(true);

    const hasPaystackScript = typeof window !== "undefined" && window.PaystackPop;
    const isPlaceholderKey = !PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY.includes("xxxx");

    if (!hasPaystackScript) {
      alert("Paystack library is loading. Please check your internet connection or use Simulation Mode.");
      setPaying(false);
      return;
    }

    if (isPlaceholderKey) {
      setKeyNotice(true);
      setPaying(false);
      return;
    }

    try {
      const channelConfig = preferredChannel === "card"
        ? ["card"]
        : preferredChannel === "transfer"
        ? ["bank_transfer", "bank"]
        : preferredChannel === "ussd"
        ? ["ussd"]
        : ["card", "bank_transfer", "ussd"];

      const methodDesc = preferredChannel === "card"
        ? "Paystack (Debit Card)"
        : preferredChannel === "transfer"
        ? "Paystack (Bank Transfer)"
        : preferredChannel === "ussd"
        ? "Paystack (USSD)"
        : "Paystack (Online)";

      const txRef = `${placedOrder.orderNumber}_${Date.now()}`;
      const metadata = {
        custom_fields: [
          { display_name: "Customer Name", variable_name: "customer_name", value: placedOrder.customerName },
          { display_name: "Order Number", variable_name: "order_number", value: placedOrder.orderNumber },
          { display_name: "Phone Number", variable_name: "phone_number", value: placedOrder.phone },
          { display_name: "Fulfillment", variable_name: "fulfillment", value: placedOrder.fulfillment },
          { display_name: "Address", variable_name: "address", value: placedOrder.address },
        ],
      };

      // Check if Paystack v2 or v1
      if (typeof window.PaystackPop?.setup === "function") {
        // Paystack Inline v1
        const handler = window.PaystackPop.setup({
          key: PAYSTACK_PUBLIC_KEY,
          email: placedOrder.email,
          amount: Math.round(placedOrder.total * 100), // Amount in Kobo
          currency: "NGN",
          channels: channelConfig,
          ref: txRef,
          metadata: metadata,
          callback: function (response) {
            // STRICT VERIFICATION: Ensure the transaction actually succeeded and wasn't cancelled or aborted
            const isApproved = response && (
              response.status === "success" ||
              response.message === "Approved" ||
              (response.reference && response.status !== "cancelled" && response.status !== "failed")
            );

            if (isApproved && response.status !== "cancelled") {
              handlePaymentSuccess(response.reference || response.trxref || txRef, methodDesc);
            } else {
              setPaying(false);
              showToast("Payment was not completed.");
            }
          },
          onClose: function () {
            setPaying(false);
            showToast("Payment window closed. Order was not charged.");
          },
        });

        handler.openIframe();
      } else if (typeof window.PaystackPop === "function") {
        // Paystack Inline v2
        const paystack = new window.PaystackPop();
        paystack.newTransaction({
          key: PAYSTACK_PUBLIC_KEY,
          email: placedOrder.email,
          amount: Math.round(placedOrder.total * 100),
          currency: "NGN",
          channels: channelConfig,
          reference: txRef,
          metadata: metadata,
          onSuccess: (transaction) => {
            handlePaymentSuccess(transaction.reference || txRef, methodDesc);
          },
          onCancel: () => {
            setPaying(false);
            showToast("Payment was cancelled.");
          },
          onError: (err) => {
            console.error("Paystack error:", err);
            setPaying(false);
            alert("Paystack error: " + (err?.message || "Invalid public key or transaction could not be started."));
          },
          onClose: () => {
            setPaying(false);
            showToast("Payment window closed. Order was not charged.");
          },
        });
      } else {
        throw new Error("PaystackPop is not available");
      }
    } catch (err) {
      console.error("Paystack error:", err);
      alert("Unable to open Paystack modal: " + (err?.message || "Please check your internet connection or use Simulation mode."));
      setPaying(false);
    }
  }

  // Quick Test Payment Simulation
  function handleSimulatedPayment(channelLabel) {
    setPaying(true);
    setTimeout(() => {
      const simRef = `SIM_PAY_${Math.floor(100000 + Math.random() * 900000)}`;
      handlePaymentSuccess(simRef, `⚡ Simulated Payment (${channelLabel || "Demo Mode"})`);
    }, 600);
  }

  // Manual GTBank Transfer Confirmation
  function handleManualTransferConfirm() {
    if (!placedOrder) return;
    setPaying(true);

    const manualRef = `GTB_TRF_${placedOrder.orderNumber}`;
    const manualOrder = {
      ...placedOrder,
      status: "Pending Transfer Verification",
      paymentStatus: "Pending Transfer",
      isPaid: false,
      paymentReference: manualRef,
      paymentMethod: "Direct GTBank Transfer (Proof on WhatsApp)",
      currentStageIndex: 0,
      paidAt: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setPlacedOrder(manualOrder);
    updateOrderStatus(manualOrder.orderNumber, manualOrder);
    clearCart();
    try {
      sessionStorage.removeItem("tph_checkout_form");
      sessionStorage.removeItem("tph_checkout_fulfillment");
    } catch {}
    setCheckoutStep("success");
    setPaying(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Send dual emails for manual transfer
    dispatchDualConfirmationEmails(manualOrder, manualRef, "Direct GTBank Transfer (Pending Proof)");

    // Open WhatsApp prefilled with receipt message
    const whatsappText = encodeURIComponent(
      `Hello ${STORE_NAME}! I just made a direct bank transfer for my catering order:\n\n` +
      `*Order Number:* ${manualOrder.orderNumber}\n` +
      `*Amount Transferred:* ${formatNaira(manualOrder.total)}\n` +
      `*Customer:* ${manualOrder.customerName} (${manualOrder.phone})\n` +
      `*Fulfillment:* ${manualOrder.fulfillment}\n` +
      `*Address:* ${manualOrder.address}\n\n` +
      `I am attaching my payment receipt proof below. Please confirm and begin preparation!`
    );

    window.open(`https://wa.me/${BUSINESS_WHATSAPP_PHONE.replace(/[^0-9]/g, "")}?text=${whatsappText}`, "_blank");
  }

  function handleCopyBank() {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopiedBank(true);
    showToast("Account number copied!");
    setTimeout(() => setCopiedBank(false), 2000);
  }

  // ---------------------------------------------------------------------------
  // RENDER: STEP 3 (SUCCESSFUL PAYMENT CONFIRMATION)
  // ---------------------------------------------------------------------------
  if (checkoutStep === "success" && placedOrder) {
    const mailtoSubject = encodeURIComponent(`Order Receipt #${placedOrder.orderNumber} — ${STORE_NAME}`);
    const mailtoBody = encodeURIComponent(
      `Hello ${placedOrder.customerName},\n\n` +
      `Thank you for ordering with ${STORE_NAME}!\n\n` +
      `RECEIPT DETAILS:\n` +
      `Order Number: ${placedOrder.orderNumber}\n` +
      `Payment Reference: ${placedOrder.paymentReference}\n` +
      `Amount Paid: ${formatNaira(placedOrder.total)}\n` +
      `Status: ${placedOrder.status}\n` +
      `Fulfillment: ${placedOrder.fulfillment}\n` +
      `Destination: ${placedOrder.address}\n\n` +
      `ITEMS:\n` +
      placedOrder.items.map((it) => `• ${it.name} x${it.qty} = ${formatNaira(it.price * it.qty)}`).join("\n")
    );

    const whatsappText = encodeURIComponent(
      `Hello ${STORE_NAME}! I just completed payment for my order:\n\n` +
      `*Order Number:* ${placedOrder.orderNumber}\n` +
      `*Amount Paid:* ${formatNaira(placedOrder.total)}\n` +
      `*Payment Ref:* ${placedOrder.paymentReference}\n` +
      `*Customer:* ${placedOrder.customerName} (${placedOrder.phone})\n` +
      `*Fulfillment:* ${placedOrder.fulfillment}\n` +
      `*Address:* ${placedOrder.address}\n\n` +
      `*Items:*\n` +
      placedOrder.items.map((it) => `• ${it.name} x${it.qty}`).join("\n") + "\n\n" +
      `Kindly confirm receipt and begin preparation!`
    );

    return (
      <div className="font-body min-h-screen py-12 px-4 sm:px-6" style={{ backgroundColor: "#F6F2EB", color: "#201D1B" }}>
        <style>{FONT_IMPORT}</style>

        <div className="max-w-2xl mx-auto">
          {/* Green Checkmark Badge */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-md transition-transform transform scale-105"
              style={{ backgroundColor: "#2E7D32", color: "#F6F2EB" }}
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-[#2E7D32]">
              Payment Verified • Order Confirmed
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-2 text-[#201D1B]">
              Payment Successful!
            </h1>
            <p className="text-sm text-[#4A4642] max-w-md mx-auto">
              Your payment of <strong className="text-[#201D1B] font-semibold">{formatNaira(placedOrder.total)}</strong> was
              successful. We are now preparing your catering order.
            </p>
          </div>

          {/* Dual Email Dispatch Status Banner */}
          <div className="mb-6 p-4 rounded-sm border bg-[#FBF9F5] border-[#E4DED2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-[#201D1B]">Automated Confirmation Dispatched</p>
                <div className="text-xs text-[#4A4642] mt-0.5 space-y-0.5">
                  <p>
                    • Customer receipt sent to: <strong className="text-[#201D1B]">{placedOrder.email}</strong>{" "}
                    <span className="text-[#2E7D32] font-medium">({customerEmailStatus === "sent" ? "Delivered" : "Queued"})</span>
                  </p>
                  <p>
                    • Kitchen desk alert sent to: <strong className="text-[#201D1B]">{BUSINESS_EMAIL}</strong>{" "}
                    <span className="text-[#2E7D32] font-medium">({sellerEmailStatus === "sent" ? "Delivered" : "Queued"})</span>
                  </p>
                </div>
              </div>
            </div>
            <a
              href={`mailto:${placedOrder.email}?subject=${mailtoSubject}&body=${mailtoBody}`}
              className="text-xs px-3 py-1.5 rounded-sm font-medium border border-[#201D1B] hover:bg-[#201D1B] hover:text-[#F6F2EB] transition-colors whitespace-nowrap self-end sm:self-center"
            >
              Open Email App
            </a>
          </div>

          {/* WhatsApp Direct Notification */}
          <div className="mb-6 p-4 rounded-sm flex items-center justify-between gap-4 text-sm border bg-[#EAF7ED] border-[#B2DFDB]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#25D366]/20 text-[#1B5E20] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-[#1B5E20]">Direct WhatsApp Confirmation</p>
                <p className="text-xs text-[#2E7D32]">Send payment reference to our kitchen dispatch desk.</p>
              </div>
            </div>
            <a
              href={`https://wa.me/${BUSINESS_WHATSAPP_PHONE.replace(/[^0-9]/g, "")}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3.5 py-2 rounded-sm font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: "#25D366" }}
            >
              WhatsApp Us
            </a>
          </div>

          {/* Receipt Card */}
          <div className="p-6 sm:p-8 rounded-sm shadow-sm border mb-8 bg-[#FBF9F5] border-[#E4DED2]">
            <div className="flex flex-wrap justify-between items-start pb-6 mb-6 border-b border-[#E4DED2]">
              <div className="flex items-start gap-3">
                <img
                  src={brandLogo}
                  alt={STORE_NAME}
                  className="w-12 h-12 object-contain rounded-full bg-white p-1 border border-[#E4DED2] shadow-sm flex-shrink-0"
                />
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#A9824F]">Paid Receipt</span>
                  <h2 className="font-display text-2xl font-bold text-[#6E1E2B] mt-0.5">{placedOrder.orderNumber}</h2>
                  <p className="text-xs text-[#4A4642] mt-0.5">Ref: {placedOrder.paymentReference}</p>
                  <p className="text-xs text-[#4A4642]">Method: {placedOrder.paymentMethod}</p>
                </div>
              </div>
              <div className="text-right mt-2 sm:mt-0">
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded bg-[#2E7D32]/10 text-[#2E7D32]">
                  {placedOrder.status}
                </span>
                <p className="text-xs text-[#4A4642] mt-1.5">{placedOrder.fulfillment}</p>
                <p className="text-xs text-[#4A4642]">{placedOrder.paidAt}</p>
              </div>
            </div>

            {/* Customer & Fulfillment Info */}
            <div className="grid sm:grid-cols-2 gap-4 pb-6 mb-6 text-xs border-b border-[#E4DED2]">
              <div>
                <p className="font-semibold uppercase tracking-wider text-[#A9824F] mb-1">Customer</p>
                <p className="font-medium text-sm text-[#201D1B]">{placedOrder.customerName}</p>
                <p className="text-[#4A4642]">{placedOrder.email}</p>
                <p className="text-[#4A4642]">{placedOrder.phone}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wider text-[#A9824F] mb-1">
                  {placedOrder.fulfillment === "Delivery" ? "Delivery Address" : "Pickup Station"}
                </p>
                <p className="text-sm text-[#201D1B] leading-relaxed">{placedOrder.address}</p>
                <p className="text-[#4A4642] mt-1">Date: {placedOrder.preferredDate}</p>
                {placedOrder.notes && (
                  <p className="text-[#4A4642] mt-1 italic">Note: "{placedOrder.notes}"</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="pb-6 mb-6 border-b border-[#E4DED2]">
              <p className="font-semibold uppercase tracking-wider text-[#A9824F] text-xs mb-3">Items Ordered</p>
              <div className="flex flex-col gap-3">
                {placedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-[#E4DED2]/50 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-sm overflow-hidden bg-[#E4DED2] flex-shrink-0 border border-[#E4DED2]">
                        <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-[#201D1B]">{item.name}</p>
                        <p className="text-xs text-[#4A4642]">Qty: {item.qty} × {formatNaira(item.price)}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">{formatNaira(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="flex flex-col gap-2 pb-2 text-sm">
              <div className="flex justify-between text-[#4A4642]">
                <span>Subtotal</span>
                <span>{formatNaira(placedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#4A4642]">
                <span>{placedOrder.fulfillment === "Delivery" ? "Delivery Fee" : "Pickup Fee"}</span>
                <span>{placedOrder.deliveryFee > 0 ? formatNaira(placedOrder.deliveryFee) : "₦0"}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-[#E4DED2] text-[#201D1B]">
                <span className="font-display">Total Paid</span>
                <span className="font-display text-[#2E7D32] text-xl">{formatNaira(placedOrder.total)}</span>
              </div>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#track"
              className="w-full sm:w-auto text-center px-8 py-3.5 rounded-sm text-white text-sm font-medium shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#6E1E2B" }}
            >
              Track Order Live ({placedOrder.orderNumber})
            </a>
            <a
              href="#shop"
              className="w-full sm:w-auto text-center px-8 py-3.5 rounded-sm text-sm font-medium border border-[#201D1B] hover:bg-[#201D1B] hover:text-[#F6F2EB] transition-colors"
            >
              Back to Shop (Cart Cleared)
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: STEP 2 (ORDER CREATED — PENDING PAYMENT / COMPLETE PAYMENT SCREEN)
  // ---------------------------------------------------------------------------
  if (checkoutStep === "payment" && placedOrder) {
    return (
      <div className="font-body min-h-screen py-12 px-4 sm:px-6" style={{ backgroundColor: "#F6F2EB", color: "#201D1B" }}>
        <style>{FONT_IMPORT}</style>

        <div className="max-w-xl mx-auto">
          {/* Back button to return to cart & modify items */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => {
                setCheckoutStep("form");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E1E2B] hover:text-[#201D1B] transition-colors py-1.5 px-3 rounded-sm bg-white border border-[#E4DED2] shadow-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>← Back to Cart / Add More Items</span>
            </button>
            <a href="#shop" className="text-xs text-[#4A4642] hover:text-[#6E1E2B] underline">
              + Browse Shop More
            </a>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block w-16 h-16 mb-3">
              <img
                src={brandLogo}
                alt={STORE_NAME}
                className="w-full h-full object-contain rounded-full bg-white p-1 border-2 border-[#A9824F] shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#A9824F] text-white flex items-center justify-center text-[10px] shadow">
                ⏳
              </div>
            </div>
            <p className="text-xs uppercase tracking-widest font-semibold text-[#A9824F] mb-1">
              Order Logged • Awaiting Payment
            </p>
            <h1 className="font-display text-3xl font-semibold text-[#201D1B]">
              Complete Your Payment
            </h1>
            <p className="text-sm text-[#4A4642] mt-1 max-w-sm mx-auto">
              Thank you, <span className="font-medium text-[#201D1B]">{placedOrder.customerName}</span>! Complete payment to confirm your booking.
            </p>
          </div>

          {/* Amount Due Card */}
          <div className="p-6 rounded-sm border mb-6 shadow-sm bg-[#FBF9F5] border-[#E4DED2]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E4DED2]">
              <div>
                <span className="text-xs text-[#4A4642]">Order Reference</span>
                <p className="font-mono font-bold text-lg text-[#6E1E2B]">{placedOrder.orderNumber}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#4A4642]">Amount Due</span>
                <p className="font-display text-2xl font-bold text-[#6E1E2B]">{formatNaira(placedOrder.total)}</p>
              </div>
            </div>

            {/* Quick breakdown preview */}
            <div className="text-xs text-[#4A4642] space-y-1 pb-4 mb-4 border-b border-[#E4DED2]">
              <div className="flex justify-between">
                <span>Fulfillment:</span>
                <span className="font-medium text-[#201D1B]">{placedOrder.fulfillment}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium text-[#201D1B]">{placedOrder.preferredDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Items:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#201D1B]">{placedOrder.items.length} items</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutStep("form");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-[11px] text-[#6E1E2B] underline hover:text-[#201D1B] font-medium cursor-pointer"
                  >
                    (Modify / Add)
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Methods Selection (Matching Blueprint) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider font-semibold text-[#A9824F]">Choose Payment Method</p>
                <span className="text-[10px] text-[#4A4642] font-mono">Secured by Paystack</span>
              </div>

              {/* Notice if Key is Placeholder */}
              {keyNotice && (
                <div className="p-3.5 rounded-sm bg-[#FFF8E1] border border-[#FFE082] text-xs text-[#6D4C41] space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-base">💡</span>
                    <div>
                      <p className="font-semibold text-[#E65100]">Paystack Key is in Placeholder Mode</p>
                      <p className="text-[11px] mt-0.5">
                        Your <code className="bg-black/5 px-1 rounded font-mono">PAYSTACK_PUBLIC_KEY</code> in <code className="bg-black/5 px-1 rounded font-mono">config.js</code> has not been replaced with your real key yet.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#FFE082]/60">
                    <span className="text-[11px]">To test the customer experience right now:</span>
                    <button
                      type="button"
                      onClick={() => handleSimulatedPayment(selectedMethod.toUpperCase())}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-[#6E1E2B] text-white rounded hover:opacity-90"
                    >
                      ⚡ Simulate This Payment
                    </button>
                  </div>
                </div>
              )}

              {/* 4 Interactive Payment Channel Options */}
              <div className="space-y-2.5">
                {/* 1. DEBIT CARD */}
                <div
                  onClick={() => { setSelectedMethod("card"); setKeyNotice(false); }}
                  className={`p-3.5 rounded-sm border cursor-pointer transition-all ${
                    selectedMethod === "card"
                      ? "border-[#6E1E2B] bg-[#6E1E2B]/5 shadow-sm"
                      : "border-[#E4DED2] bg-white hover:border-[#201D1B]/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        selectedMethod === "card" ? "bg-[#6E1E2B] text-white" : "bg-[#E4DED2] text-[#201D1B]"
                      }`}>
                        💳
                      </div>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-[#201D1B]">Debit Card</p>
                        <p className="text-[11px] text-[#4A4642]">Mastercard, Visa, Verve</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#2E7D32]/10 text-[#2E7D32]">
                        Instant
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedMethod === "card" ? "border-[#6E1E2B] bg-[#6E1E2B]" : "border-[#C9BFAE]"
                      }`}>
                        {selectedMethod === "card" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  {selectedMethod === "card" && (
                    <div className="mt-3 pt-3 border-t border-[#E4DED2] flex items-center justify-between gap-3">
                      <p className="text-[11px] text-[#4A4642]">Pay directly with your local or international card.</p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handlePaystackPayment("card"); }}
                        disabled={paying}
                        className="px-4 py-2 rounded-sm text-white text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
                        style={{ backgroundColor: "#6E1E2B" }}
                      >
                        {paying ? "Opening..." : `Pay ${formatNaira(placedOrder.total)} with Card`}
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. DYNAMIC BANK TRANSFER (PAYSTACK) */}
                <div
                  onClick={() => { setSelectedMethod("transfer"); setKeyNotice(false); }}
                  className={`p-3.5 rounded-sm border cursor-pointer transition-all ${
                    selectedMethod === "transfer"
                      ? "border-[#6E1E2B] bg-[#6E1E2B]/5 shadow-sm"
                      : "border-[#E4DED2] bg-white hover:border-[#201D1B]/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        selectedMethod === "transfer" ? "bg-[#6E1E2B] text-white" : "bg-[#E4DED2] text-[#201D1B]"
                      }`}>
                        🏦
                      </div>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-[#201D1B]">Bank Transfer (Paystack)</p>
                        <p className="text-[11px] text-[#4A4642]">Pay from any Nigerian bank app</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#2E7D32]/10 text-[#2E7D32]">
                        Auto-Confirm
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedMethod === "transfer" ? "border-[#6E1E2B] bg-[#6E1E2B]" : "border-[#C9BFAE]"
                      }`}>
                        {selectedMethod === "transfer" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  {selectedMethod === "transfer" && (
                    <div className="mt-3 pt-3 border-t border-[#E4DED2] flex items-center justify-between gap-3">
                      <p className="text-[11px] text-[#4A4642]">Paystack generates a temporary virtual account for instant transfer.</p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handlePaystackPayment("transfer"); }}
                        disabled={paying}
                        className="px-4 py-2 rounded-sm text-white text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
                        style={{ backgroundColor: "#6E1E2B" }}
                      >
                        {paying ? "Opening..." : `Pay ${formatNaira(placedOrder.total)} via Transfer`}
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. USSD CODE */}
                <div
                  onClick={() => { setSelectedMethod("ussd"); setKeyNotice(false); }}
                  className={`p-3.5 rounded-sm border cursor-pointer transition-all ${
                    selectedMethod === "ussd"
                      ? "border-[#6E1E2B] bg-[#6E1E2B]/5 shadow-sm"
                      : "border-[#E4DED2] bg-white hover:border-[#201D1B]/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        selectedMethod === "ussd" ? "bg-[#6E1E2B] text-white" : "bg-[#E4DED2] text-[#201D1B]"
                      }`}>
                        📱
                      </div>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-[#201D1B]">USSD Banking Code</p>
                        <p className="text-[11px] text-[#4A4642]">GTBank, Zenith, Access, UBA, Sterling & more</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        Quick Code
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedMethod === "ussd" ? "border-[#6E1E2B] bg-[#6E1E2B]" : "border-[#C9BFAE]"
                      }`}>
                        {selectedMethod === "ussd" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  {selectedMethod === "ussd" && (
                    <div className="mt-3 pt-3 border-t border-[#E4DED2] flex items-center justify-between gap-3">
                      <p className="text-[11px] text-[#4A4642]">Dial generated code directly on your registered phone number.</p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handlePaystackPayment("ussd"); }}
                        disabled={paying}
                        className="px-4 py-2 rounded-sm text-white text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
                        style={{ backgroundColor: "#6E1E2B" }}
                      >
                        {paying ? "Opening..." : `Pay ${formatNaira(placedOrder.total)} with USSD`}
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. DIRECT BANK TRANSFER (MANUAL GTBANK) */}
                <div
                  onClick={() => { setSelectedMethod("manual_bank"); setKeyNotice(false); }}
                  className={`p-3.5 rounded-sm border cursor-pointer transition-all ${
                    selectedMethod === "manual_bank"
                      ? "border-[#6E1E2B] bg-[#6E1E2B]/5 shadow-sm"
                      : "border-[#E4DED2] bg-white hover:border-[#201D1B]/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        selectedMethod === "manual_bank" ? "bg-[#6E1E2B] text-white" : "bg-[#E4DED2] text-[#201D1B]"
                      }`}>
                        🏛️
                      </div>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-[#201D1B]">Direct Bank Transfer (Manual)</p>
                        <p className="text-[11px] text-[#4A4642]">Direct deposit to {BANK_DETAILS.bankName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#A9824F]/15 text-[#A9824F]">
                        Manual Proof
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedMethod === "manual_bank" ? "border-[#6E1E2B] bg-[#6E1E2B]" : "border-[#C9BFAE]"
                      }`}>
                        {selectedMethod === "manual_bank" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  {selectedMethod === "manual_bank" && (
                    <div className="mt-3 pt-3 border-t border-[#E4DED2] space-y-3">
                      <div className="p-3 rounded-sm bg-white border border-[#E4DED2] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[#888]">Bank:</span>
                          <span className="font-semibold text-[#201D1B]">{BANK_DETAILS.bankName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#888]">Account Name:</span>
                          <span className="font-medium text-[#201D1B]">{BANK_DETAILS.accountName}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-[#E4DED2]/60">
                          <span className="text-[#888]">Account Number:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#6E1E2B]">{BANK_DETAILS.accountNumber}</span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleCopyBank(); }}
                              className="text-[10px] px-2 py-0.5 rounded bg-[#E4DED2] hover:bg-[#201D1B] hover:text-white transition-colors"
                            >
                              {copiedBank ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[#888]">Reference Code:</span>
                          <span className="font-mono font-semibold text-[#6E1E2B]">{placedOrder.orderNumber}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleManualTransferConfirm(); }}
                        disabled={paying}
                        className="w-full py-2.5 rounded-sm text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        style={{ backgroundColor: "#25D366" }}
                      >
                        <span>✓ I Have Transferred — Send Proof to WhatsApp</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. QUICK TEST SIMULATION MODE */}
                <div
                  onClick={() => { setSelectedMethod("simulation"); setKeyNotice(false); }}
                  className={`p-3 rounded-sm border cursor-pointer transition-all ${
                    selectedMethod === "simulation"
                      ? "border-[#6E1E2B] bg-[#6E1E2B]/5 shadow-sm"
                      : "border-[#E4DED2] bg-white hover:border-[#201D1B]/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#6E1E2B]/10 text-[#6E1E2B] flex items-center justify-center text-sm font-bold">
                        ⚡
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-xs sm:text-sm text-[#201D1B]">Quick Test Simulation</p>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#6E1E2B]/10 text-[#6E1E2B]">
                            Dev Demo
                          </span>
                        </div>
                        <p className="text-[11px] text-[#4A4642]">Approve instantly for development testing & emails</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedMethod === "simulation" ? "border-[#6E1E2B] bg-[#6E1E2B]" : "border-[#C9BFAE]"
                    }`}>
                      {selectedMethod === "simulation" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  {selectedMethod === "simulation" && (
                    <div className="mt-3 pt-3 border-t border-[#E4DED2] flex items-center justify-between gap-3">
                      <p className="text-[11px] text-[#4A4642]">Bypasses real banking and approves order immediately.</p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSimulatedPayment("SIMULATION"); }}
                        disabled={paying}
                        className="px-4 py-2 rounded-sm text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: "#201D1B" }}
                      >
                        ⚡ Approve Test Payment Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex items-center justify-between text-xs text-[#4A4642] pt-3 mt-4 border-t border-[#E4DED2]/60">
            <button
              type="button"
              onClick={() => {
                setCheckoutStep("form");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-[#6E1E2B] font-medium hover:underline flex items-center gap-1 cursor-pointer"
            >
              ← Edit Cart / Change Items
            </button>
            <div className="flex items-center gap-4">
              <a href="#shop" className="hover:underline">
                Browse Shop More
              </a>
              <a href="#track" className="hover:underline">
                Track ({placedOrder.orderNumber}) →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: STEP 1 (CART REVIEW & CHECKOUT FORM)
  // ---------------------------------------------------------------------------
  return (
    <div className="font-body min-h-screen" style={{ backgroundColor: "#F6F2EB", color: "#201D1B" }}>
      <style>{FONT_IMPORT}</style>

      {/* Nav */}
      <header className="border-b sticky top-0 z-50" style={{ borderColor: "#E4DED2", backgroundColor: "#F6F2EB" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between h-20">
          <a href="#" className="font-display text-xl tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2.5">
            <img
              src={brandLogo}
              alt={STORE_NAME}
              className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-[#E4DED2] shadow-sm"
            />
            <span>{STORE_NAME}</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="text-sm hover:opacity-70 transition-opacity">
                {link.label}
              </a>
            ))}
            <a
              href="#cart"
              className="text-sm px-4 py-2 rounded-sm text-white font-medium"
              style={{ backgroundColor: "#6E1E2B" }}
            >
              Cart ({cartCount})
            </a>
          </nav>

          <button
            className="md:hidden text-sm"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 pb-6 flex flex-col gap-4 border-t border-[#E4DED2]">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="text-sm pt-4">
                {link.label}
              </a>
            ))}
            <a href="#cart" className="text-sm pt-2 font-medium">Cart ({cartCount})</a>
          </div>
        )}
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#201D1B] text-[#F6F2EB] px-4 py-2.5 rounded-sm text-xs shadow-lg transition-opacity">
          {toastMessage}
        </div>
      )}

      {/* Main Checkout Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: "#A9824F" }}>
            Secure Checkout
          </p>
          <h1 className="font-display text-3xl sm:text-4xl">Review Cart & Place Order</h1>
        </div>

        {cart.length === 0 ? (
          <div className="p-12 text-center rounded-sm border bg-[#FBF9F5] border-[#E4DED2]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E4DED2] flex items-center justify-center text-[#4A4642]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-semibold mb-2">Your Cart is Empty</h2>
            <p className="text-sm text-[#4A4642] mb-6 max-w-sm mx-auto">
              You don't have any catering items or platters in your cart yet. Explore our freshly prepared menus!
            </p>
            <a
              href="#shop"
              className="inline-block px-8 py-3 rounded-sm text-white text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#6E1E2B" }}
            >
              Browse Menus
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Checkout Details Form */}
            <div className="lg:col-span-7 bg-[#FBF9F5] p-6 sm:p-8 rounded-sm border border-[#E4DED2]">
              <form onSubmit={handleInitiateOrder} className="space-y-6">
                {/* Fulfillment Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A9824F] mb-2">
                    Fulfillment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFulfillment("delivery")}
                      className={`p-3.5 rounded-sm border text-left transition-all ${
                        fulfillment === "delivery"
                          ? "border-[#6E1E2B] bg-[#6E1E2B]/5 font-semibold text-[#6E1E2B]"
                          : "border-[#E4DED2] hover:border-[#201D1B]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span>Lagos Delivery</span>
                        <span>{formatNaira(DELIVERY_FEE)}</span>
                      </div>
                      <p className="text-[11px] text-[#4A4642] mt-0.5">Chilled dispatch to your venue / doorstep</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFulfillment("pickup")}
                      className={`p-3.5 rounded-sm border text-left transition-all ${
                        fulfillment === "pickup"
                          ? "border-[#6E1E2B] bg-[#6E1E2B]/5 font-semibold text-[#6E1E2B]"
                          : "border-[#E4DED2] hover:border-[#201D1B]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span>Self Pickup</span>
                        <span className="text-[#2E7D32]">FREE</span>
                      </div>
                      <p className="text-[11px] text-[#4A4642] mt-0.5">Lekki Phase 1 Kitchen Hub</p>
                    </button>
                  </div>
                </div>

                {/* Customer Contact Details */}
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#A9824F]">
                    Contact Information
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange("name")}
                        placeholder="e.g. David Ajayi"
                        className="w-full px-3.5 py-2.5 rounded-sm border border-[#E4DED2] bg-white text-sm focus:outline-none focus:border-[#6E1E2B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={handleChange("phone")}
                        placeholder="e.g. 0803 123 4567"
                        className="w-full px-3.5 py-2.5 rounded-sm border border-[#E4DED2] bg-white text-sm focus:outline-none focus:border-[#6E1E2B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="e.g. david@example.com"
                      className="w-full px-3.5 py-2.5 rounded-sm border border-[#E4DED2] bg-white text-sm focus:outline-none focus:border-[#6E1E2B]"
                    />
                    <p className="text-[11px] text-[#4A4642] mt-1">
                      Your payment receipt and live order tracking link will be delivered here.
                    </p>
                  </div>
                </div>

                {/* Delivery Address (if Delivery) */}
                {fulfillment === "delivery" && (
                  <div>
                    <label className="block text-xs font-medium mb-1">Delivery Address in Lagos *</label>
                    <input
                      type="text"
                      required
                      value={form.address}
                      onChange={handleChange("address")}
                      placeholder="e.g. 21 Admiralty Way, Lekki Phase 1, Lagos"
                      className="w-full px-3.5 py-2.5 rounded-sm border border-[#E4DED2] bg-white text-sm focus:outline-none focus:border-[#6E1E2B]"
                    />
                  </div>
                )}

                {/* Preferred Event / Delivery Date */}
                <div>
                  <label className="block text-xs font-medium mb-1">Preferred Date / Event Time</label>
                  <input
                    type="text"
                    value={form.preferredDate}
                    onChange={handleChange("preferredDate")}
                    placeholder="e.g. Saturday, 15 Oct — 2:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-sm border border-[#E4DED2] bg-white text-sm focus:outline-none focus:border-[#6E1E2B]"
                  />
                </div>

                {/* Special Instructions / Notes */}
                <div>
                  <label className="block text-xs font-medium mb-1">Special Notes / Dietary Requirements</label>
                  <textarea
                    rows="2"
                    value={form.notes}
                    onChange={handleChange("notes")}
                    placeholder="e.g. Extra spicy pepper sauce, call when rider arrives..."
                    className="w-full px-3.5 py-2.5 rounded-sm border border-[#E4DED2] bg-white text-sm focus:outline-none focus:border-[#6E1E2B]"
                  />
                </div>

                {/* Place Order CTA Button */}
                <button
                  type="submit"
                  disabled={!canPlaceOrder || placing}
                  className="w-full py-4 rounded-sm text-white font-medium text-sm transition-all shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#6E1E2B" }}
                >
                  {placing ? (
                    <span>Logging Order...</span>
                  ) : (
                    <span>Proceed to Payment ({formatNaira(total)}) →</span>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Order Summary & Cart Items */}
            <div className="lg:col-span-5 bg-[#FBF9F5] p-6 sm:p-8 rounded-sm border border-[#E4DED2] sticky top-28">
              <h2 className="font-display text-xl font-semibold mb-4 pb-3 border-b border-[#E4DED2]">
                Order Summary ({cart.length} {cart.length === 1 ? "item" : "items"})
              </h2>

              {/* Items List */}
              <div className="divide-y divide-[#E4DED2]/60 max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-sm overflow-hidden bg-[#E4DED2] flex-shrink-0 border border-[#E4DED2]">
                        <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-xs sm:text-sm text-[#201D1B] leading-snug">{item.name}</p>
                        <p className="text-[11px] text-[#4A4642] mt-0.5">{formatNaira(item.price)} each</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center border border-[#E4DED2] rounded-sm bg-white">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="px-2 py-0.5 text-xs hover:bg-[#F6F2EB]"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-medium">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, 1)}
                          className="px-2 py-0.5 text-xs hover:bg-[#F6F2EB]"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-[#888] hover:text-[#6E1E2B] text-xs p-1"
                        aria-label="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Calculation */}
              <div className="pt-4 border-t border-[#E4DED2] space-y-2 text-sm mt-4">
                <div className="flex justify-between text-[#4A4642]">
                  <span>Subtotal</span>
                  <span>{formatNaira(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#4A4642]">
                  <span>{fulfillment === "delivery" ? "Delivery Fee" : "Pickup Fee"}</span>
                  <span>{deliveryFee > 0 ? formatNaira(deliveryFee) : "FREE"}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-3 border-t border-[#E4DED2] text-[#201D1B]">
                  <span className="font-display">Total Due</span>
                  <span className="font-display text-lg text-[#6E1E2B]">{formatNaira(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

