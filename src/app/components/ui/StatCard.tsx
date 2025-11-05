"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative";
  icon: ReactNode;
  iconBg: string;
}

export function StatCard({ title, value, change, changeType, icon, iconBg }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-white/50 to-transparent dark:from-gray-800/50 pointer-events-none" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </h3>
          {change && (
            <div className="flex items-center gap-1">
              <span className={`text-sm font-semibold ${
                changeType === "positive" 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {change}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                dari bulan lalu
              </span>
            </div>
          )}
        </div>
        
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`p-3 rounded-xl ${iconBg}`}
        >
          {icon}
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl" />
    </motion.div>
  );
}