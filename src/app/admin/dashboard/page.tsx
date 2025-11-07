"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUMKM: number;
  activeProducts: number;
  pendingRequests: number;
}

interface TopProduct {
  product_name: string;
  total_sold: number;
  total_revenue: number;
}

interface UMKMRevenue {
  umkm_name: string;
  total_revenue: number;
  order_count: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUMKM: 0,
    activeProducts: 0,
    pendingRequests: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [umkmRevenue, setUMKMRevenue] = useState<UMKMRevenue[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);

    // Fetch orders
    const { data: orders } = await supabase.from("orders").select("*");

    if (orders) {
      const totalRevenue = orders.reduce(
        (sum, order) => sum + Number(order.total_amount || 0),
        0
      );

      setStats((prev) => ({
        ...prev,
        totalOrders: orders.length,
        totalRevenue,
      }));

      // Calculate top products
      const productStats: Record<string, { sold: number; revenue: number }> =
        {};
      const umkmStats: Record<string, { revenue: number; orders: number }> =
        {};

      orders.forEach((order) => {
        const products = order.products as Array<{
          product_name: string;
          quantity: number;
          price: number;
          umkm_name?: string;
        }>;

        products?.forEach((product) => {
          const name = product.product_name || "Unknown";
          const quantity = product.quantity || 0;
          const revenue = (product.price || 0) * quantity;

          // Product stats
          if (!productStats[name]) {
            productStats[name] = { sold: 0, revenue: 0 };
          }
          productStats[name].sold += quantity;
          productStats[name].revenue += revenue;

          // UMKM stats
          const umkmName = product.umkm_name || "Unknown UMKM";
          if (!umkmStats[umkmName]) {
            umkmStats[umkmName] = { revenue: 0, orders: 0 };
          }
          umkmStats[umkmName].revenue += revenue;
        });

        // Count orders per UMKM
        const umkmName =
          (products[0]?.umkm_name as string) || "Unknown UMKM";
        if (umkmStats[umkmName]) {
          umkmStats[umkmName].orders += 1;
        }
      });

      // Top products
      const topProds = Object.entries(productStats)
        .map(([name, stats]) => ({
          product_name: name,
          total_sold: stats.sold,
          total_revenue: stats.revenue,
        }))
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, 5);

      setTopProducts(topProds);

      // UMKM revenue
      const umkmRev = Object.entries(umkmStats)
        .map(([name, stats]) => ({
          umkm_name: name,
          total_revenue: stats.revenue,
          order_count: stats.orders,
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 5);

      setUMKMRevenue(umkmRev);

      // Calculate monthly data (last 6 months)
      const monthlyRevenue: Record<string, { revenue: number; orders: number }> = {};
      const now = new Date();
      
      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        monthlyRevenue[monthKey] = { revenue: 0, orders: 0 };
      }

      // Group orders by month
      orders.forEach((order) => {
        const orderDate = new Date(order.created_at);
        const monthKey = orderDate.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        
        if (monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey].revenue += Number(order.total_amount || 0);
          monthlyRevenue[monthKey].orders += 1;
        }
      });

      // Convert to array
      const monthlyDataArray = Object.entries(monthlyRevenue).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        orders: data.orders,
      }));

      setMonthlyData(monthlyDataArray);
    }

    // Fetch UMKM count
    const { count: umkmCount } = await supabase
      .from("umkm")
      .select("*", { count: "exact", head: true });

    // Fetch products count
    const { count: productsCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_available", true);

    // Fetch pending requests
    const [
      { count: pendingUmkm },
      { count: pendingProducts },
      { count: pendingFaq },
    ] = await Promise.all([
      supabase
        .from("umkm_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("product_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("faq_questions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

    setStats((prev) => ({
      ...prev,
      totalUMKM: umkmCount || 0,
      activeProducts: productsCount || 0,
      pendingRequests:
        (pendingUmkm || 0) + (pendingProducts || 0) + (pendingFaq || 0),
    }));

    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchDashboardData();
    };
    void fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: "📦",
      growth: "+12%",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Revenue",
      value: `Rp ${(stats.totalRevenue / 1000000).toFixed(1)}M`,
      icon: "💰",
      growth: "+15%",
      bg: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600",
    },
    {
      title: "Total UMKM",
      value: stats.totalUMKM.toLocaleString(),
      icon: "🏪",
      growth: "+8%",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600",
    },
    {
      title: "Active Products",
      value: stats.activeProducts.toLocaleString(),
      icon: "📱",
      growth: "+5%",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Monitor your platform performance and analytics
        </p>
      </div>

      {/* Pending Requests Alert */}
      {stats.pendingRequests > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-900 dark:text-yellow-200">
                {stats.pendingRequests} Pending Requests
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                You have requests waiting for review
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${card.bg} rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center">
                <span className="text-2xl">{card.icon}</span>
              </div>
              <span className="text-green-600 text-sm font-medium px-2 py-1 bg-white dark:bg-neutral-900 rounded-lg">
                {card.growth}
              </span>
            </div>
            <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {card.title}
            </h3>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800"
        >
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">
            🏆 Top Selling Products
          </h2>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="product_name" 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  formatter={(value: number) => [value + ' sold', 'Total Sold']}
                />
                <Legend />
                <Bar dataKey="total_sold" fill={COLORS[0]} name="Products Sold" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-neutral-500 py-8">No product data available</p>
          )}
        </motion.div>

        {/* UMKM Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800"
        >
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">
            💰 Top UMKM by Revenue
          </h2>
          {umkmRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={umkmRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="umkm_name" 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  formatter={(value: number) => ['Rp ' + value.toLocaleString(), 'Revenue']}
                />
                <Legend />
                <Bar dataKey="total_revenue" fill={COLORS[2]} name="Total Revenue" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-neutral-500 py-8">No UMKM data available</p>
          )}
        </motion.div>
      </div>

      {/* Monthly Revenue Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">
          📈 Monthly Revenue Trend
        </h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'revenue') return ['Rp ' + value.toLocaleString(), 'Revenue'];
                  return [value, 'Orders'];
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke={COLORS[1]} 
                strokeWidth={3}
                name="Revenue"
                dot={{ fill: COLORS[1], r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke={COLORS[3]} 
                strokeWidth={3}
                name="Orders"
                dot={{ fill: COLORS[3], r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-neutral-500 py-8">No monthly data available</p>
        )}
      </motion.div>
    </div>
  );
}
