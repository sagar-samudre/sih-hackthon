import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Calendar,
  ShoppingCart,
  Phone,
  Tag,
  Star,
  Camera
} from 'lucide-react';
import { Product, Language, User } from '../types';
import { getTranslation } from '../utils/translations';

interface CropLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  currentUser: User | null;
  onOpenOrderModal: (product: Product) => void;
  onOpenCropPhotoModal: (product: Product) => void;
  lang: Language;
}

export const CropLightboxModal: React.FC<CropLightboxModalProps> = ({
  isOpen,
  onClose,
  product,
  currentUser,
  onOpenOrderModal,
  onOpenCropPhotoModal,
  lang
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [product]);

  if (!isOpen || !product) return null;

  const t = getTranslation(lang);
  const isMr = lang === 'mr';
  const isHi = lang === 'hi';

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'];

  const prevImage = () => {
    setActiveIndex(curr => (curr === 0 ? images.length - 1 : curr - 1));
  };

  const nextImage = () => {
    setActiveIndex(curr => (curr === images.length - 1 ? 0 : curr + 1));
  };

  const isOwner = currentUser?.id === product.farmerId || currentUser?.mobile === product.farmerMobile || currentUser?.role === 'farmer';

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-stone-900 text-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-stone-800 my-auto flex flex-col md:flex-row max-h-[92vh]">
        {/* Left Side: Big Image Showcase with Arrows & Thumbnails */}
        <div className="md:w-3/5 bg-black flex flex-col justify-between relative p-4">
          {/* Top Bar on Image */}
          <div className="flex items-center justify-between z-10">
            <span className="bg-black/60 backdrop-blur-md text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-white/10">
              📷 {activeIndex + 1} / {images.length} {isMr ? 'फोटो' : 'Photos'}
            </span>

            {/* If farmer owns crop, allow adding more photos right from here */}
            {isOwner && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCropPhotoModal(product);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isMr ? 'फोटो बदला / जोडा' : 'Add/Edit Photos'}</span>
              </button>
            )}
          </div>

          {/* Main Photo Display */}
          <div className="my-auto relative flex items-center justify-center min-h-[260px] sm:min-h-[380px]">
            <img
              src={images[activeIndex]}
              alt={`${product.cropName} photo ${activeIndex + 1}`}
              className="max-h-[360px] sm:max-h-[440px] w-auto max-w-full object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />

            {/* Left & Right Nav Arrows if multiple */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer"
                  title="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer"
                  title="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none justify-center">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeIndex === i ? 'border-amber-400 scale-105' : 'border-stone-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Crop Info & Action Panel */}
        <div className="md:w-2/5 p-5 sm:p-6 bg-stone-900 flex flex-col justify-between border-t md:border-t-0 md:border-l border-stone-800">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-900/80 text-emerald-200 border border-emerald-700/50">
                {product.grade}
              </span>
              <button
                onClick={onClose}
                className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight mt-3">
              {product.cropName}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {isMr ? 'जात / व्हरायटी:' : 'Variety:'} <span className="text-stone-200 font-semibold">{product.variety}</span>
            </p>

            <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-3">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-stone-200 font-medium">{product.farmerLocation}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{isMr ? 'काढणी दिनांक:' : 'Harvest Date:'} <span className="text-stone-200 font-medium">{product.harvestDate}</span></span>
            </div>

            {/* Price Card */}
            <div className="mt-4 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60">
              <span className="text-xs text-emerald-300 font-medium block">
                {isMr ? 'थेट शेतकरी विक्री दर:' : 'Direct Farmer Price:'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-amber-300 font-mono">
                  ₹{product.pricePerKg}
                </span>
                <span className="text-xs text-stone-300">/ kg</span>
                <span className="text-xs text-emerald-400 font-bold ml-auto bg-emerald-900/80 px-2 py-0.5 rounded">
                  0% {isMr ? 'दलाली कपात' : 'Commission'}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-emerald-800/40 flex justify-between text-xs text-stone-300">
                <span>{isMr ? 'शहरातील किरकोळ दर:' : 'Retail Market:'} ₹{product.retailPricePerKg}/kg</span>
                <span className="font-bold text-amber-300">
                  {isMr ? 'बचत:' : 'Save:'} ₹{product.retailPricePerKg - product.pricePerKg}/kg
                </span>
              </div>
            </div>

            {/* Stock & Description */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-stone-300">
                <span className="text-stone-400">{isMr ? 'उपलब्ध शेतमाल साठा:' : 'Available Stock:'}</span>
                <span className="font-bold text-white font-mono">{product.quantityKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span className="text-stone-400">{isMr ? 'किमान ऑर्डर मर्यादा:' : 'Minimum Order:'}</span>
                <span className="font-bold text-white font-mono">{product.minOrderKg} kg</span>
              </div>

              {product.description && (
                <p className="text-xs text-stone-400 mt-2 p-2.5 bg-stone-800/60 rounded-xl leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-stone-800 flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenOrderModal(product);
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isMr ? 'थेट खरेदी करा' : 'Buy Direct'}</span>
            </button>

            <a
              href={`tel:${product.farmerMobile}`}
              className="p-3 bg-stone-800 hover:bg-stone-700 text-emerald-400 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title="Call Farmer"
            >
              <Phone className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
