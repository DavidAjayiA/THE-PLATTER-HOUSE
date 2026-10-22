import { useState, useEffect, useRef } from "react";
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

      {/* Touch & Mouse Draggable Movable Page Switcher */}
      <DraggablePageSwitcher currentHash={currentHash} navigateTo={navigateTo} />
    </div>
  );
}

function DraggablePageSwitcher({ currentHash, navigateTo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(() => {
    if (typeof window !== "undefined") {
      return {
        x: Math.max(12, window.innerWidth - 130),
        y: Math.max(12, window.innerHeight - 80),
      };
    }
    return { x: 20, y: 100 };
  });

  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 });
  const containerRef = useRef(null);

  // Handle Drag Start
  const handleStart = (clientX, clientY) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      origX: position.x,
      origY: position.y,
    };
  };

  // Handle Drag Move with Screen Boundary Clamping
  const handleMove = (clientX, clientY) => {
    if (!isDraggingRef.current) return;
    const dx = clientX - dragStartRef.current.startX;
    const dy = clientY - dragStartRef.current.startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }

    const elemWidth = containerRef.current?.offsetWidth || 140;
    const elemHeight = containerRef.current?.offsetHeight || 44;

    const maxX = window.innerWidth - elemWidth - 10;
    const maxY = window.innerHeight - elemHeight - 10;

    const newX = Math.min(Math.max(10, dragStartRef.current.origX + dx), maxX);
    const newY = Math.min(Math.max(10, dragStartRef.current.origY + dy), maxY);

    setPosition({ x: newX, y: newY });
  };

  const handleEnd = () => {
    isDraggingRef.current = false;
  };

  // Touch Handlers for Mobile Phones
  const onTouchStart = (e) => {
    const t = e.touches[0];
    handleStart(t.clientX, t.clientY);
  };

  const onTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    const t = e.touches[0];
    handleMove(t.clientX, t.clientY);
  };

  // Mouse Handlers for Desktop
  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    handleStart(e.clientX, e.clientY);

    const onMouseMove = (ev) => handleMove(ev.clientX, ev.clientY);
    const onMouseUp = () => {
      handleEnd();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={containerRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: "none",
      }}
      className="fixed z-50 select-none shadow-2xl transition-shadow"
    >
      {!isOpen ? (
        // Minimized Movable Pill Bubble (Takes almost zero screen space)
        <div
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={handleEnd}
          onClick={() => {
            if (!hasMovedRef.current) setIsOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#201D1B] text-[#F6F2EB] border border-[#A9824F]/60 cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-transform backdrop-blur-md opacity-95 hover:opacity-100 shadow-xl"
          title="Drag anywhere on your phone screen, tap to open pages"
        >
          <span className="text-[#A9824F] font-bold text-xs">⋮⋮</span>
          <span className="text-sm">🧭</span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F6F2EB]">
            Pages
          </span>
        </div>
      ) : (
        // Expanded Movable Menu Card
        <div className="bg-[#201D1B] text-[#F6F2EB] rounded-xl p-3 text-xs font-mono border border-[#A9824F]/40 max-w-xs shadow-2xl backdrop-blur-md">
          {/* Draggable Header Grip */}
          <div
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={handleEnd}
            className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-white/10 cursor-grab active:cursor-grabbing text-[11px] text-[#A9824F]"
          >
            <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase">
              <span>⋮⋮</span>
              <span>PAGE SWITCHER</span>
            </div>
            <button
              onClick={() => {
                if (!hasMovedRef.current) setIsOpen(false);
              }}
              className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[#E4DED2] cursor-pointer"
            >
              Minimize ✕
            </button>
          </div>

          {/* Quick Page Links (Admin is hidden from public customers unless authenticated or visiting #admin) */}
          <div className="flex flex-wrap gap-1.5">
            {(() => {
              const isStaffAuthed = () => {
                try {
                  const until = localStorage.getItem("tph_admin_authed_until");
                  if (until && Number(until) > Date.now()) return true;
                  return sessionStorage.getItem("tph_admin_authed") === "true";
                } catch {
                  return false;
                }
              };

              const pages = [
                { label: "Home", hash: "#" },
                { label: "Shop", hash: "#shop" },
                { label: "Collections", hash: "#collections" },
                { label: "Events", hash: "#events" },
                { label: "Track", hash: "#track" },
                { label: "Cart", hash: "#cart" },
              ];

              if (isStaffAuthed() || currentHash.toLowerCase().startsWith("#admin")) {
                pages.push({ label: "Admin ⚙️", hash: "#admin", admin: true });
              }

              return pages.map((p) => {
                const isActive =
                  p.hash === "#"
                    ? currentHash === "#" || currentHash === ""
                    : currentHash.startsWith(p.hash);
                return (
                  <button
                    key={p.label}
                    onClick={() => {
                      navigateTo(p.hash);
                      setIsOpen(false); // Auto-close on selection on mobile for full view
                    }}
                    className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#6E1E2B] text-white font-bold shadow-sm"
                        : p.admin
                        ? "bg-[#A9824F]/30 text-white hover:bg-[#A9824F]/50"
                        : "bg-white/5 hover:bg-white/15 text-[#E4DED2]"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              });
            })()}
          </div>

          <p className="text-[9px] text-[#888] text-center mt-2 pt-1 border-t border-white/5">
            Hold & drag anywhere on your screen
          </p>
        </div>
      )}
    </div>
  );
}
