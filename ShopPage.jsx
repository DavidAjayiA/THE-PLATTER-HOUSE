import { useState, useMemo } from "react";
import { useCart } from "./CartContext.jsx";
import { useMenu } from "./MenuContext.jsx";
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
  return `₦${(amount || 0).toLocaleString("en-NG")}`;
}

export default function ShopPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const { cartCount, addToCart } = useCart();
  const { products, categories } = useMenu();
  const [justAdded, setJustAdded] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory, products]);

  function handleAddToCart(product) {
    addToCart(product);
    setJustAdded(product.name);
    window.clearTimeout(handleAddToCart._t);
    handleAddToCart._t = window.setTimeout(() => setJustAdded(null), 1400);

    setShowToast(true);
    window.clearTimeout(handleAddToCart._toastT);
    handleAddToCart._toastT = window.setTimeout(() => setShowToast(false), 2000);
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
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="text-sm hover:opacity-70 transition-opacity">
                {link.label}
              </a>
            ))}
            <div className="relative">
              <a
                href="#cart"
                className="text-sm px-4 py-2 rounded-sm text-white inline-block"
                style={{ backgroundColor: "#6E1E2B" }}
              >
                Cart ({cartCount})
              </a>
              {showToast && (
                <div
                  role="status"
                  className="absolute top-full right-0 mt-2 whitespace-nowrap text-xs px-3 py-2 rounded-sm shadow-sm"
                  style={{ backgroundColor: "#201D1B", color: "#F6F2EB" }}
                >
                  Product added to cart
                </div>
              )}
            </div>
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

      {/* Page heading */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-14 pb-8">
        <h1 className="font-display text-3xl md:text-4xl mb-3">Shop</h1>
        <p className="text-sm md:text-base max-w-md" style={{ color: "#4A4642" }}>
          Browse small chops, platters, pastries and full event packages,
          priced and ready to order.
        </p>
      </section>

      {/* Category filter */}
      <section className="max-w-6xl mx-auto px-6 md:px-10">
        <div
          className="flex gap-2 overflow-x-auto pb-4 mb-8"
          style={{ borderBottom: "1px solid #E4DED2" }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="text-sm px-4 py-2 whitespace-nowrap transition-colors"
              style={
                activeCategory === cat
                  ? { backgroundColor: "#6E1E2B", color: "#F6F2EB" }
                  : { backgroundColor: "transparent", color: "#201D1B", border: "1px solid #E4DED2" }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product grid */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {filteredProducts.map((product) => {
            const isSoldOut = product.inStock === false;
            return (
              <div key={product.id || product.name} className="flex flex-col group">
                <div
                  className="w-full aspect-square overflow-hidden mb-4 rounded-sm relative bg-[#E4DED2] shadow-sm"
                  style={{ border: "1px solid #E4DED2" }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isSoldOut ? "grayscale opacity-60" : "group-hover:scale-105"
                    }`}
                  />
                  {/* Sold out overlay tag */}
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2">
                      <span className="bg-[#6E1E2B] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-sm shadow-md border border-white/20">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs mb-1 font-medium tracking-wide uppercase" style={{ color: "#A9824F" }}>
                  {product.category}
                </p>
                <h3 className="font-display text-base md:text-lg mb-2 leading-snug">{product.name}</h3>
                <span className="text-sm font-semibold mb-3">{formatNaira(product.price)}</span>
                <button
                  onClick={() => !isSoldOut && handleAddToCart(product)}
                  disabled={isSoldOut}
                  className="mt-auto w-full text-sm px-4 py-2.5 rounded-sm font-medium transition-all"
                  style={
                    isSoldOut
                      ? { backgroundColor: "#E4DED2", color: "#8A857D", cursor: "not-allowed", border: "1px solid #E4DED2" }
                      : justAdded === product.name
                      ? { backgroundColor: "#A9824F", color: "#F6F2EB" }
                      : { border: "1px solid #201D1B", color: "#201D1B", cursor: "pointer" }
                  }
                >
                  {isSoldOut ? "Sold Out" : justAdded === product.name ? "✓ Added to cart" : "Add to cart"}
                </button>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <p className="text-sm text-center py-16" style={{ color: "#4A4642" }}>
            No products in this category yet.
          </p>
        )}
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
