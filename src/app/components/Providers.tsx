"use client";

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Lazy load providers untuk mengurangi initial bundle
const LazyAuthProvider = dynamic(() => 
  import("../../contexts/OptimizedAuthContext").then(mod => ({ default: mod.OptimizedAuthProvider })), 
  { ssr: false }
);

const LazyCartProvider = dynamic(() => 
  import("../../contexts/CartContext").then(mod => ({ default: mod.CartProvider })), 
  { ssr: false }
);

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <LazyAuthProvider>
      <LazyCartProvider>
        {children}
      </LazyCartProvider>
    </LazyAuthProvider>
  );
}