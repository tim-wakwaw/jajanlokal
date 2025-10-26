"use client";

import { BackgroundRippleEffect } from "./ui/BackgroundRipple";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { Spotlight } from "@/components/ui/spotlight-new";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import Image from "next/image";
import { Navbar } from "./ui/resizable-navbar";

export default function HeroSection() {
  const words = [
    {
      text: "Jajan",
    },
    {
      text: "Lokal",
      className: "text-gray-500 dark:text-gray-400",
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      {/* Spotlight Effect */}
      <Spotlight />
      
      {/* Background Ripple Effect */}
      <BackgroundRippleEffect gridSize={50} />
      
      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8">
        <div className="text-center">
          <TypewriterEffect words={words} />
          
          <p className="mx-auto mt-4 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400 sm:text-base">
            Dukung UMKM Indonesia dengan belanja produk lokal terbaik
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">
              Mulai Belanja
            </button>
            <button className="rounded-lg border-2 border-neutral-300 px-6 py-2.5 text-sm font-semibold text-neutral-900 transition-all hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-100 dark:hover:border-neutral-600 dark:hover:bg-neutral-900">
              Daftar Sebagai Seller
            </button>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
             <BackgroundGradient className="rounded-[22px] bg-white p-5 dark:bg-zinc-900">
              <Image
                src="/assets/tailor.png"
                alt="Harga Terjangkau"
                width={400}
                height={240}
                className="mb-3 h-96 w-full rounded-lg object-cover"
              />
              <h3 className="mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Harga Terjangkau
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Dapatkan produk berkualitas dengan harga bersahabat
              </p>
            </BackgroundGradient>

            <BackgroundGradient className="rounded-[22px] bg-white p-5 dark:bg-zinc-900">
              <Image
                src="/assets/actor.png"
                alt="Harga Terjangkau"
                width={400}
                height={240}
                className="mb-3 h-96 w-full rounded-lg object-cover"
              />
              <h3 className="mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Harga Terjangkau
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Dapatkan produk berkualitas dengan harga bersahabat
              </p>
            </BackgroundGradient>

            <BackgroundGradient className="rounded-[22px] bg-white p-5 dark:bg-zinc-900">
              <Image
                src="/assets/movie-director.png"
                alt="Harga Terjangkau"
                width={400}
                height={240}
                className="mb-3 h-96 w-full rounded-lg object-cover"
              />
              <h3 className="mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Harga Terjangkau
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Dapatkan produk berkualitas dengan harga bersahabat
              </p>
            </BackgroundGradient>
          </div>
        </div>
      </div>
    </div>
  );
}
