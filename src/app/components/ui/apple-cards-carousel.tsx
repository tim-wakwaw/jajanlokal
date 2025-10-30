"use client";
import React, {
    useEffect,
    useRef,
    useState,
    createContext,
    useContext,
    useCallback,
} from "react";
import {
    IconArrowNarrowLeft,
    IconArrowNarrowRight,
    IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../../hooks/use-outside-click";
import { CardContainer, CardBody, CardItem } from "./3d-card";

// Interface CardData
export interface CardData {
    src: string;
    title: string;
    category: string;
    content: React.ReactNode;
    id: number | string;
}

// Definisikan CarouselProps SEBELUM digunakan
interface CarouselProps {
    items: CardData[];
    initialScroll?: number;
}

// Context
export const CarouselContext = createContext<{
    onCardClose: (index: number) => void;
    currentIndex: number;
}>({
    onCardClose: () => { },
    currentIndex: 0,
});

// Komponen AppleCardsCarousel
export const AppleCardsCarousel = ({ items, initialScroll = 0 }: CarouselProps) => {
    const carouselRef = React.useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // --- FIX Z-INDEX: Tambahkan state untuk kartu yang terbuka ---
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const checkScrollability = useCallback(() => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    }, []);

    useEffect(() => {
        if (carouselRef.current) {
            carouselRef.current.scrollLeft = initialScroll;
            checkScrollability();
        }
    }, [initialScroll, checkScrollability]);

    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
    };

    const handleCardClose = useCallback((index: number) => {
        // Nonaktifkan scroll saat menutup
        setCurrentIndex(index);
    }, []);

    useEffect(() => {
        checkScrollability();
        window.addEventListener('resize', checkScrollability);
        return () => {
            window.removeEventListener('resize', checkScrollability);
        };
    }, [checkScrollability]);

    return (
        <CarouselContext.Provider
            value={{ onCardClose: handleCardClose, currentIndex }}
        >
            <div className="relative w-full">
                <div
                    className="flex w-full justify-center overflow-x-auto overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20"
                    ref={carouselRef}
                    onScroll={checkScrollability}
                >
                    <div
                        className={cn(
                            "flex flex-row justify-start gap-6 px-4",
                        )}
                    >
                        {items.map((item: CardData, index: number) => (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 20,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        duration: 0.5,
                                        delay: 0.1 * index,
                                        ease: "easeOut",
                                    },
                                }}
                                key={"card" + item.id}

                                // --- FIX Z-INDEX & INTEGRASI HOVER ---
                                className={cn(
                                    "relative group shrink-0",
                                    openIndex === index && "z-50" // Terapkan z-50 jika kartu ini terbuka
                                )}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {/* --- INTEGRASI HOVER: Tambahkan motion.span --- */}
                                <AnimatePresence>
                                    {hoveredIndex === index && (
                                        <motion.span
                                            className="absolute inset-[-4px] bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-xl md:rounded-2xl"
                                            layoutId="hoverBackground"
                                            initial={{ opacity: 0 }}
                                            animate={{
                                                opacity: 1,
                                                transition: { duration: 0.3 },
                                            }}
                                            exit={{
                                                opacity: 0,
                                                transition: { duration: 0.15, delay: 0.2 },
                                            }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 260,
                                                damping: 25,
                                            }}
                                        />
                                    )}
                                </AnimatePresence>

                                {/* Bungkus Card dengan z-20 agar di atas hover span */}
                                <div className="relative z-20">
                                    <Card
                                        card={item}
                                        index={index}
                                        layout
                                        // --- FIX Z-INDEX: Kirim state & setter ke Card ---
                                        openIndex={openIndex}
                                        setOpenIndex={setOpenIndex}
                                    />
                                </div>
                            </motion.div>
                        ))}
                        <div className="shrink-0 w-1/3 md:w-1/4"></div> {/* Spacer */}
                    </div>
                </div>
                <div className="flex justify-center gap-2 md:justify-end md:mr-10 mt-4 md:mt-0">
                    <button
                        className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 disabled:opacity-50 transition-opacity"
                        onClick={scrollLeft}
                        disabled={!canScrollLeft}
                        aria-label="Scroll Left"
                    >
                        <IconArrowNarrowLeft className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
                    </button>
                    <button
                        className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 disabled:opacity-50 transition-opacity"
                        onClick={scrollRight}
                        disabled={!canScrollRight}
                        aria-label="Scroll Right"
                    >
                        <IconArrowNarrowRight className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
                    </button>
                </div>
            </div>
        </CarouselContext.Provider>
    );
};

// Komponen Card
export const Card = ({
    card,
    index,
    layout = false,
    // --- FIX Z-INDEX: Terima props baru ---
    openIndex,
    setOpenIndex,
}: {
    card: CardData;
    index: number;
    layout?: boolean;
    openIndex: number | null;
    setOpenIndex: (index: number | null) => void;
}) => {
    // --- FIX Z-INDEX: Hapus state 'open' lokal ---
    // const [open, setOpen] = useState(false);
    const isOpen = openIndex === index; // Tentukan state dari props

    const containerRef = useRef<HTMLElement>(null);
    const { onCardClose } = useContext(CarouselContext);

    const handleClose = useCallback(() => {
        setOpenIndex(null); // Gunakan setter dari props
        if (typeof onCardClose === 'function') {
            setTimeout(() => onCardClose(index), 300);
        }
    }, [index, onCardClose, setOpenIndex]); // Tambahkan setOpenIndex ke dependensi

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                handleClose();
            }
        }

        if (isOpen) { // Gunakan isOpen
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, handleClose]); // Ganti 'open' ke 'isOpen'

    useOutsideClick(containerRef as React.RefObject<HTMLElement>, handleClose);

    const handleOpen = () => {
        setOpenIndex(index); // Gunakan setter dari props
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && ( // Gunakan isOpen
                    <div className="fixed inset-0 z-50 h-screen overflow-auto flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 h-full w-full bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ ease: "easeOut", duration: 0.3 }}
                            ref={containerRef as React.RefObject<HTMLDivElement>}
                            layoutId={layout ? `card-${card.id}` : undefined}
                            className="relative z-[60] h-fit max-w-3xl rounded-xl bg-white p-4 shadow-xl md:p-8 dark:bg-neutral-900"
                        >
                            <button
                                className="sticky top-2 right-2 z-50 ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-neutral-700 hover:bg-neutral-800 dark:bg-neutral-200 dark:hover:bg-neutral-300 transition-colors"
                                onClick={handleClose}
                                aria-label="Close"
                            >
                                <IconX className="h-5 w-5 text-neutral-100 dark:text-neutral-900" />
                            </button>
                            <div className="flex flex-col md:flex-row gap-4 md:gap-8 -mt-6">
                                <motion.div className="w-full md:w-1/2 shrink-0">
                                    <BlurImage
                                        src={card.src}
                                        alt={card.title}
                                        className="rounded-lg object-cover aspect-square w-full h-auto md:h-full"
                                    />
                                </motion.div>
                                <div className="w-full md:w-1/2">
                                    <motion.p
                                        layoutId={layout ? `category-${card.id}` : undefined}
                                        className="text-sm font-medium text-neutral-500 dark:text-neutral-400"
                                    >
                                        {card.category}
                                    </motion.p>
                                    <motion.h2
                                        layoutId={layout ? `title-${card.id}` : undefined}
                                        className="mt-1 text-2xl font-semibold text-neutral-800 md:text-3xl dark:text-neutral-100"
                                    >
                                        {card.title}
                                    </motion.h2>
                                    <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
                                        {card.content}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <CardContainer
                containerClassName={cn(
                    "h-72 w-56 md:h-96 md:w-72 p-0"
                    // Hapus z-index dari sini, sudah dihandle parent
                )}
                className="h-full w-full"
            >
                <CardBody
                    className={cn(
                        "h-full w-full relative flex flex-col items-start justify-end overflow-hidden",
                        "rounded-lg shadow-md md:rounded-xl",
                        "bg-neutral-200 dark:bg-neutral-800",
                        "hover:shadow-xl transition-shadow duration-300 ease-out"
                    )}
                >
                    <motion.button
                        layoutId={layout ? `card-${card.id}` : undefined}
                        onClick={handleOpen}
                        className="absolute inset-0 z-30 h-full w-full"
                        aria-label={`Lihat detail ${card.title}`}
                    />
                    <CardItem
                        translateZ={-20}
                        className="absolute inset-0 z-0 h-full w-full"
                    >
                        <BlurImage
                            src={card.src}
                            alt={card.title}
                            className="h-full w-full object-cover"
                        />
                    </CardItem>
                    <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <CardItem
                        translateZ={40}
                        className="relative z-20 p-4 md:p-5"
                    >
                        <motion.p
                            layoutId={layout ? `category-${card.id}` : undefined}
                            className="text-xs font-medium text-white/80 md:text-sm"
                        >
                            {card.category}
                        </motion.p>
                        <motion.p
                            layoutId={layout ? `title-${card.id}` : undefined}
                            className="mt-1 text-base font-semibold text-balance text-white md:text-xl"
                        >
                            {card.title}
                        </motion.p>
                    </CardItem>
                </CardBody>
            </CardContainer>
        </>
    );
};

// Komponen BlurImage
export const BlurImage = ({
    className,
    src,
    alt,
    ...rest
}: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) => {
    const [isLoading, setLoading] = useState(true);
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            className={cn(
                "transition duration-300 ease-in-out",
                isLoading
                    ? "scale-105 blur-lg grayscale"
                    : "scale-100 blur-0 grayscale-0",
                className
            )}
            onLoad={() => setLoading(false)}
            src={src}
            loading="lazy"
            decoding="async"
            alt={alt || "Image"}
            {...rest}
        />
    );
};