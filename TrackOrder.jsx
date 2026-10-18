import { useState, useEffect } from "react";
import { useCart } from "./CartContext.jsx";
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

const STAGES = [
  {
    key: "confirmed",
    label: "Order Confirmed",
    description: "Payment received successfully.",
  },
  {
    key: "preparing",
    label: "Preparing",
    description: "We are getting your order ready.",
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    description: "Your order is on its way.",
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Your order has been completed.",
  },
];

// Sample order used for demo lookup
const SAMPLE_ORDER = {
  orderNumber: "TPH-10482",
  currentStageIndex: 1,
  placedOn: "2 September 2026",
  fulfillment: "Delivery",
  address: "12 Admiralty Way, Lekki Phase 1, Lagos",
  items: [
    { name: "Small Chops Platter (50pc)", qty: 1 },
    { name: "Puff-Puff & Chin Chin Mix", qty: 2 },
    { name: "Meat Pie Box (24pc)", qty: 1 },
  ],
};

export default function TrackOrderPage() {
  const { cartCount, lastOrder } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "found" | "not_found"
  const [activeOrder, setActiveOrder] = useState(null);

  // Pre-fill with customer's latest placed order if available
  useEffect(() => {
    if (lastOrder && lastOrder.orderNumber) {
      setOrderNumber(lastOrder.orderNumber);
      if (lastOrder.email) setEmail(lastOrder.email);
    }
  }, [lastOrder]);

  function handleTrack(e) {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setStatus("loading");

    setTimeout(() => {
      const inputNum = orderNumber.trim().toUpperCase();
      const inputEmail = email.trim().toLowerCase();

      let savedOrders = [];
      try {
        savedOrders = JSON.parse(localStorage.getItem("tph_orders") || "[]");
        const localLast = JSON.parse(localStorage.getItem("tph_last_order") || "null");
        if (localLast && !savedOrders.some((o) => o.orderNumber === localLast.orderNumber)) {
          savedOrders.unshift(localLast);
        }
      } catch {
        savedOrders = [];
      }

      const match = savedOrders.find(
        (o) =>
          o.orderNumber.toUpperCase() === inputNum &&
          (!inputEmail || (o.email && o.email.toLowerCase() === inputEmail))
      );

      if (match) {
        setActiveOrder(match);
        setStatus("found");
      } else if (inputNum === SAMPLE_ORDER.orderNumber) {
        setActiveOrder(SAMPLE_ORDER);
        setStatus("found");
      } else {
        setActiveOrder(null);
        setStatus("not_found");
      }
    }, 600);
  }

  return (
    <div className="font-body min-h-screen" style={{ backgroundColor: "#F6F2EB", color: "#201D1B" }}>
      <style>{FONT_IMPORT}</style>

      {/* Nav */}
      <header className="border-b sticky top-0 z-50" style={{ borderColor: "#E4DED2", backgroundColor: "#F6F2EB" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between h-20">
          <a className="font-display text-xl tracking-tight flex items-center gap-2.5" href="#CateringHome">
            <img
              src={brandLogo}
              alt="The Platter House"
              className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-[#E4DED2] shadow-sm"
            />
            <span>The Platter House</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="text-sm hover:opacity-70 transition-opacity">
                {link.label}
              </a>
            ))}
            <a href="#cart" className="text-sm px-4 py-2 rounded-sm text-white" style={{ backgroundColor: "#6E1E2B" }}>
              Cart ({cartCount})
            </a>
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <a
              href="#cart"
              className="text-xs px-3 py-1.5 rounded-full font-medium shadow-sm transition-all text-white flex items-center gap-1.5"
              style={{ backgroundColor: "#6E1E2B" }}
            >
              <span>🛒</span>
              <span>Cart ({cartCount})</span>
            </a>
            <button
              className="text-sm font-medium py-1 px-2 rounded hover:bg-black/5"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 pb-6 flex flex-col gap-4" style={{ borderTop: "1px solid #E4DED2" }}>
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="text-sm pt-4">
                {link.label}
              </a>
            ))}
            <a href="#cart" className="text-sm pt-2">Cart ({cartCount})</a>
          </div>
        )}
      </header>

      <section className="max-w-3xl mx-auto px-6 md:px-10 pt-16 pb-10">
        <h1 className="font-display text-3xl md:text-4xl mb-3">Track Order</h1>
        <p className="text-sm md:text-base max-w-md" style={{ color: "#4A4642" }}>
          Enter your order number and the email you used at checkout to see
          the latest status.
        </p>
      </section>

      {/* Lookup form */}
      <section className="max-w-3xl mx-auto px-6 md:px-10 pb-10">
        <form
          onSubmit={handleTrack}
          className="grid sm:grid-cols-2 gap-4 p-6"
          style={{ backgroundColor: "#FBF9F5", border: "1px solid #E4DED2" }}
        >
          <label className="flex flex-col gap-2 text-sm">
            Order number
            <input
              required
              placeholder="e.g. TPH-10482"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="px-3 py-2 text-sm"
              style={{ border: "1px solid #E4DED2", backgroundColor: "#F6F2EB" }}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Email used at checkout
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 text-sm"
              style={{ border: "1px solid #E4DED2", backgroundColor: "#F6F2EB" }}
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 rounded-sm text-white text-sm"
              style={{ backgroundColor: "#6E1E2B" }}
            >
              {status === "loading" ? "Looking up…" : "Track order"}
            </button>
            <span className="text-xs ml-4" style={{ color: "#A9824F" }}>
              Try order number TPH-10482 to see a live example.
            </span>
          </div>
        </form>
      </section>

      {/* Results */}
      {status === "not_found" && (
        <section className="max-w-3xl mx-auto px-6 md:px-10 pb-16">
          <p className="text-sm p-6" style={{ backgroundColor: "#FBF9F5", border: "1px solid #E4DED2", color: "#4A4642" }}>
            We couldn't find an order matching those details. Double-check
            your order number and email, or reach us at hello@theplatterhouse.com.
          </p>
        </section>
      )}

      {status === "found" && (
        <section className="max-w-3xl mx-auto px-6 md:px-10 pb-20">
          <div className="p-8" style={{ backgroundColor: "#FBF9F5", border: "1px solid #E4DED2" }}>
            {(() => {
              const currentOrder = activeOrder || SAMPLE_ORDER;
              const currentStage = currentOrder.currentStageIndex ?? 1;
              return (
                <>
                  <div className="flex flex-wrap justify-between items-baseline gap-2 mb-8">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl">Order {currentOrder.orderNumber}</h2>
                        {currentOrder.isPaid ? (
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#2E7D32]/10 text-[#2E7D32]">
                            Paid
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#A9824F]/15 text-[#A9824F]">
                            {currentOrder.status || "Pending Payment"}
                          </span>
                        )}
                      </div>
                      {currentOrder.customerName && (
                        <p className="text-xs text-[#A9824F] mt-0.5">Customer: {currentOrder.customerName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs" style={{ color: "#4A4642" }}>Placed {currentOrder.placedOn}</span>
                      {currentOrder.paymentReference && (
                        <p className="text-[11px] font-mono text-[#4A4642] mt-0.5">Ref: {currentOrder.paymentReference}</p>
                      )}
                    </div>
                  </div>

                  {/* Status timeline */}
                  <div className="mb-10">
                    <div className="flex items-start">
                      {STAGES.map((stage, i) => {
                        const isComplete = i < currentStage;
                        const isCurrent = i === currentStage;
                        const isLast = i === STAGES.length - 1;
                        return (
                          <div key={stage.key} className="flex-1 flex flex-col items-start relative">
                            <div className="flex items-center w-full">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                                style={{
                                  backgroundColor: isComplete || isCurrent ? "#6E1E2B" : "transparent",
                                  border: isComplete || isCurrent ? "none" : "1.5px solid #C9BFAE",
                                  color: "#F6F2EB",
                                }}
                              >
                                {isComplete ? "✓" : isCurrent ? "●" : ""}
                              </div>
                              {!isLast && (
                                <div
                                  className="flex-1 h-px mx-1"
                                  style={{ backgroundColor: isComplete ? "#6E1E2B" : "#E4DED2" }}
                                />
                              )}
                            </div>
                            <p
                              className="text-xs md:text-sm mt-3 pr-2"
                              style={{ color: isComplete || isCurrent ? "#201D1B" : "#A39A8B", fontWeight: isCurrent ? 600 : 400 }}
                            >
                              {stage.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mb-8 p-4" style={{ border: "1px solid #E4DED2" }}>
                    <p className="text-sm" style={{ color: "#6E1E2B" }}>
                      {STAGES[currentStage]?.description || "Your order is being processed."}
                    </p>
                  </div>

                  {/* Order details */}
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm mb-3" style={{ color: "#A9824F" }}>Items ({currentOrder.items?.length || 0})</p>
                      <ul className="flex flex-col gap-2 text-sm">
                        {currentOrder.items && currentOrder.items.map((item, idx) => (
                          <li key={item.id || idx} className="flex justify-between py-1 border-b border-[#E4DED2]/40 last:border-0">
                            <span>{item.name}</span>
                            <span style={{ color: "#4A4642" }}>×{item.qty}</span>
                          </li>
                        ))}
                      </ul>
                      {currentOrder.total && (
                        <p className="text-sm font-semibold mt-4 pt-3 border-t border-[#E4DED2]">
                          Total: ₦{Number(currentOrder.total).toLocaleString("en-NG")}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm mb-3" style={{ color: "#A9824F" }}>Fulfillment & Destination</p>
                      <p className="text-sm font-medium mb-1">{currentOrder.fulfillment}</p>
                      <p className="text-sm" style={{ color: "#4A4642" }}>{currentOrder.address}</p>
                      {currentOrder.phone && (
                        <p className="text-xs text-[#4A4642] mt-2">Contact: {currentOrder.phone}</p>
                      )}
                      {currentOrder.email && (
                        <p className="text-xs text-[#4A4642]">Email: {currentOrder.email}</p>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: "#201D1B", color: "#F6F2EB" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
           <a className="font-display text-xl tracking-tight" href="#CateringHome">The Platter House</a>
            <p className="text-sm mt-3 max-w-xs" style={{ color: "#C9C3BA" }}>
              Small chops, platters and full event catering for weddings,
              birthdays and corporate gatherings across the city.
            </p>
          </div>

          <div>
            <p className="text-sm mb-4" style={{ color: "#A9824F" }}>Explore</p>
            <ul className="flex flex-col gap-3 text-sm">
              <li><a href="#shop" className="hover:opacity-70 transition-opacity">Shop</a></li>
              <li><a href="#collections" className="hover:opacity-70 transition-opacity">Collections</a></li>
              <li><a href="#events" className="hover:opacity-70 transition-opacity">Events & Catering</a></li>
              <li><a href="#track" className="hover:opacity-70 transition-opacity">Track Order</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm mb-4" style={{ color: "#A9824F" }}>Get in touch</p>
            <ul className="flex flex-col gap-3 text-sm" style={{ color: "#C9C3BA" }}>
              <li>hello@theplatterhouse.com</li>
              <li>+234 800 000 0000</li>
              <li>Lekki Phase 1, Lagos</li>
              <li>Orders close daily at 4pm for next-day delivery.</li>
            </ul>
          </div>
        </div>

        <div
          className="max-w-6xl mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between gap-3 text-sm"
          style={{ borderTop: "1px solid #3A3632", color: "#8A857D" }}
        >
          <span>© {new Date().getFullYear()} The Platter House. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:opacity-70 transition-opacity">Privacy Policy</a>
            <a href="#terms" className="hover:opacity-70 transition-opacity">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
