"use client";

import React from "react";
import Link from "next/link";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { motion } from "motion/react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 pt-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-16 text-center"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Tentang JajanLokal
        </h1>
        <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
          Menghubungkan UMKM lokal dengan masyarakat untuk menciptakan ekonomi yang lebih inklusif dan berkelanjutan
        </p>
      </motion.div>

      {/* Main Content with Tracing Beam */}
      <div className="pb-20">
        <TracingBeam className="px-6">
          <div className="max-w-2xl mx-auto antialiased pt-4 relative">
            {/* Section 1: Visi */}
            <div className="mb-20">
              <h2 className="bg-black text-white rounded-full text-sm w-fit px-4 py-1 mb-4">
                Visi Kami
              </h2>
              
              <p className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                Memberdayakan UMKM Indonesia di Era Digital
              </p>

              <div className="text-sm prose prose-sm dark:prose-invert">
                <div className="rounded-lg mb-6 h-48 bg-linear-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🏪</div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">UMKM Indonesia</p>
                  </div>
                </div>
                
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  JajanLokal hadir sebagai platform digital yang menghubungkan UMKM lokal dengan pelanggan di seluruh Indonesia. 
                  Kami percaya bahwa setiap UMKM memiliki cerita unik dan produk berkualitas yang layak untuk dikenal lebih luas.
                </p>
                
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mt-4">
                  Dengan teknologi yang mudah digunakan, kami membantu UMKM untuk memasarkan produk mereka secara online, 
                  menjangkau lebih banyak pelanggan, dan mengembangkan bisnis mereka ke level berikutnya.
                </p>
              </div>
            </div>

            {/* Section 2: Misi */}
            <div className="mb-20">
              <h2 className="bg-black text-white rounded-full text-sm w-fit px-4 py-1 mb-4">
                Misi Kami
              </h2>
              
              <p className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                Tiga Pilar Pemberdayaan UMKM
              </p>

              <div className="text-sm prose prose-sm dark:prose-invert">
                <div className="rounded-lg mb-6 h-48 bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🎯</div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Misi JajanLokal</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-2">
                      🎯 Aksesibilitas Digital
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300">
                      Memberikan platform yang mudah digunakan bagi UMKM untuk memiliki kehadiran online 
                      tanpa perlu keahlian teknis yang rumit.
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <h3 className="font-bold text-purple-700 dark:text-purple-400 mb-2">
                      🤝 Koneksi Lokal
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300">
                      Menghubungkan pelanggan dengan UMKM di sekitar mereka melalui peta interaktif 
                      dan sistem pencarian yang cerdas.
                    </p>
                  </div>

                  <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg">
                    <h3 className="font-bold text-pink-700 dark:text-pink-400 mb-2">
                      📈 Pertumbuhan Berkelanjutan
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300">
                      Menyediakan tools dan insights untuk membantu UMKM menganalisis performa 
                      dan mengembangkan strategi bisnis yang lebih baik.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Fitur Unggulan */}
            <div className="mb-20">
              <h2 className="bg-black text-white rounded-full text-sm w-fit px-4 py-1 mb-4">
                Fitur Unggulan
              </h2>
              
              <p className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                Platform Lengkap untuk UMKM
              </p>

              <div className="text-sm prose prose-sm dark:prose-invert">
                <div className="rounded-lg mb-6 h-48 bg-linear-to-r from-pink-100 to-blue-100 dark:from-pink-900/30 dark:to-blue-900/30 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">⚡</div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Fitur Platform</p>
                  </div>
                </div>
                
                <ul className="space-y-3 text-neutral-700 dark:text-neutral-300">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🗺️</span>
                    <div>
                      <strong>Peta UMKM Interaktif</strong>
                      <p>Temukan UMKM terdekat dengan visualisasi peta yang mudah digunakan</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🛍️</span>
                    <div>
                      <strong>Katalog Produk Digital</strong>
                      <p>Tampilkan produk dengan foto berkualitas dan deskripsi detail</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">💬</span>
                    <div>
                      <strong>Review & Rating</strong>
                      <p>Sistem review transparan untuk membangun kepercayaan pelanggan</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <strong>Dashboard Admin</strong>
                      <p>Kelola toko, produk, dan pesanan dengan mudah dari satu tempat</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 4: Dampak */}
            <div className="mb-20">
              <h2 className="bg-black text-white rounded-full text-sm w-fit px-4 py-1 mb-4">
                Dampak Kami
              </h2>
              
              <p className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                Bersama Membangun Ekonomi Lokal
              </p>

              <div className="text-sm prose prose-sm dark:prose-invert">
                <div className="rounded-lg mb-6 h-48 bg-linear-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📈</div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Dampak Positif</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-linear-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">100+</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">UMKM Terdaftar</div>
                  </div>
                  
                  <div className="text-center p-4 bg-linear-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">500+</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Produk Lokal</div>
                  </div>
                  
                  <div className="text-center p-4 bg-linear-to-br from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-800/20 rounded-lg">
                    <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">1000+</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Pengguna Aktif</div>
                  </div>
                  
                  <div className="text-center p-4 bg-linear-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">10+</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Kota Terjangkau</div>
                  </div>
                </div>

                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  Setiap transaksi di JajanLokal bukan hanya pembelian produk, tapi juga dukungan langsung 
                  untuk ekonomi lokal. Dengan berbelanja di platform kami, Anda turut membantu UMKM 
                  Indonesia untuk terus berkembang dan menciptakan lapangan kerja baru.
                </p>
              </div>
            </div>

            {/* Section 5: Bergabung */}
            <div className="mb-20">
              <h2 className="bg-black text-white rounded-full text-sm w-fit px-4 py-1 mb-4">
                Bergabung Bersama Kami
              </h2>
              
              <p className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                Mari Tumbuh Bersama
              </p>

              <div className="text-sm prose prose-sm dark:prose-invert">
                <div className="rounded-lg mb-6 h-48 bg-linear-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🤝</div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Bergabung Bersama</p>
                  </div>
                </div>
                
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                  Apakah Anda seorang pengusaha UMKM yang ingin memperluas jangkauan pasar? 
                  Atau pelanggan yang ingin mendukung produk lokal berkualitas? 
                  JajanLokal adalah tempat yang tepat untuk Anda.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <a
                    href="/request-umkm"
                    className="flex-1 text-center px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Daftarkan UMKM Anda
                  </a>
                  
                  <Link
                    href="/produk"
                    className="flex-1 text-center px-6 py-3 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white font-semibold rounded-lg border-2 border-neutral-300 dark:border-neutral-600 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-200"
                  >
                    Jelajahi Produk
                  </Link>
                </div>

                <p className="text-neutral-600 dark:text-neutral-400 text-center mt-8 italic">
                  &ldquo;Bersama kita dukung UMKM Indonesia untuk Go Digital dan Go Global!&rdquo;
                </p>
              </div>
            </div>
          </div>
        </TracingBeam>
      </div>
    </div>
  );
}
