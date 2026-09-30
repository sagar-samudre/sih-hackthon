/**
 * Image handling utilities for crop photos in SetiMitra
 * Supports reading file from camera/gallery, compressing large camera shots, and converting to base64 Data URLs.
 */

export async function processCropImageFile(file: File, maxDimension = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    // Basic verification
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Failed to load image data'));
        return;
      }

      // If file is already small (e.g. < 250KB) and not a huge dimension, return directly
      if (file.size < 250 * 1024) {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(dataUrl); // Fallback to raw data url if decode fails
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Curated high-definition crop presets for instant use
 */
export interface CropPreset {
  name: string;
  nameLocalMr: string;
  nameLocalHi: string;
  crop: string;
  variety: string;
  category: 'Vegetables' | 'Fruits' | 'Grains & Pulses' | 'Spices' | 'Leafy Greens';
  price: number;
  url: string;
  additionalUrls?: string[];
}

export const CROP_PRESETS: CropPreset[] = [
  {
    name: 'Tomato',
    nameLocalMr: 'टोमॅटो',
    nameLocalHi: 'टमाटर',
    crop: 'Red Round Hybrid Tomatoes',
    variety: 'Vaishnavi F1 Premium',
    category: 'Vegetables',
    price: 20,
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=900&auto=format&fit=crop&q=80',
    additionalUrls: [
      'https://images.unsplash.com/photo-1546470427-227c7369a4d3?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=900&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'Onion',
    nameLocalMr: 'कांदा',
    nameLocalHi: 'प्याज',
    crop: 'Nashik Red Quality Onions',
    variety: 'Garwa Winter Red',
    category: 'Vegetables',
    price: 24,
    url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=900&auto=format&fit=crop&q=80',
    additionalUrls: [
      'https://images.unsplash.com/photo-1508747703725-719777637510?w=900&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'Potato',
    nameLocalMr: 'बटाटा',
    nameLocalHi: 'आलू',
    crop: 'Kufri Jyoti Clean Potatoes',
    variety: 'Kufri Jyoti Grade A',
    category: 'Vegetables',
    price: 16,
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=900&auto=format&fit=crop&q=80',
    additionalUrls: [
      'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=900&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'Cauliflower',
    nameLocalMr: 'फ्लॉवर / गोबी',
    nameLocalHi: 'फूलगोभी',
    crop: 'Snowball White Cauliflower',
    variety: 'Snow Crown Compact',
    category: 'Vegetables',
    price: 22,
    url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=900&auto=format&fit=crop&q=80'
  },
  {
    name: 'Capsicum',
    nameLocalMr: 'ढोबळी मिरची',
    nameLocalHi: 'शिमला मिर्च',
    crop: 'Green Bell Polyhouse Capsicum',
    variety: 'Indra Hybrid Polyhouse',
    category: 'Vegetables',
    price: 34,
    url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=900&auto=format&fit=crop&q=80'
  },
  {
    name: 'Spinach',
    nameLocalMr: 'पालक',
    nameLocalHi: 'पालक साग',
    crop: 'Fresh Broadleaf Farm Spinach',
    variety: 'All Green Desi Palak',
    category: 'Leafy Greens',
    price: 25,
    url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=900&auto=format&fit=crop&q=80'
  },
  {
    name: 'Green Chilli',
    nameLocalMr: 'हिरवी मिरची',
    nameLocalHi: 'हरी मिर्च',
    crop: 'Spicy Green Bullet Chillies',
    variety: 'G-4 Jawala Export Grade',
    category: 'Spices',
    price: 45,
    url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=900&auto=format&fit=crop&q=80'
  },
  {
    name: 'Carrot',
    nameLocalMr: 'गाजर',
    nameLocalHi: 'गाजर',
    crop: 'Sweet Red Farm Carrots',
    variety: 'Pusa Kesar Sweet',
    category: 'Vegetables',
    price: 24,
    url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=900&auto=format&fit=crop&q=80'
  },
  {
    name: 'Ginger',
    nameLocalMr: 'आले (अदरक)',
    nameLocalHi: 'ताजा अदरक',
    crop: 'Fresh Cleaned Farm Ginger',
    variety: 'Mahim / Rio de Janeiro',
    category: 'Spices',
    price: 68,
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=900&auto=format&fit=crop&q=80'
  },
  {
    name: 'Garlic',
    nameLocalMr: 'लसूण',
    nameLocalHi: 'लहसुन',
    crop: 'Desi Pungent Farm Garlic',
    variety: 'G-282 Solid Clove',
    category: 'Spices',
    price: 110,
    url: 'https://images.unsplash.com/photo-1615477032219-bc188649a50d?w=900&auto=format&fit=crop&q=80'
  }
];
