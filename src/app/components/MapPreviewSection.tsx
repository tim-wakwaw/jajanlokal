// src/app/components/MapPreviewSection.tsx

"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import MagicBorderButton from "./ui/MagicBorderButton";
import SplitText from "./ui/SplitText";
import { MapPin } from "lucide-react";

export default function MapPreviewSection() {
    // Daftar pin untuk mockup peta
    const mapPins = [
        {
            src: "/assets/icons/pin-kuliner.gif",
            alt: "Kuliner",
            className: "top-[20%] left-[30%] w-12 h-12"
        },
        {
            src: "/assets/icons/pin-fashion.gif",
            alt: "Fashion",
            className: "top-[40%] left-[60%] w-12 h-12"
        },
        {
            src: "/assets/icons/pin-kerajinan.gif",
            alt: "Kerajinan",
            className: "top-[65%] left-[40%] w-12 h-12"
        },
        {
            src: "/assets/icons/pin-retail.gif",
            alt: "Retail",
            className: "top-[50%] left-[15%] w-12 h-12"
        },
        {
            src: "/assets/icons/pin-kesehatan.gif",
            alt: "Kesehatan",
            className: "top-[25%] left-[75%] w-12 h-12"
        },
    ];

    return (
        <section className="py-16 md:py-24 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* 1. Konten Teks & CTA */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative z-10"
                >
                    <SplitText
                        text="Jelajahi Peta UMKM Interaktif"
                        tag="h2"
                        className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-white"
                        splitType="words"
                        delay={80}
                        textAlign="left"
                    />
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-lg mb-8">
                        Temukan bisnis lokal di sekitar Anda dengan peta interaktif kami.
                        Lihat lokasi, kategori, dan rating UMKM secara real-time untuk menemukan favorit baru Anda.
                    </p>
                    <Link href="/peta-umkm">
                        <MagicBorderButton>
                            <span className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4" />
                                Eksplor Peta Sekarang
                            </span>
                        </MagicBorderButton>
                    </Link>
                </motion.div>

                {/* 2. Visual Mockup Peta */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative w-full h-[450px] rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Latar Peta Statis (Abu-abu) */}
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800">
                        {/* Anda bisa ganti ini dengan gambar peta statis jika ada */}
                        <Image
                            src="/assets/icons/pin-posisi.gif"
                            alt="Peta Latar Belakang"
                            layout="fill"
                            objectFit="cover"
                            className="opacity-10 dark:opacity-5"
                        />
                    </div>

                    {/* Fake UI Peta */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="absolute top-4 left-4 w-5/12 bg-white dark:bg-gray-900 p-2 rounded-lg shadow-lg flex items-center gap-2"
                    >
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded-full" />
                        <div className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-full" />
                    </motion.div>

                    {/* Pin Lokasi Pengguna (Palsu) */}
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Image
                            src="/assets/icons/pin-posisi.gif"
                            alt="Lokasi Anda"
                            width={64}
                            height={64}
                            className="w-16 h-16"
                        />
                    </motion.div>

                    {/* Pin UMKM (Animasi) */}
                    {mapPins.map((pin, index) => (
                        <motion.div
                            key={index}
                            className={`absolute ${pin.className}`}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                delay: 0.7 + index * 0.1,
                                type: "spring",
                                stiffness: 150
                            }}
                        >
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{
                                    duration: 2.5 + index * 0.3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <Image
                                    src={pin.src}
                                    alt={pin.alt}
                                    width={48}
                                    height={48}
                                    unoptimized // Penting untuk GIF
                                />
                            </motion.div>
                        </motion.div>
                    ))}

                </motion.div>
            </div>
        </section>
    );
}