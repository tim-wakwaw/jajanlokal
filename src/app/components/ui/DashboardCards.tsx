"use client";

import { motion } from "framer-motion";

interface TrendingUMKMProps {
  name: string;
  category: string;
  rating: number;
  trend: string;
  trendType: "up" | "down";
  icon: string;
  iconBg: string;
}

export function TrendingUMKMCard({ name, category, rating, trend, trendType, icon, iconBg }: TrendingUMKMProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
    >
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">{category}</span>
          <span className="text-sm">•</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{rating}</span>
            <span className="text-yellow-400">⭐</span>
          </div>
        </div>
      </div>

      <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
        trendType === "up" 
          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
      }`}>
        <span className="text-sm font-bold">{trend}</span>
        <span className="text-xs">minggu ini</span>
      </div>
    </motion.div>
  );
}

interface ActivityItemProps {
  title: string;
  time: string;
  icon: string;
  iconBg: string;
}

export function ActivityItem({ title, time, icon, iconBg }: ActivityItemProps) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
    >
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center text-xl shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{time}</p>
      </div>
    </motion.div>
  );
}