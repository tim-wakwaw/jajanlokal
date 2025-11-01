"use client";

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react'; 
import { CardContainer, CardBody, CardItem } from './ui/3d-card';
import LazyImage from './LazyImage'; 
import { useOutsideClick } from '@/hooks/useOutsideClick'; 
import { IconX, IconBuildingStore, IconMessage2, IconShoppingCart } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import UMKMDetailOverview from './UMKMDetailOverview';
import UMKMDetailProduct from './UMKMDetailProduct';
import UMKMDetailReview from './UMKMDetailReview';

export interface Product { name: string; price: number; image?: string; }
export interface Comment { user: string; text: string;}

export interface UMKM {
  id: number;
  name: string;
  image?: string; 
  alamat: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  rating: number;
  comments: Comment[]; 
  products: Product[];
}

interface UMKMDetailCardProps {
  umkm: UMKM;
  onClose: () => void;
  className?: string;
}

type ActiveTab = 'overview' | 'product' | 'review';


export const UMKMDetailCard: React.FC<UMKMDetailCardProps> = ({ umkm, onClose, className }) => {
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  useOutsideClick(cardWrapperRef, onClose);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  const TabButton = ({ tab, label, icon }: { tab: ActiveTab, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={cn(
        "flex-1 flex flex-col items-center gap-1 p-3 text-xs font-medium border-b-2 transition-all",
        activeTab === tab
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:bg-muted"
      )}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-1000 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
      
      <motion.div
        ref={cardWrapperRef} 
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="my-auto" 
      >
        <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }}>
          <CardContainer
            containerClassName={cn(
              "py-0", 
              className
            )}
            className="bg-card border rounded-xl shadow-lg" 
          >
            <CardBody className="relative p-6 w-96 flex flex-col h-auto">
              
              <CardItem
                translateZ={30}
                className="absolute top-4 right-4 z-20"
              >
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                  aria-label="Tutup detail"
                >
                  <IconX className="h-4 w-4 text-muted-foreground" />
                </button>
              </CardItem>

              {umkm.image && (
                <CardItem
                  translateZ={20}
                  className="w-full mt-2" 
                >
                  <LazyImage
                    src={umkm.image}
                    alt={umkm.name}
                    className="w-full h-40 object-cover rounded-lg shadow-md"
                    eager
                  />
                </CardItem>
              )}

              <CardItem
                translateZ={25}
                className={cn("mt-4 w-full", !umkm.image && "mt-8")} 
              >
                <h3 className="text-xl font-bold text-foreground line-clamp-1">{umkm.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {umkm.category} • ⭐ {umkm.rating}
                </p>
              </CardItem>
              
              <CardItem
                translateZ={10}
                className="w-full mt-4 border-b border-border"
              >
                <nav className="flex justify-around">
                  <TabButton tab="overview" label="Overview" icon={<IconBuildingStore className="w-4 h-4" />} />
                  <TabButton tab="product" label="Product" icon={<IconShoppingCart className="w-4 h-4" />} />
                  <TabButton tab="review" label="Review" icon={<IconMessage2 className="w-4 h-4" />} />
                </nav>
              </CardItem>

              <CardItem
                translateZ={15}
                className="mt-4 w-full overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    
                    // 4. HAPUS 'max-h-[40vh]', 'overflow-y-auto', dll.
                    className="" 
                  >
                    {activeTab === 'overview' && <UMKMDetailOverview umkm={umkm} />}
                    {activeTab === 'product' && <UMKMDetailProduct umkm={umkm} />}
                    {activeTab === 'review' && <UMKMDetailReview umkm={umkm} />}
                  </motion.div>
                </AnimatePresence>
              </CardItem>

            </CardBody>
          </CardContainer>
        </motion.div>
      </motion.div>
    </div>
  );
};