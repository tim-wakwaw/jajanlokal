"use client";

import React from "react";
import { motion, Variants } from "framer-motion"; // [!code ++]
import { MapPin, ShieldCheck, Store } from "lucide-react";

const steps = [
    {
        icon: <MapPin className="w-10 h-10 text-blue-500" />,
        title: "Temukan UMKM",
        description: "Jelajahi bisnis lokal di sekitar Anda melalui peta interaktif dan pencarian cerdas.",
    },
    {
        icon: <ShieldCheck className="w-10 h-10 text-purple-500" />,
        title: "Pesan dengan Aman",
        description: "Nikmati transaksi yang aman dan terpercaya.",
    },
    {
        icon: <Store className="w-10 h-10 text-green-500" />,
        title: "Dukung Bisnis Lokal",
        description: "Setiap pembelian Anda berkontribusi langsung pada pertumbuhan UMKM Indonesia.",
    },
];

const cardVariants: Variants = { // [!code ++]
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
        opacity: 1,
        scale: 1,
        transition: {
            delay: i * 0.15,
            duration: 0.4,
            ease: "easeOut",
        },
    }),
};

export default function HowItWorksSection() {
    return (
        <section className="py-16 md:py-24 bg-white dark:bg-neutral-950">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-neutral-800 dark:text-neutral-100">
                        Kenapa Memilih JajanLokal?
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                        Platform Anda untuk menemukan, memesan, dan mendukung bisnis lokal.
                    </p>
                </motion.div>

                {/* Grid 3 Langkah */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.title}
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={cardVariants}
                            className="bg-neutral-50 dark:bg-neutral-900 p-8 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800"
                        >
                            <div className="p-4 bg-white dark:bg-neutral-800 rounded-full inline-block mb-4 shadow-md">
                                {step.icon}
                            </div>
                            <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
                                {step.title}
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}