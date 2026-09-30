import React, { useState } from 'react';
import { X, Lock, User as UserIcon, MapPin, AlertCircle, Shield, Truck } from 'lucide-react';
import { User, UserRole, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: User) => void;
  lang?: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  lang = 'mr'
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [role, setRole] = useState<UserRole>('farmer');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Nashik');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  // Role specific fields
  const [fpoName, setFpoName] = useState('');
  const [farmSizeAcres, setFarmSizeAcres] = useState('');
  const [primaryCrops, setPrimaryCrops] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<'Supermarket' | 'Hotel/Restaurant' | 'Food Processor' | 'Wholesale Trader' | 'Exporter'>('Supermarket');
  const [gstin, setGstin] = useState('');
  const [transportAgencyName, setTransportAgencyName] = useState('');
  const [vehicleTypes, setVehicleTypes] = useState('');
  const [totalVehicles, setTotalVehicles] = useState('4');
  const [operatingRoutes, setOperatingRoutes] = useState('Nashik - Mumbai APMC (Vashi)');

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const t = getTranslation(lang);
  const isMr = lang === 'mr';
  const isHi = lang === 'hi';

  if (!isOpen) return null;

  const handleQuickLogin = async (quickMobile: string, quickRole: UserRole) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: quickMobile, password: 'password123', role: quickRole })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onSuccessLogin(data.user);
        onClose();
      } else {
        setErrorMessage(data.error || 'Login failed.');
      }
    } catch {
      setErrorMessage('Network error during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const cleanMobile = mobile.trim();
    if (!cleanMobile || cleanMobile.length < 10) {
      setErrorMessage(
        isMr
          ? 'कृपया १० अंकांचा वैध मोबाईल क्रमांक प्रविष्ट करा.'
          : isHi
          ? 'कृपया १० अंकों का वैध मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid 10-digit mobile number.'
      );
      setLoading(false);
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage(
        isMr
          ? 'पासवर्ड किमान ४ अक्षरांचा असणे आवश्यक आहे.'
          : isHi
          ? 'पासवर्ड कम से कम ४ अक्षरों का होना चाहिए।'
          : 'Please enter a password with at least 4 characters.'
      );
      setLoading(false);
      return;
    }

    try {
      if (isRegisterMode) {
        if (!name.trim()) {
          setErrorMessage(
            isMr
              ? 'कृपया आपले पूर्ण नाव किंवा व्यवसायाचे नाव प्रविष्ट करा.'
              : isHi
              ? 'कृपया अपना पूरा नाम या व्यावसायिक नाम दर्ज करें।'
              : 'Please enter your full name or business contact name.'
          );
          setLoading(false);
          return;
        }

        const payload = {
          name: name.trim(),
          mobile: cleanMobile,
          password,
          role,
          state,
          district,
          address: address.trim() || undefined,
          pincode: pincode.trim() || undefined,
          fpoName: role === 'farmer' ? fpoName.trim() : undefined,
          farmSizeAcres: role === 'farmer' && farmSizeAcres ? farmSizeAcres : undefined,
          primaryCrops: role === 'farmer' && primaryCrops ? primaryCrops.split(',').map(c => c.trim()) : undefined,
          businessName: role === 'bulk_buyer' ? businessName.trim() : undefined,
          businessType: role === 'bulk_buyer' ? businessType : undefined,
          gstin: role === 'bulk_buyer' ? gstin.trim() : undefined,
          transportAgencyName: role === 'transporter' ? transportAgencyName.trim() : undefined,
          vehicleTypes: role === 'transporter' && vehicleTypes ? vehicleTypes.split(',').map(v => v.trim()) : undefined,
          totalVehicles: role === 'transporter' && totalVehicles ? Number(totalVehicles) : undefined,
          operatingRoutes: role === 'transporter' && operatingRoutes ? operatingRoutes.split(',').map(r => r.trim()) : undefined
        };

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to register account');
        }

        onSuccessLogin(data.user);
        onClose();
      } else {
        // Login Mode
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: cleanMobile, password, role })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Invalid credentials');
        }

        onSuccessLogin(data.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 my-8">
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white p-5 px-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold">
                {isRegisterMode
                  ? isMr ? 'SetiMitra नवीन नोंदणी (Register)' : isHi ? 'SetiMitra नया पंजीकरण (Register)' : 'Register SetiMitra Account'
                  : isMr ? 'SetiMitra लॉगिन (Login)' : isHi ? 'SetiMitra लॉगिन (Login)' : 'SetiMitra Login'}
              </h3>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              {t.subTagline || 'बळीराजा व खरेदीदार थेट डिजिटल बाजार'}
            </p>
          </div>
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 bg-gray-100 border-b border-gray-200 text-xs font-bold">
          <button
            type="button"
            id="tab-mode-login"
            onClick={() => {
              setIsRegisterMode(false);
              setErrorMessage('');
            }}
            className={`py-3 text-center transition-colors border-b-2 cursor-pointer ${
              !isRegisterMode
                ? 'bg-white text-emerald-800 border-emerald-700'
                : 'text-gray-600 hover:text-gray-900 border-transparent'
            }`}
          >
            {isMr ? 'लॉगिन करा (Login)' : isHi ? 'लॉगिन करें (Login)' : 'Login'}
          </button>
          <button
            type="button"
            id="tab-mode-register"
            onClick={() => {
              setIsRegisterMode(true);
              setErrorMessage('');
            }}
            className={`py-3 text-center transition-colors border-b-2 cursor-pointer ${
              isRegisterMode
                ? 'bg-white text-emerald-800 border-emerald-700'
                : 'text-gray-600 hover:text-gray-900 border-transparent'
            }`}
          >
            {isMr ? 'नवीन नोंदणी (Register)' : isHi ? 'नया पंजीकरण (Register)' : 'New Registration'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Select User Role */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              {isMr ? 'आपली भूमिका निवडा:' : isHi ? 'अपनी भूमिका चुनें:' : 'Select Your Profile Type:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                id="role-select-farmer"
                onClick={() => setRole('farmer')}
                className={`py-2 px-2.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  role === 'farmer'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                🌾 {t.roleFarmer}
              </button>
              <button
                type="button"
                id="role-select-bulk-buyer"
                onClick={() => setRole('bulk_buyer')}
                className={`py-2 px-2.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  role === 'bulk_buyer'
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                🏢 {t.roleBulkBuyer}
              </button>
              <button
                type="button"
                id="role-select-customer"
                onClick={() => setRole('customer')}
                className={`py-2 px-2.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  role === 'customer'
                    ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                🛒 {t.roleConsumer}
              </button>
              <button
                type="button"
                id="role-select-transporter"
                onClick={() => setRole('transporter')}
                className={`py-2 px-2.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  role === 'transporter'
                    ? 'bg-blue-900 text-white border-blue-900 shadow-xs ring-1 ring-blue-700'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                🚛 {t.roleTransporter || 'वाहतूकदार'}
              </button>
            </div>
          </div>

          {/* Quick 1-Click Test Login Accounts */}
          {!isRegisterMode && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-900 mb-1.5 flex items-center justify-between">
                <span>
                  {isMr
                    ? '⚡ नोंदणीकृत चाचणी खाती (Registered Test Accounts):'
                    : isHi
                    ? '⚡ पंजीकृत परीक्षण खाते (Test Accounts):'
                    : '⚡ Registered Test Accounts (1-Click Fill):'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('9822012345', 'farmer')}
                  className="py-1.5 px-2 bg-white hover:bg-emerald-100 text-emerald-900 font-semibold rounded-lg border border-emerald-300 text-center transition-colors cursor-pointer"
                >
                  🌾 रमेश (शेतकरी)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('9890011223', 'bulk_buyer')}
                  className="py-1.5 px-2 bg-white hover:bg-blue-100 text-blue-900 font-semibold rounded-lg border border-blue-300 text-center transition-colors cursor-pointer"
                >
                  🏢 विक्रम (खरेदीदार)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('9923055443', 'customer')}
                  className="py-1.5 px-2 bg-white hover:bg-purple-100 text-purple-900 font-semibold rounded-lg border border-purple-300 text-center transition-colors cursor-pointer"
                >
                  🛒 पूजा (ग्राहक)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('9823411223', 'transporter')}
                  className="py-1.5 px-2 bg-white hover:bg-blue-200 text-blue-950 font-bold rounded-lg border border-blue-400 text-center transition-colors cursor-pointer"
                >
                  🚛 संतोष (वाहतूकदार)
                </button>
              </div>
            </div>
          )}

          {/* Registration Extra Fields */}
          {isRegisterMode && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {isMr ? 'पूर्ण नाव / संपर्क व्यक्तीचे नाव *' : isHi ? 'पूरा नाम / संपर्क व्यक्ति *' : 'Full Name / Contact Person *'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    id="register-input-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isMr ? 'उदा. ज्ञानेश्वर कदम' : isHi ? 'उदा. ज्ञानेश्वर कदम' : 'e.g. Ramesh Patil'}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Farmer Specific Fields */}
              {role === 'farmer' && (
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2.5">
                  <div className="text-xs font-bold text-emerald-950">
                    {isMr ? 'शेतकरी / FPO माहिती' : isHi ? 'किसान / एफपीओ विवरण' : 'Farmer / FPO Information'}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-1">
                      {isMr ? 'FPO / शेतकरी उत्पादक कंपनीचे नाव (ऐच्छिक)' : isHi ? 'एफपीओ का नाम (वैकल्पिक)' : 'FPO / Farmer Group Name'}
                    </label>
                    <input
                      type="text"
                      value={fpoName}
                      onChange={(e) => setFpoName(e.target.value)}
                      placeholder={isMr ? 'उदा. सह्याद्री ऍग्रो फार्मर्स' : 'e.g. Sahyadri Agro FPO'}
                      className="w-full p-2 text-xs border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 mb-1">
                        {isMr ? 'शेती क्षेत्र (एकर)' : isHi ? 'खेत का क्षेत्रफल (एकड़)' : 'Farm Size (Acres)'}
                      </label>
                      <input
                        type="number"
                        value={farmSizeAcres}
                        onChange={(e) => setFarmSizeAcres(e.target.value)}
                        placeholder="e.g. 5"
                        className="w-full p-2 text-xs border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 mb-1">
                        {isMr ? 'प्रमुख पिके (स्वल्पविरामाने)' : isHi ? 'प्रमुख फसलें' : 'Primary Crops'}
                      </label>
                      <input
                        type="text"
                        value={primaryCrops}
                        onChange={(e) => setPrimaryCrops(e.target.value)}
                        placeholder="टोमॅटो, कांदा, सोयाबीन"
                        className="w-full p-2 text-xs border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bulk Buyer Specific Fields */}
              {role === 'bulk_buyer' && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2.5">
                  <div className="text-xs font-bold text-blue-950">
                    {isMr ? 'घाऊक खरेदीदार / व्यवसाय माहिती' : isHi ? 'थोक खरीदार / व्यापार विवरण' : 'Bulk Buyer / Business Information'}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 mb-1">
                        {isMr ? 'कंपनी / पेढीचे नाव' : isHi ? 'कंपनी का नाम' : 'Business Name'}
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="FreshMart Ltd"
                        className="w-full p-2 text-xs border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 mb-1">
                        {isMr ? 'जीएसटी क्रमांक (ऐच्छिक)' : isHi ? 'जीएसटी नंबर (वैकल्पिक)' : 'GSTIN (Optional)'}
                      </label>
                      <input
                        type="text"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="27AAAAA0000A1Z5"
                        className="w-full p-2 text-xs border border-gray-300 rounded-lg bg-white uppercase font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Transporter Specific Fields */}
              {role === 'transporter' && (
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2.5">
                  <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-700" />
                    <span>{isMr ? 'वाहतूकदार / चालक माहिती' : isHi ? 'ट्रांसपोर्टर / चालक विवरण' : 'Transporter / Fleet Details'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 mb-1">
                        {isMr ? 'वाहतूक एजन्सीचे नाव' : isHi ? 'ट्रांसपोर्ट एजेंसी नाम' : 'Transport Agency Name'}
                      </label>
                      <input
                        type="text"
                        value={transportAgencyName}
                        onChange={(e) => setTransportAgencyName(e.target.value)}
                        placeholder="Kisan Express Transport"
                        className="w-full p-2 text-xs border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 mb-1">
                        {isMr ? 'वाहनांची संख्या' : isHi ? 'वाहनों की संख्या' : 'Fleet Size'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={totalVehicles}
                        onChange={(e) => setTotalVehicles(e.target.value)}
                        placeholder="4"
                        className="w-full p-2 text-xs border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-1">
                      {isMr ? 'उपलब्ध वाहनांचे प्रकार' : isHi ? 'वाहन प्रकार' : 'Vehicle Types'}
                    </label>
                    <input
                      type="text"
                      value={vehicleTypes}
                      onChange={(e) => setVehicleTypes(e.target.value)}
                      placeholder="Tata Ace Reefer, Bolero Pickup"
                      className="w-full p-2 text-xs border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {isMr ? 'राज्य' : isHi ? 'राज्य' : 'State'}
                  </label>
                  <input
                    id="state-input"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2 text-xs border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {isMr ? 'जिल्हा' : isHi ? 'जिला' : 'District'}
                  </label>
                  <input
                    id="district-input"
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2 text-xs border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {isMr ? 'पिनकोड' : isHi ? 'पिनकोड' : 'Pincode'}
                  </label>
                  <input
                    id="pincode-input"
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="422001"
                    className="w-full p-2 text-xs border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {isMr ? 'मोबाईल क्रमांक (१० अंक) *' : isHi ? 'मोबाइल नंबर (१० अंक) *' : 'Mobile Number (10 digits) *'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-gray-500 font-semibold">+91</span>
              <input
                id="auth-mobile-input"
                type="tel"
                maxLength={10}
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder={isMr ? '१० अंकांचा मोबाईल क्रमांक टाका' : 'Enter 10-digit mobile number'}
                className="w-full pl-12 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono font-medium"
              />
            </div>
          </div>

          {/* Password (User-Chosen) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-700">
                {isRegisterMode
                  ? isMr ? 'पासवर्ड निवडा *' : isHi ? 'पासवर्ड चुनें *' : 'Choose Password *'
                  : isMr ? 'पासवर्ड टाका *' : isHi ? 'पासवर्ड दर्ज करें *' : 'Enter Password *'}
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50 text-sm mt-2 cursor-pointer"
          >
            {loading
              ? isMr ? 'तपासत आहे...' : isHi ? 'जांच हो रही है...' : 'Verifying...'
              : isRegisterMode
              ? isMr ? 'नोंदणी करा व बाजारात प्रवेश करा' : isHi ? 'पंजीकरण करें व बाज़ार में प्रवेश करें' : 'Register & Access Marketplace'
              : isMr ? 'मोबाईल नंबरने लॉगिन करा' : isHi ? 'मोबाइल नंबर से लॉगिन करें' : 'Login with Mobile Number'}
          </button>

          {/* Toggle between Login and Register */}
          <div className="text-center pt-2 text-xs text-gray-600">
            {isRegisterMode ? (
              <span>
                {isMr ? 'आधीच खाते आहे का?' : isHi ? 'पहले से खाता है?' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  id="switch-to-login-btn"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setErrorMessage('');
                  }}
                  className="text-emerald-700 hover:text-emerald-800 font-bold underline ml-1 cursor-pointer"
                >
                  {isMr ? 'येथे लॉगिन करा' : isHi ? 'यहाँ लॉगिन करें' : 'Login here'}
                </button>
              </span>
            ) : (
              <span>
                {isMr ? 'नवीन शेतकरी किंवा खरेदीदार आहात?' : isHi ? 'नए किसान या खरीदार हैं?' : 'New to SetiMitra?'}{' '}
                <button
                  type="button"
                  id="switch-to-register-btn"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setErrorMessage('');
                  }}
                  className="text-emerald-700 hover:text-emerald-800 font-bold underline ml-1 cursor-pointer"
                >
                  {isMr ? 'नवीन खाते तयार करा (नोंदणी)' : isHi ? 'नया खाता बनाएं (रजिस्टर)' : 'Create account (Register)'}
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
