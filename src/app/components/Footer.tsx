"use client";

import Link from "next/link";
import { Send, Facebook, Twitter, Instagram, Github } from "lucide-react";
// 1. Impor NavbarLogo yang sudah ada (menggantikan definisi 'Logo' yang error)
import { NavbarLogo } from "./ui/resizable-navbar";

export default function Footer() {
    // 2. Definisi 'Logo' yang sebelumnya ada di sini sudah dihapus.

    return (
        <footer className="w-full border-t border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 relative z-2000">
            <div className="container mx-auto max-w-7xl px-6 py-16">
                {/* Bagian Atas: Logo, Link, dan Newsletter */}
                <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
                    {/* 1. Branding & Social */}
                    <div className="md:col-span-4 lg:col-span-5">
                        {/* 3. Gunakan NavbarLogo yang diimpor */}
                        <NavbarLogo />
                        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                            Misi kami adalah memberdayakan UMKM lokal Indonesia melalui
                            platform digital yang modern dan mudah diakses.
                        </p>
                        <div className="mt-6 flex space-x-4">
                            <a
                                href="#"
                                className="text-neutral-500 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                                aria-label="Facebook"
                            >
                                <Facebook size={20} />
                            </a>
                            <a
                                href="#"
                                className="text-neutral-500 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                                aria-label="Twitter"
                            >
                                <Twitter size={20} />
                            </a>
                            <a
                                href="#"
                                className="text-neutral-500 transition-colors hover:text-purple-500 dark:hover:text-purple-400"
                                aria-label="Instagram"
                            >
                                <Instagram size={20} />
                            </a>
                            <a
                                href="https://github.com/tim-wakwaw/jajanlokal" // Sesuai path file
                                className="text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
                                aria-label="GitHub"
                            >
                                <Github size={20} />
                            </a>
                        </div>
                    </div>

                    {/* 2. Link Navigasi Cepat */}
                    <div className="md:col-span-2 lg:col-span-2">
                        <h5 className="font-semibold text-neutral-800 dark:text-neutral-100">
                            Jelajahi
                        </h5>
                        <ul className="mt-4 space-y-3">
                            <li>
                                <Link
                                    href="/produk"
                                    className="text-sm text-neutral-600 transition-colors hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                                >
                                    Produk
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/peta-umkm"
                                    className="text-sm text-neutral-600 transition-colors hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                                >
                                    Peta UMKM
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/blog"
                                    className="text-sm text-neutral-600 transition-colors hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                                >
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 3. Link Perusahaan */}
                    <div className="md:col-span-2 lg:col-span-2">
                        <h5 className="font-semibold text-neutral-800 dark:text-neutral-100">
                            Perusahaan
                        </h5>
                        <ul className="mt-4 space-y-3">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-sm text-neutral-600 transition-colors hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                                >
                                    Tentang Kami
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/kontak"
                                    className="text-sm text-neutral-600 transition-colors hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                                >
                                    Kontak
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/daftar"
                                    className="text-sm text-neutral-600 transition-colors hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                                >
                                    Jadi Seller
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 4. Newsletter */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <h5 className="font-semibold text-neutral-800 dark:text-neutral-100">
                            Langganan Newsletter
                        </h5>
                        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                            Dapatkan info terbaru seputar produk dan UMKM favorit Anda.
                        </p>
                        <form className="mt-4 flex w-full">
                            <input
                                type="email"
                                placeholder="Email Anda"
                                className="w-full rounded-l-md border-y border-l border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                            />
                            <button
                                type="submit"
                                className="rounded-r-md bg-linear-to-r from-blue-500 to-purple-500 px-4 py-2 text-white transition-all hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                aria-label="Kirim"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bagian Bawah: Copyright */}
                <div className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800">
                    <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                        © {new Date().getFullYear()} JajanLokal. Dibuat oleh Tim Newbie Cihuy untuk UMKM Indonesia.
                    </p>
                </div>
            </div>
        </footer>
    );
}
