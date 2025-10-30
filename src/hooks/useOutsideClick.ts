"use client"; 

import React, { useEffect, RefObject } from "react";

type ClickOutsideCallback = (event: MouseEvent | TouchEvent) => void;

/**
 * Custom hook untuk mendeteksi klik atau sentuhan di luar elemen yang ditentukan.
 * @param ref Ref React ke elemen DOM yang ingin dipantau. Bisa null saat awal render.
 * @param callback Fungsi yang akan dipanggil ketika klik/sentuhan terjadi di luar elemen ref.
 */
export const useOutsideClick = (
  ref: RefObject<Element | null>,
  callback: ClickOutsideCallback
) => {
  useEffect(() => {
    /** Listener untuk event mousedown dan touchstart */
    const listener = (event: MouseEvent | TouchEvent) => {

      if (!ref || !ref.current || !(event.target instanceof Node) || ref.current.contains(event.target)) {
        return;
      }
      // Panggil callback jika klik di luar
      callback(event);
    };

    // Tambahkan event listener ke document
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]); 
};
