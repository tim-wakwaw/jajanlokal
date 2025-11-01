"use client";

import { useState, useEffect } from 'react';

/**
 * Hook kustom untuk mendeteksi apakah query media CSS cocok.
 * @param query String query media (misal: "(min-width: 768px)")
 * @returns {boolean} True jika query cocok, false jika tidak.
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Pastikan kode ini hanya berjalan di client
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    
    // Set state awal
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    // Listener untuk perubahan ukuran layar
    const listener = () => setMatches(media.matches);
    
    // Gunakan addEventListener yang lebih modern
    media.addEventListener('change', listener);
    
    // Cleanup listener
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};