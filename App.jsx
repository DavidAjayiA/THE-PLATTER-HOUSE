import { useState, useEffect } from "react";
import CateringHome from "./CateringHome";
import ShopPage from "./ShopPage";
import CollectionsPage from "./CollectionsPage";
import EventsAndCatering from "./EventsAndCatering";
import TrackOrderPage from "./TrackOrder";
import CartCheckoutPage from "./CartCheckout";
import AdminDashboard from "./AdminDashboard";

export default function App() {
  const [currentHash, setCurrentHash] = useState(() => window.location.hash || "#");
  const [showDevNav, setShowDevNav] = useState(true);

  useEffect(() => {
    const onHashChange = () => {
      setCurrentHash(window.location.hash || "#");
      window.scrollTo(0, 0);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigateTo = (hash) => {
    window.location.hash = hash;
  };

  const renderCurrentPage = () => {
    const hash = currentHash.toLowerCase();

    if (hash.startsWith("#admin")) {
      return <AdminDashboard />;
    }
    if (hash.startsWith("#shop")) {
      return <ShopPage />;
    }
    if (
      hash.startsWith("#collections") ||
      hash.startsWith("#small-chops") ||
      hash.startsWith("#platters-trays") ||
      hash.startsWith("#pastries-desserts") ||
      hash.startsWith("#event-packages")
    ) {
      return <CollectionsPage />;
    }
    if (hash.startsWith("#events") || hash.startsWith("#quote-form")) {
      return <EventsAndCatering />;
    }
    if (hash.startsWith("#track")) {
      return <TrackOrderPage />;
    }
    if (hash.startsWith("#cart")) {
      return <CartCheckoutPage />;
    }

    return <CateringHome />;
  };

  return (
    <div className="relative">
      {renderCurrentPage()}

      {/* Development Quick Navigation Bar */}
      <div className="fixed bottom-4 right-4 z-50 bg-[#201D1B] text-[#F6F2EB] shadow-2xl rounded-lg p-2.5 text-xs font-mono border border-[#E4DED2]/20 max-w-xs transition-all opacity-90 hover:opacity-100">
        <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-[#E4DED2]/20">
          <span className="font-semibold tracking-wide text-[11px] text-[#E4DED2]">PAGE SWITCHER</span>
          <button
            onClick={() => setShowDevNav(!showDevNav)}
            className="hover:text-white px-1 py-0.5 rounded text-[10px] bg-white/10"
          >
            {showDevNav ? "Minimize" : "Pages"}
          </button>
        </div>

        {showDevNav && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => navigateTo("#")}
              className={`px-2 py-1 rounded transition-colors ${
                currentHash === "#" || currentHash === "" ? "bg-[#6E1E2B] text-white font-bold" : "hover:bg-white/10"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigateTo("#shop")}
              className={`px-2 py-1 rounded transition-colors ${
                currentHash.startsWith("#shop") ? "bg-[#6E1E2B] text-white font-bold" : "hover:bg-white/10"
              }`}
            >
              Shop
            </button>
            <button
              onClick={() => navigateTo("#collections")}
              className={`px-2 py-1 rounded transition-colors ${
                currentHash.startsWith("#collections") ? "bg-[#6E1E2B] text-white font-bold" : "hover:bg-white/10"
              }`}
            >
              Collections
            </button>
            <button
              onClick={() => navigateTo("#events")}
              className={`px-2 py-1 rounded transition-colors ${
                currentHash.startsWith("#events") ? "bg-[#6E1E2B] text-white font-bold" : "hover:bg-white/10"
              }`}
            >
              Events
            </button>
            <button
              onClick={() => navigateTo("#track")}
              className={`px-2 py-1 rounded transition-colors ${
                currentHash.startsWith("#track") ? "bg-[#6E1E2B] text-white font-bold" : "hover:bg-white/10"
              }`}
            >
              Track Order
            </button>
            <button
              onClick={() => navigateTo("#cart")}
              className={`px-2 py-1 rounded transition-colors ${
                currentHash.startsWith("#cart") ? "bg-[#6E1E2B] text-white font-bold" : "hover:bg-white/10"
              }`}
            >
              Cart
            </button>
            <button
              onClick={() => navigateTo("#admin")}
              className={`px-2 py-1 rounded transition-colors ${
                currentHash.startsWith("#admin") ? "bg-[#6E1E2B] text-white font-bold" : "bg-[#A9824F]/30 hover:bg-[#A9824F]/50 text-white"
              }`}
            >
              Admin ⚙️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
