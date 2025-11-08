"use client";

import { useAuth } from "@/contexts/OptimizedAuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }

    // Check if user is admin
    if (user) {
      // Get user role from profiles table
      import("@/lib/supabase").then(({ supabase }) => {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              setUserRole(data.role);
              if (
                data.role !== "admin" &&
                data.role !== "super_admin" &&
                data.role !== "moderator"
              ) {
                router.push("/");
              }
            } else {
              router.push("/");
            }
          });
      });
    }
  }, [user, loading, router]);

  if (loading || !user || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      href: "/admin/dashboard",
      icon: "📊",
      label: "Dashboard",
      active: pathname === "/admin/dashboard",
    },
    {
      href: "/admin/orders",
      icon: "📦",
      label: "Orders",
      active: pathname.startsWith("/admin/orders"),
    },
    {
      href: "/admin/umkm-requests",
      icon: "🏪",
      label: "UMKM Requests",
      active: pathname.startsWith("/admin/umkm-requests"),
    },
    {
      href: "/admin/umkm-product-requests",
      icon: "📝",
      label: "Product Requests",
      active: pathname.startsWith("/admin/umkm-product-requests"),
    },
    {
      href: "/admin/blog-management",
      icon: "📰",
      label: "Blog Management",
      active: pathname.startsWith("/admin/blog-management"),
    },
    {
      href: "/admin/faq-management",
      icon: "❓",
      label: "FAQ Management",
      active: pathname.startsWith("/admin/faq-management"),
    },
    {
      href: "/admin/analytics",
      icon: "📈",
      label: "Analytics",
      active: pathname.startsWith("/admin/analytics"),
    },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 fixed h-screen overflow-y-auto">
        {/* Logo */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              J
            </div>
            <div>
              <h1 className="font-bold text-lg text-neutral-900 dark:text-white">
                JajanLokal
              </h1>
              <p className="text-xs text-neutral-500">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {user.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                {user.email}
              </p>
              <p className="text-xs text-neutral-500 capitalize">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                item.active
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 absolute bottom-0 w-64 bg-white dark:bg-neutral-900">
          <button
            onClick={async () => {
              const { supabase } = await import("@/lib/supabase");
              await supabase.auth.signOut();
              router.push("/auth/login");
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-all"
          >
            <span className="text-xl">🚪</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
