"use client";

import React from "react";
import Link from "next/link";
import { StickyScroll } from "./ui/sticky-scroll-reveal";
import BlurText from "./ui/blurtext";
import { NavbarButton } from "./ui/resizable-navbar";
import { MapPin, ShieldCheck, TrendingUp, Users } from "lucide-react";

const umkmBenefits = [
  {
    title: "Jangkauan Pasar Lebih Luas",
    description:
      "Produk Anda akan dilihat oleh ribuan pengunjung JajanLokal setiap hari. Perluas jangkauan pelanggan Anda melampaui batas fisik toko Anda.",
    content: (
      <div className="h-full w-full flex items-center justify-center text-white bg-linear-to-br from-cyan-500 to-emerald-500">
        <TrendingUp className="h-32 w-32" />
      </div>
    ),
  },
  {
    title: "Muncul di Peta Digital Interaktif",
    description:
      "Lokasi fisik UMKM Anda akan terdaftar di Peta UMKM kami. Pelanggan di sekitar Anda dapat dengan mudah menemukan toko Anda secara langsung.",
    content: (
      <div className="h-full w-full flex items-center justify-center text-white bg-linear-to-br from-pink-500 to-indigo-500">
        <MapPin className="h-32 w-32" />
      </div>
    ),
  },
  {
    title: "Sistem Pembayaran Aman & Terintegrasi",
    description:
      "Nikmati kemudahan transaksi yang aman dan terpercaya.",
    content: (
      <div className="h-full w-full flex items-center justify-center text-white bg-linear-to-br from-orange-500 to-yellow-500">
        <ShieldCheck className="h-32 w-32" />
      </div>
    ),
  },
  {
    title: "Siap Bergabung?",
    description:
      "Daftarkan UMKM Anda sekarang juga, gratis! Mari tumbuh bersama dan bawa bisnis lokal Anda ke level berikutnya.",
    content: (
      <div className="h-full w-full flex flex-col items-center justify-center text-white bg-linear-to-br from-emerald-500 to-blue-500 p-8">
        <Users className="h-24 w-24 mb-4" />
        <NavbarButton
          as={Link}
          href="/request-umkm"
          variant="primary"
          className="bg-white text-black text-base font-semibold px-8 py-4 shadow-lg hover:shadow-xl"
        >
          Daftar Sekarang
        </NavbarButton>
      </div>
    ),
  },
];

export default function RegisterUMKMSection() {
  return (
    <section className="relative w-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <div className="absolute top-16 md:top-24 left-1/2 -translate-x-1/2 z-20 text-center">
        <BlurText
          text="Kenapa Harus Daftar UMKM di JajanLokal?"
          delay={150}
          animateBy="words"
          direction="top"
          className="text-4xl md:text-5xl font-bold"
        />
      </div>
      <StickyScroll content={umkmBenefits} />
    </section>
  );
}
