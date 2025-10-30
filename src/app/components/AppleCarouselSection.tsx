"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
// --- PASTIKAN IMPOR INI BENAR ---
import { motion, easeOut } from "motion/react";
import { AppleCardsCarousel, type CardData } from "@/app/components/ui/apple-cards-carousel";

// Tipe data mentah dari JSON (tambahkan rating dan image)
interface UmkmData {
    id: number;
    name: string;
    image?: string;
    category: string;
    description: string;
    products: { name: string; price: number }[];
    rating: number;
}

const ProductDetailContent = ({ description, products, umkmId }: { description: string, products?: { name: string; price: number }[], umkmId: number }) => (
    <div>
        <h4 className="font-semibold mb-2 text-neutral-800 dark:text-neutral-200">Deskripsi</h4>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{description}</p>
        {products && products.length > 0 && (
            <>
                <h4 className="font-semibold mb-2 text-neutral-800 dark:text-neutral-200">Produk Unggulan</h4>
                <ul className="list-disc list-inside text-sm text-neutral-600 dark:text-neutral-400">
                    {products.slice(0, 3).map((p, i) => (
                        <li key={i}>{p.name} - Rp{p.price.toLocaleString()}</li>
                    ))}
                </ul>
            </>
        )}
        <Link 
            href={`/peta-umkm?umkm=${umkmId}`}
            className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
        >
            Lihat Detail UMKM
        </Link>
    </div>
);

// --- Helper untuk Gambar ---
const categoryImages: { [key: string]: string } = {
    "Kuliner": "/assets/actor.png",
    "Fashion": "/assets/tailor.png",
    "Retail": "/assets/movie-director.png",
    "Kesehatan": "/assets/actor.png",
    "Kerajinan": "/assets/tailor.png",
};
const getImagePath = (category: string): string => {
    return categoryImages[category] || "/assets/movie-director.png";
};

// --- Komponen Section Utama ---
export default function AppleCarouselSection() {
    const [popularUmkm, setPopularUmkm] = useState<CardData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/data/umkmData.json")
            .then((response) => response.json())
            .then((data: UmkmData[]) => {
                // Sort berdasarkan rating tertinggi ke terendah
                const sortedData = data.sort((a, b) => b.rating - a.rating);
                const top4 = sortedData.slice(0, 4);

                // Log untuk debug
                console.log("Top 4 UMKM berdasarkan rating:", top4.map(u => ({ name: u.name, rating: u.rating })));

                const formattedData: CardData[] = top4.map((umkm) => ({
                    id: umkm.id,
                    category: `${umkm.category} • ⭐ ${umkm.rating}`,
                    title: umkm.name,
                    src: umkm.image || getImagePath(umkm.category), // Gunakan gambar dari JSON atau fallback
                    content: <ProductDetailContent description={umkm.description} products={umkm.products} umkmId={umkm.id} />
                }));

                setPopularUmkm(formattedData);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Gagal memuat data UMKM populer:", error);
                setIsLoading(false);
            });
    }, []);

    // --- GUNAKAN variabel 'easeOut' ---
    const sectionVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: easeOut // <-- Gunakan variabel, bukan string atau 'as any'
            }
        }
    };

    return (
        <motion.section
            className="w-full bg-neutral-100 dark:bg-neutral-950 py-16 md:py-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants} // <-- Error seharusnya hilang
        >
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-neutral-800 dark:text-neutral-200">
                    UMKM Populer Minggu Ini
                </h2>

                {isLoading ? (
                    <div className="text-center text-neutral-500">Memuat UMKM populer...</div>
                ) : (
                    <AppleCardsCarousel items={popularUmkm} />
                )}

                <div className="mt-10 text-center">
                    <Link
                        href="/peta-umkm"
                        className="inline-block rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                    >
                        Lihat Semua UMKM
                    </Link>
                </div>

            </div>
        </motion.section>
    );
}