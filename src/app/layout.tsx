// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProviders";
import Header from "./header";
import Footer from "./components/Footer";
import { FloatingActionButton } from "./components/FloatingActionButton";
import Providers from "./components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JajanLokal - Platform UMKM Indonesia",
  description: "Platform untuk mendukung dan mengembangkan UMKM lokal Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var effectiveTheme = theme === 'system' ? systemTheme : theme;
                  
                  if (effectiveTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Providers>
            {/* Header dengan Navbar untuk desktop dan mobile */}
            <Header />
            
            {/* Main content area */}
            <main className="relative">
              {children}
            </main>
            
            {/* Footer */}
            <Footer />
            
            {/* Floating Action Button untuk Cart dan Admin */}
            <FloatingActionButton />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}