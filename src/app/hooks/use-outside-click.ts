import React, { useEffect } from "react";

// Tipe callback yang lebih spesifik, menerima event mouse atau sentuh
type ClickOutsideCallback = (event: MouseEvent | TouchEvent) => void;

export const useOutsideClick = (
    ref: React.RefObject<HTMLElement>, // Bisa HTMLElement atau elemen spesifik lain jika perlu
    callback: ClickOutsideCallback,
) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            // Do nothing if clicking ref's element or descendent elements
            // Pastikan event.target adalah Node sebelum menggunakan contains
            if (!ref.current || !(event.target instanceof Node) || ref.current.contains(event.target)) {
                return;
            }
            callback(event);
        };

        // Tambahkan event listener dengan tipe yang benar
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            // Hapus event listener dengan tipe yang benar
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, callback]); // Array dependensi sudah benar
};