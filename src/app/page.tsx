import HeroSection from "./components/HeroSection";
import ThemeToggle from "./components/ThemeToggle";
import UMKMSection from "./components/UMKMSection";
import AppleCarouselSection from "./components/AppleCarouselSection";
import TestimonialSection from "./components/TestimonialSection";

export default function Home() {
  return (
    <>
      <ThemeToggle />
      <HeroSection />
      <UMKMSection />
      <AppleCarouselSection />
      <TestimonialSection />
    </>
  );
}