"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";

interface OrderDetails {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (!error && data) {
        setOrderDetails(data);
      }
    };

    void fetchOrderDetails();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-blue-50 to-purple-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-8 text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg
            className="w-12 h-12 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>

        <h1 className="text-3xl font-bold mb-2">Pembayaran Berhasil!</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Terima kasih atas pembelian Anda
        </p>

        {orderDetails && (
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Order ID:
              </span>
              <span className="text-sm font-mono font-semibold">
                {orderDetails.id.slice(0, 8)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Total:
              </span>
              <span className="text-sm font-semibold text-green-600">
                Rp {Number(orderDetails.total_amount).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Status:
              </span>
              <span className="text-sm font-semibold text-green-600">
                Paid
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Kembali ke Beranda
          </button>
          <button
            onClick={() => router.push("/produk")}
            className="w-full py-3 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          >
            Belanja Lagi
          </button>
        </div>
      </motion.div>
    </div>
  );
}
