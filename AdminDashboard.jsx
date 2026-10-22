import { useState, useEffect, useMemo, useRef } from "react";
import { STORE_NAME, BUSINESS_EMAIL, BUSINESS_WHATSAPP_PHONE, ADMIN_PIN, ADMIN_INACTIVITY_TIMEOUT_MINUTES } from "./config.js";
import brandLogo from "./IMG/the_platter_house_hq.jpg";
import { useMenu } from "./MenuContext.jsx";
import {
  fetchSupabaseOrders,
  updateSupabaseOrderStatus,
  subscribeToSupabaseOrders,
} from "./supabaseClient.js";

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@400;500;600;700&display=swap');
  .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
  .font-body { font-family: 'Work Sans', sans-serif; }
`;

// Default seed orders to display if no orders exist yet
const INITIAL_SEED_ORDERS = [
  {
    orderNumber: "TPH-10482",
    placedOn: "12 Oct 2026, 10:45 AM",
    customerName: "David Ajayi",
    phone: "0803 123 4567",
    email: "david@gmail.com",
    fulfillment: "Delivery",
    address: "21 Admiralty Way, Lekki Phase 1, Lagos, Nigeria",
    preferredDate: "Today, 1:30 PM",
    notes: "Please pack pepper sauce in separate small cups.",
    subtotal: 42000,
    deliveryFee: 5000,
    total: 47000,
    status: "Confirmed",
    paymentStatus: "Paid",
    isPaid: true,
    paymentMethod: "Paystack (Online)",
    paymentReference: "TPH_10482_948271",
    currentStageIndex: 0, // 0: Confirmed, 1: Preparing, 2: Out for Delivery, 3: Delivered
    items: [
      { name: "Small Chops Platter (50pc)", qty: 1, price: 30000 },
      { name: "Meat Pie Box (24pc)", qty: 1, price: 12000 },
    ],
  },
  {
    orderNumber: "TPH-10481",
    placedOn: "12 Oct 2026, 09:15 AM",
    customerName: "Tosin Adebanjo",
    phone: "0814 555 8921",
    email: "tosin.a@outlook.com",
    fulfillment: "Delivery",
    address: "Bourdillon Road, Ikoyi, Lagos",
    preferredDate: "Today, 3:00 PM",
    notes: "Executive boardroom meeting delivery.",
    subtotal: 60000,
    deliveryFee: 5000,
    total: 65000,
    status: "Preparing",
    paymentStatus: "Paid",
    isPaid: true,
    paymentMethod: "Paystack (Online)",
    paymentReference: "TPH_10481_881920",
    currentStageIndex: 1,
    items: [
      { name: "Chicken Skewer Platter (30pc)", qty: 2, price: 25000 },
      { name: "Puff-Puff & Chin Chin Mix", qty: 2, price: 5000 },
    ],
  },
  {
    orderNumber: "TPH-10480",
    placedOn: "11 Oct 2026, 04:30 PM",
    customerName: "Blessing Okonjo",
    phone: "0902 444 3311",
    email: "blessing.okonjo@gmail.com",
    fulfillment: "Delivery",
    address: "Chevron Drive, Lekki, Lagos",
    preferredDate: "Tomorrow, 12:00 PM",
    notes: "Birthday party platters.",
    subtotal: 115000,
    deliveryFee: 5000,
    total: 120000,
    status: "Preparing",
    paymentStatus: "Paid",
    isPaid: true,
    paymentMethod: "Paystack (Online)",
    paymentReference: "TPH_10480_771822",
    currentStageIndex: 1,
    items: [
      { name: "Assorted Small Chops (100pc)", qty: 2, price: 50000 },
      { name: "Birthday Cake, 2-Tier", qty: 1, price: 15000 },
    ],
  },
  {
    orderNumber: "TPH-10479",
    placedOn: "11 Oct 2026, 02:00 PM",
    customerName: "Victoria Igwe",
    phone: "0706 888 1234",
    email: "victoria@company.ng",
    fulfillment: "Pickup",
    address: "Lekki Phase 1 Hub (Self Pickup)",
    preferredDate: "Tomorrow, 11:00 AM",
    notes: "",
    subtotal: 35000,
    deliveryFee: 0,
    total: 35000,
    status: "Pending Payment",
    paymentStatus: "Unpaid",
    isPaid: false,
    paymentMethod: "Pending",
    paymentReference: "None",
    currentStageIndex: 0,
    items: [
      { name: "Meat Pie Box (24pc)", qty: 2, price: 12000 },
      { name: "Spring Roll & Samosa Mix (40pc)", qty: 1, price: 11000 },
    ],
  },
  {
    orderNumber: "TPH-10478",
    placedOn: "10 Oct 2026, 01:10 PM",
    customerName: "Michael Ekanem",
    phone: "0805 222 9988",
    email: "michael.e@gmail.com",
    fulfillment: "Delivery",
    address: "GRA Ikeja, Lagos",
    preferredDate: "10 Oct, 3:30 PM",
    notes: "Gated estate, security pass requested at gate.",
    subtotal: 55000,
    deliveryFee: 5000,
    total: 60000,
    status: "Delivered",
    paymentStatus: "Paid",
    isPaid: true,
    paymentMethod: "Paystack (Online)",
    paymentReference: "TPH_10478_554411",
    currentStageIndex: 3,
    items: [
      { name: "Small Chops Platter (50pc)", qty: 1, price: 30000 },
      { name: "Jollof Rice Party Tray", qty: 1, price: 25000 },
    ],
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "New Paid Order Received! 🎉",
    desc: "Order #TPH-10482 (₦47,000) from David Ajayi has been paid via Paystack.",
    time: "10 minutes ago",
    unread: true,
    orderNumber: "TPH-10482",
  },
  {
    id: 2,
    title: "Order Moved to Out for Delivery",
    desc: "Rider dispatched for Order #TPH-10478 to GRA Ikeja.",
    time: "2 hours ago",
    unread: false,
    orderNumber: "TPH-10478",
  },
  {
    id: 3,
    title: "Online Payment Confirmed",
    desc: "Paystack confirmed payment of ₦65,000 for Order #TPH-10481.",
    time: "3 hours ago",
    unread: false,
    orderNumber: "TPH-10481",
  },
];

function formatNaira(amount) {
  return `₦${(amount || 0).toLocaleString("en-NG")}`;
}

const DEFAULT_FOOD_FALLBACK = "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80";

// Compress & convert device/camera photo to web-optimized JPEG data URL (keeps storage < 120KB)
function processDeviceImage(file, onSuccess, onError) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    if (onError) onError("Please select an image file (.jpg, .png, .webp)");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const rawData = e.target.result;
    const img = new Image();
    img.onload = () => {
      try {
        const MAX_DIM = 900;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > MAX_DIM) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          }
        } else {
          if (h > MAX_DIM) {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL("image/jpeg", 0.84);
        onSuccess(compressed);
      } catch {
        onSuccess(rawData);
      }
    };
    img.onerror = () => onSuccess(rawData);
    img.src = rawData;
  };
  reader.onerror = () => {
    if (onError) onError("Could not read file from device.");
  };
  reader.readAsDataURL(file);
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("all"); // "all" | "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [sidebarTab, setSidebarTab] = useState("orders"); // "dashboard" | "orders" | "products" | "customers" | "payments" | "analytics" | "settings"
  const [toastMessage, setToastMessage] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null); // When not null, opens Edit Order modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptMode, setReceiptMode] = useState("customer"); // "customer" | "kitchen"
  const [dispenseKey, setDispenseKey] = useState(0); // Incremented to re-trigger paper roll animation
  const [viewingReceiptImage, setViewingReceiptImage] = useState(null); // When not null, opens Receipt Zoom Lightbox

  // ---------------------------------------------------------------------------
  // OPTION 2: VENDOR SECURITY & ACCESS CONTROL STATE
  // ---------------------------------------------------------------------------
  function getStoredAdminPin() {
    try {
      const custom = localStorage.getItem("tph_admin_pin");
      if (custom && custom.trim().length >= 4) return custom.trim();
    } catch {}
    return (ADMIN_PIN || "1234").trim();
  }

  const [activeAdminPin, setActiveAdminPin] = useState(getStoredAdminPin);

  const [rememberDevice, setRememberDevice] = useState(() => {
    try {
      return localStorage.getItem("tph_admin_remember_choice") === "true";
    } catch {
      return false;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const until = localStorage.getItem("tph_admin_authed_until");
      if (until && Number(until) > Date.now()) {
        return true;
      }
      return sessionStorage.getItem("tph_admin_authed") === "true";
    } catch {
      return false;
    }
  });

  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [wasInactivityLocked, setWasInactivityLocked] = useState(false);

  // Inactivity timeout configuration in minutes (0 = Disabled)
  const [inactivityMinutes, setInactivityMinutes] = useState(() => {
    try {
      const saved = localStorage.getItem("tph_admin_inactivity_minutes");
      if (saved !== null && !isNaN(Number(saved))) return Number(saved);
    } catch {}
    return ADMIN_INACTIVITY_TIMEOUT_MINUTES ?? 3;
  });

  // Brute Force Guard & Lockout States
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      return Number(sessionStorage.getItem("tph_admin_failed_attempts") || 0);
    } catch {
      return 0;
    }
  });

  const [lockoutUntil, setLockoutUntil] = useState(() => {
    try {
      const val = Number(sessionStorage.getItem("tph_admin_lockout_until") || 0);
      return val > Date.now() ? val : 0;
    } catch {
      return 0;
    }
  });
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Change PIN form state inside Admin Settings
  const [changePinForm, setChangePinForm] = useState({
    currentPin: "",
    newPin: "",
    confirmPin: "",
  });
  const [changePinError, setChangePinError] = useState(null);
  const [changePinSuccess, setChangePinSuccess] = useState(null);

  // Lockout Countdown Timer
  useEffect(() => {
    if (!lockoutUntil || lockoutUntil <= Date.now()) {
      setLockoutRemaining(0);
      return;
    }
    const updateCountdown = () => {
      const diff = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (diff <= 0) {
        setLockoutRemaining(0);
        setLockoutUntil(0);
        setFailedAttempts(0);
        try {
          sessionStorage.removeItem("tph_admin_lockout_until");
          sessionStorage.removeItem("tph_admin_failed_attempts");
        } catch {}
      } else {
        setLockoutRemaining(diff);
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Inactivity Auto-Lock Detection (Monitors mouse, keyboard, touch, scroll)
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    if (!isAuthenticated) return;

    lastActivityRef.current = Date.now();

    const recordUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const monitoredEvents = ["mousedown", "mousemove", "keydown", "touchstart", "scroll", "click"];
    monitoredEvents.forEach((evt) => window.addEventListener(evt, recordUserActivity, { passive: true }));

    const autoLockInterval = setInterval(() => {
      if (inactivityMinutes <= 0) return; // 0 = Disabled
      const elapsedMs = Date.now() - lastActivityRef.current;
      const timeoutMs = inactivityMinutes * 60 * 1000;

      if (elapsedMs >= timeoutMs) {
        setIsAuthenticated(false);
        setWasInactivityLocked(true);
        try {
          sessionStorage.removeItem("tph_admin_authed");
          localStorage.removeItem("tph_admin_authed_until");
        } catch {}
        setPinInput("");
        setPinError(false);
        setIsVerifying(false);
      }
    }, 4000);

    return () => {
      monitoredEvents.forEach((evt) => window.removeEventListener(evt, recordUserActivity));
      clearInterval(autoLockInterval);
    };
  }, [isAuthenticated, inactivityMinutes]);

  // Check candidate PIN against current active PIN
  function checkPinCode(candidatePin) {
    if (lockoutRemaining > 0) return;

    const expectedPin = activeAdminPin;
    setIsVerifying(true);
    setPinError(false);

    setTimeout(() => {
      if (candidatePin === expectedPin) {
        setIsAuthenticated(true);
        setIsVerifying(false);
        setPinInput("");
        setPinError(false);
        setWasInactivityLocked(false);
        setFailedAttempts(0);
        try {
          sessionStorage.setItem("tph_admin_authed", "true");
          sessionStorage.removeItem("tph_admin_failed_attempts");
          sessionStorage.removeItem("tph_admin_lockout_until");

          if (rememberDevice) {
            localStorage.setItem("tph_admin_authed_until", String(Date.now() + 24 * 60 * 60 * 1000));
            localStorage.setItem("tph_admin_remember_choice", "true");
          } else {
            localStorage.removeItem("tph_admin_authed_until");
            localStorage.setItem("tph_admin_remember_choice", "false");
          }
        } catch {}
        showToast("Welcome back! Vendor portal unlocked successfully.");
      } else {
        setIsVerifying(false);
        setPinError(true);
        setPinInput("");

        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        try {
          sessionStorage.setItem("tph_admin_failed_attempts", String(nextAttempts));
        } catch {}

        if (nextAttempts >= 5) {
          const lockEnd = Date.now() + 60000;
          setLockoutUntil(lockEnd);
          setLockoutRemaining(60);
          try {
            sessionStorage.setItem("tph_admin_lockout_until", String(lockEnd));
          } catch {}
        }
      }
    }, 550);
  }

  function handleDigitPress(digit) {
    if (isVerifying || lockoutRemaining > 0) return;
    const expectedLength = activeAdminPin.length || 4;
    if (pinInput.length >= expectedLength) return;

    const nextPin = pinInput + digit;
    setPinInput(nextPin);
    setPinError(false);

    if (nextPin.length === expectedLength) {
      checkPinCode(nextPin);
    }
  }

  function handleBackspace() {
    if (isVerifying || lockoutRemaining > 0) return;
    setPinInput((prev) => prev.slice(0, -1));
    setPinError(false);
  }

  function handleClearPin() {
    if (isVerifying || lockoutRemaining > 0) return;
    setPinInput("");
    setPinError(false);
  }

  function handleLockPortal() {
    setIsAuthenticated(false);
    setWasInactivityLocked(false);
    try {
      sessionStorage.removeItem("tph_admin_authed");
      localStorage.removeItem("tph_admin_authed_until");
    } catch {}
    setPinInput("");
    setPinError(false);
    setIsVerifying(false);
    showToast("Logged out of vendor portal");
  }

  // Handle In-Dashboard PIN Change Form Submit
  function handleChangePinSubmit(e) {
    e.preventDefault();
    setChangePinError(null);
    setChangePinSuccess(null);

    const { currentPin, newPin, confirmPin } = changePinForm;

    if (currentPin.trim() !== activeAdminPin) {
      setChangePinError("Current PIN is incorrect.");
      return;
    }

    if (!/^\d{4}$/.test(newPin.trim())) {
      setChangePinError("New PIN must be exactly 4 numeric digits (e.g. 5829).");
      return;
    }

    if (newPin.trim() !== confirmPin.trim()) {
      setChangePinError("New PIN and Confirm PIN do not match.");
      return;
    }

    const finalPin = newPin.trim();
    try {
      localStorage.setItem("tph_admin_pin", finalPin);
    } catch {}
    setActiveAdminPin(finalPin);
    setChangePinForm({ currentPin: "", newPin: "", confirmPin: "" });
    setChangePinSuccess(`Security PIN updated successfully! Your new PIN is ${finalPin}`);
    showToast("Master PIN updated successfully!");
  }

  // Reset PIN back to config.js default (1234)
  function handleResetPinToDefault() {
    try {
      localStorage.removeItem("tph_admin_pin");
    } catch {}
    const defaultPin = (ADMIN_PIN || "1234").trim();
    setActiveAdminPin(defaultPin);
    setChangePinForm({ currentPin: "", newPin: "", confirmPin: "" });
    setChangePinError(null);
    setChangePinSuccess("Security PIN restored to factory default (1234).");
    showToast("Security PIN reset to default (1234)");
  }

  // Global Keyboard Listener for Laptop / Desktop Physical Keyboard
  useEffect(() => {
    if (isAuthenticated) return;

    function handleGlobalKeyDown(e) {
      if (isVerifying || lockoutRemaining > 0) return;

      // Listen for numbers 0-9 (number row and numpad)
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleDigitPress(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Escape" || e.key === "Delete") {
        e.preventDefault();
        handleClearPin();
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isAuthenticated, isVerifying, lockoutRemaining, pinInput, activeAdminPin]);

  // Clean session when leaving unless 24h remember device was selected
  useEffect(() => {
    return () => {
      try {
        const until = localStorage.getItem("tph_admin_authed_until");
        if (!until || Number(until) <= Date.now()) {
          sessionStorage.removeItem("tph_admin_authed");
        }
      } catch {}
    };
  }, []);

  // Load orders from localStorage, then fetch & subscribe to Supabase
  useEffect(() => {
    let isMounted = true;

    // 1. Instant local render
    try {
      const stored = JSON.parse(localStorage.getItem("tph_orders") || "[]");
      if (stored.length > 0) {
        setOrders(stored);
        setSelectedOrder(stored[0]);
      } else {
        setOrders(INITIAL_SEED_ORDERS);
        setSelectedOrder(INITIAL_SEED_ORDERS[0]);
      }
    } catch {
      setOrders(INITIAL_SEED_ORDERS);
    }

    // 2. Fetch fresh live orders from Supabase cloud database
    fetchSupabaseOrders()
      .then((cloudOrders) => {
        if (!isMounted) return;
        if (cloudOrders && cloudOrders.length > 0) {
          setOrders((prev) => {
            const map = new Map();
            cloudOrders.forEach((o) => map.set(o.orderNumber, o));
            prev.forEach((o) => {
              if (!map.has(o.orderNumber)) map.set(o.orderNumber, o);
            });
            const merged = Array.from(map.values());
            try {
              localStorage.setItem("tph_orders", JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      })
      .catch((err) => console.warn("Supabase orders fetch:", err));

    // 3. Realtime subscription: live incoming orders and status updates
    const unsubscribe = subscribeToSupabaseOrders(({ eventType, order }) => {
      if (!isMounted) return;
      setOrders((prev) => {
        let next;
        if (eventType === "INSERT") {
          showToast(`🔔 New Order Received: #${order.orderNumber}!`);
          const newNotif = {
            id: Date.now(),
            title: `🔔 New Paid Order #${order.orderNumber}`,
            desc: `${order.customerName} ordered ${order.items?.length || 0} dishes (Total: ₦${Number(order.totalAmount || 0).toLocaleString()})`,
            time: "Just now",
            unread: true,
            orderNumber: order.orderNumber,
          };
          setNotifications((n) => [newNotif, ...n]);
          next = [order, ...prev.filter((o) => o.orderNumber !== order.orderNumber)];
        } else if (eventType === "UPDATE") {
          next = prev.map((o) => (o.orderNumber === order.orderNumber ? { ...o, ...order } : o));
        } else if (eventType === "DELETE") {
          next = prev.filter((o) => o.orderNumber !== order.orderNumber);
        } else {
          next = prev;
        }
        try {
          localStorage.setItem("tph_orders", JSON.stringify(next));
        } catch {}
        return next;
      });
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }

  // Update order status and synchronize to localStorage & Supabase
  function updateStatus(orderNumber, newStageIndex, newStatusLabel) {
    const updated = orders.map((o) => {
      if (o.orderNumber === orderNumber) {
        return {
          ...o,
          currentStageIndex: newStageIndex,
          status: newStatusLabel,
        };
      }
      return o;
    });

    setOrders(updated);
    const orderObj = updated.find((o) => o.orderNumber === orderNumber);
    setSelectedOrder(orderObj);

    try {
      localStorage.setItem("tph_orders", JSON.stringify(updated));
      const localLast = JSON.parse(localStorage.getItem("tph_last_order") || "null");
      if (localLast && localLast.orderNumber === orderNumber) {
        localStorage.setItem("tph_last_order", JSON.stringify(orderObj));
      }
    } catch (e) {
      console.error(e);
    }

    // Sync status change to Supabase cloud database
    const STAGE_KEYS = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];
    const stageKey = STAGE_KEYS[newStageIndex] || "confirmed";
    updateSupabaseOrderStatus(orderNumber, stageKey).catch(() => {});

    // Add notification
    const newNotif = {
      id: Date.now(),
      title: `Order #${orderNumber} Updated`,
      desc: `Status changed to "${newStatusLabel}". Customer tracking updated.`,
      time: "Just now",
      unread: true,
      orderNumber,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(`Order #${orderNumber} marked as ${newStatusLabel}`);
  }

  // Verify & Approve Manual GTBank Bank Transfer
  function verifyTransferPayment(orderNumber) {
    const verifiedTimestamp = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const updated = orders.map((o) => {
      if (o.orderNumber === orderNumber) {
        return {
          ...o,
          isPaid: true,
          paymentStatus: "Paid",
          status: "Confirmed",
          currentStageIndex: 1, // Advance tracking to Stage 1: Order Confirmed
          paidAt: verifiedTimestamp,
          verifiedByVendor: true,
        };
      }
      return o;
    });

    setOrders(updated);
    const orderObj = updated.find((o) => o.orderNumber === orderNumber);
    setSelectedOrder(orderObj);

    try {
       // Sync into localStorage for the customer's #track page
      localStorage.setItem("tph_orders", JSON.stringify(updated));
      // Add Live Notification to vendor stream
      const localLast = JSON.parse(localStorage.getItem("tph_last_order") || "null");
      if (localLast && localLast.orderNumber === orderNumber) {
        localStorage.setItem("tph_last_order", JSON.stringify(orderObj));
      }
    } catch (e) {
      console.error(e);
    }

    // Sync to Supabase cloud database
    updateSupabaseOrderStatus(orderNumber, "confirmed").catch(() => {});

    // Add Live Notification to vendor stream
    const newNotif = {
      id: Date.now(),
      title: `Transfer Verified for #${orderNumber} 🎉`,
      desc: `Vendor confirmed GTBank transfer of ${formatNaira(orderObj.total)} from ${orderObj.customerName}.`,
      time: "Just now",
      unread: true,
      orderNumber,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(`✓ Payment Verified: Order #${orderNumber} marked as Paid & Confirmed`);
  }

  // Delete an Order with safety confirmation
  function deleteOrder(orderNumber) {
    if (!window.confirm(`Are you sure you want to delete Order #${orderNumber}? This will permanently remove it from your records.`)) {
      return;
    }

    const updated = orders.filter((o) => o.orderNumber !== orderNumber);
    setOrders(updated);

    try {
      localStorage.setItem("tph_orders", JSON.stringify(updated));
      const localLast = JSON.parse(localStorage.getItem("tph_last_order") || "null");
      if (localLast && localLast.orderNumber === orderNumber) {
        localStorage.removeItem("tph_last_order");
      }
    } catch (e) {
      console.error(e);
    }

    if (selectedOrder?.orderNumber === orderNumber) {
      setSelectedOrder(updated[0] || null);
    }

    showToast(`Order #${orderNumber} deleted successfully`);
  }

  // Save modifications to an existing order
  function handleSaveOrderEdit(e) {
    e.preventDefault();
    if (!editingOrder) return;

    const updated = orders.map((o) => {
      if (o.orderNumber === editingOrder.orderNumber) {
        return {
          ...o,
          customerName: (editingOrder.customerName || "").trim(),
          phone: (editingOrder.phone || "").trim(),
          email: (editingOrder.email || "").trim(),
          address: (editingOrder.address || "").trim(),
          preferredDate: (editingOrder.preferredDate || "").trim(),
          notes: (editingOrder.notes || "").trim(),
        };
      }
      return o;
    });

    setOrders(updated);
    const updatedObj = updated.find((o) => o.orderNumber === editingOrder.orderNumber);
    setSelectedOrder(updatedObj);

    try {
      localStorage.setItem("tph_orders", JSON.stringify(updated));
      const localLast = JSON.parse(localStorage.getItem("tph_last_order") || "null");
      if (localLast && localLast.orderNumber === editingOrder.orderNumber) {
        localStorage.setItem("tph_last_order", JSON.stringify(updatedObj));
      }
    } catch (e) {
      console.error(e);
    }

    setEditingOrder(null);
    showToast(`Order #${updatedObj.orderNumber} details updated successfully`);
  }

  function markAllNotificationsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast("All notifications marked as read");
  }

  // ==========================================
  // MODULE 4: DYNAMIC MENU CATALOG STUDIO STATE
  // ==========================================
  const {
    products,
    categories,
    toggleStock,
    updateProduct,
    addProduct,
    deleteProduct,
    resetMenuToDefault,
  } = useMenu();

  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [menuActiveCategory, setMenuActiveCategory] = useState("All");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [editImageUploadLoading, setEditImageUploadLoading] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    category: "Small Chops",
    customCategory: "",
    price: "",
    description: "",
    image: "",
  });

  const menuMetrics = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.inStock).length;
    const soldOut = total - inStock;
    return { total, inStock, soldOut };
  }, [products]);

  const filteredCatalog = useMemo(() => {
    return products.filter((item) => {
      const matchesCat =
        menuActiveCategory === "All" || item.category === menuActiveCategory;
      const q = menuSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [products, menuActiveCategory, menuSearchQuery]);

  function handleToggleStock(product) {
    toggleStock(product.id);
    const willBeInStock = !product.inStock;
    showToast(
      willBeInStock
        ? `✓ "${product.name}" is now LIVE in stock.`
        : `✕ "${product.name}" is now marked as SOLD OUT.`
    );
  }

  function handleDeleteProduct(product) {
    if (window.confirm(`Are you sure you want to delete "${product.name}" from your menu catalog?`)) {
      deleteProduct(product.id);
      showToast(`Removed "${product.name}" from catalog.`);
    }
  }

  function handleSaveProductEdit(e) {
    e.preventDefault();
    if (!editingProduct) return;

    const finalCategory =
      editingProduct.category === "__custom__"
        ? (editingProduct.customCategory || "").trim() || "Special Platters"
        : editingProduct.category;

    updateProduct(editingProduct.id, {
      name: (editingProduct.name || "").trim(),
      category: finalCategory,
      price: Number(editingProduct.price) || 0,
      description: (editingProduct.description || "").trim(),
      image: (editingProduct.image || "").trim() || DEFAULT_FOOD_FALLBACK,
      inStock: editingProduct.inStock ?? true,
    });
    setEditingProduct(null);
    showToast(`✓ Updated "${editingProduct.name}" details.`);
  }

  function handleCreateProduct(e) {
    e.preventDefault();
    if (!newProductForm.name.trim() || !newProductForm.price) {
      showToast("Please enter dish name and price.");
      return;
    }

    const finalCategory =
      newProductForm.category === "__custom__"
        ? (newProductForm.customCategory || "").trim() || "Special Platters"
        : newProductForm.category;

    const created = addProduct({
      name: newProductForm.name.trim(),
      category: finalCategory,
      price: Number(newProductForm.price) || 0,
      description: (newProductForm.description || "").trim(),
      image: (newProductForm.image || "").trim() || DEFAULT_FOOD_FALLBACK,
    });

    setIsAddingProduct(false);
    setNewProductForm({
      name: "",
      category: "Small Chops",
      customCategory: "",
      price: "",
      description: "",
      image: "",
    });
    showToast(`🎉 Added "${created.name}" to menu catalog!`);
  }

  function handleResetMenu() {
    if (window.confirm("Reset menu to factory default items? Any custom added dishes will be restored.")) {
      resetMenuToDefault();
      showToast("Menu catalog restored to factory default.");
    }
  }

  // Unique Customers aggregated from orders
  const uniqueCustomers = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      const key = (o.phone || o.customerName || "").trim().toLowerCase();
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          name: o.customerName,
          phone: o.phone,
          email: o.email || "N/A",
          address: o.address || "N/A",
          ordersCount: 1,
          totalSpent: o.isPaid ? o.total : 0,
          lastOrderDate: o.placedOn,
        });
      } else {
        const item = map.get(key);
        item.ordersCount += 1;
        if (o.isPaid) item.totalSpent += o.total;
        map.set(key, item);
      }
    });
    return Array.from(map.values());
  }, [orders]);

  // Filtered orders calculation
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Tab filter
      const statusLower = (o.status || "").toLowerCase();
      if (activeTab === "pending" && !statusLower.includes("pending")) return false;
      if (activeTab === "confirmed" && !statusLower.includes("confirmed")) return false;
      if (activeTab === "preparing" && !statusLower.includes("preparing")) return false;
      if (activeTab === "out_for_delivery" && !statusLower.includes("out")) return false;
      if (activeTab === "delivered" && !statusLower.includes("delivered")) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNumber = (o.orderNumber || "").toLowerCase().includes(query);
        const matchesName = (o.customerName || "").toLowerCase().includes(query);
        const matchesPhone = (o.phone || "").toLowerCase().includes(query);
        return matchesNumber || matchesName || matchesPhone;
      }
      return true;
    });
  }, [orders, activeTab, searchQuery]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => (o.status || "").toLowerCase().includes("pending")).length,
      confirmed: orders.filter((o) => (o.status || "").toLowerCase().includes("confirmed")).length,
      preparing: orders.filter((o) => (o.status || "").toLowerCase().includes("preparing")).length,
      out_for_delivery: orders.filter((o) => (o.status || "").toLowerCase().includes("out")).length,
      delivered: orders.filter((o) => (o.status || "").toLowerCase().includes("delivered")).length,
    };
  }, [orders]);

  // Total revenue
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.isPaid || (o.paymentStatus || "").toLowerCase() === "paid")
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  // ---------------------------------------------------------------------------
  // RENDER: VENDOR SECURITY PIN GATE
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    const expectedLength = (activeAdminPin || "1234").trim().length || 4;

    return (
      <div
        className="font-body min-h-screen flex items-center justify-center p-4 relative"
        style={{ backgroundColor: "#201D1B", color: "#F6F2EB" }}
      >
        <style>{FONT_IMPORT}</style>

        {/* Top Green Notification Toast */}
        {toastMessage && (
          <div
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-semibold shadow-2xl transition-all border pointer-events-none"
            style={{ backgroundColor: "#1B5E20", color: "#FFFFFF", borderColor: "#4CAF50" }}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">✓</span>
            <span className="tracking-wide">{toastMessage}</span>
          </div>
        )}

        <div className="max-w-xs sm:max-w-sm w-full bg-[#2B1B1E] p-8 rounded-sm border border-[#A9824F]/30 shadow-2xl text-center">
          {/* Brand Logo with Padlock Security Accent */}
          <div className="relative w-20 h-20 mx-auto mb-4">
            <img
              src={brandLogo}
              alt={STORE_NAME}
              className="w-full h-full object-contain rounded-full bg-white p-1.5 shadow-md border-2 border-[#A9824F]"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#6E1E2B] border border-[#A9824F] text-white flex items-center justify-center shadow">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-[#A9824F] mb-1">
            Vendor Portal Access
          </p>
          <h1 className="font-display text-2xl font-semibold text-white mb-1">
            {STORE_NAME}
          </h1>

          {/* Inactivity Auto-Lock Alert */}
          {wasInactivityLocked && (
            <div className="my-3 p-2.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-center gap-2 animate-pulse">
              <svg className="w-4 h-4 text-amber-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 15" />
              </svg>
              <span>Screen locked after {inactivityMinutes} minutes of inactivity</span>
            </div>
          )}

          {/* Brute-Force Lockout Alert */}
          {lockoutRemaining > 0 ? (
            <div className="my-3 p-3 rounded bg-red-900/60 border border-red-500/60 text-red-200 text-xs font-semibold flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-red-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <span>Keypad locked: Try again in {lockoutRemaining}s</span>
            </div>
          ) : (
            <p className="text-xs text-[#E4DED2]/70 mb-4">
              Enter 4-digit security PIN to unlock the dashboard.
            </p>
          )}

          {/* Hidden input to capture physical keyboard focus */}
          <input
            type="password"
            maxLength={expectedLength}
            value={pinInput}
            onChange={(e) => {
              if (lockoutRemaining > 0) return;
              const val = e.target.value.replace(/[^0-9]/g, "");
              if (val.length <= expectedLength) {
                setPinInput(val);
                setPinError(false);
                if (val.length === expectedLength) {
                  checkPinCode(val);
                }
              }
            }}
            disabled={isVerifying || lockoutRemaining > 0}
            className="sr-only"
            autoFocus
          />

          {/* Interactive PIN Dots */}
          <div className="flex justify-center items-center gap-3.5 my-3">
            {Array.from({ length: expectedLength }).map((_, idx) => {
              const isFilled = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 border ${
                    pinError
                      ? "border-red-500 bg-red-500/80 animate-pulse"
                      : isFilled
                      ? "bg-[#A9824F] border-[#A9824F] scale-110 shadow-sm"
                      : "border-white/30 bg-white/5"
                  }`}
                />
              );
            })}
          </div>

          {/* Status Message / Loading Circle Feedback */}
          <div className="min-h-[26px] flex items-center justify-center">
            {isVerifying ? (
              <div className="flex items-center justify-center gap-2 text-xs text-[#A9824F] font-medium">
                <svg className="animate-spin h-4 w-4 text-[#A9824F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verifying PIN...</span>
              </div>
            ) : lockoutRemaining > 0 ? (
              <p className="text-xs text-red-400 font-medium">
                Attempts exceeded. Please wait {lockoutRemaining}s.
              </p>
            ) : pinError ? (
              <p className="text-xs text-red-400 font-medium">
                Incorrect PIN. Please try again.
              </p>
            ) : (
              <p className="text-[11px] text-[#E4DED2]/50">
                {pinInput.length === 0 ? "Type or tap your 4 digits" : `${pinInput.length} of ${expectedLength} entered`}
              </p>
            )}
          </div>

          {/* Remember this Device (24 Hours) Checkbox */}
          <label className="flex items-center justify-center gap-2 mt-2 mb-2 text-xs text-[#E4DED2]/80 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberDevice}
              disabled={isVerifying || lockoutRemaining > 0}
              onChange={(e) => {
                const val = e.target.checked;
                setRememberDevice(val);
                try {
                  localStorage.setItem("tph_admin_remember_choice", val ? "true" : "false");
                } catch {}
              }}
              className="w-3.5 h-3.5 rounded accent-[#A9824F] cursor-pointer"
            />
            <span>Remember this device for 24 hours</span>
          </label>

          {/* Touch Numpad */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-4 border-t border-white/10">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
              <button
                key={digit}
                type="button"
                disabled={isVerifying || lockoutRemaining > 0}
                onClick={() => handleDigitPress(digit)}
                className="py-3 text-sm font-mono font-semibold rounded bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              disabled={isVerifying || lockoutRemaining > 0 || pinInput.length === 0}
              onClick={handleClearPin}
              className="py-3 text-xs font-mono rounded bg-white/5 text-[#E4DED2]/60 hover:bg-white/10 active:scale-95 transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={isVerifying || lockoutRemaining > 0}
              onClick={() => handleDigitPress("0")}
              className="py-3 text-sm font-mono font-semibold rounded bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              0
            </button>
            <button
              type="button"
              disabled={isVerifying || lockoutRemaining > 0 || pinInput.length === 0}
              onClick={handleBackspace}
              className="py-3 text-sm font-mono rounded bg-white/5 text-[#E4DED2]/80 hover:bg-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed"
              aria-label="Delete"
            >
              ⌫
            </button>
          </div>

          <div className="mt-5 pt-3 text-xs text-[#E4DED2]/50">
            <a href="#" className="hover:text-white underline">
              ← Return to Public Storefront
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-body min-h-screen bg-[#F6F2EB] text-[#201D1B] flex flex-col">
      <style>{FONT_IMPORT}</style>

      {/* Top Admin Navigation Header */}
      <header className="bg-[#201D1B] text-[#F6F2EB] px-6 py-3.5 flex items-center justify-between border-b border-[#332F2B] sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src={brandLogo}
              alt={STORE_NAME}
              className="w-9 h-9 object-contain rounded-full bg-white p-0.5 border border-[#A9824F] shadow-sm flex-shrink-0"
            />
            <div>
              <p className="font-display font-semibold tracking-wide text-sm">{STORE_NAME}</p>
              <p className="text-[10px] text-[#A9824F] uppercase tracking-wider font-semibold">Seller & Kitchen Dashboard</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={() => {
              try { sessionStorage.removeItem("tph_admin_authed"); } catch {}
            }}
            className="text-xs px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>View Live Store</span>
          </a>
          <a
            href="#track"
            onClick={() => {
              try { sessionStorage.removeItem("tph_admin_authed"); } catch {}
            }}
            className="text-xs px-3 py-1.5 rounded bg-[#6E1E2B] hover:opacity-90 transition-opacity"
          >
            Track Order Page
          </a>
          <button
            onClick={handleLockPortal}
            className="text-xs px-3 py-1.5 rounded bg-white/10 hover:bg-red-950/60 hover:text-red-300 border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Log out of vendor portal"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Toast Alert — Top Center Green Badge */}
      {toastMessage && (
        <div
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-semibold shadow-2xl transition-all border pointer-events-none"
          style={{ backgroundColor: "#1B5E20", color: "#FFFFFF", borderColor: "#4CAF50" }}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">✓</span>
          <span className="tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Main Admin Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Matching Blueprint) */}
        <aside className="w-56 bg-[#2B1B1E] text-[#F6F2EB] hidden md:flex flex-col justify-between p-4 flex-shrink-0">
          <div className="space-y-6">
            <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2.5">
              <img
                src={brandLogo}
                alt={STORE_NAME}
                className="w-8 h-8 object-contain rounded-full bg-white p-0.5 border border-[#A9824F]"
              />
              <div>
                <p className="text-[10px] text-[#E4DED2]/60 uppercase tracking-wider">Merchant Mode</p>
                <p className="text-xs font-semibold text-white">The Platter House HQ</p>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                {
                  key: "orders",
                  label: "Orders",
                  count: counts.all,
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                      <path d="m3.3 7 8.7 5 8.7-5"/>
                      <path d="M12 22V12"/>
                    </svg>
                  ),
                },
                {
                  key: "products",
                  label: "Menu Catalog",
                  count: products.length,
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="4" r="1.5" />
                      <path d="M4 14a8 8 0 0 1 16 0" />
                      <line x1="2" y1="17" x2="22" y2="17" strokeWidth="2" />
                      <line x1="6" y1="20" x2="18" y2="20" />
                    </svg>
                  ),
                },
                {
                  key: "customers",
                  label: "Customers",
                  count: uniqueCustomers.length,
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  ),
                },
                {
                  key: "payments",
                  label: "Payments (Paystack)",
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="14" x="2" y="5" rx="2"/>
                      <line x1="2" x2="22" y1="10" y2="10"/>
                    </svg>
                  ),
                },
                {
                  key: "analytics",
                  label: "Sales Analytics",
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18"/>
                      <path d="m19 9-5 5-4-4-3 3"/>
                    </svg>
                  ),
                },
                {
                  key: "settings",
                  label: "Settings",
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  ),
                },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSidebarTab(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${
                    sidebarTab === item.key
                      ? "bg-[#6E1E2B] text-white shadow-sm font-semibold"
                      : "text-[#E4DED2]/80 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 opacity-90">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 text-white font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="pt-4 border-t border-white/10 text-[11px] text-[#E4DED2]/60 px-3">
            <p className="font-semibold text-white/90">Paystack Live Sync</p>
            <p className="text-[10px] text-green-400">● Webhook Listener Active</p>
          </div>
        </aside>

        {/* Center / Right Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {sidebarTab === "orders" && (
            <>
              {/* Top Metrics Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#FBF9F5] p-4 rounded-sm border border-[#E4DED2] shadow-sm">
              <p className="text-xs text-[#A9824F] font-semibold uppercase tracking-wider">Total Revenue</p>
              <p className="font-display text-2xl font-bold text-[#6E1E2B] mt-1">{formatNaira(totalRevenue)}</p>
              <p className="text-[11px] text-[#4A4642] mt-0.5">Paid via Paystack & transfers</p>
            </div>

            <div className="bg-[#FBF9F5] p-4 rounded-sm border border-[#E4DED2] shadow-sm">
              <p className="text-xs text-[#A9824F] font-semibold uppercase tracking-wider">Total Orders</p>
              <p className="font-display text-2xl font-bold text-[#201D1B] mt-1">{counts.all}</p>
              <p className="text-[11px] text-[#4A4642] mt-0.5">{counts.confirmed} confirmed bookings</p>
            </div>

            <div className="bg-[#FBF9F5] p-4 rounded-sm border border-[#E4DED2] shadow-sm">
              <p className="text-xs text-[#A9824F] font-semibold uppercase tracking-wider">Active in Kitchen</p>
              <p className="font-display text-2xl font-bold text-[#201D1B] mt-1">{counts.preparing}</p>
              <p className="text-[11px] text-[#4A4642] mt-0.5">Currently preparing dishes</p>
            </div>

            <div className="bg-[#FBF9F5] p-4 rounded-sm border border-[#E4DED2] shadow-sm">
              <p className="text-xs text-[#A9824F] font-semibold uppercase tracking-wider">Awaiting Payment</p>
              <p className="font-display text-2xl font-bold text-[#A9824F] mt-1">{counts.pending}</p>
              <p className="text-[11px] text-[#4A4642] mt-0.5">Pending customer transfer</p>
            </div>
          </div>

          {/* 3-Column Work Area: Orders Table, Selected Order Drawer, Notifications Feed */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Section: Orders Table & Tabs (7 cols) */}
            <div className="xl:col-span-7 bg-[#FBF9F5] rounded-sm border border-[#E4DED2] p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E4DED2]">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#201D1B]">Orders</h2>
                  <p className="text-xs text-[#4A4642] mt-0.5">Manage customer orders, track payments, and dispatch catering</p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Order ID, name..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-sm border border-[#E4DED2] bg-white text-[#201D1B] focus:outline-none focus:border-[#6E1E2B]"
                  />
                  <svg className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Status Tabs (Matching Blueprint) */}
              <div className="flex flex-wrap gap-1.5 my-4 border-b border-[#E4DED2]/60 pb-3 text-xs">
                {[
                  { key: "all", label: "All Orders", count: counts.all },
                  { key: "pending", label: "Pending", count: counts.pending },
                  { key: "confirmed", label: "Confirmed", count: counts.confirmed },
                  { key: "preparing", label: "Preparing", count: counts.preparing },
                  { key: "out_for_delivery", label: "Out for Delivery", count: counts.out_for_delivery },
                  { key: "delivered", label: "Delivered", count: counts.delivered },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 ${
                      activeTab === tab.key
                        ? "bg-[#6E1E2B] text-white font-semibold shadow-sm"
                        : "hover:bg-[#E4DED2]/50 text-[#4A4642]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded ${
                        activeTab === tab.key ? "bg-white/20 text-white" : "bg-[#E4DED2] text-[#201D1B]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E4DED2] text-[#A9824F] uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4DED2]/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-xs text-[#888]">
                          No orders found matching this filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => {
                        const isSelected = selectedOrder?.orderNumber === o.orderNumber;
                        const isPaid = o.isPaid || (o.paymentStatus || "").toLowerCase() === "paid";
                        return (
                          <tr
                            key={o.orderNumber}
                            onClick={() => setSelectedOrder(o)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? "bg-[#6E1E2B]/10 font-medium" : "hover:bg-[#E4DED2]/30"
                            }`}
                          >
                            <td className="py-3 px-3 font-mono font-semibold text-[#6E1E2B]">
                              <div className="flex items-center gap-1.5">
                                <span>{o.orderNumber}</span>
                                {o.receiptImage && (
                                  <span
                                    className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-sans font-medium flex items-center gap-0.5"
                                    title="Customer uploaded bank transfer receipt"
                                  >
                                    <span>📎</span>
                                    <span>Receipt</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <p className="font-medium text-[#201D1B]">{o.customerName}</p>
                              <p className="text-[10px] text-[#4A4642]">{o.phone}</p>
                            </td>
                            <td className="py-3 px-3 text-[#4A4642] whitespace-nowrap">
                              {o.placedOn?.split(",")[0] || o.placedOn}
                            </td>
                            <td className="py-3 px-3 font-semibold text-[#201D1B]">
                              {formatNaira(o.total)}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  isPaid
                                    ? "bg-[#2E7D32]/10 text-[#2E7D32]"
                                    : "bg-[#A9824F]/15 text-[#A9824F]"
                                }`}
                              >
                                {isPaid ? "Paid" : "Unpaid"}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  o.status === "Delivered"
                                    ? "bg-blue-100 text-blue-800"
                                    : o.status === "Preparing"
                                    ? "bg-purple-100 text-purple-800"
                                    : o.status === "Out for Delivery"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : o.status === "Confirmed"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {o.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(o);
                                }}
                                className="px-2 py-1 text-[11px] rounded border border-[#201D1B]/30 hover:bg-[#201D1B] hover:text-white transition-colors"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Middle Section: Selected Order Detail Drawer (5 cols) */}
            <div className="xl:col-span-5 space-y-6">
              {selectedOrder ? (
                <div className="bg-[#FBF9F5] rounded-sm border border-[#E4DED2] p-5 shadow-sm">
                  {/* Order Header */}
                  <div className="flex items-start justify-between pb-4 mb-4 border-b border-[#E4DED2]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-xl font-bold text-[#6E1E2B]">
                          Order #{selectedOrder.orderNumber}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            selectedOrder.isPaid ? "bg-[#2E7D32]/10 text-[#2E7D32]" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {selectedOrder.isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </div>
                      <p className="text-xs text-[#4A4642] mt-0.5">Placed: {selectedOrder.placedOn}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setDispenseKey((k) => k + 1);
                          setShowReceiptModal(true);
                        }}
                        className="text-xs px-2.5 py-1 rounded border border-[#E4DED2] bg-white hover:bg-[#6E1E2B]/10 hover:border-[#6E1E2B] transition-colors flex items-center gap-1 cursor-pointer text-[#201D1B]"
                        title="Print Customer Receipt or Kitchen Slip"
                      >
                        <svg className="w-3.5 h-3.5 text-[#6E1E2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        <span>Print Slip</span>
                      </button>

                      <button
                        onClick={() => setEditingOrder({ ...selectedOrder })}
                        className="text-xs px-2.5 py-1 rounded border border-[#E4DED2] bg-white hover:bg-[#A9824F]/10 hover:border-[#A9824F] transition-colors flex items-center gap-1 cursor-pointer text-[#201D1B]"
                        title="Edit Customer / Delivery Details"
                      >
                        <svg className="w-3.5 h-3.5 text-[#A9824F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => deleteOrder(selectedOrder.orderNumber)}
                        className="text-xs px-2 py-1 rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Delete Order Permanently"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="text-xs space-y-2 pb-4 mb-4 border-b border-[#E4DED2]">
                    <p className="font-semibold uppercase tracking-wider text-[#A9824F]">Customer Details</p>
                    <div className="grid grid-cols-2 gap-2 text-[#201D1B]">
                      <div>
                        <span className="text-[#888]">Name:</span>{" "}
                        <span className="font-medium">{selectedOrder.customerName}</span>
                      </div>
                      <div>
                        <span className="text-[#888]">Phone:</span>{" "}
                        <span className="font-medium">{selectedOrder.phone}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[#888]">Email:</span>{" "}
                        <span className="font-medium">{selectedOrder.email}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[#888]">Destination:</span>{" "}
                        <span className="font-medium">{selectedOrder.address}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[#888]">Fulfillment:</span>{" "}
                        <span className="font-medium">{selectedOrder.fulfillment} ({selectedOrder.preferredDate || "Standard"})</span>
                      </div>
                      {selectedOrder.notes && (
                        <div className="col-span-2 bg-[#F6F2EB] p-2 rounded text-[11px] italic text-[#4A4642]">
                          Note: "{selectedOrder.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="text-xs pb-4 mb-4 border-b border-[#E4DED2]">
                    <p className="font-semibold uppercase tracking-wider text-[#A9824F] mb-2">Order Items</p>
                    <div className="space-y-2">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-[#E4DED2]/40 last:border-0">
                          <div>
                            <p className="font-medium text-[#201D1B]">{item.name}</p>
                            <p className="text-[10px] text-[#888]">Qty: {item.qty} × {formatNaira(item.price)}</p>
                          </div>
                          <span className="font-semibold">{formatNaira(item.price * item.qty)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#E4DED2] space-y-1">
                      <div className="flex justify-between text-[#4A4642]">
                        <span>Subtotal:</span>
                        <span>{formatNaira(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-[#4A4642]">
                        <span>Delivery Fee:</span>
                        <span>{formatNaira(selectedOrder.deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-[#201D1B] pt-1 border-t border-[#E4DED2]">
                        <span>Total Paid:</span>
                        <span className="text-[#6E1E2B] font-display text-base">{formatNaira(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="text-xs pb-4 mb-4 border-b border-[#E4DED2] bg-[#F6F2EB] p-3 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-[#6E1E2B]">Payment Information</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        selectedOrder.isPaid || (selectedOrder.paymentStatus || "").toLowerCase() === "paid"
                          ? "bg-[#2E7D32]/10 text-[#2E7D32]"
                          : "bg-[#E65100]/15 text-[#E65100]"
                      }`}>
                        {selectedOrder.isPaid || (selectedOrder.paymentStatus || "").toLowerCase() === "paid" ? "● PAID" : "● AWAITING TRANSFER"}
                      </span>
                    </div>
                    <p className="text-[#201D1B]">Gateway: {selectedOrder.paymentMethod || "Paystack"}</p>
                    <p className="text-[#201D1B] font-mono">Ref: {selectedOrder.paymentReference || "N/A"}</p>
                    <p className="text-[11px] text-[#4A4642] mt-1">Paid on: {selectedOrder.paidAt || selectedOrder.placedOn}</p>
                  </div>

                  {/* Bank Transfer Approval Card & Uploaded Receipt Proof */}
                  {selectedOrder.receiptImage ? (
                    <div className="mb-4 p-3.5 rounded-sm bg-[#F0FDF4] border border-[#BBF7D0] text-xs space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🧾</span>
                          <div>
                            <p className="font-semibold text-[#166534] text-xs">Customer Uploaded Transfer Receipt</p>
                            <p className="text-[11px] text-[#15803D] mt-0.5">
                              Sender: <strong className="font-medium text-[#166534]">{selectedOrder.senderAccountName || selectedOrder.customerName}</strong>
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534] uppercase tracking-wider">
                          Proof Attached
                        </span>
                      </div>

                      {/* Receipt Image Thumbnail & Zoom */}
                      <div className="relative group rounded border border-[#BBF7D0] overflow-hidden bg-white max-h-48 flex items-center justify-center">
                        <img
                          src={selectedOrder.receiptImage}
                          alt="Customer Payment Receipt"
                          className="w-full object-contain max-h-44 cursor-pointer hover:scale-[1.02] transition-transform"
                          onClick={() => setViewingReceiptImage(selectedOrder.receiptImage)}
                        />
                        <button
                          type="button"
                          onClick={() => setViewingReceiptImage(selectedOrder.receiptImage)}
                          className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/75 hover:bg-black text-white text-[11px] font-medium rounded shadow flex items-center gap-1 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                          </svg>
                          <span>Zoom Receipt</span>
                        </button>
                      </div>

                      {/* Verify Button (if still unpaid) */}
                      {(!selectedOrder.isPaid || (selectedOrder.paymentStatus || "").toLowerCase() !== "paid") ? (
                        <button
                          onClick={() => verifyTransferPayment(selectedOrder.orderNumber)}
                          className="w-full py-2.5 rounded-sm text-white font-semibold text-xs shadow-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
                          style={{ backgroundColor: "#166534" }}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          <span>✓ Verify Receipt & Confirm Order</span>
                        </button>
                      ) : (
                        <div className="py-1 px-2 rounded bg-emerald-100 text-emerald-800 text-[11px] font-medium text-center">
                          ✓ Transfer Verified & Funds Reconciled
                        </div>
                      )}
                    </div>
                  ) : (!selectedOrder.isPaid || (selectedOrder.paymentStatus || "").toLowerCase() !== "paid") && (
                    <div className="mb-4 p-3.5 rounded-sm bg-[#FFF8E1] border border-[#FFE082] text-xs space-y-2.5">
                      <div className="flex items-start gap-2">
                        <span className="text-base">⚠️</span>
                        <div>
                          <p className="font-semibold text-[#E65100]">Awaiting Bank Transfer Confirmation</p>
                          <p className="text-[11px] text-[#5D4037] mt-0.5">
                            Customer paid via direct GTBank transfer. No receipt uploaded (customer may send via WhatsApp). Check your bank app for <strong>{formatNaira(selectedOrder.total)}</strong> before confirming.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => verifyTransferPayment(selectedOrder.orderNumber)}
                        className="w-full py-2.5 rounded-sm text-white font-semibold text-xs shadow-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
                        style={{ backgroundColor: "#2E7D32" }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span>✓ I Have Received Funds — Confirm Order</span>
                      </button>
                    </div>
                  )}

                  {/* Stage Advancement Action Buttons (Matching Blueprint) */}
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#A9824F]">Update Order Stage</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => updateStatus(selectedOrder.orderNumber, 1, "Preparing")}
                        className={`py-2 rounded-sm text-xs font-medium border transition-colors ${
                          selectedOrder.status === "Preparing"
                            ? "bg-[#6E1E2B] text-white border-[#6E1E2B]"
                            : "hover:bg-[#E4DED2] border-[#E4DED2]"
                        }`}
                      >
                        Preparing
                      </button>
                      <button
                        onClick={() => updateStatus(selectedOrder.orderNumber, 2, "Out for Delivery")}
                        className={`py-2 rounded-sm text-xs font-medium border transition-colors ${
                          selectedOrder.status === "Out for Delivery"
                            ? "bg-[#6E1E2B] text-white border-[#6E1E2B]"
                            : "hover:bg-[#E4DED2] border-[#E4DED2]"
                        }`}
                      >
                        Out for Delivery
                      </button>
                      <button
                        onClick={() => updateStatus(selectedOrder.orderNumber, 3, "Delivered")}
                        className={`py-2 rounded-sm text-xs font-medium border transition-colors ${
                          selectedOrder.status === "Delivered"
                            ? "bg-[#2E7D32] text-white border-[#2E7D32]"
                            : "hover:bg-[#E4DED2] border-[#E4DED2]"
                        }`}
                      >
                        Delivered
                      </button>
                    </div>

                    {/* Customer Action Direct WhatsApp */}
                    <div className="pt-2">
                      <a
                        href={`https://wa.me/${selectedOrder.phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Hello ${selectedOrder.customerName}, this is ${STORE_NAME}. Your order #${selectedOrder.orderNumber} is currently: ${selectedOrder.status}. Thank you for ordering with us!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-sm text-xs font-semibold text-white flex items-center justify-center gap-2 shadow-sm transition-opacity hover:opacity-90"
                        style={{ backgroundColor: "#25D366" }}
                      >
                        <span>WhatsApp Customer ({selectedOrder.phone})</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#FBF9F5] rounded-sm border border-[#E4DED2] p-8 text-center text-xs text-[#888]">
                  Select an order from the table to view details.
                </div>
              )}

              {/* Live Notifications Feed (Right Column in Blueprint) */}
              <div className="bg-[#FBF9F5] rounded-sm border border-[#E4DED2] p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4DED2]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <h3 className="font-display text-base font-semibold text-[#201D1B]">Live Notifications</h3>
                  </div>
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-[#A9824F] hover:underline"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="divide-y divide-[#E4DED2]/60 mt-3 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 text-xs flex items-start gap-2.5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? "bg-[#6E1E2B]" : "bg-[#C9BFAE]"}`} />
                      <div className="flex-1">
                        <p className="font-semibold text-[#201D1B]">{n.title}</p>
                        <p className="text-[#4A4642] text-[11px] mt-0.5">{n.desc}</p>
                        <p className="text-[10px] text-[#888] mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODULE 4: MENU CATALOG & DISH STUDIO */}
      {sidebarTab === "products" && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Header & Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4DED2]">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#6E1E2B]/10 border border-[#6E1E2B]/20 flex items-center justify-center text-[#6E1E2B] shadow-sm flex-shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="4" r="1.5" />
                    <path d="M4 14a8 8 0 0 1 16 0" />
                    <line x1="2" y1="17" x2="22" y2="17" strokeWidth="2" />
                    <line x1="6" y1="20" x2="18" y2="20" />
                  </svg>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-[#201D1B]">
                  Menu Catalogue
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#4A4642] mt-1">
                Manage live menu prices, 1-click in-stock availability, catering trays, and dish photos.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetMenu}
                className="text-xs px-3.5 py-2 rounded-sm border border-[#E4DED2] bg-white text-[#4A4642] hover:text-[#201D1B] hover:bg-[#E4DED2]/30 transition-colors cursor-pointer font-medium"
                title="Restore original starter dishes"
              >
                Reset to Default
              </button>
              <button
                type="button"
                onClick={() => setIsAddingProduct(true)}
                className="text-xs px-4 py-2 rounded-sm bg-[#6E1E2B] text-white hover:bg-[#561722] font-semibold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span className="text-sm font-bold">+</span>
                <span>Add New Dish</span>
              </button>
            </div>
          </div>

          {/* Metric Cards Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FBF9F5] p-4 rounded-sm border border-[#E4DED2] shadow-sm">
              <p className="text-xs text-[#A9824F] font-semibold uppercase tracking-wider">Total Menu Items</p>
              <p className="font-display text-2xl font-bold text-[#201D1B] mt-1">{menuMetrics.total}</p>
              <p className="text-[11px] text-[#4A4642] mt-0.5">Dishes across all categories</p>
            </div>

            <div className="bg-[#FBF9F5] p-4 rounded-sm border border-[#E4DED2] shadow-sm">
              <p className="text-xs text-[#A9824F] font-semibold uppercase tracking-wider">In Stock (Live)</p>
              <p className="font-display text-2xl font-bold text-emerald-700 mt-1 flex items-center gap-2">
                <span>{menuMetrics.inStock}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </p>
              <p className="text-[11px] text-[#4A4642] mt-0.5">Visible & orderable in customer shop</p>
            </div>

            <div className="bg-[#FBF9F5] p-4 rounded-sm border border-[#E4DED2] shadow-sm">
              <p className="text-xs text-[#A9824F] font-semibold uppercase tracking-wider">Sold Out (Paused)</p>
              <p className="font-display text-2xl font-bold text-[#6E1E2B] mt-1">{menuMetrics.soldOut}</p>
              <p className="text-[11px] text-[#4A4642] mt-0.5">Marked Sold Out on customer shop</p>
            </div>

            <div className="bg-[#FBF9F5] p-4 rounded-sm border border-[#E4DED2] shadow-sm">
              <p className="text-xs text-[#A9824F] font-semibold uppercase tracking-wider">Categories</p>
              <p className="font-display text-2xl font-bold text-[#201D1B] mt-1">
                {Math.max(categories.length - 1, 1)}
              </p>
              <p className="text-[11px] text-[#4A4642] mt-0.5">Active food sections</p>
            </div>
          </div>

          {/* Filter Strip & Live Search */}
          <div className="bg-[#FBF9F5] p-4 rounded-sm border border-[#E4DED2] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setMenuActiveCategory(cat)}
                  className={`text-xs px-3.5 py-1.5 rounded-sm whitespace-nowrap transition-colors cursor-pointer ${
                    menuActiveCategory === cat
                      ? "bg-[#6E1E2B] text-white font-semibold shadow-sm"
                      : "bg-white border border-[#E4DED2] text-[#4A4642] hover:text-[#201D1B]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <input
                type="text"
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                placeholder="Search dishes by name or ingredients..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
              />
              <svg
                className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#888]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Dish Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCatalog.map((dish) => (
              <div
                key={dish.id}
                className={`bg-[#FBF9F5] rounded-sm border transition-all duration-200 flex flex-col overflow-hidden shadow-sm hover:shadow-md ${
                  dish.inStock ? "border-[#E4DED2]" : "border-amber-300/80 bg-[#FFFDF9]"
                }`}
              >
                {/* Card Image Banner */}
                <div className="w-full h-44 bg-[#E4DED2] relative overflow-hidden group">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_FOOD_FALLBACK;
                    }}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      !dish.inStock ? "grayscale opacity-75" : ""
                    }`}
                    loading="lazy"
                  />
                  {/* Category Pill Tag */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm text-[#A9824F] text-[10px] uppercase font-bold tracking-wider rounded">
                    {dish.category}
                  </span>

                  {/* In Stock / Sold Out Badge */}
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded shadow ${
                      dish.inStock
                        ? "bg-emerald-600 text-white"
                        : "bg-[#6E1E2B] text-white animate-pulse"
                    }`}
                  >
                    {dish.inStock ? "● In Stock" : "✕ Sold Out"}
                  </span>

                  {/* Price Pill */}
                  <span className="absolute bottom-2 right-2 px-2.5 py-1 bg-[#201D1B]/85 text-white font-mono text-xs font-bold rounded">
                    {formatNaira(dish.price)}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-display text-base font-bold text-[#201D1B] leading-snug line-clamp-1">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-[#4A4642] mt-1.5 line-clamp-2 min-h-[32px]">
                    {dish.description || "No specific recipe description provided."}
                  </p>

                  {/* Quick Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-[#E4DED2] flex items-center justify-between gap-2">
                    {/* 1-Click Stock Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleStock(dish)}
                      className={`flex-1 text-xs py-1.5 px-2 rounded-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        dish.inStock
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                          : "bg-red-50 text-[#6E1E2B] border border-red-300 hover:bg-red-100"
                      }`}
                      title={dish.inStock ? "Click to mark as Sold Out" : "Click to mark as In Stock"}
                    >
                      <span className={`w-2 h-2 rounded-full ${dish.inStock ? "bg-emerald-500" : "bg-red-500"}`} />
                      <span>{dish.inStock ? "In Stock" : "Sold Out"}</span>
                    </button>

                    {/* Edit Dish Button */}
                    <button
                      type="button"
                      onClick={() => setEditingProduct(dish)}
                      className="p-1.5 text-xs text-[#4A4642] hover:text-[#6E1E2B] border border-[#E4DED2] bg-white hover:bg-[#E4DED2]/30 rounded-sm transition-colors cursor-pointer"
                      title="Edit dish name, price or photo"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>

                    {/* Delete Dish Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(dish)}
                      className="p-1.5 text-xs text-red-600 hover:text-red-800 border border-red-200 bg-white hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                      title="Delete dish from catalog"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCatalog.length === 0 && (
            <div className="bg-[#FBF9F5] rounded-sm border border-[#E4DED2] p-12 text-center">
              <p className="text-3xl mb-2">🍽️</p>
              <p className="font-display text-lg font-bold text-[#201D1B]">No dishes found</p>
              <p className="text-xs text-[#4A4642] mt-1 max-w-sm mx-auto">
                No items match your active search or category filters. Try switching category or clear the search query.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMenuActiveCategory("All");
                  setMenuSearchQuery("");
                }}
                className="mt-4 text-xs font-semibold px-4 py-2 bg-[#6E1E2B] text-white rounded-sm hover:bg-[#561722] cursor-pointer"
              >
                View All Dishes
              </button>
            </div>
          )}
        </div>
      )}

      {/* CUSTOMERS DIRECTORY & CRM */}
      {sidebarTab === "customers" && (
        <div className="space-y-6 animate-fade-in">
          <div className="pb-4 border-b border-[#E4DED2]">
            <h2 className="font-display text-2xl font-bold text-[#201D1B]">Customer Database</h2>
            <p className="text-xs text-[#4A4642] mt-0.5">Customer details, order history, and 1-click WhatsApp customer care</p>
          </div>

          <div className="bg-[#FBF9F5] rounded-sm border border-[#E4DED2] overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E4DED2] bg-[#F3EDE2]/60 text-[#201D1B] font-semibold">
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Phone & Contact</th>
                  <th className="p-3.5">Delivery Address</th>
                  <th className="p-3.5 text-center">Orders Placed</th>
                  <th className="p-3.5 text-right">Lifetime Spend</th>
                  <th className="p-3.5 text-center">Quick WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DED2]">
                {uniqueCustomers.map((cust, idx) => (
                  <tr key={idx} className="hover:bg-white/60 transition-colors">
                    <td className="p-3.5 font-semibold text-[#201D1B]">{cust.name}</td>
                    <td className="p-3.5 text-[#4A4642]">
                      <p className="font-mono">{cust.phone}</p>
                      <p className="text-[11px] text-[#888]">{cust.email}</p>
                    </td>
                    <td className="p-3.5 text-[#4A4642] max-w-xs truncate">{cust.address}</td>
                    <td className="p-3.5 text-center font-bold text-[#201D1B]">{cust.ordersCount}</td>
                    <td className="p-3.5 text-right font-bold text-[#6E1E2B] font-mono">{formatNaira(cust.totalSpent)}</td>
                    <td className="p-3.5 text-center">
                      <a
                        href={`https://wa.me/${(cust.phone || "").replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 text-white font-medium text-[11px] hover:bg-emerald-700 shadow-sm"
                      >
                        <span>Chat</span>
                        <span>💬</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYMENTS & SETTLEMENT LEDGER */}
      {sidebarTab === "payments" && (
        <div className="space-y-6 animate-fade-in">
          <div className="pb-4 border-b border-[#E4DED2]">
            <h2 className="font-display text-2xl font-bold text-[#201D1B]">Payments</h2>
            <p className="text-xs text-[#4A4642] mt-0.5">Paystack webhook logs, direct bank transfers, and verification status</p>
          </div>

          <div className="bg-[#FBF9F5] rounded-sm border border-[#E4DED2] overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E4DED2] bg-[#F3EDE2]/60 text-[#201D1B] font-semibold">
                  <th className="p-3.5">Reference ID</th>
                  <th className="p-3.5">Order #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DED2]">
                {orders.map((o) => (
                  <tr key={o.orderNumber} className="hover:bg-white/60 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-[#4A4642]">{o.paymentReference || "N/A"}</td>
                    <td className="p-3.5 font-bold text-[#201D1B]">#{o.orderNumber}</td>
                    <td className="p-3.5 text-[#201D1B] font-medium">{o.customerName}</td>
                    <td className="p-3.5 text-[#4A4642]">{o.paymentMethod}</td>
                    <td className="p-3.5 text-right font-bold text-[#201D1B] font-mono">{formatNaira(o.total)}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          o.isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {!o.isPaid ? (
                        <button
                          type="button"
                          onClick={() => verifyTransferPayment(o.orderNumber)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                        >
                          Verify Transfer
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium">✓ Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SALES ANALYTICS */}
      {sidebarTab === "analytics" && (
        <div className="space-y-6 animate-fade-in">
          <div className="pb-4 border-b border-[#E4DED2]">
            <h2 className="font-display text-2xl font-bold text-[#201D1B]">Sales Analytics</h2>
            <p className="text-xs text-[#4A4642] mt-0.5">Summary of financials, average order size, and kitchen performance</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-[#FBF9F5] p-5 rounded-sm border border-[#E4DED2] shadow-sm">
              <p className="text-xs font-semibold text-[#A9824F] uppercase tracking-wider">Gross Sales</p>
              <p className="font-display text-3xl font-bold text-[#6E1E2B] mt-1">{formatNaira(totalRevenue)}</p>
              <p className="text-xs text-[#4A4642] mt-1">From all confirmed & paid orders</p>
            </div>

            <div className="bg-[#FBF9F5] p-5 rounded-sm border border-[#E4DED2] shadow-sm">
              <p className="text-xs font-semibold text-[#A9824F] uppercase tracking-wider">Average Order Value (AOV)</p>
              <p className="font-display text-3xl font-bold text-[#201D1B] mt-1">
                {formatNaira(counts.all > 0 ? Math.round(totalRevenue / counts.all) : 0)}
              </p>
              <p className="text-xs text-[#4A4642] mt-1">Average spent per catering customer</p>
            </div>

            <div className="bg-[#FBF9F5] p-5 rounded-sm border border-[#E4DED2] shadow-sm">
              <p className="text-xs font-semibold text-[#A9824F] uppercase tracking-wider">Delivery vs Pickup</p>
              <p className="font-display text-3xl font-bold text-[#201D1B] mt-1">
                {orders.filter((o) => o.fulfillment === "Delivery").length} / {orders.filter((o) => o.fulfillment === "Pickup").length}
              </p>
              <p className="text-xs text-[#4A4642] mt-1">Delivery runs vs Hub collections</p>
            </div>
          </div>
        </div>
      )}

      {/* STORE & VENDOR SETTINGS */}
      {sidebarTab === "settings" && (
        <div className="space-y-6 animate-fade-in max-w-3xl">
          <div className="pb-4 border-b border-[#E4DED2]">
            <h2 className="font-display text-2xl font-bold text-[#201D1B]">Admin Settings</h2>
            <p className="text-xs text-[#4A4642] mt-0.5">Operational configuration, payment accounts, and security preferences</p>
          </div>

          <div className="bg-[#FBF9F5] p-6 rounded-sm border border-[#E4DED2] shadow-sm space-y-4">
            <h3 className="font-display text-base font-bold text-[#201D1B]">Bank Transfer Details (GTBank)</h3>
            <p className="text-xs text-[#4A4642]">
              Customers who choose "Direct Bank Transfer" at checkout see these instructions:
            </p>
            <div className="p-4 bg-white border border-[#E4DED2] rounded-sm font-mono text-xs space-y-1">
              <p><span className="text-[#888]">Bank Name:</span> <strong>Guaranty Trust Bank (GTBank)</strong></p>
              <p><span className="text-[#888]">Account Name:</span> <strong>The Platter House Catering Ltd</strong></p>
              <p><span className="text-[#888]">Account Number:</span> <strong>0123456789</strong></p>
            </div>
          </div>

          {/* VENDOR SECURITY & ACCESS CONTROL PANEL */}
          <div className="bg-[#FBF9F5] p-6 rounded-sm border border-[#E4DED2] shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4DED2] pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-[#201D1B] flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#A9824F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  <span>Vendor Security & Master PIN</span>
                </h3>
                <p className="text-xs text-[#4A4642] mt-0.5">
                  Manage your portal PIN, inactivity auto-lock timeout, and trusted devices
                </p>
              </div>
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  activeAdminPin === (ADMIN_PIN || "1234").trim()
                    ? "bg-[#A9824F]/15 text-[#6E1E2B] border border-[#A9824F]/30"
                    : "bg-[#1B5E20]/15 text-[#1B5E20] border border-[#4CAF50]/30"
                }`}
              >
                {activeAdminPin === (ADMIN_PIN || "1234").trim() ? "Default PIN Active" : "Custom PIN Active"}
              </span>
            </div>

            {/* Current PIN & Change PIN Form */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-[#E4DED2] rounded-sm text-xs">
                <div>
                  <span className="text-[#888] block text-[11px]">Current Security PIN</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-base font-bold tracking-widest text-[#201D1B]">
                      ••••
                    </span>
                    <span className="text-[10px] text-[#A9824F] bg-[#A9824F]/10 px-2 py-0.5 rounded">
                      {activeAdminPin.length} digits configured
                    </span>
                  </div>
                </div>
                {activeAdminPin !== (ADMIN_PIN || "1234").trim() && (
                  <button
                    type="button"
                    onClick={handleResetPinToDefault}
                    className="px-3 py-1.5 text-xs text-[#6E1E2B] hover:bg-[#6E1E2B]/5 border border-[#6E1E2B]/30 rounded cursor-pointer transition-colors"
                  >
                    Reset to Default (1234)
                  </button>
                )}
              </div>

              {/* Form Feedback */}
              {changePinError && (
                <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <span>✕</span>
                  <span>{changePinError}</span>
                </div>
              )}
              {changePinSuccess && (
                <div className="p-3 rounded bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2">
                  <span>✓</span>
                  <span>{changePinSuccess}</span>
                </div>
              )}

              {/* Change PIN Form */}
              <form onSubmit={handleChangePinSubmit} className="space-y-3 bg-white p-4 border border-[#E4DED2] rounded-sm">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6E1E2B]">
                  Change 4-Digit Security PIN
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#4A4642] mb-1">
                      Current PIN <span className="text-[#6E1E2B]">*</span>
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      placeholder="e.g. 1234"
                      value={changePinForm.currentPin}
                      onChange={(e) =>
                        setChangePinForm({
                          ...changePinForm,
                          currentPin: e.target.value.replace(/[^0-9]/g, ""),
                        })
                      }
                      className="w-full px-3 py-2 text-xs font-mono bg-[#FBF9F5] border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B] text-center tracking-widest"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#4A4642] mb-1">
                      New 4-Digit PIN <span className="text-[#6E1E2B]">*</span>
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      placeholder="e.g. 5829"
                      value={changePinForm.newPin}
                      onChange={(e) =>
                        setChangePinForm({
                          ...changePinForm,
                          newPin: e.target.value.replace(/[^0-9]/g, ""),
                        })
                      }
                      className="w-full px-3 py-2 text-xs font-mono bg-[#FBF9F5] border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B] text-center tracking-widest"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#4A4642] mb-1">
                      Confirm New PIN <span className="text-[#6E1E2B]">*</span>
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      placeholder="e.g. 5829"
                      value={changePinForm.confirmPin}
                      onChange={(e) =>
                        setChangePinForm({
                          ...changePinForm,
                          confirmPin: e.target.value.replace(/[^0-9]/g, ""),
                        })
                      }
                      className="w-full px-3 py-2 text-xs font-mono bg-[#FBF9F5] border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B] text-center tracking-widest"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-sm text-xs font-semibold text-white bg-[#6E1E2B] hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                  >
                    Save New PIN
                  </button>
                </div>
              </form>
            </div>

            {/* Inactivity Auto-Lock Setting */}
            <div className="pt-4 border-t border-[#E4DED2] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-[#201D1B] flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#A9824F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <polyline points="12 7 12 12 15 15" />
                    </svg>
                    <span>Auto-Lock on Inactivity</span>
                  </h4>
                  <p className="text-[11px] text-[#4A4642] mt-0.5">
                    Automatically locks the dashboard when no mouse, typing, or touch activity is detected.
                  </p>
                </div>
                <select
                  value={inactivityMinutes}
                  onChange={(e) => {
                    const mins = Number(e.target.value);
                    setInactivityMinutes(mins);
                    try {
                      localStorage.setItem("tph_admin_inactivity_minutes", String(mins));
                    } catch {}
                    showToast(
                      mins === 0
                        ? "Inactivity auto-lock disabled"
                        : `Auto-lock set to ${mins} minutes`
                    );
                  }}
                  className="px-3 py-2 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B] text-[#201D1B] font-medium cursor-pointer"
                >
                  <option value={2}>2 minutes (Strict / Countertop POS)</option>
                  <option value={3}>3 minutes (Recommended Default)</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={0}>Disabled / Never (Back office)</option>
                </select>
              </div>
            </div>

            {/* Trusted Device Session & Quick Lock */}
            <div className="pt-4 border-t border-[#E4DED2] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-[11px] text-[#4A4642]">
                <span className="font-semibold text-[#201D1B]">Trusted Device Session:</span>{" "}
                {rememberDevice ? (
                  <span className="text-[#1B5E20] font-medium">Active (24-Hour Keep Unlocked)</span>
                ) : (
                  <span className="text-[#888]">Standard Session (Locks on window close)</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {rememberDevice && (
                  <button
                    type="button"
                    onClick={() => {
                      setRememberDevice(false);
                      try {
                        localStorage.removeItem("tph_admin_authed_until");
                        localStorage.setItem("tph_admin_remember_choice", "false");
                      } catch {}
                      showToast("Revoked 24h trusted session on this device");
                    }}
                    className="px-3 py-1.5 rounded-sm border border-[#E4DED2] bg-white text-[#6E1E2B] hover:bg-[#6E1E2B]/5 text-xs transition-colors cursor-pointer"
                  >
                    Revoke 24h Session
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLockPortal}
                  className="px-3 py-1.5 rounded-sm bg-[#201D1B] hover:bg-[#201D1B]/80 text-[#F6F2EB] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 text-[#A9824F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  <span>Lock Portal Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  </div>

      {/* EDIT ORDER MODAL DIALOG */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FBF9F5] rounded-sm border border-[#E4DED2] w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#6E1E2B] text-white flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold">Edit Order #{editingOrder.orderNumber}</h3>
                <p className="text-xs text-white/80">Update customer contact or delivery details</p>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors text-sm cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveOrderEdit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Customer Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#201D1B] mb-1">
                    Customer Name <span className="text-[#6E1E2B]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingOrder.customerName || ""}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, customerName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#201D1B] mb-1">
                    Phone Number <span className="text-[#6E1E2B]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={editingOrder.phone || ""}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                  />
                </div>
              </div>

              {/* Email & Delivery Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#201D1B] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editingOrder.email || ""}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#201D1B] mb-1">
                    Preferred Delivery / Event Date
                  </label>
                  <input
                    type="text"
                    value={editingOrder.preferredDate || ""}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, preferredDate: e.target.value })
                    }
                    placeholder="e.g. Tomorrow, 12:00 PM"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-semibold text-[#201D1B] mb-1">
                  Delivery Address / Location <span className="text-[#6E1E2B]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingOrder.address || ""}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, address: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                />
              </div>

              {/* Special Instructions / Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#201D1B] mb-1">
                  Special Notes & Dietary Instructions
                </label>
                <textarea
                  rows={2}
                  value={editingOrder.notes || ""}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, notes: e.target.value })
                  }
                  placeholder="e.g. Mild pepper, extra disposable spoons, call upon arrival"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                />
              </div>

              {/* Order Items Info (Read-Only notice) */}
              <div className="bg-[#E4DED2]/30 p-3 rounded-sm border border-[#E4DED2] text-[11px] text-[#4A4642]">
                <p className="font-semibold text-[#201D1B] mb-1">Order Summary ({editingOrder.items?.length || 0} items):</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {editingOrder.items?.map((item, idx) => (
                    <li key={idx}>
                      {item.qty}x {item.name} ({formatNaira(item.price * item.qty)})
                    </li>
                  ))}
                </ul>
                <p className="mt-1 font-medium text-[#201D1B]">Total: {formatNaira(editingOrder.total)}</p>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-[#E4DED2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 text-xs font-medium text-[#4A4642] hover:text-[#201D1B] border border-[#E4DED2] rounded-sm bg-white hover:bg-[#E4DED2]/40 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#6E1E2B] hover:bg-[#561722] rounded-sm shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save Changes</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* THERMAL RECEIPT / KITCHEN SLIP DISPENSER MODAL */}
      {showReceiptModal && selectedOrder && (
        <div
          id="printable-receipt-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
        >
          <div className="w-full max-w-[420px] my-auto flex flex-col items-center">
            
            {/* Top Thermal Printer Slot (Machine Casing) - Hidden in Print */}
            <div className="no-print w-full bg-[#1A1817] rounded-t-xl border border-[#3E3A36] p-3 shadow-2xl relative">
              <div className="flex items-center justify-between pb-2 border-b border-[#2D2A26] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[11px] text-[#A9824F] font-semibold tracking-wider uppercase">
                    Thermal POS 80mm
                  </span>
                </div>
                
                {/* Mode Selector Toggle */}
                <div className="flex items-center bg-black/60 rounded p-0.5 border border-[#3E3A36]">
                  <button
                    onClick={() => {
                      setReceiptMode("customer");
                      setDispenseKey((k) => k + 1);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      receiptMode === "customer"
                        ? "bg-[#6E1E2B] text-white"
                        : "text-[#888] hover:text-white"
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    onClick={() => {
                      setReceiptMode("kitchen");
                      setDispenseKey((k) => k + 1);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      receiptMode === "kitchen"
                        ? "bg-[#6E1E2B] text-white"
                        : "text-[#888] hover:text-white"
                    }`}
                  >
                    Kitchen
                  </button>
                </div>

                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs ml-2 cursor-pointer transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* The Recessed Paper Dispensing Mouth */}
              <div className="mt-2.5 h-3 bg-[#0A0A09] rounded-full border-t border-black/80 shadow-inner flex items-center justify-center relative">
                <div className="w-48 h-0.5 bg-[#252220] rounded-full" />
              </div>
            </div>

            {/* Dispensing Paper Area: Clipped container allowing the ticket to slide out downwards */}
            <div className="w-full flex justify-center overflow-hidden pt-1 pb-3">
              <div
                key={dispenseKey}
                id="printable-ticket"
                className="animate-dispense w-full max-w-[340px] bg-white text-black font-mono text-xs shadow-2xl relative select-none"
                style={{
                  filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.45))",
                }}
              >
                {/* Paper Top Margin */}
                <div className="pt-5 px-5">
                  {receiptMode === "customer" ? (
                    /* ================= CUSTOMER RECEIPT VIEW ================= */
                    <div className="space-y-3 text-center">
                      {/* Brand Header with Logo */}
                      <div className="flex flex-col items-center">
                        <img
                          src={brandLogo}
                          alt={STORE_NAME}
                          className="w-16 h-16 object-contain rounded-full bg-white p-1 border border-neutral-300 shadow-sm mb-1.5"
                        />
                        <h2 className="font-bold text-base tracking-widest uppercase">
                          THE PLATTER HOUSE
                        </h2>
                        <p className="text-[10px] tracking-wide text-neutral-600 uppercase mt-0.5">
                          Luxury Catering & Small Chops
                        </p>
                        <p className="text-[9px] text-neutral-500 mt-0.5">
                          Lekki Phase 1, Lagos • +234 812 345 6789
                        </p>
                      </div>

                      <div className="border-t border-dashed border-neutral-400 my-2" />

                      {/* Order Info */}
                      <div className="text-left text-[11px] space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>ORDER: #{selectedOrder.orderNumber}</span>
                          <span className="uppercase text-[10px] px-1 border border-black">
                            {selectedOrder.fulfillment || "Delivery"}
                          </span>
                        </div>
                        <div className="flex justify-between text-neutral-600 text-[10px]">
                          <span>DATE:</span>
                          <span>{selectedOrder.placedOn}</span>
                        </div>
                        <div className="flex justify-between text-neutral-600 text-[10px]">
                          <span>CLIENT:</span>
                          <span className="font-semibold text-black truncate max-w-[170px]">
                            {selectedOrder.customerName}
                          </span>
                        </div>
                        <div className="flex justify-between text-neutral-600 text-[10px]">
                          <span>PHONE:</span>
                          <span>{selectedOrder.phone}</span>
                        </div>
                        <div className="text-[10px] text-neutral-600 pt-0.5">
                          <span className="font-semibold text-black">DEST: </span>
                          <span>{selectedOrder.address}</span>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-neutral-400 my-2" />

                      {/* Line Items */}
                      <div className="text-left space-y-1.5 text-[11px]">
                        <div className="flex justify-between text-[10px] font-bold pb-0.5 border-b border-neutral-300">
                          <span>QTY  ITEM</span>
                          <span>AMOUNT</span>
                        </div>
                        {selectedOrder.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start text-[10px] leading-tight">
                            <span className="flex-1 pr-2">
                              {item.qty}x {item.name}
                            </span>
                            <span className="font-semibold whitespace-nowrap">
                              {formatNaira(item.price * item.qty)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-dashed border-neutral-400 my-2" />

                      {/* Financial Totals */}
                      <div className="text-left text-[11px] space-y-1">
                        <div className="flex justify-between text-[10px] text-neutral-600">
                          <span>SUBTOTAL:</span>
                          <span>{formatNaira(selectedOrder.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-neutral-600">
                          <span>DELIVERY:</span>
                          <span>{formatNaira(selectedOrder.deliveryFee || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold pt-1 border-t border-neutral-300">
                          <span>TOTAL:</span>
                          <span>{formatNaira(selectedOrder.total)}</span>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-neutral-400 my-2" />

                      {/* Payment Status Stamp */}
                      <div className="border border-neutral-800 p-1.5 rounded-sm text-center">
                        <p className="font-bold text-xs uppercase tracking-wider">
                          {selectedOrder.isPaid ? "✓ PAID IN FULL" : "⏳ PAYMENT PENDING"}
                        </p>
                        <p className="text-[9px] text-neutral-600 mt-0.5">
                          Method: {selectedOrder.paymentMethod || "Bank Transfer"}
                        </p>
                        {selectedOrder.paymentReference && (
                          <p className="text-[8px] text-neutral-500 font-mono">
                            Ref: {selectedOrder.paymentReference}
                          </p>
                        )}
                      </div>

                      {/* Barcode & Footer */}
                      <div className="pt-2 text-center space-y-1.5">
                        <div className="flex justify-center items-center py-1">
                          {/* Simulated Vector Barcode */}
                          <div className="flex items-center gap-[2px] h-9">
                            {[2,4,1,3,2,5,1,2,4,2,1,3,4,1,2,5,3,1,2,4,1,3,2,4,1,2].map((w, i) => (
                              <div
                                key={i}
                                className="bg-black h-full"
                                style={{ width: `${w}px` }}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[9px] tracking-widest text-neutral-700">
                          *{selectedOrder.orderNumber}*
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider pt-1">
                          THANK YOU FOR YOUR PATRONAGE!
                        </p>
                        <p className="text-[8px] text-neutral-500">
                          www.theplatterhouse.ng
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* ================= KITCHEN PREP SLIP VIEW (KOT) ================= */
                    <div className="space-y-3 text-center">
                      {/* Chef Header with Logo */}
                      <div className="bg-neutral-900 text-white p-2.5 rounded-sm flex items-center gap-3 text-left">
                        <img
                          src={brandLogo}
                          alt={STORE_NAME}
                          className="w-11 h-11 object-contain rounded-full bg-white p-0.5 border border-white/40 flex-shrink-0"
                        />
                        <div>
                          <h2 className="font-bold text-sm tracking-widest uppercase">
                            🍳 KITCHEN PREP TICKET
                          </h2>
                          <p className="text-[9px] tracking-wider uppercase text-neutral-300 mt-0.5">
                            CHEF & PACKING COPY (KOT)
                          </p>
                        </div>
                      </div>

                      <div className="border-t-2 border-black my-2" />

                      {/* Due Time & Target */}
                      <div className="text-left space-y-1">
                        <div className="bg-neutral-100 p-2 border border-neutral-300 rounded-sm">
                          <p className="text-[9px] text-neutral-500 uppercase font-bold">REQUIRED BY:</p>
                          <p className="text-xs font-bold text-black uppercase">
                            {selectedOrder.preferredDate || "IMMEDIATE PREPARATION"}
                          </p>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold pt-1">
                          <span>ORDER: #{selectedOrder.orderNumber}</span>
                          <span className="uppercase text-[10px] px-1 bg-black text-white">
                            {selectedOrder.fulfillment || "Delivery"}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-700">
                          <span className="font-bold">CLIENT:</span> {selectedOrder.customerName} ({selectedOrder.phone})
                        </p>
                        <p className="text-[10px] text-neutral-700">
                          <span className="font-bold">LOCATION:</span> {selectedOrder.address}
                        </p>
                      </div>

                      <div className="border-t border-dashed border-neutral-400 my-2" />

                      {/* Items to Cook with Checkboxes */}
                      <div className="text-left space-y-2 text-[11px]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                          ITEMS TO COOK & ASSEMBLE:
                        </p>
                        {selectedOrder.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 p-1.5 border border-neutral-300 rounded-sm bg-neutral-50"
                          >
                            <span className="w-4 h-4 border border-black rounded-[2px] inline-block flex-shrink-0 mt-0.5" />
                            <div className="flex-1 leading-snug">
                              <span className="font-bold text-xs">{item.qty}x </span>
                              <span className="font-semibold text-xs uppercase">{item.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-dashed border-neutral-400 my-2" />

                      {/* Chef Notes / Allergies */}
                      <div className="text-left bg-neutral-100 p-2 border border-neutral-300 rounded-sm text-[10px]">
                        <p className="font-bold uppercase text-neutral-700 mb-0.5">⚠️ CHEF & ALLERGY NOTES:</p>
                        <p className="text-neutral-800 italic">
                          {selectedOrder.notes && selectedOrder.notes.trim() !== ""
                            ? selectedOrder.notes
                            : "No special dietary requests specified."}
                        </p>
                      </div>

                      {/* Kitchen Checklist */}
                      <div className="text-left text-[9px] space-y-1 text-neutral-600 pt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 border border-neutral-400 rounded-[2px]" />
                          <span>Food temperature & freshness verified</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 border border-neutral-400 rounded-[2px]" />
                          <span>Platter sealed with branded sticker & ribbon</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 border border-neutral-400 rounded-[2px]" />
                          <span>Cutlery & dip containers included</span>
                        </div>
                      </div>

                      <div className="border-t-2 border-black my-2" />

                      <div className="text-left text-[9px] pt-1">
                        <p className="font-bold">HEAD CHEF SIGNATURE:</p>
                        <div className="border-b border-black mt-4 mb-1" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Jagged Sawtooth Perforated Edge at the Bottom */}
                <div className="w-full overflow-hidden leading-none h-3 pt-3">
                  <svg
                    className="w-full h-3 text-white fill-current block"
                    viewBox="0 0 340 10"
                    preserveAspectRatio="none"
                  >
                    <path d="M0,0 L8.5,10 L17,0 L25.5,10 L34,0 L42.5,10 L51,0 L59.5,10 L68,0 L76.5,10 L85,0 L93.5,10 L102,0 L110.5,10 L119,0 L127.5,10 L136,0 L144.5,10 L153,0 L161.5,10 L170,0 L178.5,10 L187,0 L195.5,10 L204,0 L212.5,10 L221,0 L229.5,10 L238,0 L246.5,10 L255,0 L263.5,10 L272,0 L280.5,10 L289,0 L297.5,10 L306,0 L314.5,10 L323,0 L331.5,10 L340,0 Z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom Floating Control Bar (No-Print) */}
            <div className="no-print w-full flex items-center justify-between gap-2 pt-2 px-1 text-xs">
              <button
                type="button"
                onClick={() => setDispenseKey((k) => k + 1)}
                className="px-3 py-2 rounded-sm bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer text-[11px]"
                title="Feed ticket again"
              >
                <span>Feed Again 🔄</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="px-3 py-2 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer text-[11px]"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-sm bg-[#6E1E2B] hover:bg-[#541620] text-white font-semibold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print Ticket / PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* EDIT DISH MODAL DIALOG */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FBF9F5] rounded-sm border border-[#E4DED2] w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#6E1E2B] text-white flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold">Edit Dish: {editingProduct.name}</h3>
                <p className="text-xs text-white/80">Update price, category, upload photo or edit description</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
              <div>
                <label className="block text-xs font-semibold text-[#201D1B] mb-1">
                  Dish / Platter Name <span className="text-[#6E1E2B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#201D1B] mb-1">
                    Category <span className="text-[#6E1E2B]">*</span>
                  </label>
                  <select
                    value={
                      categories.includes(editingProduct.category) && editingProduct.category !== "__custom__"
                        ? editingProduct.category
                        : "__custom__"
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "__custom__") {
                        setEditingProduct({
                          ...editingProduct,
                          category: "__custom__",
                          customCategory: editingProduct.customCategory || editingProduct.category || "",
                        });
                      } else {
                        setEditingProduct({ ...editingProduct, category: val });
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                  >
                    {categories
                      .filter((c) => c !== "All")
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    <option value="__custom__">✨ + Enter Custom Category...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#201D1B] mb-1">
                    Price (₦ Naira) <span className="text-[#6E1E2B]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.price || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                  />
                </div>
              </div>

              {/* Custom Category Input if selected */}
              {(editingProduct.category === "__custom__" ||
                (!categories.includes(editingProduct.category) && editingProduct.category !== "All")) && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-sm animate-fade-in">
                  <label className="block text-[11px] font-semibold text-[#8B6528] mb-1">
                    Type Custom Category Name: <span className="text-[#6E1E2B]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grills & Suya, Party Soups, Cocktails..."
                    value={editingProduct.customCategory ?? editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: "__custom__",
                        customCategory: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                  />
                </div>
              )}

              {/* Photo Upload Section */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#201D1B]">
                  Dish Photo / Image
                </label>

                {/* Primary Upload Button from Device */}
                <div className="p-3 bg-white border border-dashed border-[#A9824F]/70 rounded-sm">
                  <p className="text-xs font-medium text-[#201D1B] mb-1">
                    📸 Choose Photo from Device / Gallery
                  </p>
                  <p className="text-[11px] text-[#4A4642] mb-2">
                    Upload from your phone camera or laptop. Resized and stored automatically.
                  </p>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6E1E2B] text-white text-xs font-semibold rounded-sm hover:bg-[#561722] cursor-pointer shadow-sm transition-colors">
                    <span>📁 Browse Files / Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditImageUploadLoading(true);
                          processDeviceImage(
                            file,
                            (dataUrl) => {
                              setEditingProduct((prev) => ({ ...prev, image: dataUrl }));
                              setEditImageUploadLoading(false);
                              showToast("✓ Photo loaded from your device!");
                            },
                            (err) => {
                              setEditImageUploadLoading(false);
                              showToast(err);
                            }
                          );
                        }
                      }}
                    />
                  </label>
                  {editImageUploadLoading && (
                    <span className="text-xs text-[#A9824F] ml-3 animate-pulse">Processing image...</span>
                  )}
                </div>

                {/* Or Web Image URL */}
                <div>
                  <p className="text-[11px] font-medium text-[#4A4642] mb-1">
                    Or paste direct image URL:
                  </p>
                  <input
                    type="text"
                    value={editingProduct.image || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    placeholder="https://... direct image link"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                  />
                </div>

                {/* Live Preview Box */}
                {editingProduct.image && (
                  <div className="p-2.5 bg-white rounded border border-[#E4DED2] flex items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded overflow-hidden bg-[#E4DED2] flex-shrink-0 border border-[#E4DED2]">
                        <img
                          src={editingProduct.image}
                          alt="Dish preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_FOOD_FALLBACK;
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-800">✓ Image Preview Active</p>
                        <p className="text-[10px] text-[#888] truncate max-w-xs">
                          {editingProduct.image.startsWith("data:")
                            ? "Device Uploaded Photo"
                            : editingProduct.image}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingProduct((prev) => ({ ...prev, image: "" }))}
                      className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded border border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer font-medium"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#201D1B] mb-1">
                  Description / Ingredients
                </label>
                <textarea
                  rows="3"
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={editingProduct.inStock ?? true}
                  onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                  className="w-4 h-4 text-[#6E1E2B] rounded focus:ring-0 cursor-pointer"
                />
                <label htmlFor="inStockCheck" className="text-xs font-semibold text-[#201D1B] cursor-pointer">
                  This dish is currently In Stock and available for customers to order
                </label>
              </div>

              <div className="pt-3 border-t border-[#E4DED2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-xs font-medium text-[#4A4642] hover:text-[#201D1B] border border-[#E4DED2] rounded-sm bg-white hover:bg-[#E4DED2]/40 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#6E1E2B] hover:bg-[#561722] rounded-sm shadow-sm transition-colors cursor-pointer"
                >
                  Save Dish Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW DISH MODAL DIALOG */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FBF9F5] rounded-sm border border-[#E4DED2] w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#6E1E2B] text-white flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold">+ Add New Dish to Menu</h3>
                <p className="text-xs text-white/80">Upload photos directly or pick custom categories for your catalog</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingProduct(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
              <div>
                <label className="block text-xs font-semibold text-[#201D1B] mb-1">
                  Dish / Platter Name <span className="text-[#6E1E2B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suya Peppered Gizzard Platter (50pc)"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#201D1B] mb-1">
                    Category <span className="text-[#6E1E2B]">*</span>
                  </label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                  >
                    {categories
                      .filter((c) => c !== "All")
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    <option value="__custom__">✨ + Enter Custom Category...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#201D1B] mb-1">
                    Price (₦ Naira) <span className="text-[#6E1E2B]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 35000"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                  />
                </div>
              </div>

              {/* Custom Category Input if selected */}
              {newProductForm.category === "__custom__" && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-sm animate-fade-in">
                  <label className="block text-[11px] font-semibold text-[#8B6528] mb-1">
                    Type Custom Category Name: <span className="text-[#6E1E2B]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grills & Suya, Party Soups, Cocktails..."
                    value={newProductForm.customCategory}
                    onChange={(e) => setNewProductForm({ ...newProductForm, customCategory: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                  />
                </div>
              )}

              {/* Photo Upload Section */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#201D1B]">
                  Dish Photo / Image
                </label>

                {/* Primary Upload Button from Device */}
                <div className="p-3 bg-white border border-dashed border-[#A9824F]/70 rounded-sm">
                  <p className="text-xs font-medium text-[#201D1B] mb-1">
                    📸 Choose Photo from Device / Gallery (Recommended)
                  </p>
                  <p className="text-[11px] text-[#4A4642] mb-2">
                    Pick any picture from your phone or laptop. Automatically resized for fast loading.
                  </p>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6E1E2B] text-white text-xs font-semibold rounded-sm hover:bg-[#561722] cursor-pointer shadow-sm transition-colors">
                    <span>📁 Browse Files / Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageUploadLoading(true);
                          processDeviceImage(
                            file,
                            (dataUrl) => {
                              setNewProductForm((prev) => ({ ...prev, image: dataUrl }));
                              setImageUploadLoading(false);
                              showToast("✓ Photo loaded from your device!");
                            },
                            (err) => {
                              setImageUploadLoading(false);
                              showToast(err);
                            }
                          );
                        }
                      }}
                    />
                  </label>
                  {imageUploadLoading && (
                    <span className="text-xs text-[#A9824F] ml-3 animate-pulse">Processing image...</span>
                  )}
                </div>

                {/* Or Web Image URL */}
                <div>
                  <p className="text-[11px] font-medium text-[#4A4642] mb-1">
                    Or paste direct image URL:
                  </p>
                  <input
                    type="text"
                    placeholder="https://... direct image link"
                    value={newProductForm.image}
                    onChange={(e) => setNewProductForm({ ...newProductForm, image: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                  />
                  <p className="text-[10px] text-[#888] mt-0.5">
                    Note: Some websites block external image copying. If a link fails, use the "Upload Photo" button above!
                  </p>
                </div>

                {/* Optional Presets */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-[#888] text-[10px]">Sample presets:</span>
                  {[
                    { label: "Jollof Tray", url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80" },
                    { label: "Grilled Fish", url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80" },
                    { label: "Catering Event", url: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80" },
                    { label: "Celebration Cake", url: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80" },
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => setNewProductForm((prev) => ({ ...prev, image: preset.url }))}
                      className="px-2 py-0.5 rounded bg-white border border-[#E4DED2] hover:border-[#6E1E2B] text-[#4A4642] text-[10px] cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Live Preview Box */}
                {newProductForm.image && (
                  <div className="p-2.5 bg-white rounded border border-[#E4DED2] flex items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded overflow-hidden bg-[#E4DED2] flex-shrink-0 border border-[#E4DED2]">
                        <img
                          src={newProductForm.image}
                          alt="Dish preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_FOOD_FALLBACK;
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-800">✓ Image Preview Active</p>
                        <p className="text-[10px] text-[#888] truncate max-w-xs">
                          {newProductForm.image.startsWith("data:")
                            ? "Device Uploaded Photo"
                            : newProductForm.image}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewProductForm((prev) => ({ ...prev, image: "" }))}
                      className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded border border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer font-medium"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#201D1B] mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe platter contents, piece count, pepper level, dip sauces..."
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E4DED2] rounded-sm focus:outline-none focus:border-[#6E1E2B]"
                />
              </div>

              <div className="pt-3 border-t border-[#E4DED2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-4 py-2 text-xs font-medium text-[#4A4642] hover:text-[#201D1B] border border-[#E4DED2] rounded-sm bg-white hover:bg-[#E4DED2]/40 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#6E1E2B] hover:bg-[#561722] rounded-sm shadow-sm transition-colors cursor-pointer"
                >
                  Create Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT ZOOM / LIGHTBOX MODAL */}
      {viewingReceiptImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
          onClick={() => setViewingReceiptImage(null)}
        >
          <div
            className="relative max-w-2xl max-h-[92vh] bg-white rounded-sm shadow-2xl p-4 overflow-hidden flex flex-col items-center border border-[#E4DED2]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-[#E4DED2]">
              <div className="flex items-center gap-2">
                <span className="text-base">🧾</span>
                <div>
                  <h4 className="font-display font-bold text-sm text-[#201D1B]">Bank Transfer Receipt Proof</h4>
                  <p className="text-[11px] text-[#4A4642]">Order #{selectedOrder?.orderNumber} • {selectedOrder?.customerName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceiptImage(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto max-h-[72vh] w-full flex items-center justify-center bg-gray-50 p-2 rounded border border-[#E4DED2]/60">
              <img
                src={viewingReceiptImage}
                alt="Payment Receipt Screenshot"
                className="max-w-full max-h-[68vh] object-contain rounded shadow-sm"
              />
            </div>
            <div className="w-full pt-3 mt-3 border-t border-[#E4DED2] flex items-center justify-between">
              <a
                href={viewingReceiptImage}
                target="_blank"
                rel="noreferrer"
                download={`Receipt_${selectedOrder?.orderNumber || "order"}.jpg`}
                className="text-xs px-3 py-1.5 rounded-sm border border-[#E4DED2] bg-white text-[#201D1B] hover:bg-gray-50 font-medium"
              >
                Open Original in New Tab ↗
              </a>
              <button
                type="button"
                onClick={() => setViewingReceiptImage(null)}
                className="text-xs px-4 py-1.5 rounded-sm bg-[#6E1E2B] text-white font-medium hover:bg-[#561722] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
