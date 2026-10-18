import { useState } from "react";
import { useCart } from "./CartContext.jsx";
import assortedSmallChopsImg from "./IMG/assorted small chops.jpg";
import smallChops100Img from "./IMG/small chops assorted.jpg";
import sc2Img from "./IMG/SC2.jpg";
import chickenSkewersImg from "./IMG/chicken skiwer platter.jpg";
import puffPuffImg from "./IMG/puff puff.jpg";
import springRollSamosaImg from "./IMG/spring roll & samosa.jpg";
import meatPieImg from "./IMG/meat pie.jpg";
import chinChinImg from "./IMG/chin chin.jpg";
import birthdayCakeImg from "./IMG/birthday cake.jpg";
import pastries3Img from "./IMG/pastries3.jpg";
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

function formatNaira(amount) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

const COLLECTIONS = [
  {
    id: "small-chops",
    title: "Small Chops",
    tagline: "Passed around, never passed up.",
    description:
      "Spring rolls, samosas, puff-puff and skewers made for cocktail hours, receptions and anywhere guests are mingling rather than seated.",
    image: assortedSmallChopsImg,
    products: [
      { name: "Spring Roll & Samosa Mix (40pc)", price: 22000, image: springRollSamosaImg },
      { name: "Puff-Puff & Chin Chin Mix", price: 18000, image: puffPuffImg },
      { name: "Chicken Skewer Platter (30pc)", price: 26000, image: chickenSkewersImg },
      { name: "Assorted Small Chops (100pc)", price: 45000, image: smallChops100Img },
    ],
  },
  {
    id: "platters-trays",
    title: "Platters & Trays",
    tagline: "Built for the buffet table.",
    description:
      "Rice, swallow and protein trays sized for real gatherings, from a family get-together of 20 to a full hall of 200.",
    image: sc2Img,
    products: [
      {
        name: "Jollof Rice Party Tray",
        price: 35000,
        image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80",
      },
      { name: "Small Chops Platter (50pc)", price: 42000, image: sc2Img },
      {
        name: "Swallow & Soup Combo Tray",
        price: 38000,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
      },
      {
        name: "Grilled Fish & Peppered Sauce Tray",
        price: 48000,
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "pastries-desserts",
    title: "Pastries & Desserts",
    tagline: "The part everyone remembers.",
    description:
      "Cakes, meat pies and chin chin, plain for the office or dressed up for a wedding table.",
    image: pastries3Img,
    products: [
      { name: "Meat Pie Box (24pc)", price: 16000, image: meatPieImg },
      { name: "Chin Chin, Family Pack", price: 9000, image: chinChinImg },
      { name: "Birthday Cake, 2-Tier", price: 55000, image: birthdayCakeImg },
      {
        name: "Wedding Cake, 3-Tier",
        price: 120000,
        image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "event-packages",
    title: "Event Packages",
    tagline: "One menu, fully sorted.",
    description:
      "Curated bundles by guest count, so you're not building a wedding or corporate menu item by item.",
    image: platter1Img,
    products: [
      { name: "Intimate Gathering Package (20 guests)", price: 180000, image: platter1Img },
      { name: "Corporate Lunch Package (50 guests)", price: 320000, image: platter3Img },
      {
        name: "Classic Wedding Package (100 guests)",
        price: 850000,
        image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];

export default function CollectionsPage() {
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("small-chops");

  function scrollToSection(id) {
    return (e) => {
      e.preventDefault();
      setActiveSection(id);
      const el = document.getElementById(id);
      if (el) {
        const offset = 85;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        window.scrollTo({
          top: elementRect - bodyRect - offset,
          behavior: "smooth",
        });
      }
    };
  }

  return (
    <div className="font-body min-h-screen" style={{ backgroundColor: "#F6F2EB", color: "#201D1B" }}>
      <style>{FONT_IMPORT}</style>

      {/* Nav */}
      <header className="border-b sticky top-0 z-50" style={{ borderColor: "#E4DED2", backgroundColor: "#F6F2EB" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between h-20">
          <a className="font-display text-xl tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2.5" href="#">
            <img
              src={brandLogo}
              alt="The Platter House"
              className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-[#E4DED2] shadow-sm"
            />
            <span>The Platter House</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = link.label === "Collections";
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`text-sm transition-opacity pb-1 ${
                    isActive
                      ? "font-semibold text-[#6E1E2B] border-b-2 border-[#6E1E2B]"
                      : "text-[#201D1B] hover:opacity-70"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <a href="#cart" className="text-sm px-4 py-2 rounded-sm text-white" style={{ backgroundColor: "#6E1E2B" }}>
              Cart ({cartCount})
            </a>
          </nav>

          {/* Mobile Right Bar (Cart + Hamburger) */}
          <div className="flex items-center gap-2.5 md:hidden">
            <a
              href="#cart"
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-white text-xs font-semibold shadow-sm active:scale-95 transition-transform"
              style={{ backgroundColor: "#6E1E2B" }}
              title="View Cart"
            >
              <span>🛒</span>
              <span>Cart</span>
              <span className="bg-white text-[#6E1E2B] font-bold rounded-full px-1.5 py-0.2 text-[10px] min-w-[18px] text-center shadow-inner">
                {cartCount}
              </span>
            </a>

            <button
              className="px-2.5 py-1.5 text-xs border border-[#E4DED2] rounded-sm bg-white text-[#201D1B] font-medium"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? "✕" : "☰ Menu"}
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
            <a href="#cart" className="text-sm pt-2 font-semibold text-[#6E1E2B]">
              🛒 View Cart ({cartCount} items)
            </a>
          </div>
        )}
      </header>

      {/* Page heading */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-16 pb-6">
        <h1 className="font-display text-3xl md:text-4xl mb-3">Collections</h1>
        <p className="text-sm md:text-base max-w-md" style={{ color: "#4A4642" }}>
          Everything we make, grouped the way you'd actually plan a menu.
        </p>
      </section>

      {/* Quick jump */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-10">
        <div className="flex gap-2 overflow-x-auto" style={{ borderBottom: "1px solid #E4DED2" }}>
          {COLLECTIONS.map((c) => {
            const isActive = activeSection === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={scrollToSection(c.id)}
                className={`text-sm px-4 py-3 whitespace-nowrap transition-all border-b-2 font-medium cursor-pointer ${
                  isActive
                    ? "border-[#6E1E2B] text-[#6E1E2B]"
                    : "border-transparent text-[#4A4642] hover:text-[#201D1B]"
                }`}
              >
                {c.title}
              </button>
            );
          })}
        </div>
      </section>

      {/* Collection sections */}
      {COLLECTIONS.map((collection, i) => {
        const reversed = i % 2 === 1;
        return (
          <section
            key={collection.id}
            id={collection.id}
            className="max-w-6xl mx-auto px-6 md:px-10 py-16"
            style={{ borderTop: i === 0 ? "none" : "1px solid #E4DED2" }}
          >
            <div className={`grid md:grid-cols-2 gap-12 items-center ${reversed ? "md:[direction:rtl]" : ""}`}>
              {/* Collection Image Showcase */}
              <div style={{ direction: "ltr" }} className="w-full">
                <div
                  className="w-full aspect-[4/3] relative overflow-hidden rounded-sm bg-[#E4DED2] shadow-md group"
                  style={{ border: "1px solid #E4DED2" }}
                >
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <span className="text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded bg-[#201D1B]/80 backdrop-blur-sm border border-white/10">
                      {collection.title}
                    </span>
                    <span className="text-xs font-medium text-white/90">
                      {collection.products.length} Products Available
                    </span>
                  </div>
                </div>
              </div>

              {/* Collection Details & Product List */}
              <div style={{ direction: "ltr" }}>
                <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#A9824F" }}>
                  {collection.tagline}
                </p>
                <h2 className="font-display text-2xl md:text-3xl mb-4 text-[#201D1B]">{collection.title}</h2>
                <p className="text-sm md:text-base mb-6 leading-relaxed" style={{ color: "#4A4642" }}>
                  {collection.description}
                </p>

                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#A9824F] mb-3">
                    Included in this collection
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {collection.products.map((p) => (
                      <li
                        key={p.name}
                        className="flex items-center justify-between gap-4 text-sm p-2 rounded-sm hover:bg-[#FBF9F5] transition-colors border border-transparent hover:border-[#E4DED2]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-sm overflow-hidden flex-shrink-0 bg-[#E4DED2] border border-[#E4DED2]">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="font-medium text-[#201D1B] truncate">{p.name}</span>
                        </div>
                        <span style={{ color: "#6E1E2B" }} className="font-semibold whitespace-nowrap text-sm">
                          {formatNaira(p.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="#shop"
                  className="inline-block px-7 py-3 rounded-sm text-white text-sm font-medium tracking-wide shadow-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#6E1E2B" }}
                >
                  Shop {collection.title} →
                </a>
              </div>
            </div>
          </section>
        );
      })}

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
