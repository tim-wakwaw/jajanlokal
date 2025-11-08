"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import Footer from "./components/Footer";
import { FloatingActionButton } from "./components/FloatingActionButton";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  // Check jika ini halaman detail produk (format: /produk/[id])
  const isProductDetailRoute = pathname?.match(/^\/produk\/[^/]+$/);

  // Untuk admin routes atau product detail, gak render Header, Footer, FAB
  if (isAdminRoute || isProductDetailRoute) {
    return <>{children}</>;
  }

  // Untuk routes biasa, render semua
  return (
    <>
      <Header />
      <main className="relative">{children}</main>
      <Footer />
      <FloatingActionButton />
    </>
  );
}
