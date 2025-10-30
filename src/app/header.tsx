"use client";

import { useState } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle
} from "./components/ui/resizable-navbar";

const navItems = [
  { name: "Home", link: "/" },
  { name: "Menu", link: "/menu" },
  { name: "Peta UMKM", link: "/peta-umkm" },
  { name: "About", link: "/about" },
  { name: "Blog", link: "/blog" },
  { name: "Kontak", link: "/kontak" },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Navbar>
        {/* Desktop Navbar */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <NavbarButton href="/daftar" variant="primary">
            Daftar
          </NavbarButton>
        </NavBody>

        {/* Mobile Navbar */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={handleMobileMenuToggle}
            />
          </MobileNavHeader>
          
          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={handleMobileItemClick}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-${idx}`}
                href={item.link}
                onClick={handleMobileItemClick}
                className="w-full px-4 py-3 text-left text-lg font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100 transition-colors"
              >
                {item.name}
              </a>
            ))}
            <div className="mt-4 w-full">
              <NavbarButton href="/daftar" variant="primary" className="w-full">
                Daftar
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
