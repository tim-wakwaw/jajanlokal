"use client";

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react'; 
import { CardContainer, CardBody, CardItem } from './ui/3d-card';
import LazyImage from './LazyImage'; 
import { useOutsideClick } from '@/hooks/useOutsideClick'; 
import { IconX, IconBuildingStore, IconMessage2, IconShoppingCart, IconUsers } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import UMKMDetailOverview from './UMKMDetailOverview';
import UMKMDetailProduct from './UMKMDetailProduct';
import UMKMDetailReview from './UMKMDetailReview';
import { getSimilarUMKMByUMKM } from '@/lib/recommendations';

// Simple UMKM List Component  
const SimpleUMKMList = ({ umkmId }: { umkmId: string }) => {
  const [similarUMKM, setSimilarUMKM] = React.useState<Array<{
    id: string;
    name: string; 
    category: string;
    image?: string;
    rating?: number;
    alamat?: string;
  }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSimilar = async () => {
      console.log('🏪 SimpleUMKMList fetching for:', umkmId);
      try {
        // getSimilarUMKMByUMKM returns UMKM data directly
        const umkmData = await getSimilarUMKMByUMKM(umkmId, 6);
        console.log('🏪 SimpleUMKMList got UMKM:', umkmData);
        setSimilarUMKM(umkmData);
      } catch (error) {
        console.error('🏪 SimpleUMKMList error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (umkmId) fetchSimilar();
  }, [umkmId]);

  if (loading) {
    return (
      <div className="text-neutral-600 dark:text-white/70 text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600 dark:border-white"></div>
        <p className="mt-2">Loading UMKM serupa...</p>
      </div>
    );
  }

  if (similarUMKM.length === 0) {
    return (
      <div className="text-neutral-600 dark:text-white/70 text-center py-8">
        <IconBuildingStore className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Tidak ada UMKM serupa ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {similarUMKM.map((umkm) => (
        <motion.div 
          key={umkm.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-neutral-100 dark:bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-neutral-300 dark:border-white/20 hover:border-neutral-400 dark:hover:border-white/40 transition-all cursor-pointer"
        >
          {/* UMKM Image */}
          <div className="relative w-full h-32 bg-linear-to-br from-blue-500/20 to-purple-600/20">
            {umkm.image ? (
              <LazyImage
                src={umkm.image}
                alt={umkm.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <IconBuildingStore className="w-12 h-12 text-neutral-400 dark:text-white/40" />
              </div>
            )}
          </div>

          {/* UMKM Info */}
          <div className="p-3">
            <h4 className="text-neutral-900 dark:text-white font-semibold text-sm truncate mb-1">
              {umkm.name}
            </h4>
            <p className="text-neutral-600 dark:text-white/70 text-xs truncate mb-2">
              {umkm.category}
            </p>
            
            {/* Rating & Location */}
            <div className="flex items-center justify-between text-xs">
              {umkm.rating && (
                <span className="text-yellow-500 dark:text-yellow-400 flex items-center gap-1">
                  ⭐ {umkm.rating.toFixed(1)}
                </span>
              )}
              {umkm.alamat && (
                <span className="text-neutral-500 dark:text-white/60 truncate flex-1 ml-2">
                  {umkm.alamat.split(',')[0]}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export interface Product { id: string; name: string; price: number; image?: string; stock: number; is_available: boolean; }
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

type ActiveTab = 'overview' | 'product' | 'review' | 'similar';

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 flex flex-col items-center gap-1 p-3 text-xs font-medium border-b-2 transition-all",
      isActive
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:bg-muted"
    )}
  >
    {icon}
    {label}
  </button>
);


export const UMKMDetailCard: React.FC<UMKMDetailCardProps> = ({ umkm, onClose, className }) => {
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  useOutsideClick(cardWrapperRef, onClose);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

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
                  <TabButton 
                    label="Overview" 
                    icon={<IconBuildingStore className="w-4 h-4" />} 
                    isActive={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                  />
                  <TabButton 
                    label="Product" 
                    icon={<IconShoppingCart className="w-4 h-4" />} 
                    isActive={activeTab === 'product'}
                    onClick={() => setActiveTab('product')}
                  />
                  <TabButton 
                    label="Review" 
                    icon={<IconMessage2 className="w-4 h-4" />} 
                    isActive={activeTab === 'review'}
                    onClick={() => setActiveTab('review')}
                  />
                  <TabButton 
                    label="Similar" 
                    icon={<IconUsers className="w-4 h-4" />} 
                    isActive={activeTab === 'similar'}
                    onClick={() => setActiveTab('similar')}
                  />
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
                    
                    className="" 
                  >
                                        {activeTab === 'overview' && <UMKMDetailOverview umkm={umkm} />}
                    {activeTab === 'product' && <UMKMDetailProduct umkm={umkm} />}
                    {activeTab === 'review' && <UMKMDetailReview umkm={umkm} />}
                    {activeTab === 'similar' && (
                      <div className="p-4 space-y-4">
                        <SimpleUMKMList umkmId={umkm.id.toString()} />
                      </div>
                    )}
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