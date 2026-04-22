import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Ventures", href: "/ventures" },
  { 
    label: "Community", 
    subLinks: [
      { label: "CSR Initiatives", href: "/community/csr" },
      { label: "Non-CSR Initiatives", href: "/community/non-csr" },
    ]
  },
  { label: "Press Release", href: "/press-release" },
  { label: "Investors", href: "/investors" },
  { label: "Contact Us", href: "/contact" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const location = useLocation();

  const toggleSubMenu = (label: string) => {
    setActiveSubMenu(activeSubMenu === label ? null : label);
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="flex items-center justify-center lg:justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center lg:mr-auto">
            <img
              src="/LOGO MARK 1.png"
              alt="Velrona"
              className="h-10 sm:h-15 lg:h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group flex items-center">
                {link.subLinks ? (
                  <div className="flex items-center gap-1 cursor-pointer py-2">
                    {link.href ? (
                      <Link
                        to={link.href}
                        className={`nav-link text-sm font-medium ${isActive(link.href) ? "nav-link-active" : ""}`}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span className={`nav-link text-sm font-medium ${link.subLinks.some(sub => isActive(sub.href)) ? "nav-link-active" : ""}`}>
                        {link.label}
                      </span>
                    )}
                    <ChevronDown size={14} className="text-foreground transition-transform group-hover:rotate-180" />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 mt-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="bg-white border border-border rounded-xl shadow-xl overflow-hidden min-w-[200px]">
                        {link.subLinks.map((sub) => (
                          <Link
                            key={sub.label}
                            to={sub.href}
                            className="block px-6 py-3 text-sm text-foreground hover:bg-slate-50 hover:text-accent transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={link.href}
                    className={`nav-link text-sm font-medium ${isActive(link.href) ? "nav-link-active" : ""}`}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground absolute right-6"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-border overflow-hidden"
          >
            <nav className="container mx-auto px-6 py-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <div key={link.label} className="flex flex-col">
                  {link.subLinks ? (
                    <>
                      <div 
                        className="flex items-center justify-between py-3 cursor-pointer"
                        onClick={() => toggleSubMenu(link.label)}
                      >
                        <span className={`text-lg font-medium ${(link.href && isActive(link.href)) || (link.subLinks && link.subLinks.some(sub => isActive(sub.href))) ? "text-accent" : "text-foreground"}`}>
                          {link.label}
                        </span>
                        <ChevronDown 
                          size={20} 
                          className={`transition-transform duration-300 ${activeSubMenu === link.label ? "rotate-180" : ""}`} 
                        />
                      </div>
                      <AnimatePresence>
                        {activeSubMenu === link.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col pl-4 border-l-2 border-slate-100 mb-2"
                          >
                            {link.subLinks.map((sub) => (
                              <Link
                                key={sub.label}
                                to={sub.href}
                                className="py-3 text-base text-muted-foreground hover:text-accent"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to={link.href}
                      className={`text-lg font-medium py-3 ${isActive(link.href) ? "text-accent" : "text-foreground"}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;