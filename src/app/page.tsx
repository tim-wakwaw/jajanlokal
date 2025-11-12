import HeroSection from "./components/HeroSection";
import ThemeToggle from "./components/ThemeToggle";
import UMKMSection from "./components/UMKMSection";
import AppleCarouselSection from "./components/AppleCarouselSection";
import ProductSection from "./components/ProductSection";
import TestimonialSection from "./components/TestimonialSection";
import RecommendationSection from "./components/RecommendationSection";

export default function Home() {
  return (
    <>
      <ThemeToggle />
      <HeroSection />
      
      <UMKMSection />
      <AppleCarouselSection />
      <ProductSection />
      
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
    </>
  );
}