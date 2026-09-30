import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Trash2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  MapPin,
  Calendar,
  Tag,
  Star,
  Plus,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { Product, User, Language } from '../types';
import { processCropImageFile, CROP_PRESETS } from '../utils/imageUtils';
import { getTranslation } from '../utils/translations';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onProductAdded: (newProduct: Product) => void;
  lang?: Language;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProductAdded,
  lang = 'mr'
}) => {
  const t = getTranslation(lang);
  const isMr = lang === 'mr';
  const isHi = lang === 'hi';

  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [category, setCategory] = useState<'Vegetables' | 'Fruits' | 'Grains & Pulses' | 'Spices' | 'Leafy Greens'>('Vegetables');
  const [quantityKg, setQuantityKg] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [minOrderKg, setMinOrderKg] = useState('10');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [grade, setGrade] = useState<'Grade A (Export/Premium)' | 'Grade B (Standard)' | 'Grade C (Processing)'>('Grade A (Export/Premium)');
  const [organicCertified, setOrganicCertified] = useState(false);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(
    currentUser?.district
      ? `${currentUser.villageOrCity ? currentUser.villageOrCity + ', ' : ''}${currentUser.district} (${currentUser.state || 'MH'})`
      : 'Pimpalgaon, Nashik (MH)'
  );

  // Multiple crop images state
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
  ]);
  const [selectedPreview, setSelectedPreview] = useState<string>(
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
  );
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle files from device or camera
  const handleImageFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsProcessingImage(true);
    setError('');

    try {
      const processed: string[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.type.startsWith('image/')) {
          const dataUrl = await processCropImageFile(file);
          processed.push(dataUrl);
        }
      }

      if (processed.length === 0) {
        throw new Error(isMr ? 'कृपया वैध फोटो फाईल निवडा.' : 'Please select valid image files.');
      }

      // If existing image was just the initial placeholder, replace it; otherwise append
      const isPlaceholderOnly = images.length === 1 && images[0].includes('unsplash.com/photo-1592924357228');
      const updated = isPlaceholderOnly ? processed : [...images, ...processed];

      setImages(updated);
      setSelectedPreview(processed[0]);
    } catch (err: any) {
      setError(err.message || 'Error processing crop image.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      setError(
        isMr
          ? 'किमान १ पिकाचा फोटो असणे आवश्यक आहे.'
          : isHi
          ? 'कम से कम १ तस्वीर होना आवश्यक है।'
          : 'At least 1 crop image is required.'
      );
      return;
    }
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    if (selectedPreview === images[index]) {
      setSelectedPreview(updated[0]);
    }
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    const updated = [target, ...rest];
    setImages(updated);
    setSelectedPreview(target);
  };

  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    const url = customUrlInput.trim();
    if (!images.includes(url)) {
      setImages(prev => [...prev, url]);
      setSelectedPreview(url);
    }
    setCustomUrlInput('');
  };

  const applyPreset = (preset: typeof CROP_PRESETS[0]) => {
    setCropName(preset.crop);
    setVariety(preset.variety);
    setCategory(preset.category);
    setPricePerKg(String(preset.price));
    const allPresetImages = preset.additionalUrls
      ? [preset.url, ...preset.additionalUrls]
      : [preset.url];
    setImages(allPresetImages);
    setSelectedPreview(preset.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!cropName.trim()) {
      setError(isMr ? 'कृपया पिकाचे नाव प्रविष्ट करा.' : 'Please enter crop name.');
      return;
    }
    if (Number(quantityKg) <= 0 || Number(pricePerKg) <= 0) {
      setError(isMr ? 'वजन आणि दर शून्यापेक्षा जास्त असावेत.' : 'Quantity and price must be greater than zero.');
      return;
    }
    if (images.length === 0) {
      setError(isMr ? 'कृपया पिकाचा किमान १ फोटो जोडा.' : 'Please attach at least 1 photo of your crop.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        farmerId: currentUser?.id || 'user-farmer-1',
        farmerName: currentUser?.name || 'Ramesh Patil',
        farmerMobile: currentUser?.mobile || '9822012345',
        farmerLocation: location || 'Nashik, Maharashtra',
        fpoName: currentUser?.fpoName || 'Sahyadri Agro FPO',
        category,
        cropName: cropName.trim(),
        variety: variety.trim() || 'Desi Farm Quality',
        quantityKg: Number(quantityKg),
        pricePerKg: Number(pricePerKg),
        minOrderKg: Number(minOrderKg) || 10,
        harvestDate,
        grade,
        organicCertified,
        images,
        description: description.trim() || (isMr ? 'शेतातून थेट ताजी काढणी केलेला शेतीमाल.' : 'Fresh farm harvest.')
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to list product');
      }

      onProductAdded(data.product);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error listing crop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-stone-200 my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white p-4 sm:p-5 px-6 flex items-center justify-between shrink-0 border-b border-emerald-800">
          <div>
            <h3 className="text-lg sm:text-xl font-black font-serif flex items-center gap-2 text-white">
              <span className="text-amber-300">🌾</span>
              <span>{isMr ? 'नवीन शेतीमाल विका व पिकाचे फोटो जोडा' : isHi ? 'फसल बेचें और तस्वीरें जोड़ें' : 'List Harvest with Crop Photos'}</span>
            </h3>
            <p className="text-xs text-emerald-200 mt-0.5">
              {isMr
                ? 'दलालीमुक्त थेट विक्री • शेतातील फोटो जोडून खरेदीदारांचा विश्वास मिळवा'
                : isHi
                ? 'बिचौलियों के बिना सीधी बिक्री • खेत की तस्वीरें जोड़ें'
                : 'Direct farm-gate selling with zero middleman deductions • Real crop photos'}
            </p>
          </div>
          <button
            id="add-product-close-btn"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CROP PHOTO UPLOAD SECTION (Camera, Device, Drag&Drop, Multiple Photos) */}
          {/* ========================================================================= */}
          <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border-2 border-emerald-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>{isMr ? 'पिकाचे फोटो जोडा (Farmer Crop Images) *' : isHi ? 'फसल की तस्वीरें जोड़ें *' : 'Farmer Crop Photos *'}</span>
                </label>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isMr
                    ? 'शेतातून किंवा काढणीच्या क्रेटमधून थेट कॅमेऱ्याने फोटो काढा किंवा गॅलरीतून निवडा.'
                    : isHi
                    ? 'खेत या क्रेट से सीधे कैमरे से फ़ोटो लें या गैलरी से चुनें।'
                    : 'Take live photos from your farm or crates using camera or select from device.'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg">
                {images.length} {isMr ? 'फोटो जोडले' : 'Photos'}
              </span>
            </div>

            {/* Selected Main Preview Box */}
            <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden bg-stone-900 border border-stone-300 shadow-inner flex items-center justify-center">
              {selectedPreview ? (
                <img
                  src={selectedPreview}
                  alt="Crop preview"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center text-stone-400 p-4">
                  <ImageIcon className="w-10 h-10 mx-auto mb-1 text-stone-600" />
                  <p className="text-xs">{isMr ? 'कोणताही फोटो जोडलेला नाही' : 'No photo uploaded'}</p>
                </div>
              )}

              {/* Cover badge */}
              {images[0] === selectedPreview && (
                <span className="absolute top-3 left-3 bg-amber-400 text-emerald-950 text-xs font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {isMr ? 'कव्हर फोटो (Cover Photo)' : isHi ? 'कवर फ़ोटो' : 'Cover Photo'}
                </span>
              )}
            </div>

            {/* Upload Buttons: Live Camera & Device File Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Camera Input */}
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={e => handleImageFiles(e.target.files)}
              />
              <button
                type="button"
                id="add-crop-camera-btn"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isProcessingImage}
                className="p-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-amber-300" />
                <span>{isMr ? '📷 थेट कॅमेऱ्याने फोटो काढा' : isHi ? '📷 कैमरे से फ़ोटो लें' : '📷 Take Photo with Camera'}</span>
              </button>

              {/* Gallery Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleImageFiles(e.target.files)}
              />
              <button
                type="button"
                id="add-crop-gallery-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
                className="p-3 bg-white hover:bg-stone-100 text-stone-800 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-stone-300 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-emerald-700" />
                <span>{isMr ? '📁 गॅलरीतून फोटो जोडा' : isHi ? '📁 गैलरी से फ़ोटो चुनें' : '📁 Browse Device Photos'}</span>
              </button>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={e => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragging(false);
                handleImageFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-3 rounded-xl border-2 border-dashed text-center cursor-pointer transition-colors ${
                isDragging ? 'border-emerald-600 bg-emerald-50' : 'border-stone-300 hover:border-emerald-500 bg-white'
              }`}
            >
              <p className="text-xs font-semibold text-stone-700">
                {isMr
                  ? 'किंवा फोटो येथे ड्रॅग करा (JPG, PNG, WebP)'
                  : 'Or drag & drop crop pictures here'}
              </p>
            </div>

            {/* Thumbnails of All Uploaded Crop Images */}
            {images.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">
                  {isMr ? 'जोडलेले पिकाचे फोटो (क्लिक करून कव्हर फोटो ठरवा):' : 'Uploaded Photos (click to preview / set cover):'}
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {images.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedPreview(url)}
                      className={`group relative rounded-xl overflow-hidden border-2 transition-all aspect-square bg-stone-100 cursor-pointer ${
                        selectedPreview === url
                          ? 'border-emerald-600 ring-2 ring-emerald-500/40 shadow-xs'
                          : 'border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />

                      {idx === 0 ? (
                        <span
                          title="Cover Photo"
                          className="absolute top-1 left-1 bg-amber-400 text-emerald-950 p-0.5 rounded shadow-xs"
                        >
                          <Star className="w-2.5 h-2.5 fill-current" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleSetPrimary(idx);
                          }}
                          className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-black/70 text-white p-0.5 rounded text-[8px] hover:bg-emerald-600"
                        >
                          ★ {isMr ? 'कव्हर' : 'Set'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 text-white p-1 rounded hover:bg-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick 1-Click Crop Presets */}
            <div className="pt-2 border-t border-stone-200">
              <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">
                {isMr ? 'किंवा तयार नमुना पिकाचे फोटो व माहिती निवडा:' : 'Or pick ready high-grade crop preset:'}
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CROP_PRESETS.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-stone-800 rounded-xl text-xs font-semibold border border-stone-200 shrink-0 transition-all cursor-pointer shadow-2xs"
                  >
                    <img
                      src={p.url}
                      alt={p.name}
                      className="w-5 h-5 rounded-md object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span>{isMr ? p.nameLocalMr : isHi ? p.nameLocalHi : p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CROP DETAILS & PRICING */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isMr ? 'पिकाचे नाव' : isHi ? 'फसल का नाम' : 'Crop Name'} *
              </label>
              <input
                id="add-crop-name-input"
                type="text"
                required
                value={cropName}
                onChange={e => setCropName(e.target.value)}
                placeholder="e.g. Red Round Hybrid Tomatoes"
                className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isMr ? 'जात / व्हरायटी' : isHi ? 'किस्म / वैरायटी' : 'Variety / Seed'}
              </label>
              <input
                id="add-variety-input"
                type="text"
                value={variety}
                onChange={e => setVariety(e.target.value)}
                placeholder="e.g. Vaishnavi F1 / Kufri Jyoti"
                className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isMr ? 'वर्ग / कॅटेगरी' : isHi ? 'वर्ग / श्रेणी' : 'Category'}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="Vegetables">Vegetables (भाजीपाला)</option>
                <option value="Fruits">Fruits (फळे)</option>
                <option value="Leafy Greens">Leafy Greens (पालेभाज्या)</option>
                <option value="Spices">Spices (मसाले / आले / लसूण)</option>
                <option value="Grains & Pulses">Grains & Pulses (धान्य व कडधान्ये)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isMr ? 'दर्जा / ग्रेड' : isHi ? 'ग्रेड' : 'Grade'}
              </label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value as any)}
                className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="Grade A (Export/Premium)">Grade A (Export / Premium - अव्वल दर्जा)</option>
                <option value="Grade B (Standard)">Grade B (Standard Daily - मध्यम दर्जा)</option>
                <option value="Grade C (Processing)">Grade C (Processing / Sauce - प्रक्रिया दर्जा)</option>
              </select>
            </div>
          </div>

          {/* Quantity & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isMr ? 'उपलब्ध वजन (किलो)' : isHi ? 'मात्रा (किलो)' : 'Total Quantity (Kg)'} *
              </label>
              <input
                id="add-quantity-input"
                type="number"
                required
                min="1"
                value={quantityKg}
                onChange={e => setQuantityKg(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isMr ? 'शेतकरी विक्री दर (₹/किलो)' : isHi ? 'विक्रय मूल्य (₹/किलो)' : 'Price (₹/Kg)'} *
              </label>
              <input
                id="add-price-input"
                type="number"
                required
                min="1"
                value={pricePerKg}
                onChange={e => setPricePerKg(e.target.value)}
                placeholder="e.g. 20"
                className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isMr ? 'किमान ऑर्डर (किलो)' : isHi ? 'न्यूनतम ऑर्डर (किलो)' : 'Min Order (Kg)'}
              </label>
              <input
                id="add-min-order-input"
                type="number"
                min="1"
                value={minOrderKg}
                onChange={e => setMinOrderKg(e.target.value)}
                placeholder="10"
                className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Harvest Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isMr ? 'काढणी दिनांक' : isHi ? 'कटाई तिथि' : 'Harvest Date'}
              </label>
              <input
                id="add-harvest-date-input"
                type="date"
                value={harvestDate}
                onChange={e => setHarvestDate(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isMr ? 'शेताचे ठिकाण / गाव' : isHi ? 'खेत का स्थान / गाँव' : 'Farm Location / Village'} *
              </label>
              <input
                id="add-location-input"
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Pimpalgaon Baswant, Nashik (MH)"
                className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Organic checkbox */}
          <div className="flex items-center gap-2 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
            <input
              id="add-organic-checkbox"
              type="checkbox"
              checked={organicCertified}
              onChange={e => setOrganicCertified(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="add-organic-checkbox" className="text-xs font-bold text-emerald-950 cursor-pointer">
              🌿 {isMr ? '१००% सेंद्रिय / विषमुक्त शेतीमाल (Organic Certified / Zero Pesticides)' : '100% Certified Organic / Zero Chemical Residue'}
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {isMr ? 'तपशील व पॅकेजिंग माहिती' : isHi ? 'विवरण और पैकेजिंग जानकारी' : 'Description & Packaging Details'}
            </label>
            <textarea
              id="add-description-input"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={isMr ? 'उदा. २५ किलो क्रेट्स मध्ये पॅक केलेला, शेतातून थेट काढणी...' : 'e.g. Packed in 25kg ventilated plastic crates fresh from farm gate...'}
              className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 flex items-center justify-between border-t border-stone-200">
            <button
              type="button"
              id="add-product-cancel-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
            >
              {isMr ? 'रद्द करा' : isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              id="add-product-submit-btn"
              disabled={loading || isProcessingImage}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>
                {loading
                  ? (isMr ? 'माल प्रसिद्ध करत आहे...' : 'Publishing...')
                  : (isMr ? 'शेतमाल व फोटो थेट प्रसिद्ध करा' : isHi ? 'फसल और तस्वीरें लाइव करें' : 'Publish Produce with Crop Photos')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
