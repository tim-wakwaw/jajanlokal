import HeroSection from "./components/HeroSection";
import ThemeToggle from "./components/ThemeToggle";
import UMKMSection from "./components/UMKMSection";

export default function Home() {
  return (
    <>
      <ThemeToggle />
      <HeroSection />
      <UMKMSection />
    </>
  );
}

