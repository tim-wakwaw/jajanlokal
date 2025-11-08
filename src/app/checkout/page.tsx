"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { useAuth } from "@/contexts/OptimizedAuthContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { showErrorAlert, showSuccessAlert, showToast } from "@/lib/sweetalert";
import { SimilarProducts } from "../components/RecommendationSection";
import { Trash2 } from "lucide-react";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems, cartTotal, cartCount, refreshCart, removeFromCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Pre-fill email from user
    setCustomerEmail(user.email || "");
    
    // Refresh cart to get latest data
    refreshCart();
  }, [user, router, refreshCart]);

  // Log cart changes for debugging
  useEffect(() => {
    console.log('🛒 Checkout - Cart items updated:', cartItems.length, 'items');
    console.log('🛒 Checkout - Cart total:', cartTotal);
    console.log('🛒 Checkout - Cart count:', cartCount);
  }, [cartItems, cartTotal, cartCount]);

  const handleCheckout = async () => {
    if (!user) return;

    // Validate form
    if (!customerName || !customerEmail || !customerPhone || !customerAddress) {
      showErrorAlert("Error", "Mohon lengkapi semua data pengiriman");
      return;
    }

    if (cartItems.length === 0) {
      showErrorAlert("Error", "Keranjang belanja kosong");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          notes,
          cartItems: cartItems.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            price: item.product_price,
            quantity: item.quantity,
            umkm_name: item.umkm_name,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      // 🗑️ Clear cart from localStorage
      localStorage.removeItem(`cart_${user.id}`);

      // 🔄 Refresh cart to clear UI
      await refreshCart();

      // Show success and redirect to Xendit payment page
      showSuccessAlert("Sukses!", "Mengarahkan ke halaman pembayaran...");
      
      // Redirect to Xendit invoice URL
      window.location.href = data.invoiceUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      showErrorAlert(
        "Error",
        error instanceof Error ? error.message : "Checkout gagal"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      showToast('Item berhasil dihapus dari keranjang', 'success');
      
      // Jika keranjang jadi kosong, redirect ke produk
      if (cartCount <= 1) {
        router.push('/produk');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      showErrorAlert('Error', 'Gagal menghapus item dari keranjang');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Silakan login untuk melanjutkan checkout
          </p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2">Keranjang Kosong</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Tambahkan produk ke keranjang terlebih dahulu
          </p>
          <button
            onClick={() => router.push("/produk")}
            className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Belanja Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Checkout
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Lengkapi data pengiriman dan selesaikan pembayaran
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800">
              <h2 className="text-2xl font-bold mb-6">Data Pengiriman</h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nomor HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Jalan, nomor rumah, RT/RW, Kelurahan, Kecamatan, Kota"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan untuk penjual..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Summary Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Ringkasan Pesanan</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800"
                  >
                    {item.product_image && (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {item.product_name}
                      </h3>
                      <p className="text-xs text-neutral-500">
                        {item.umkm_name}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          x{item.quantity}
                        </span>
                        <span className="font-semibold text-sm">
                          Rp {(item.product_price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                    {/* 🗑️ Delete Button */}
                    <button
                      onClick={() => handleRemoveItem(item.product_id)}
                      className="p-2 h-fit rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors shrink-0"
                      title="Hapus dari keranjang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Subtotal
                  </span>
                  <span className="font-semibold">
                    Rp {cartTotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">
                    Rp {cartTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Memproses...</span>
                  </div>
                ) : (
                  "Bayar Sekarang"
                )}
              </button>

              <p className="text-xs text-center text-neutral-500 mt-4">
                Anda akan diarahkan ke halaman pembayaran Xendit
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 🤖 Recommendations Section */}
      {cartItems.length > 0 && (
        <section className="py-16 bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 space-y-16">
            {/* Similar Products berdasarkan produk pertama di cart */}
            <SimilarProducts 
              productId={cartItems[0]?.product_id}
              title="⭐ Produk Serupa"
              className="space-y-8"
            />
          </div>
        </section>
      )}
    </div>
  );
}
