"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";

export default function PaymentFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-8 text-center"
      >
        {/* Failed Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg
            className="w-12 h-12 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </motion.div>

        <h1 className="text-3xl font-bold mb-2">Pembayaran Gagal</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Terjadi kesalahan saat memproses pembayaran Anda
        </p>

        {orderId && (
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Order ID: <span className="font-mono font-semibold">{orderId.slice(0, 8)}</span>
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push("/checkout")}
            className="w-full py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Coba Lagi
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          >
            Kembali ke Beranda
          </button>
        </div>
      </motion.div>
    </div>
  );
}
