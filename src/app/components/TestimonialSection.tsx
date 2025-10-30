"use client";

import { motion } from 'framer-motion';
import TestimonialCarousel from './TestimonialCarousel';

export default function TestimonialSection() {
  return (
    <section className="w-full bg-linear-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Apa Kata Mereka?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Testimoni nyata dari pelanggan yang telah merasakan pelayanan terbaik UMKM lokal
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <TestimonialCarousel />

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              24+
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Testimoni Pelanggan
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              12+
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              UMKM Terpercaya
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              4.7
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Rating Rata-rata
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}