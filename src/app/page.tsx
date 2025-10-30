import HeroSection from "./components/HeroSection";
import ThemeToggle from "./components/ThemeToggle";
import UMKMSection from "./components/UMKMSection";
// ----- PERBAIKI IMPOR INI -----
import AppleCarouselSection from "./components/AppleCarouselSection"; // <-- Impor DARI FILE SECTION, TANPA .tsx

export default function Home() {
  return (
    <>
      <ThemeToggle />
      <HeroSection />
      <UMKMSection />
      <AppleCarouselSection /> {/* <-- Penggunaan sudah benar */}
    </>
  );
}