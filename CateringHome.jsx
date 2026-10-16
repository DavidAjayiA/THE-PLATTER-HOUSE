import { useState, useEffect } from "react";
import { useCart } from "./CartContext.jsx";
import assortedSmallChopsImg from "./IMG/assorted small chops.jpg";
import smallChopsAssortedImg from "./IMG/small chops assorted.jpg";
import platter2Img from "./IMG/platter2.jpg";
import meatPieImg from "./IMG/meat pie.jpg";
import birthdayCakeImg from "./IMG/birthday cake.jpg";
import chinChinImg from "./IMG/chin chin.jpg";
import sc2Img from "./IMG/SC2.jpg";
import FoodImg from "./IMG/assorted small chops.jpg";

import hqPlatterImg from "./IMG/the_platter_house_hq.jpg";

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

const SIGNATURE_ITEMS = [
  { name: "Puff-Puff & Chin Chin Mix", price: "₦18,000" },
  { name: "Small Chops Platter (50pc)", price: "₦42,000" },
  { name: "Jollof Rice Party Tray", price: "₦35,000" },
  { name: "Wedding Cake, 3-Tier", price: "₦120,000" },
];

const COLLECTIONS = [
  {
    title: "Small Chops",
    tag: "Passed around, never passed up",
    description: "Golden crispy spring rolls, savory samosas, warm puff-puff and grilled chicken skewers.",
    image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1600&q=95",
  },
  {
    title: "Platters & Trays",
    tag: "Built for the buffet table",
    description: "Smoky party jollof rice, swallow and assorted protein platters sized for gatherings of 20 to 200.",
    image: hqPlatterImg,
  },
  {
    title: "Pastries & Desserts",
    tag: "The part everyone remembers",
    description: "Flaky golden meat pies, crunchy artisan chin chin, and luxury celebration cakes.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=95",
  },
  {
    title: "Event Packages",
    tag: "One menu, fully sorted",
    description: "Curated bundles by guest count, complete with small chops, main dishes, and desserts.",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=95",
  },
];

function CollectionsSlideshow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % COLLECTIONS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [paused]);

  const goTo = (i) => setIndex((i + COLLECTIONS.length) % COLLECTIONS.length);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative overflow-hidden rounded-sm shadow-md"
      style={{ border: "1px solid #E4DED2" }}
    >
      <div className="relative h-80 md:h-[420px] overflow-hidden bg-[#201D1B]">
        {COLLECTIONS.map((item, i) => (
          <div
            key={item.title}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
            }`}
          >
            {/* Crystal-clear image with gentle contrast enhancement */}
            <img
              src={item.image}
              alt={item.title}
              loading="eager"
              className="w-full h-full object-cover filter contrast-[1.05] brightness-[1.02] saturate-[1.06]"
              style={{
                imageRendering: "-webkit-optimize-contrast",
              }}
            />
            {/* Clean bottom gradient only — top and middle remain 100% bright and clear */}
            <div
              className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(20,18,16,0.92) 0%, rgba(20,18,16,0.55) 55%, transparent 100%)",
              }}
            />
            {/* Overlay content */}
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 z-20">
              <span className="text-[11px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#6E1E2B] text-white inline-block mb-2 shadow-sm">
                {item.tag || `Collection 0${i + 1}`}
              </span>
              <h3 className="font-display text-2xl md:text-3xl text-white mb-2 drop-shadow-sm">
                {item.title}
              </h3>
              <p className="text-sm md:text-base max-w-lg text-[#F6F2EB]/95 leading-relaxed drop-shadow-sm">
                {item.description}
              </p>
            </div>
          </div>
        ))}

        {/* Navigation arrows */}
        <button
          onClick={() => goTo(index - 1)}
          aria-label="Previous collection"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white z-30 rounded-full transition-all hover:scale-110 shadow-md backdrop-blur-sm"
          style={{ backgroundColor: "rgba(32,29,26,0.65)" }}
        >
          ‹
        </button>
        <button
          onClick={() => goTo(index + 1)}
          aria-label="Next collection"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white z-30 rounded-full transition-all hover:scale-110 shadow-md backdrop-blur-sm"
          style={{ backgroundColor: "rgba(32,29,26,0.65)" }}
        >
          ›
        </button>
      </div>

      {/* Slide indicators / thumbnails */}
      <div className="flex items-center justify-between px-6 py-3.5" style={{ backgroundColor: "#FBF9F5" }}>
        <span className="text-xs text-[#4A4642] font-medium">
          {index + 1} of {COLLECTIONS.length} Collections
        </span>
        <div className="flex items-center gap-2">
          {COLLECTIONS.map((c, i) => (
            <button
              key={c.title}
              onClick={() => goTo(i)}
              aria-label={`Show ${c.title}`}
              aria-current={i === index}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === index ? "24px" : "8px",
                backgroundColor: i === index ? "#6E1E2B" : "#C9BFAE",
              }}
            />
          ))}
        </div>
        <a href="#collections" className="text-xs font-semibold text-[#6E1E2B] hover:underline">
          Explore All →
        </a>
      </div>
    </div>
  );
}

export default function CateringHome() {
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="font-body min-h-screen" style={{ backgroundColor: "#F6F2EB", color: "#201D1B" }}>
      <style>{FONT_IMPORT}</style>

      {/* Nav */}
      <header className="border-b sticky top-0 z-50" style={{ borderColor: "#E4DED2", backgroundColor: "#F6F2EB" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between h-20">
          <a href="#" className="font-display text-xl tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2.5" style={{ color: "#201D1B" }}>
            <img
              src={hqPlatterImg}
              alt="The Platter House"
              className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-[#E4DED2] shadow-sm"
            />
            <span>The Platter House</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm hover:opacity-70 transition-opacity"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#cart"
              className="text-sm px-4 py-2 rounded-sm text-white"
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

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24 grid md:grid-cols-5 gap-12 items-start">
        <div className="md:col-span-3">
          <h1 className="font-display text-4xl md:text-6xl leading-[1.05]" style={{ color: "#201D1B" }}>
            Good food, brought
            <br />
            to the table on time.
          </h1>
          <p className="mt-6 text-base md:text-lg max-w-md" style={{ color: "#4A4642" }}>
            Small chops, platters and full event catering for weddings, birthdays
            and corporate gatherings across the city.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#shop"
              className="px-6 py-3 rounded-sm text-white text-sm"
              style={{ backgroundColor: "#6E1E2B" }}
            >
              Browse the menu
            </a>
            <a
              href="#events"
              className="px-6 py-3 rounded-sm text-sm border"
              style={{ borderColor: "#201D1B" }}
            >
              Place an Order
            </a>
          </div>
        </div>

        {/* Hero image + menu card panel */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="w-full h-56 md:h-64 overflow-hidden relative rounded-sm shadow-sm" style={{ border: "1px solid #E4DED2" }}>
            <img
              src={FoodImg}
              alt="Fresh Nigerian Small Chops & Catering Platters"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 right-3 bg-[#6E1E2B] text-white text-[11px] font-medium px-2.5 py-1 rounded-sm shadow">
              Scrumptious
            </div>
          </div>
          <div
            className="p-8"
            style={{ backgroundColor: "#FBF9F5", border: "1px solid #E4DED2" }}
          >
            <p className="font-display text-lg mb-6" style={{ color: "#6E1E2B" }}>
              Today's signature picks
            </p>
            <ul className="flex flex-col gap-4">
              {SIGNATURE_ITEMS.map((item, i) => (
                <li key={item.name}>
                  <div className="flex justify-between items-baseline gap-4">
                    <span className="text-sm">{item.name}</span>
                    <span
                      className="flex-1 border-b"
                      style={{ borderColor: "#E4DED2", borderBottomStyle: "dotted", marginBottom: "3px" }}
                    />
                    <span className="text-sm whitespace-nowrap" style={{ color: "#A9824F" }}>
                      {item.price}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Collections slideshow */}
      <section id="collections" className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display text-2xl md:text-3xl">Collections</h2>
          <a href="#shop" className="text-sm hover:opacity-70 transition-opacity">
            View all products
          </a>
        </div>
        <CollectionsSlideshow />
      </section>

      {/* Events strip */}
      <section id="events" className="border-y" style={{ borderColor: "#E4DED2" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-16 grid md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-3">
            <h2 className="font-display text-2xl md:text-3xl mb-3">Planning a wedding or a large event?</h2>
            <p className="text-sm md:text-base max-w-md" style={{ color: "#4A4642" }}>
              Tell us the date, guest count and menu you have in mind, and we'll
              put together a quote built around your event.
            </p>
          </div>
          <div className="md:col-span-2 md:text-right">
            <a
              href="#events"
              className="inline-block px-6 py-3 rounded-sm text-white text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#6E1E2B" }}
            >
              Send your Request
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: "#201D1B", color: "#F6F2EB" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <span className="font-display text-lg">The Platter House</span>
            <p className="text-sm mt-3 max-w-xs" style={{ color: "#C9C3BA" }}>
              Small chops, platters and full event catering for weddings,
              birthdays and corporate gatherings across the city.
            </p>
          </div>

          <div>
            <p className="text-sm mb-4" style={{ color: "#A9824F" }}>
              Explore
            </p>
            <ul className="flex flex-col gap-3 text-sm">
              <li><a href="#shop" className="hover:opacity-70 transition-opacity">Shop</a></li>
              <li><a href="#collections" className="hover:opacity-70 transition-opacity">Collections</a></li>
              <li><a href="#events" className="hover:opacity-70 transition-opacity">Events & Catering</a></li>
              <li><a href="#track" className="hover:opacity-70 transition-opacity">Track Order</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm mb-4" style={{ color: "#A9824F" }}>
              Get in touch
            </p>
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
