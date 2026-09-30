import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Trash2,
  CheckCircle,
  Star,
  Plus,
  Image as ImageIcon,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Product, Language } from '../types';
import { processCropImageFile, CROP_PRESETS } from '../utils/imageUtils';
import { getTranslation } from '../utils/translations';

interface CropPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdateProductImages: (productId: string, newImages: string[]) => void;
  lang: Language;
}

export const CropPhotoModal: React.FC<CropPhotoModalProps> = ({
  isOpen,
  onClose,
  product,
  onUpdateProductImages,
  lang
}) => {
  const t = getTranslation(lang);
  const isMr = lang === 'mr';
  const isHi = lang === 'hi';

  const [images, setImages] = useState<string[]>(product?.images || []);
  const [selectedPreview, setSelectedPreview] = useState<string>(product?.images[0] || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Synchronize when product changes
  React.useEffect(() => {
    if (product) {
      setImages(product.images || []);
      setSelectedPreview(product.images?.[0] || '');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.type.startsWith('image/')) {
          const dataUrl = await processCropImageFile(file);
          newUrls.push(dataUrl);
        }
      }

      if (newUrls.length === 0) {
        throw new Error(isMr ? 'कृपया वैध फोटो फाईल निवडा.' : 'Please select valid image files.');
      }

      const updated = [...images, ...newUrls];
      setImages(updated);
      setSelectedPreview(newUrls[0]);
      setSuccessMsg(
        isMr
          ? `${newUrls.length} नवीन फोटो जोडले गेले!`
          : isHi
          ? `${newUrls.length} नई तस्वीरें जोड़ी गईं!`
          : `${newUrls.length} new photos added!`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    if (images.length <= 1) {
      setErrorMsg(
        isMr
          ? 'किमान १ पिकाचा फोटो असणे आवश्यक आहे.'
          : isHi
          ? 'कम से कम १ फसल की तस्वीर होना आवश्यक है।'
          : 'At least 1 crop photo is required.'
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
    const reordered = [target, ...rest];
    setImages(reordered);
    setSelectedPreview(target);
  };

  const handleAddPresetPhoto = (url: string) => {
    if (!images.includes(url)) {
      const updated = [...images, url];
      setImages(updated);
      setSelectedPreview(url);
    }
  };

  const handleSaveAndApply = async () => {
    if (images.length === 0) {
      setErrorMsg(
        isMr
          ? 'कृपया किमान १ फोटो ठेवा.'
          : isHi
          ? 'कृपया कम से कम १ तस्वीर रखें।'
          : 'Please keep at least 1 image.'
      );
      return;
    }

    try {
      await fetch(`/api/products/${product.id}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images })
      });
    } catch {
      // update state locally
    }

    onUpdateProductImages(product.id, images);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200 my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-emerald-800">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-300" />
              <span>
                {isMr
                  ? `${product.cropName} - पिकाचे फोटो जोडा / बदला`
                  : isHi
                  ? `${product.cropName} - फसल की तस्वीरें जोड़ें / बदलें`
                  : `Add / Update Photos: ${product.cropName}`}
              </span>
            </h3>
            <p className="text-xs text-emerald-200 mt-0.5">
              {isMr
                ? 'तुमच्या शेतातील किंवा काढणीच्या क्रेटचे स्पष्ट फोटो जोडा. थेट खरेदीदार आकर्षित होतील.'
                : isHi
                ? 'खेत या क्रेट की स्पष्ट तस्वीरें जोड़ें। सीधे खरीदारों का विश्वास बढ़ेगा।'
                : 'Upload clear pictures of your harvest from the farm or crates to attract direct buyers.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 border border-emerald-300 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Large Preview of Selected Image */}
          <div className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden bg-stone-900 border border-stone-300 shadow-inner flex items-center justify-center">
            {selectedPreview ? (
              <img
                src={selectedPreview}
                alt="Selected crop preview"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-center text-stone-400 p-4">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-stone-600" />
                <p className="text-xs">{isMr ? 'कोणताही फोटो निवडलेला नाही' : 'No photo selected'}</p>
              </div>
            )}

            {/* Main photo badge */}
            {images[0] === selectedPreview && (
              <span className="absolute top-3 left-3 bg-amber-400 text-emerald-950 text-xs font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                {isMr ? 'मुख्य कव्हर फोटो (Cover Photo)' : isHi ? 'मुख्य कवर तस्वीर' : 'Primary Cover Photo'}
              </span>
            )}
          </div>

          {/* Action Buttons: Camera Capture and File Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Camera Capture Input */}
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
            <button
              type="button"
              id="crop-photo-camera-btn"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isProcessing}
              className="p-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-5 h-5 text-amber-300" />
              <span>
                {isMr
                  ? '📷 कॅमेऱ्याने थेट फोटो काढा'
                  : isHi
                  ? '📷 कैमरे से सीधी तस्वीर लें'
                  : '📷 Take Photo with Camera'}
              </span>
            </button>

            {/* Gallery File Upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
            <button
              type="button"
              id="crop-photo-browse-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-stone-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-5 h-5 text-emerald-700" />
              <span>
                {isMr
                  ? '📁 गॅलरीतून फोटो निवडा'
                  : isHi
                  ? '📁 गैलरी से तस्वीरें चुनें'
                  : '📁 Browse Gallery Photos'}
              </span>
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-emerald-600 bg-emerald-50/80'
                : 'border-stone-300 hover:border-emerald-500 bg-stone-50'
            }`}
          >
            <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1" />
            <p className="text-xs font-semibold text-stone-700">
              {isMr
                ? 'फोटो येथे ड्रॅग करून टाका किंवा ब्राउझ करण्यासाठी क्लिक करा'
                : isHi
                ? 'तस्वीरें यहाँ खींच कर डालें या चुनने के लिए क्लिक करें'
                : 'Drag & drop photos here or click to browse'}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              JPG, PNG, WebP • {isMr ? 'स्वयंचलित रिसाईज व ऑप्टिमायझेशन' : 'Auto-optimized for mobile speed'}
            </p>
          </div>

          {/* Current Photos Thumbnail Management Strip */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                {isMr ? 'पिकाचे सर्व जोडलेले फोटो:' : isHi ? 'जोड़ी गई तस्वीरें:' : 'Uploaded Crop Photos:'} ({images.length})
              </span>
              <span className="text-[11px] text-stone-500">
                {isMr ? 'क्लिक करून कव्हर फोटो ठरवा' : isHi ? 'क्लिक करके कवर फोटो चुनें' : 'Click to preview or set as main'}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
              {images.map((url, idx) => (
                <div
                  key={idx}
                  className={`group relative rounded-xl overflow-hidden border-2 transition-all aspect-square bg-stone-100 cursor-pointer ${
                    selectedPreview === url
                      ? 'border-emerald-600 ring-2 ring-emerald-500/40 shadow-sm'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                  onClick={() => setSelectedPreview(url)}
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {/* Primary star badge */}
                  {idx === 0 ? (
                    <span
                      title="Primary Cover Photo"
                      className="absolute top-1 left-1 bg-amber-400 text-emerald-950 p-1 rounded-md shadow-xs"
                    >
                      <Star className="w-3 h-3 fill-current" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleSetPrimary(idx);
                      }}
                      title="Make Primary Cover"
                      className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-black/60 text-white p-1 rounded-md text-[9px] hover:bg-emerald-600 transition-opacity"
                    >
                      ★ {isMr ? 'कव्हर करा' : 'Set Cover'}
                    </button>
                  )}

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleRemovePhoto(idx);
                    }}
                    title="Remove Photo"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 text-white p-1 rounded-md hover:bg-red-700 transition-opacity shadow-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Presets Recommendation */}
          <div className="pt-2 border-t border-stone-200">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wide block mb-2">
              {isMr ? 'वापरण्यासाठी तयार दर्जेदार नमुना फोटो:' : isHi ? 'तैयार उच्च-गुणवत्ता तस्वीरें:' : 'Or pick high-grade crop photos:'}
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CROP_PRESETS.slice(0, 6).map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleAddPresetPhoto(preset.url)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-100 hover:bg-emerald-50 hover:border-emerald-300 text-stone-800 rounded-xl text-xs font-semibold border border-stone-200 shrink-0 transition-all cursor-pointer"
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-5 h-5 rounded-md object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span>{isMr ? preset.nameLocalMr : isHi ? preset.nameLocalHi : preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 p-4 sm:p-5 flex items-center justify-between border-t border-stone-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-200 rounded-xl cursor-pointer"
          >
            {isMr ? 'रद्द करा' : isHi ? 'रद्द करें' : 'Cancel'}
          </button>

          <button
            type="button"
            id="save-crop-photos-btn"
            onClick={handleSaveAndApply}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>
              {isMr ? 'पिकाचे फोटो जतन करा (Save Photos)' : isHi ? 'तस्वीरें सुरक्षित करें' : 'Save & Publish Crop Photos'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
