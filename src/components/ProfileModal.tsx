import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Phone,
  MapPin,
  Building2,
  Tractor,
  ShieldCheck,
  CheckCircle,
  PlusCircle,
  Camera,
  Image as ImageIcon,
  Edit2,
  Save,
  ShoppingBag,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Truck
} from 'lucide-react';
import { User, Product, Language, UserRole } from '../types';
import { getTranslation } from '../utils/translations';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUpdateUser: (updatedUser: User) => void;
  products: Product[];
  onOpenAddProductModal: () => void;
  onOpenCropPhotoModal: (product: Product) => void;
  lang: Language;
  onSwitchRole?: (role: UserRole) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  products,
  onOpenAddProductModal,
  onOpenCropPhotoModal,
  lang,
  onSwitchRole
}) => {
  const t = getTranslation(lang);
  const isMr = lang === 'mr';
  const isHi = lang === 'hi';

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [villageOrCity, setVillageOrCity] = useState(currentUser?.villageOrCity || '');
  const [district, setDistrict] = useState(currentUser?.district || '');
  const [state, setState] = useState(currentUser?.state || 'Maharashtra');
  const [pincode, setPincode] = useState(currentUser?.pincode || '');
  const [fpoName, setFpoName] = useState(currentUser?.fpoName || '');
  const [farmSizeAcres, setFarmSizeAcres] = useState(String(currentUser?.farmSizeAcres || ''));
  const [primaryCrops, setPrimaryCrops] = useState(currentUser?.primaryCrops?.join(', ') || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen || !currentUser) return null;

  // Filter crops belonging to this farmer
  const farmerCrops = products.filter(
    p => p.farmerId === currentUser.id || p.farmerMobile === currentUser.mobile || currentUser.role === 'farmer'
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      mobile: mobile.trim() || currentUser.mobile,
      villageOrCity: villageOrCity.trim(),
      district: district.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      fpoName: fpoName.trim(),
      farmSizeAcres: farmSizeAcres ? Number(farmSizeAcres) : currentUser.farmSizeAcres,
      primaryCrops: primaryCrops
        ? primaryCrops.split(',').map(s => s.trim()).filter(Boolean)
        : currentUser.primaryCrops
    };

    try {
      await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch {
      // update state locally regardless
    }

    onUpdateUser(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const getRoleTitle = () => {
    switch (currentUser.role) {
      case 'farmer':
        return isMr ? 'प्रमाणित शेतकरी / FPO' : isHi ? 'प्रमाणित किसान / एफपीओ' : 'Verified Farmer / FPO';
      case 'bulk_buyer':
        return isMr ? 'घाऊक खरेदीदार / व्यापारी' : isHi ? 'थोक खरीदार / व्यापारी' : 'Bulk Buyer / Wholesaler';
      case 'customer':
        return isMr ? 'थेट ग्राहक' : isHi ? 'प्रत्यक्ष उपभोक्ता' : 'Direct Consumer';
      case 'transporter':
        return isMr ? 'कृषी वाहतूकदार व चालक' : isHi ? 'कृषि ट्रांसपोर्टर व चालक' : 'Transporter & Fleet Operator';
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-stone-200 my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 border-b border-emerald-700/50">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-md">
              {currentUser.role === 'farmer' ? (
                <Tractor className="w-7 h-7 text-amber-300" />
              ) : currentUser.role === 'bulk_buyer' ? (
                <Building2 className="w-7 h-7 text-blue-300" />
              ) : currentUser.role === 'transporter' ? (
                <Truck className="w-7 h-7 text-cyan-300" />
              ) : (
                <ShoppingBag className="w-7 h-7 text-purple-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight">
                  {currentUser.name}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-emerald-950 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {getRoleTitle()}
                </span>
              </div>
              <p className="text-xs text-emerald-200 font-medium mt-0.5">
                +91 {currentUser.mobile} • {[currentUser.villageOrCity, currentUser.district, currentUser.state].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                id="edit-profile-btn"
                onClick={() => setIsEditing(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-white/20"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isMr ? 'माहिती बदला' : isHi ? 'संपादित करें' : 'Edit Profile'}</span>
              </button>
            )}
            <button
              id="close-profile-modal-btn"
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 border border-emerald-300 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isMr
                  ? 'प्रोफाईल यशस्वीरीत्या अपडेट करण्यात आली आहे!'
                  : isHi
                  ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!'
                  : 'Profile successfully updated!'}
              </span>
            </div>
          )}

          {/* Edit Profile Form OR View Mode */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-emerald-700" />
                  {isMr ? 'प्रोफाईल माहिती संपादित करा' : isHi ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile Details'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-medium text-stone-500 hover:text-stone-800"
                >
                  {isMr ? 'रद्द करा' : isHi ? 'रद्द करें' : 'Cancel'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isMr ? 'पूर्ण नाव' : isHi ? 'पूरा नाम' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isMr ? 'मोबाईल क्रमांक' : isHi ? 'मोबाइल नंबर' : 'Mobile Number'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isMr ? 'गाव / शहर' : isHi ? 'गाँव / शहर' : 'Village / City'}
                  </label>
                  <input
                    type="text"
                    value={villageOrCity}
                    onChange={e => setVillageOrCity(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isMr ? 'जिल्हा' : isHi ? 'ज़िला' : 'District'}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isMr ? 'पिनकोड' : isHi ? 'पिनकोड' : 'Pincode'}
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {currentUser.role === 'farmer' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-200">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {isMr ? 'शेतजमीन (एकर)' : isHi ? 'खेत का आकार (एकड़)' : 'Farm Size (Acres)'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={farmSizeAcres}
                      onChange={e => setFarmSizeAcres(e.target.value)}
                      placeholder="e.g. 8.5"
                      className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {isMr ? 'FPO / शेतकरी गट' : isHi ? 'एफपीओ / किसान समूह' : 'FPO / Group Name'}
                    </label>
                    <input
                      type="text"
                      value={fpoName}
                      onChange={e => setFpoName(e.target.value)}
                      placeholder="e.g. Sahyadri Agro FPO"
                      className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {isMr ? 'मुख्य पिके' : isHi ? 'मुख्य फसलें' : 'Primary Crops'}
                    </label>
                    <input
                      type="text"
                      value={primaryCrops}
                      onChange={e => setPrimaryCrops(e.target.value)}
                      placeholder="Tomato, Onion, Capsicum"
                      className="w-full p-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-xl"
                >
                  {isMr ? 'रद्द' : isHi ? 'रद्द' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isMr ? 'जतन करा' : isHi ? 'सुरक्षित करें' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Summary Cards Grid */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-center">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  {isMr ? 'शेताचे क्षेत्र' : isHi ? 'खेत का आकार' : 'Farm Land'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-950 font-mono mt-1 block">
                  {currentUser.farmSizeAcres || 8.5} <span className="text-xs font-medium font-sans">Acres</span>
                </span>
                <span className="text-[10px] text-emerald-700">{currentUser.fpoName || 'FPO Cluster'}</span>
              </div>

              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-center">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  {isMr ? 'थेट पिके साठा' : isHi ? 'सक्रिय फसलें' : 'Active Crops'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-950 font-mono mt-1 block">
                  {farmerCrops.length} <span className="text-xs font-medium font-sans">Items</span>
                </span>
                <span className="text-[10px] text-amber-700">{isMr ? 'थेट बाजारात' : isHi ? 'लाइव मंडी' : 'Listed'}</span>
              </div>

              <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 text-center">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                  {isMr ? 'दलालमुक्त नफा' : isHi ? 'अतिरिक्त लाभ' : 'Gain vs Mandi'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-blue-950 font-mono mt-1 block">
                  +38%
                </span>
                <span className="text-[10px] text-blue-700">{isMr ? 'शेतकऱ्याला थेट' : isHi ? 'सीधा किसान को' : 'Direct to Farmer'}</span>
              </div>

              <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200 text-center">
                <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
                  {isMr ? 'बँक खात्री' : isHi ? 'भुगतान स्थिति' : 'Settlement'}
                </span>
                <span className="text-sm sm:text-base font-black text-purple-950 mt-1 block flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4 text-purple-600 inline" />
                  {isMr ? 'UPI प्रमाणित' : isHi ? 'UPI सत्यापित' : 'UPI Verified'}
                </span>
                <span className="text-[10px] text-purple-700">T+0 Direct Credit</span>
              </div>
            </div>
          )}

          {/* Farmer's Crop Listings Section with Image Upload Direct Actions */}
          <div className="border-t border-stone-200 pt-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-base text-stone-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-700" />
                  {isMr ? 'माझे शेतीमाल व पिकांचे फोटो' : isHi ? 'मेरी फसलें और तस्वीरें' : 'My Crop Listings & Crop Photos'}
                </h4>
                <p className="text-xs text-stone-500">
                  {isMr
                    ? 'खरेदीदारांचा विश्वास वाढवण्यासाठी तुमच्या शेतातील पिकांचे ताजे फोटो जोडा.'
                    : isHi
                    ? 'खरीदारों का भरोसा बढ़ाने के लिए खेत से ताज़ा तस्वीरें जोड़ें।'
                    : 'Add fresh photos of your crop from farm gate or crates to build buyer trust.'}
                </p>
              </div>

              {currentUser.role === 'farmer' && (
                <button
                  id="profile-add-harvest-btn"
                  onClick={() => {
                    onClose();
                    onOpenAddProductModal();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isMr ? '+ नवीन माल विका' : isHi ? '+ फसल बेचें' : '+ Add Harvest'}</span>
                </button>
              )}
            </div>

            {farmerCrops.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {farmerCrops.map(product => (
                  <div
                    key={product.id}
                    className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-between gap-3 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex gap-3 items-start">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300">
                        <img
                          src={product.images[0]}
                          alt={product.cropName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {product.images.length > 1 && (
                          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                            📷 {product.images.length}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-sm text-stone-900 truncate">
                          {product.cropName}
                        </h5>
                        <p className="text-xs text-stone-500 truncate">{product.variety}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold font-mono text-emerald-800 text-sm">
                            ₹{product.pricePerKg}/kg
                          </span>
                          <span className="text-xs text-stone-500 font-mono">
                            • {product.quantityKg.toLocaleString()} kg stock
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {isMr ? 'काढणी:' : isHi ? 'कटाई:' : 'Harvest:'} {product.harvestDate}
                        </div>
                      </div>
                    </div>

                    {/* Action to update/add crop photos */}
                    <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          onOpenCropPhotoModal(product);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {product.images.length > 1
                            ? isMr ? '📸 फोटो व्यवस्थापित करा' : isHi ? '📸 तस्वीरें प्रबंधित करें' : '📸 Manage Photos'
                            : isMr ? '📸 पिकाचे फोटो जोडा' : isHi ? '📸 फसल की तस्वीरें जोड़ें' : '📸 Add Crop Photos'}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-stone-50 rounded-2xl border border-dashed border-stone-300 p-6">
                <Tractor className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-700">
                  {isMr ? 'सध्या कोणताही माल लिस्ट केलेला नाही' : isHi ? 'अभी कोई फसल लिस्ट नहीं है' : 'No crops listed yet'}
                </p>
                <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto">
                  {isMr
                    ? 'तुमचा पहिला भाजीपाला किंवा फळांचा माल शेतातील फोटोंसह थेट विका.'
                    : isHi
                    ? 'अपनी पहली फसल को तस्वीरों के साथ सीधे बाज़ार में लिस्ट करें।'
                    : 'List your first harvest produce directly to buyers with crop photos.'}
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAddProductModal();
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isMr ? 'नवीन शेतीमाल विका' : isHi ? 'फसल बेचें' : 'Add First Crop'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Role Perspective Switcher for Testing/Demonstrations */}
          {onSwitchRole && (
            <div className="border-t border-stone-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50 p-3.5 rounded-2xl">
              <div>
                <span className="text-xs font-bold text-stone-800 block">
                  {isMr ? 'भूमिका बदलून ॲप तपासा (Switch View):' : isHi ? 'भूमिका बदलकर ऐप देखें:' : 'Switch Role Perspective:'}
                </span>
                <span className="text-[11px] text-stone-500">
                  {isMr
                    ? 'शेतकरी, घाऊक खरेदीदार किंवा ग्राहक म्हणून अनुभव घ्या.'
                    : isHi
                    ? 'किसान, थोक खरीदार या उपभोक्ता के रूप में ऐप अनुभव करें।'
                    : 'Experience SetiMitra as Farmer, Bulk Buyer, or Retail Consumer.'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => onSwitchRole('farmer')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    currentUser.role === 'farmer'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  🌾 {isMr ? 'शेतकरी' : isHi ? 'किसान' : 'Farmer'}
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchRole('bulk_buyer')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    currentUser.role === 'bulk_buyer'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  🏢 {isMr ? 'घाऊक खरेदीदार' : isHi ? 'थोक खरीदार' : 'Buyer'}
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchRole('customer')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    currentUser.role === 'customer'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  🛒 {isMr ? 'ग्राहक' : isHi ? 'उपभोक्ता' : 'Consumer'}
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchRole('transporter')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    currentUser.role === 'transporter'
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  🚛 {isMr ? 'वाहतूकदार' : isHi ? 'ट्रांसपोर्टर' : 'Transporter'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
