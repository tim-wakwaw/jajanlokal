"use client";

import { useState } from "react";
import { useAuth } from "../contexts/OptimizedAuthContext";
import { showLogoutConfirmation, showToast } from "../lib/sweetalert";
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
  { name: "Produk", link: "/produk" },
  { name: "Peta UMKM", link: "/peta-umkm" },
  { name: "About", link: "/about" },
  { name: "Blog", link: "/blog" },
  { name: "FAQ", link: "/faq" },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      const result = await showLogoutConfirmation();
      
      if (result.isConfirmed) {
        await signOut();
        showToast('Berhasil keluar dari akun', 'success');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      showToast('Gagal keluar dari akun', 'error');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar>
          <NavBody>
            <NavbarLogo />
            <NavItems items={navItems} />
            <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
          </NavBody>
        </Navbar>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Navbar>
        {/* Desktop Navbar */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          
          {/* Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-3">
              {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
                <NavbarButton href="/admin/dashboard" variant="secondary">
                  Admin
                </NavbarButton>
              ) : null}
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden md:block">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
              </div>
              
              <NavbarButton 
                as="button"
                onClick={handleSignOut} 
                variant="secondary"
              >
                Keluar
              </NavbarButton>
            </div>
          ) : (
            <div className="flex gap-2">
              <NavbarButton href="/auth/login" variant="secondary">
                Masuk
              </NavbarButton>
              <NavbarButton href="/auth/register" variant="primary">
                Daftar
              </NavbarButton>
            </div>
          )}
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
            
            {/* Mobile Auth */}
            <div className="border-t pt-4 mt-4">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-500">
                    {profile?.full_name || user.email}
                  </div>
                  
                  {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
                    <a
                      href="/admin/dashboard"
                      className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                      onClick={handleMobileItemClick}
                    >
                      Admin Dashboard
                    </a>
                  ) : null}
                  <button
                    onClick={() => {
                      handleSignOut();
                      handleMobileItemClick();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-2 px-4">
                    <NavbarButton href="/auth/login" variant="secondary" className="w-full">
                      Masuk
                    </NavbarButton>
                    <NavbarButton href="/auth/register" variant="primary" className="w-full">
                      Daftar
                    </NavbarButton>
                  </div>
                </>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}