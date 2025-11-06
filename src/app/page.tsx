import HeroSection from "./components/HeroSection";
import ThemeToggle from "./components/ThemeToggle";
import UMKMSection from "./components/UMKMSection";
import AppleCarouselSection from "./components/AppleCarouselSection";
import ProductSection from "./components/ProductSection";
import TestimonialSection from "./components/TestimonialSection";
import SeedDataFromJson from "./components/SeedDataFromJson";

export default function Home() {
  return (
    <>
      <ThemeToggle />
      <HeroSection />
      
      {/* Dev Tools Section - Remove in production */}
      <section className="py-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Development Tools
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tools untuk testing dan development (hapus di production)
            </p>
          </div>
          <div className="flex justify-center">
            <SeedDataFromJson />
          </div>
        </div>
      </section>
      
      <UMKMSection />
      <AppleCarouselSection />
      <ProductSection />
      <TestimonialSection />
    </>
  );
}