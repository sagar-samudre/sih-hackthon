import React, { useState } from 'react';
import { TrendingUp, ShieldCheck, Truck, Users, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface IntermediarySavingsBannerProps {
  onExploreRates?: () => void;
  onOpenPostProduct?: () => void;
  lang?: Language;
}

export const IntermediarySavingsBanner: React.FC<IntermediarySavingsBannerProps> = ({
  onExploreRates,
  onOpenPostProduct,
  lang = 'mr'
}) => {
  const [showComparisonDetails, setShowComparisonDetails] = useState(false);
  const t = getTranslation(lang);

  const isMr = lang === 'mr';
  const isHi = lang === 'hi';

  const tChainTitle = isMr ? 'पारंपरिक बहु-दलाल साखळी मॉडेल' : isHi ? 'पारंपरिक बिचौलिया सप्लाई चेन' : 'Traditional Multi-Intermediary Model';
  const tHighSpoilage = isMr ? 'नासाडी: २८% नुकसान' : isHi ? 'बर्बादी: २८% नुकसान' : 'High Spoilage (28%)';
  const tDistress = isMr ? '१. शेतातील नाईलाजाची विक्री' : isHi ? '१. खेत से औने-पौने दामों में बिक्री' : '1. Farm Gate Distress Sale';
  const tFarmerGetsOld = isMr ? 'शेतकऱ्याला मिळतात: ~₹१४/किलो' : isHi ? 'किसान को मिलता है: ~₹१४/किग्रा' : 'Farmer gets ~₹14/kg';
  const tAggregator = isMr ? '२. गावपातळीवरील दलाल व वाहतूक' : isHi ? '२. गाँव का बिचौलिया व ढुलाई' : '2. Village Aggregator & Transport';
  const tMarginOld = isMr ? '+₹३.५०/किलो दलाली' : isHi ? '+₹३.५०/किग्रा मार्जिन' : '+₹3.50/kg margin';
  const tApmcOld = isMr ? '३. एपीएमसी आडत (कमिशन एजंट)' : isHi ? '३. एपीएमसी मंडी आढ़त व टैक्स' : '3. APMC Mandi Adat (Commission Agent)';
  const tApmcRateOld = isMr ? '+८.५% आडत व उपकर' : isHi ? '+८.५% मंडी फीस व कर' : '+8.5% cess & fee';
  const tWholesaleOld = isMr ? '४. शहर होलसेलर व उप-दलाल' : isHi ? '४. शहर का थोक व्यापारी व रिटेलर' : '4. City Wholesaler & Sub-Agent';
  const tWholesaleRateOld = isMr ? '+₹६.००/किलो नफा' : isHi ? '+₹६.००/किग्रा मुनाफा' : '+₹6.00/kg markup';
  const tConsumerPaysOld = isMr ? 'शेवटचा ग्राहक भरतो:' : isHi ? 'अंतिम ग्राहक चुकाता है:' : 'End Consumer Pays:';
  const tOverpriced = isMr ? '₹३२ ते ₹३८/किलो (महाग)' : isHi ? '₹३२ से ₹३८/किग्रा (महँगा)' : '₹32 to ₹38/kg (Overpriced)';

  const sModelTitle = isMr ? 'SetiMitra (शेतीमित्र) थेट मॉडेल' : isHi ? 'SetiMitra (शेतीमित्र) सीधा मॉडल' : 'SetiMitra Direct Marketplace Model';
  const sSpeed = isMr ? 'कोल्ड-चेन व थेट GPS ट्रॅकिंग' : isHi ? 'कोल्ड चेन व लाइव GPS ट्रैकिंग' : 'Cold Chain & Live GPS Tracking';
  const sStep1 = isMr ? '१. शेतकरी / FPO कडून थेट विक्री' : isHi ? '१. किसान / एफपीओ द्वारा सीधी लिस्टिंग' : '1. Direct Listing by Farmer / FPO';
  const sFarmerGetsNew = isMr ? 'शेतकऱ्याला मिळतात: ₹२०/किलो (+४२% जास्त!)' : isHi ? 'किसान को मिलते हैं: ₹२०/किग्रा (+४२% अधिक!)' : 'Farmer gets ₹20/kg (+42% more!)';
  const sStep2 = isMr ? '२. रूट-ऑप्टिमाइझ शेतीमाल वाहतूक' : isHi ? '२. रूट-ऑप्टिमाइज्ड सुरक्षित परिवहन' : '2. Route-Optimized Logistics';
  const sFleetRate = isMr ? '+₹२.००/किलो थेट वाहन खर्च' : isHi ? '+₹२.००/किग्रा सीधा वाहन खर्च' : '+₹2.00/kg shared fleet';
  const sStep3 = isMr ? '३. थेट प्रतवारी व सुरक्षित पॅकिंग' : isHi ? '३. गुणवत्ता ग्रेडिंग व सुरक्षित प्रेषण' : '3. Quality Grading & Dispatch';
  const sZeroFee = isMr ? '०% दलाल कमिशन कपात' : isHi ? '०% बिचौलिया कमीशन कटौती' : 'Zero middleman commission';
  const sStep4 = isMr ? '४. थेट गोदामात / दारापर्यंत डिलिव्हरी' : isHi ? '४. गोदाम / दरवाजे तक त्वरित डिलीवरी' : '4. Direct Dock / Doorstep Delivery';
  const sFreshHours = isMr ? 'ताजी आवक १२-१८ तासांत' : isHi ? 'ताज़ा उपज १२-१८ घंटों में' : 'Fresh harvest within 12-18 hrs';
  const sBuyerPays = isMr ? 'खरेदीदार / ग्राहक दर:' : isHi ? 'खरीदार / ग्राहक भुगतान:' : 'End Consumer / Bulk Buyer Pays:';
  const sYouSave = isMr ? '₹२४/किलो (तुमची ₹८ ते ₹१४ बचत!)' : isHi ? '₹२४/किग्रा (आपकी ₹८ से ₹१४ सीधी बचत!)' : '₹24/kg (You save ₹8 to ₹14/kg!)';

  return (
    <div id="intermediary-savings-banner" className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white rounded-2xl p-5 md:p-7 shadow-lg mb-6 border border-emerald-700/50 w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-3 border border-emerald-600/40">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            {t.eliminateIntermediariesTitle} • {t.zeroCommissionLoss || '०% एपीएमसी कमिशन नुकसान'}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2 font-serif">
            {t.appName}: {t.eliminateIntermediariesTitle}
          </h2>
          <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
            {t.eliminateIntermediariesDesc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 px-4 border border-white/15 text-center flex-1 sm:flex-initial">
            <div className="text-xs text-emerald-200 font-medium">{t.farmerEarnings || 'शेतकऱ्याचे थेट उत्पन्न'}</div>
            <div className="text-2xl font-black text-amber-300">+35% to +45%</div>
            <div className="text-[11px] text-emerald-300">{t.bankDirect || 'थेट बँक / UPI'}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 px-4 border border-white/15 text-center flex-1 sm:flex-initial">
            <div className="text-xs text-emerald-200 font-medium">{t.buyerSavings || 'खरेदीदाराची थेट बचत'}</div>
            <div className="text-2xl font-black text-amber-300">20% to 30%</div>
            <div className="text-[11px] text-emerald-300">{t.freshRate || 'ताजा शेतातील दर'}</div>
          </div>
          <button
            id="toggle-supply-chain-breakdown-btn"
            onClick={() => setShowComparisonDetails(!showComparisonDetails)}
            className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-4 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {showComparisonDetails ? (t.hideChain || 'तपशील लपवा') : (t.compareChain || 'साखळी फरक पहा')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showComparisonDetails && (
        <div className="mt-6 pt-6 border-t border-emerald-700/60 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {/* Traditional Intermediary Model */}
          <div className="bg-emerald-950/70 rounded-xl p-4 border border-red-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                {tChainTitle}
              </span>
              <span className="text-xs text-red-300 bg-red-950/60 px-2 py-0.5 rounded">{tHighSpoilage}</span>
            </div>
            <div className="space-y-2.5 text-xs text-emerald-100">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span>{tDistress}</span>
                <span className="font-semibold text-red-300">{tFarmerGetsOld}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span>{tAggregator}</span>
                <span className="text-gray-300">{tMarginOld}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span>{tApmcOld}</span>
                <span className="text-gray-300">{tApmcRateOld}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span>{tWholesaleOld}</span>
                <span className="text-gray-300">{tWholesaleRateOld}</span>
              </div>
              <div className="flex justify-between items-center py-1 font-bold text-sm text-red-200">
                <span>{tConsumerPaysOld}</span>
                <span>{tOverpriced}</span>
              </div>
            </div>
          </div>

          {/* SetiMitra Direct Model */}
          <div className="bg-emerald-950/70 rounded-xl p-4 border border-emerald-400/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {sModelTitle}
              </span>
              <span className="text-xs text-emerald-200 bg-emerald-800/80 px-2 py-0.5 rounded">{sSpeed}</span>
            </div>
            <div className="space-y-2.5 text-xs text-emerald-100">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span>{sStep1}</span>
                <span className="font-bold text-amber-300">{sFarmerGetsNew}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span>{sStep2}</span>
                <span className="text-emerald-300">{sFleetRate}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span>{sStep3}</span>
                <span className="text-emerald-300">{sZeroFee}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span>{sStep4}</span>
                <span className="text-emerald-300">{sFreshHours}</span>
              </div>
              <div className="flex justify-between items-center py-1 font-bold text-sm text-emerald-300">
                <span>{sBuyerPays}</span>
                <span>{sYouSave}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
