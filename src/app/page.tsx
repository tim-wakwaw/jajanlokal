// src/app/page.tsx

import HeroSection from "./components/HeroSection";
import CategorySection from "./components/CategorySection";
import HowItWorksSection from "./components/HowItWorksSection";
import AppleCarouselSection from "./components/AppleCarouselSection";
import ProductSection from "./components/ProductSection";
import MapPreviewSection from "./components/MapPreviewSection"; // <-- 1. IMPORT
import TestimonialSection from "./components/TestimonialSection";
import RecommendationSection from "./components/RecommendationSection";
import RegisterUMKMSection from "./components/RegisterUMKMSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <HowItWorksSection />

      <AppleCarouselSection />
      <ProductSection />

      {/* 2. TAMBAHKAN SECTION BARU DI SINI */}
      <MapPreviewSection />

      {/* 🤖 Recommendations Section */}
      <section className="py-16 bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 space-y-16">
          <RecommendationSection
            title="Rekomendasi Produk Untuk Anda"
            className="space-y-16"
            showSimilarProducts={false}
            showSimilarUMKM={false}
            showPersonalized={true}
            showTrending={true}
          />
        </div>
      </section>

      <TestimonialSection />
      <RegisterUMKMSection />
    </>
  );
}