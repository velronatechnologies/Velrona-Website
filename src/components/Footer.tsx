const footerLinks = {
  businesses: [
    { label: "Onekit Inc", href: "#" },
    { label: "Ticpin", href: "#" },
    { label: "Caury Farms", href: "#" },
    { label: "Ofran", href: "#" },
  ],
  about: [
    { label: "Culture", href: "/culture" },
    { label: "Investors", href: "/contact" },
    { label: "Blog", href: "#blog" },
  ],
  contact: [
    { label: "Contact", href: "/contact" },
  ],
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Divider Line */}
      <div className="border-t border-border"></div>
      
      <footer className="bg-white py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
          {/* Logo */}
          <div className="col-span-2 md:col-span-1">
            <a href="#home" className="flex items-center">
              <img
                src="/velrona_texted.png"
                alt="Velrona"
                className="h-5 lg:h-7 w-auto object-contain"
              />
            </a>
          </div>

          {/* Our Businesses */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Our businesses</h4>
            <ul className="space-y-3">
              {footerLinks.businesses.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">About</h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Get in touch */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Get in touch</h4>
            <ul className="space-y-3">
              {footerLinks.contact.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Velrona Technologies Private Limited
            </p>
            <div className="flex items-center gap-6">
              <a
                href="/terms-conditions"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;