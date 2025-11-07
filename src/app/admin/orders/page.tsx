"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "motion/react";

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_status: string;
  delivery_address: string;
  phone: string;
  products: Array<{
    product_name: string;
    quantity: number;
    price: number;
    umkm_name?: string;
  }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchOrders = async () => {
    setLoading(true);

    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("payment_status", filter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setOrders(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    const loadOrders = async () => {
      await fetchOrders();
    };
    void loadOrders();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      expired: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          styles[status] || styles.pending
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Orders Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage all customer orders
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {["all", "pending", "paid", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
              }`}
            >
              {status === "all" ? "All Orders" : status.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Total Orders
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
            {orders.length}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Total Revenue
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
            Rp{" "}
            {(
              orders.reduce((sum, o) => sum + Number(o.total_amount), 0) / 1000
            ).toFixed(0)}
            K
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {orders.filter((o) => o.payment_status === "paid").length}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Pending
          </p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {orders.filter((o) => o.payment_status === "pending").length}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Customer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {orders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-mono text-neutral-900 dark:text-white">
                      {order.id.slice(0, 8)}...
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(order.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      {order.products?.slice(0, 2).map((product, idx) => (
                        <p
                          key={idx}
                          className="text-sm text-neutral-900 dark:text-white truncate"
                        >
                          {product.quantity}x {product.product_name}
                        </p>
                      ))}
                      {order.products?.length > 2 && (
                        <p className="text-xs text-neutral-500">
                          +{order.products.length - 2} more
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Rp {Number(order.total_amount).toLocaleString("id-ID")}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.payment_status)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-neutral-900 dark:text-white">
                      {order.phone}
                    </p>
                    <p className="text-xs text-neutral-500 truncate max-w-[200px]">
                      {order.delivery_address}
                    </p>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400">
              No orders found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
