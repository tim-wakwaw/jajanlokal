"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion"; // [!code ++]
import { BackgroundGradient } from "./ui/background-gradient";

// Kategori ini didasarkan pada data Anda di umkmData.json dan ProductCard.tsx
const CATEGORIES = [
    { name: "Kuliner", icon: "🍽️", href: "/peta-umkm?kategori=Kuliner" },
    { name: "Fashion", icon: "👕", href: "/peta-umkm?kategori=Fashion" },
    { name: "Retail", icon: "🏪", href: "/peta-umkm?kategori=Retail" },
    { name: "Kerajinan", icon: "🎨", href: "/peta-umkm?kategori=Kerajinan" },
    { name: "Kesehatan", icon: "💊", href: "/peta-umkm?kategori=Kesehatan" },
];

const cardVariants: Variants = { // [!code ++]
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.3,
            ease: "easeOut",
        },
    }),
};

export default function CategorySection() {
    return (
        <section className="py-16 md:py-24 bg-white dark:bg-neutral-900">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Jelajahi Berbagai Kategori
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                        Dari kuliner lezat hingga kerajinan tangan unik, temukan semua di sini.
                    </p>
                </motion.div>

                {/* Grid Kategori */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {CATEGORIES.map((category, i) => (
                        <motion.div
                            key={category.name}
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={cardVariants}
                        >
                            <BackgroundGradient
                                containerClassName="rounded-2xl w-full h-full"
                                className="rounded-2xl bg-white dark:bg-neutral-900 w-full h-full"
                                animate={true}
                            >
                                <Link
                                    href={category.href}
                                    className="block p-6 text-center transition-transform duration-300 group-hover:scale-105"
                                >
                                    <div className="text-5xl mb-4">{category.icon}</div>
                                    <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                                        {category.name}
                                    </h3>
                                </Link>
                            </BackgroundGradient>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}