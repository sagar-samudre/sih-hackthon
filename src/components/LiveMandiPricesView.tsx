import React, { useState } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calculator,
  Layers,
  Sparkles,
  TrendingUp,
  Store,
  ChevronRight,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { MandiPriceItem, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface LiveMandiPricesViewProps {
  mandiPrices: MandiPriceItem[];
  onRefresh?: () => void;
  lang: Language;
}

export const LiveMandiPricesView: React.FC<LiveMandiPricesViewProps> = ({ mandiPrices, onRefresh, lang }) => {
  const t = getTranslation(lang);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCommodity, setSelectedCommodity] = useState('All');
  const [sortField, setSortField] = useState<'name' | 'price' | 'markup' | 'trend'>('name');

  // Calculator State
  const [calcCommodity, setCalcCommodity] = useState('Tomato');
  const [calcQuintals, setCalcQuintals] = useState('30');

  // Categories definition
  const categories = [
    { id: 'All', labelEn: 'All Vegetables', labelMr: 'सर्व भाज्या (55+)' },
    { id: 'Fruiting Vegetables', labelEn: 'Fruiting', labelMr: 'फळभाज्या (टोमॅटो, वांगी, भेंडी, मिरची)' },
    { id: 'Aromatics & Spices', labelEn: 'Onion & Garlic', labelMr: 'कांदा व लसूण' },
    { id: 'Leafy Greens', labelEn: 'Leafy Greens', labelMr: 'पालेभाज्या (पालक, मेथी, कोथिंबीर)' },
    { id: 'Gourds & Cucurbits', labelEn: 'Gourds & Melons', labelMr: 'वेलीवरील भाज्या (कारले, दुधी, दोडका)' },
    { id: 'Legumes & Pods', labelEn: 'Beans & Pods', labelMr: 'शेंगा भाज्या (गवार, घेवडा, वाटाणा)' },
    { id: 'Root & Tuber', labelEn: 'Roots & Tubers', labelMr: 'कंदमुळे (बटाटा, गाजर, मुळा, बीट)' },
    { id: 'Exotic', labelEn: 'Exotics & Salads', labelMr: 'विशेष व सॅलड (ब्रोकोली, मशरूम, लिंबू)' }
  ];

  const states = ['All', ...Array.from(new Set(mandiPrices.map(m => m.state)))];
  const commodities = ['All', ...Array.from(new Set(mandiPrices.map(m => m.commodity)))];

  const filteredPrices = mandiPrices
    .filter(item => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.commodity.toLowerCase().includes(q) ||
        (item.localName && item.localName.toLowerCase().includes(q)) ||
        item.mandiName.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q) ||
        item.variety.toLowerCase().includes(q);

      const matchesState = selectedState === 'All' || item.state === selectedState;
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesCommodity = selectedCommodity === 'All' || item.commodity === selectedCommodity;

      return matchesSearch && matchesState && matchesCategory && matchesCommodity;
    })
    .sort((a, b) => {
      if (sortField === 'price') return b.modalPricePerKg - a.modalPricePerKg;
      if (sortField === 'markup') return b.intermediaryMarkupPercent - a.intermediaryMarkupPercent;
      if (sortField === 'trend') return b.dailyChangePercent - a.dailyChangePercent;
      return a.commodity.localeCompare(b.commodity);
    });

  // Calculate earnings for the selected commodity
  const selectedItem =
    mandiPrices.find(m => m.commodity.toLowerCase().includes(calcCommodity.toLowerCase())) ||
    mandiPrices[0];
  const quintals = Math.max(1, Number(calcQuintals) || 10);
  const kgTotal = quintals * 100;
  const traditionalMandiEarnings = selectedItem ? selectedItem.modalPricePerKg * kgTotal * 0.915 : 0; // After 8.5% adat/charges
  const directPlatformEarnings = selectedItem ? selectedItem.farmerDirectPricePerKg * kgTotal : 0;
  const extraEarningsInr = Math.max(0, directPlatformEarnings - traditionalMandiEarnings);

  // Overall Market Pulse stats
  const totalVegetables = mandiPrices.length;
  const avgMarkup = Math.round(
    mandiPrices.reduce((acc, curr) => acc + curr.intermediaryMarkupPercent, 0) / (totalVegetables || 1)
  );
  const upTrendsCount = mandiPrices.filter(m => m.trend === 'up').length;

  return (
    <div id="live-mandi-prices-section" className="space-y-6">
      {/* Header Banner with Real-time AgMarkNet Status */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-emerald-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold mb-2.5 border border-emerald-600/40 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>APMC & AgMarkNet Daily Vegetable Rates — Active 19 Sep 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {lang === 'mr' ? 'सर्व भाज्यांचे थेट बाजारभाव (Live Mandi Rates)' : lang === 'hi' ? 'सभी सब्जियों के लाइव मंडी भाव' : 'Live Vegetable Mandi Market Rates'}
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm max-w-2xl mt-1.5 leading-relaxed">
              {lang === 'mr'
                ? 'महाराष्ट्रातील लासलगाव, पुणे, नाशिक, वाशी आणि प्रमुख बाजार समित्यांचे फळभाज्या, पालेभाज्या व कंदमुळांचे अचूक दैनिक दर.'
                : lang === 'hi'
                ? 'महाराष्ट्र और देश की प्रमुख कृषि मंडियों से सभी सब्जियों के दैनिक थोक व खुदरा वास्तविक भाव।'
                : 'Direct transparent wholesale rates for 55+ vegetables from Lasalgaon, Pune, Nashik, Vashi and leading national APMC mandis.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl text-center border border-white/15">
              <div className="text-[11px] text-emerald-200 font-medium">Tracked Vegetables</div>
              <div className="text-xl font-black text-amber-300 font-mono">{totalVegetables}+ Crops</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl text-center border border-white/15">
              <div className="text-[11px] text-emerald-200 font-medium">Avg Middlemen Cut</div>
              <div className="text-xl font-black text-red-300 font-mono">+{avgMarkup}%</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl text-center border border-white/15">
              <div className="text-[11px] text-emerald-200 font-medium">Gaining Vegetables</div>
              <div className="text-xl font-black text-emerald-300 font-mono">{upTrendsCount} Up Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="bg-white p-3 rounded-2xl shadow-xs border border-gray-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <div className="flex items-center gap-1 text-xs font-bold text-gray-500 mr-2 shrink-0">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Category:</span>
          </div>
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-150 ${
                  active
                    ? 'bg-emerald-700 text-white shadow-xs font-bold'
                    : 'bg-gray-100 hover:bg-gray-200/80 text-gray-700'
                }`}
              >
                {lang === 'mr' ? cat.labelMr : cat.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Fair Price & Extra Earning Calculator */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-emerald-200/80">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">
                {lang === 'mr'
                  ? 'शेतकरी थेट नफा कॅल्क्युलेटर (दलाल व आडत विरहीत)'
                  : lang === 'hi'
                  ? 'किसान सीधा लाभ कैलकुलेटर (बिचौलियों के बिना)'
                  : 'Farmer Direct Realization Calculator vs Traditional Mandi Intermediaries'}
              </h2>
              <p className="text-xs text-gray-500">
                Compare your net return on SetiMitra vs traditional mandi commission + loading cuts.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Crop</label>
            <select
              id="calc-crop-select"
              value={calcCommodity}
              onChange={(e) => setCalcCommodity(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-emerald-500"
            >
              {commodities.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Harvest Quantity (Quintals)</label>
            <input
              id="calc-quintals-input"
              type="number"
              min="1"
              value={calcQuintals}
              onChange={(e) => setCalcQuintals(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="bg-red-50/80 p-3.5 rounded-xl border border-red-200 flex flex-col justify-between">
            <div>
              <div className="text-xs text-red-700 font-semibold">Traditional Mandi Payout</div>
              <div className="text-base sm:text-lg font-black text-red-900 font-mono mt-0.5">
                ₹{Math.round(traditionalMandiEarnings).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-[10px] text-red-600 mt-1">
              Loss: -8.5% Adat, deductions & weighment cuts
            </div>
          </div>

          <div className="bg-emerald-50/90 p-3.5 rounded-xl border border-emerald-300 flex flex-col justify-between">
            <div>
              <div className="text-xs text-emerald-800 font-bold flex items-center justify-between">
                <span>SetiMitra Direct</span>
                <span className="bg-emerald-200/80 text-emerald-950 px-1.5 py-0.5 rounded text-[10px] font-extrabold">
                  +25-40% Net
                </span>
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-950 font-mono mt-0.5">
                ₹{Math.round(directPlatformEarnings).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-[11px] text-emerald-800 font-bold mt-1">
              +₹{Math.round(extraEarningsInr).toLocaleString('en-IN')} extra in farmer pocket!
            </div>
          </div>
        </div>
      </div>

      {/* Search, State, and Sorting Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            id="mandi-price-search-input"
            type="text"
            placeholder={
              lang === 'mr'
                ? 'भाजीचे नाव (उदा. टोमॅटो, कांदा, मिरची, बटाटा) किंवा मंडी शोधा...'
                : 'Search any vegetable (Tomato, Onion, Chilli, Garlic...) or APMC mandi...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Filters and Sorters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            id="mandi-state-filter"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="p-2 text-xs border border-gray-300 rounded-xl bg-white font-medium text-gray-700"
          >
            {states.map(st => (
              <option key={st} value={st}>State: {st}</option>
            ))}
          </select>

          <select
            id="mandi-sort-select"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="p-2 text-xs border border-gray-300 rounded-xl bg-white font-medium text-gray-700"
          >
            <option value="name">Sort: Vegetable Name</option>
            <option value="price">Sort: Highest Rate / kg</option>
            <option value="markup">Sort: Highest Middlemen Cut</option>
            <option value="trend">Sort: Daily Gainers</option>
          </select>
        </div>
      </div>

      {/* Results Count indicator */}
      <div className="flex items-center justify-between text-xs text-gray-600 px-1">
        <span>Showing <strong className="text-gray-900">{filteredPrices.length}</strong> vegetables across registered APMC Mandis</span>
        <span className="text-[11px] text-gray-400">Values in ₹/kg and ₹/quintal</span>
      </div>

      {/* Mandi Price Comparison Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50/90 text-gray-700 border-b border-gray-200 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3.5 px-4">Vegetable & Variety</th>
                <th className="py-3.5 px-4">APMC Mandi & State</th>
                <th className="py-3.5 px-4 text-right">Mandi Modal Rate</th>
                <th className="py-3.5 px-4 text-right bg-emerald-50/70 text-emerald-950">
                  SetiMitra Direct
                </th>
                <th className="py-3.5 px-4 text-right">Retail Shop Price</th>
                <th className="py-3.5 px-4 text-center">Middlemen Markup</th>
                <th className="py-3.5 px-4 text-center">Daily Trend</th>
                <th className="py-3.5 px-4 text-right">Daily Arrivals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPrices.map((item) => (
                <tr key={item.id} className="hover:bg-emerald-50/20 transition-colors">
                  {/* Commodity & Local Name */}
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-gray-900 text-sm">
                      {item.commodity}
                    </div>
                    {item.localName && (
                      <div className="text-[11px] text-emerald-700 font-semibold">
                        {item.localName}
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {item.variety}
                    </div>
                  </td>

                  {/* Mandi & Location */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gray-800 flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item.mandiName}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 ml-4.5">
                      {item.district}, {item.state}
                    </div>
                  </td>

                  {/* APMC Modal Rate */}
                  <td className="py-3.5 px-4 text-right font-mono">
                    <div className="font-bold text-gray-900 text-sm">
                      ₹{item.modalPricePerKg.toFixed(1)}/kg
                    </div>
                    <div className="text-[10px] text-gray-400">
                      ₹{item.modalPrice}/Q
                    </div>
                  </td>

                  {/* SetiMitra Direct Price */}
                  <td className="py-3.5 px-4 text-right bg-emerald-50/50 font-mono">
                    <div className="font-black text-emerald-900 text-sm">
                      ₹{item.farmerDirectPricePerKg.toFixed(1)}/kg
                    </div>
                    <div className="text-[10px] text-emerald-700 font-extrabold">
                      +{(
                        ((item.farmerDirectPricePerKg - item.modalPricePerKg) / item.modalPricePerKg) *
                        100
                      ).toFixed(0)}
                      % Farmer Extra
                    </div>
                  </td>

                  {/* Retail Shop Price */}
                  <td className="py-3.5 px-4 text-right font-mono">
                    <div className="font-medium text-gray-400 line-through">
                      ₹{item.consumerRetailPricePerKg.toFixed(1)}/kg
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold">
                      Buyer Saves ₹{(item.consumerRetailPricePerKg - item.farmerDirectPricePerKg).toFixed(1)}
                    </div>
                  </td>

                  {/* Middlemen Markup */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                      +{item.intermediaryMarkupPercent}%
                    </span>
                  </td>

                  {/* Trend */}
                  <td className="py-3.5 px-4 text-center">
                    {item.trend === 'up' && (
                      <span className="inline-flex items-center gap-0.5 text-emerald-800 font-bold text-xs bg-emerald-100 px-2 py-0.5 rounded-full">
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700" />
                        +{item.dailyChangePercent}%
                      </span>
                    )}
                    {item.trend === 'down' && (
                      <span className="inline-flex items-center gap-0.5 text-red-800 font-bold text-xs bg-red-100 px-2 py-0.5 rounded-full">
                        <ArrowDownRight className="w-3.5 h-3.5 text-red-700" />
                        {item.dailyChangePercent}%
                      </span>
                    )}
                    {item.trend === 'stable' && (
                      <span className="inline-flex items-center gap-0.5 text-gray-700 font-medium text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        <Minus className="w-3.5 h-3.5 text-gray-500" />
                        0.0%
                      </span>
                    )}
                  </td>

                  {/* Arrivals */}
                  <td className="py-3.5 px-4 text-right font-mono text-gray-700">
                    <div className="font-semibold">{item.arrivalTons} Tons</div>
                    <div className="text-[10px] text-gray-400">{item.date}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPrices.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            <p className="font-semibold text-gray-700">No vegetable mandi prices matched your search query.</p>
            <p className="text-xs mt-1">Try resetting the category filter or search for crops like Tomato, Onion, Chilli, or Garlic.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedState('All');
                setSelectedCommodity('All');
              }}
              className="mt-3 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
