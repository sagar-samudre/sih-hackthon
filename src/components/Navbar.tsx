/**
 * =========================================================================================
 * SetiMitra (शेतीमित्र) - Top Navigation Bar & Secondary Sub-Navbar
 * =========================================================================================
 * 
 * Features:
 *   - Live Mandi APMC Price Ticker marquee.
 *   - Primary Header: Brand, Language switcher, Farmer Add-Crop, and Compact Profile Icon.
 *   - Profile Popover: Clicking the profile icon reveals user details (Role, Mobile, Location, FPO/Business) & Logout.
 *   - Dedicated Secondary Sub-Navbar: Spacious tab navigation for Marketplace, Mandi Rates, ML Predictor, Logistics, Orders.
 *   - Zero layout overflow; fully responsive.
 *   - Completely removed demo/clean-slate clutter.
 * =========================================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Sprout,
  ShoppingBag,
  BarChart3,
  Truck,
  BrainCircuit,
  PackageCheck,
  PlusCircle,
  LogIn,
  LogOut,
  MapPin,
  Phone,
  Building2,
  ChevronDown,
  User as UserIcon,
  ShieldCheck,
  Tractor,
  Camera,
  ArrowRight
} from 'lucide-react';
import { User, MandiPriceItem, Language } from '../types';
import { getTranslation } from '../utils/translations';

export type NavTab = 'marketplace' | 'mandi-prices' | 'ml-model' | 'logistics' | 'transporter-hub' | 'orders';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onOpenAddProductModal: () => void;
  onOpenProfileModal: () => void;
  onLogout: () => void;
  mandiTicker: MandiPriceItem[];
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuthModal,
  onOpenAddProductModal,
  onOpenProfileModal,
  onLogout,
  mandiTicker,
  lang,
  onLanguageChange
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const t = getTranslation(lang);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'farmer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            🌾 {t.roleFarmer}
          </span>
        );
      case 'bulk_buyer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            🏢 {t.roleBulkBuyer}
          </span>
        );
      case 'customer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            🛒 {t.roleConsumer}
          </span>
        );
      case 'transporter':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-400">
            🚛 {t.roleTransporter}
          </span>
        );
    }
  };

  const getRoleIcon = () => {
    if (!currentUser) return <UserIcon className="w-5 h-5" />;
    switch (currentUser.role) {
      case 'farmer':
        return <Tractor className="w-5 h-5 text-emerald-700" />;
      case 'bulk_buyer':
        return <Building2 className="w-5 h-5 text-blue-700" />;
      case 'customer':
        return <ShoppingBag className="w-5 h-5 text-purple-700" />;
      case 'transporter':
        return <Truck className="w-5 h-5 text-blue-700" />;
    }
  };

  const getRoleAvatarBg = () => {
    if (!currentUser) return 'bg-stone-100 text-stone-700 border-stone-300';
    switch (currentUser.role) {
      case 'farmer':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/30';
      case 'bulk_buyer':
        return 'bg-blue-100 text-blue-800 border-blue-300 ring-2 ring-blue-500/30';
      case 'customer':
        return 'bg-purple-100 text-purple-800 border-purple-300 ring-2 ring-purple-500/30';
      case 'transporter':
        return 'bg-blue-100 text-blue-900 border-blue-400 ring-2 ring-blue-600/30';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm w-full max-w-full overflow-visible">
      {/* 1. Live Mandi APMC Price Ticker Top Bar */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4 overflow-hidden border-b border-emerald-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="uppercase tracking-wider text-[11px] font-bold">
              {t.liveMandiTicker}:
            </span>
          </div>

          <div className="overflow-x-auto whitespace-nowrap flex items-center gap-6 scrollbar-none py-0.5">
            {mandiTicker.slice(0, 8).map(m => (
              <div key={m.id} className="inline-flex items-center gap-2 text-xs">
                <span className="font-bold text-white">{m.commodity}</span>
                <span className="text-stone-300">({m.mandiName.split(' ')[0]}):</span>
                <span className="font-mono text-amber-300">₹{m.modalPricePerKg}/kg</span>
                <span className="text-[11px] text-emerald-300 bg-emerald-900/80 px-1 rounded font-semibold">
                  {t.farmerDirect}: ₹{m.farmerDirectPricePerKg}
                </span>
                <span className={m.trend === 'up' ? 'text-emerald-400 font-bold' : m.trend === 'down' ? 'text-red-400 font-bold' : 'text-stone-400'}>
                  {m.trend === 'up' ? '▲' : m.trend === 'down' ? '▼' : '▬'} {m.dailyChangePercent > 0 ? `+${m.dailyChangePercent}%` : `${m.dailyChangePercent}%`}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-2">
            <button
              id="nav-view-all-rates-btn"
              onClick={() => setActiveTab('mandi-prices')}
              className="text-[11px] text-amber-300 hover:text-amber-200 underline font-medium cursor-pointer"
            >
              {t.viewAllRates} →
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar (Brand, Language, Add Crop, Profile Icon) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Localized Branding */}
          <div
            id="brand-logo-btn"
            onClick={() => setActiveTab('marketplace')}
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-emerald-950 font-serif">
                  {t.appName}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase tracking-wider border border-amber-300">
                  {t.tagline}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
                {t.subTagline}
              </p>
            </div>
          </div>

          {/* Right Header Controls: Language Selector, Farmer Add Crop, and Compact Profile Icon */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Trilingual Language Selector */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-300 text-xs font-semibold">
              <button
                id="lang-btn-mr"
                onClick={() => onLanguageChange('mr')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  lang === 'mr'
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
                title="मराठी भाषा"
              >
                मराठी
              </button>
              <button
                id="lang-btn-hi"
                onClick={() => onLanguageChange('hi')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  lang === 'hi'
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
                title="हिंदी भाषा"
              >
                हिंदी
              </button>
              <button
                id="lang-btn-en"
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
                title="English Language"
              >
                EN
              </button>
            </div>

            {/* Add Crop Button (Farmer Only) */}
            {currentUser?.role === 'farmer' && (
              <button
                id="navbar-add-product-btn"
                onClick={onOpenAddProductModal}
                className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t.addCropBtn}</span>
              </button>
            )}

            {/* Profile Only Icon with Popover Menu OR Login Button */}
            {currentUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  id="user-profile-icon-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-1.5 p-1 rounded-full border transition-all cursor-pointer hover:shadow-md ${getRoleAvatarBg()}`}
                  title={`${currentUser.name} (${currentUser.role})`}
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 pr-0.5 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Details Popover Dropdown */}
                {profileDropdownOpen && (
                  <div
                    id="user-profile-dropdown"
                    className="absolute right-0 top-full mt-2 w-80 sm:w-88 max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-stone-200 p-4 z-[110] text-stone-900 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/10"
                  >
                    {/* Header inside popover */}
                    <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getRoleAvatarBg()}`}>
                        {getRoleIcon()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-stone-900 truncate">
                          {currentUser.name}
                        </h4>
                        <div className="mt-0.5">{getRoleBadge()}</div>
                      </div>
                    </div>

                    {/* Profile Details List */}
                    <div className="py-3 space-y-2 text-xs text-stone-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="font-medium text-stone-800">+91 {currentUser.mobile}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span className="text-stone-700">
                          {[currentUser.villageOrCity, currentUser.district, currentUser.state]
                            .filter(Boolean)
                            .join(', ') || currentUser.address || 'Maharashtra'}
                        </span>
                      </div>

                      {/* Farmer Specific Details */}
                      {currentUser.role === 'farmer' && (
                        <>
                          {currentUser.fpoName && (
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-900">
                              <span className="font-semibold">{t.fpoLabel}: </span>
                              {currentUser.fpoName}
                            </div>
                          )}
                          {currentUser.farmSizeAcres && (
                            <div className="text-stone-600">
                              <span className="font-medium">{t.farmSizeLabel}: </span>
                              {currentUser.farmSizeAcres} Acres
                            </div>
                          )}
                          {currentUser.primaryCrops && currentUser.primaryCrops.length > 0 && (
                            <div className="text-stone-600">
                              <span className="font-medium">{t.cropsLabel}: </span>
                              {currentUser.primaryCrops.join(', ')}
                            </div>
                          )}
                        </>
                      )}

                      {/* Bulk Buyer Specific Details */}
                      {currentUser.role === 'bulk_buyer' && (
                        <>
                          {currentUser.businessName && (
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-900">
                              <span className="font-semibold">{t.businessLabel}: </span>
                              {currentUser.businessName} ({currentUser.businessType || 'Wholesale'})
                            </div>
                          )}
                          {currentUser.gstin && (
                            <div className="text-stone-600 font-mono text-[11px]">
                              <span className="font-sans font-medium">{t.gstinLabel}: </span>
                              {currentUser.gstin}
                            </div>
                          )}
                        </>
                      )}

                      {/* Transporter Specific Details */}
                      {currentUser.role === 'transporter' && (
                        <>
                          {currentUser.transportAgencyName && (
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-900">
                              <span className="font-semibold">वाहतूक एजन्सी: </span>
                              {currentUser.transportAgencyName}
                            </div>
                          )}
                          {currentUser.vehicleTypes && currentUser.vehicleTypes.length > 0 && (
                            <div className="text-stone-600 text-[11px]">
                              <span className="font-medium">वाहने: </span>
                              {currentUser.vehicleTypes.join(', ')}
                            </div>
                          )}
                          {currentUser.totalVehicles && (
                            <div className="text-stone-600 text-[11px]">
                              <span className="font-medium">एकूण वाहने: </span>
                              {currentUser.totalVehicles} वाहने (Fleet)
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* View Full Profile & Manage Details Button */}
                    <button
                      id="profile-dropdown-view-full-btn"
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenProfileModal();
                      }}
                      className="w-full flex items-center justify-between p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 rounded-xl font-bold text-xs transition-colors cursor-pointer border border-emerald-200/80 mb-2.5"
                    >
                      <span className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-emerald-700" />
                        <span>
                          {lang === 'mr'
                            ? 'पूर्ण प्रोफाईल व शेती तपशील पहा'
                            : lang === 'hi'
                            ? 'पूरी प्रोफ़ाइल और विवरण देखें'
                            : 'View Full Profile & Farm Details'}
                        </span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-emerald-700" />
                    </button>

                    {/* Farmer Quick Actions */}
                    {currentUser.role === 'farmer' && (
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          id="profile-dropdown-add-crop-btn"
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onOpenAddProductModal();
                          }}
                          className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>{lang === 'mr' ? 'माल विका' : lang === 'hi' ? 'फसल बेचें' : 'Sell Harvest'}</span>
                        </button>

                        <button
                          id="profile-dropdown-crop-photos-btn"
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onOpenProfileModal();
                          }}
                          className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-amber-700" />
                          <span>{lang === 'mr' ? 'पिकाचे फोटो' : lang === 'hi' ? 'फसल फोटो' : 'Crop Photos'}</span>
                        </button>
                      </div>
                    )}

                    {/* Logout Button */}
                    <div className="pt-2 border-t border-stone-100">
                      <button
                        id="profile-dropdown-logout-btn"
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="navbar-login-btn"
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.loginRegister}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Dedicated Secondary Sub-Navbar for Tabs */}
      <div className="bg-stone-50/95 border-t border-stone-200 py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center overflow-x-auto scrollbar-none gap-1.5 sm:gap-2">
          {/* Tab 1: Marketplace */}
          <button
            id="nav-tab-marketplace"
            onClick={() => setActiveTab('marketplace')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'marketplace'
                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                : 'text-stone-700 hover:bg-stone-200/80 hover:text-stone-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.subNavbarMarketplace || t.tabMarketplace}</span>
          </button>

          {/* Tab 2: Mandi Rates */}
          <button
            id="nav-tab-mandi-prices"
            onClick={() => setActiveTab('mandi-prices')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'mandi-prices'
                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                : 'text-stone-700 hover:bg-stone-200/80 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t.subNavbarMandi || t.tabMandiRates}</span>
          </button>

          {/* Tab 3: ML Model Predictor */}
          <button
            id="nav-tab-ml-model"
            onClick={() => setActiveTab('ml-model')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'ml-model'
                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                : 'text-stone-700 hover:bg-stone-200/80 hover:text-stone-900'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>{t.subNavbarML || t.tabMLPredictor}</span>
            <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
              activeTab === 'ml-model' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-900'
            }`}>
              ML
            </span>
          </button>

          {/* Tab 4: Logistics & Cold-Chain */}
          <button
            id="nav-tab-logistics"
            onClick={() => setActiveTab('logistics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'logistics'
                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                : 'text-stone-700 hover:bg-stone-200/80 hover:text-stone-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{t.subNavbarLogistics || t.tabLogistics}</span>
          </button>

          {/* Tab 4B: Transporter Hub (Customer Locations & Details) */}
          <button
            id="nav-tab-transporter-hub"
            onClick={() => setActiveTab('transporter-hub')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'transporter-hub'
                ? 'bg-blue-800 text-white font-bold shadow-xs ring-1 ring-blue-900'
                : 'text-stone-700 hover:bg-blue-50 hover:text-blue-900'
            }`}
          >
            <Truck className="w-4 h-4 text-blue-600" />
            <span>{t.subNavbarTransporter || 'वाहतूकदार (Customer Locations)'}</span>
            <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
              activeTab === 'transporter-hub' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              {lang === 'mr' ? 'पत्ते' : lang === 'hi' ? 'पते' : 'Locations'}
            </span>
          </button>

          {/* Tab 5: Orders & Live GPS */}
          <button
            id="nav-tab-orders"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                : 'text-stone-700 hover:bg-stone-200/80 hover:text-stone-900'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>{t.subNavbarOrders || t.tabOrders}</span>
            <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
              activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-900'
            }`}>
              GPS
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
