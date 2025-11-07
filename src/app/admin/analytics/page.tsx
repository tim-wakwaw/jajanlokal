"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "motion/react";

interface CategoryStats {
  category: string;
  total_sold: number;
  total_revenue: number;
  product_count: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

interface ProductPerformance {
  product_name: string;
  umkm_name: string;
  total_sold: number;
  total_revenue: number;
  avg_order_value: number;
}

export default function AnalyticsPage() {
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [topPerformers, setTopPerformers] = useState<ProductPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await fetchAnalytics();
    };
    void fetchData();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);

    // Fetch all orders
    const { data: orders } = await supabase.from("orders").select("*");

    // Fetch all products with categories
    const { data: products } = await supabase
      .from("products")
      .select("*, umkm(name, category)");

    if (orders && products) {
      // Calculate category stats
      const catStats: Record<
        string,
        { sold: number; revenue: number; products: Set<string> }
      > = {};

      orders.forEach((order) => {
        const orderProducts = order.products as Array<{
          product_id: string;
          product_name: string;
          quantity: number;
          price: number;
        }>;

        orderProducts?.forEach((orderProduct) => {
          const product = products.find((p) => p.id === orderProduct.product_id);
          const category = (product?.umkm as { category?: string })?.category || "Other";

          if (!catStats[category]) {
            catStats[category] = { sold: 0, revenue: 0, products: new Set() };
          }

          catStats[category].sold += orderProduct.quantity || 0;
          catStats[category].revenue +=
            (orderProduct.price || 0) * (orderProduct.quantity || 0);
          catStats[category].products.add(orderProduct.product_name);
        });
      });

      const categoryData = Object.entries(catStats)
        .map(([category, stats]) => ({
          category,
          total_sold: stats.sold,
          total_revenue: stats.revenue,
          product_count: stats.products.size,
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue);

      setCategoryStats(categoryData);

      // Calculate monthly revenue (last 6 months)
      const monthlyData: Record<string, { revenue: number; orders: number }> =
        {};

      orders.forEach((order) => {
        const date = new Date(order.created_at);
        const monthKey = date.toLocaleDateString("id-ID", {
          month: "short",
          year: "numeric",
        });

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, orders: 0 };
        }

        monthlyData[monthKey].revenue += Number(order.total_amount || 0);
        monthlyData[monthKey].orders += 1;
      });

      const monthlyArray = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          revenue: data.revenue,
          orders: data.orders,
        }))
        .slice(-6);

      setMonthlyRevenue(monthlyArray);

      // Calculate top performing products
      const productPerf: Record<
        string,
        { sold: number; revenue: number; umkm: string; orders: number }
      > = {};

      orders.forEach((order) => {
        const orderProducts = order.products as Array<{
          product_name: string;
          quantity: number;
          price: number;
          umkm_name?: string;
        }>;

        orderProducts?.forEach((product) => {
          const name = product.product_name;

          if (!productPerf[name]) {
            productPerf[name] = {
              sold: 0,
              revenue: 0,
              umkm: product.umkm_name || "Unknown",
              orders: 0,
            };
          }

          productPerf[name].sold += product.quantity || 0;
          productPerf[name].revenue +=
            (product.price || 0) * (product.quantity || 0);
          productPerf[name].orders += 1;
        });
      });

      const perfData = Object.entries(productPerf)
        .map(([name, stats]) => ({
          product_name: name,
          umkm_name: stats.umkm,
          total_sold: stats.sold,
          total_revenue: stats.revenue,
          avg_order_value: stats.revenue / stats.orders,
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 10);

      setTopPerformers(perfData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const maxCategoryRevenue = categoryStats[0]?.total_revenue || 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Analytics & Reports
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Detailed insights into sales performance and trends
        </p>
      </div>

      {/* Category Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
          📊 Sales by Category
        </h2>
        <div className="space-y-6">
          {categoryStats.map((cat, index) => {
            const percentage = (cat.total_revenue / maxCategoryRevenue) * 100;

            return (
              <div key={cat.category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      {cat.category}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      {cat.product_count} products • {cat.total_sold} items sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                      Rp {(cat.total_revenue / 1000).toFixed(0)}K
                    </p>
                    <p className="text-sm text-neutral-500">
                      {percentage.toFixed(0)}% of total
                    </p>
                  </div>
                </div>
                <div className="relative w-full h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="absolute h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                  />
                </div>
              </div>
            );
          })}
          {categoryStats.length === 0 && (
            <p className="text-center text-neutral-500 py-8">
              No category data available
            </p>
          )}
        </div>
      </motion.div>

      {/* Monthly Revenue Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
          📈 Monthly Revenue Trend
        </h2>
        <div className="space-y-4">
          {monthlyRevenue.map((month, index) => {
            const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));
            const percentage = (month.revenue / maxRevenue) * 100;

            return (
              <div key={month.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {month.month}
                  </span>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      Rp {(month.revenue / 1000000).toFixed(2)}M
                    </p>
                    <p className="text-xs text-neutral-500">
                      {month.orders} orders
                    </p>
                  </div>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-linear-to-r from-green-600 to-emerald-600 h-3 rounded-full"
                  />
                </div>
              </div>
            );
          })}
          {monthlyRevenue.length === 0 && (
            <p className="text-center text-neutral-500 py-8">
              No monthly data available
            </p>
          )}
        </div>
      </motion.div>

      {/* Top Performers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            🏆 Top Performing Products
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                  UMKM
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                  Units Sold
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                  Revenue
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                  Avg Order
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {topPerformers.map((product, index) => (
                <motion.tr
                  key={product.product_name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : index === 1
                          ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          : index === 2
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {product.product_name}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {product.umkm_name}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {product.total_sold}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      Rp {product.total_revenue.toLocaleString("id-ID")}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Rp {product.avg_order_value.toLocaleString("id-ID")}
                    </p>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {topPerformers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-500 dark:text-neutral-400">
                No product performance data available
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
