import React, { useState } from 'react';
import { Bot, Sparkles, TrendingUp, Navigation, Compass, ShieldCheck, Leaf, Fuel, Clock, ArrowRight, HelpCircle, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { DemandForecastResult, RouteOptimizationResult, User } from '../types';

interface AiForecastRouteViewProps {
  currentUser: User | null;
}

export const AiForecastRouteView: React.FC<AiForecastRouteViewProps> = ({ currentUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<'demand' | 'route' | 'advisor'>('demand');

  // Demand forecast state
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedRegion, setSelectedRegion] = useState('Maharashtra (Nashik / Pune Belt)');
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastData, setForecastData] = useState<DemandForecastResult | null>(null);

  // Route optimizer state
  const [originHub, setOriginHub] = useState('Nashik Agro Aggregation Center');
  const [destinationHub, setDestinationHub] = useState('Mumbai / Thane Supermarket Terminal');
  const [selectedFarms, setSelectedFarms] = useState<string[]>([
    'Farm A: Ramesh Patil (Pimpalgaon - 18Q Tomato)',
    'Farm B: Niphad FPO Hub (Niphad - 22Q Onion)',
    'Farm C: Dindori Cluster (Dindori - 12Q Capsicum)'
  ]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeData, setRouteData] = useState<RouteOptimizationResult | null>(null);

  // AI Advisor state
  const [advisorQuestion, setAdvisorQuestion] = useState('How can our FPO negotiate directly with supermarket chains without intermediary commission?');
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorAnswer, setAdvisorAnswer] = useState<string | null>(null);

  // Run initial forecast on mount or user click
  const handleGenerateForecast = async (crop = selectedCrop, region = selectedRegion) => {
    setForecastLoading(true);
    try {
      const res = await fetch('/api/ai/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropName: crop, region })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setForecastData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setForecastLoading(false);
    }
  };

  // Run route optimization
  const handleOptimizeRoute = async () => {
    setRouteLoading(true);
    try {
      const res = await fetch('/api/ai/route-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originHub,
          destinationCity: destinationHub,
          selectedFarms
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setRouteData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRouteLoading(false);
    }
  };

  // Run AI Advisor Query
  const handleAskAdvisor = async () => {
    if (!advisorQuestion.trim()) return;
    setAdvisorLoading(true);
    try {
      const res = await fetch('/api/ai/crop-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: advisorQuestion,
          crop: selectedCrop,
          role: currentUser?.role || 'farmer'
        })
      });
      const json = await res.json();
      if (json.success && json.answer) {
        setAdvisorAnswer(json.answer);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdvisorLoading(false);
    }
  };

  // Load initial demo forecast on first render if empty
  React.useEffect(() => {
    if (!forecastData) {
      handleGenerateForecast('Tomato', 'Maharashtra (Nashik / Pune Belt)');
    }
    if (!routeData) {
      handleOptimizeRoute();
    }
  }, []);

  return (
    <div id="ai-engine-container" className="space-y-6">
      {/* AI Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by Gemini AI Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Demand Forecasting & Route Optimization
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl mt-1">
              Predict high-demand market windows, forecast mandi price trajectories, and optimize multi-farm collection logistics to reduce spoilage and transportation overheads.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-900/60 p-1.5 rounded-xl border border-emerald-700/50">
            <button
              id="subtab-ai-demand-btn"
              onClick={() => setActiveSubTab('demand')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'demand'
                  ? 'bg-amber-400 text-emerald-950 shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Demand Forecaster
            </button>
            <button
              id="subtab-ai-route-btn"
              onClick={() => setActiveSubTab('route')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'route'
                  ? 'bg-amber-400 text-emerald-950 shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Navigation className="w-4 h-4" />
              Route Optimizer
            </button>
            <button
              id="subtab-ai-advisor-btn"
              onClick={() => setActiveSubTab('advisor')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'advisor'
                  ? 'bg-amber-400 text-emerald-950 shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              Krishi Advisor
            </button>
          </div>
        </div>
      </div>

      {/* 1. Demand Forecaster SubTab */}
      {activeSubTab === 'demand' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Crop</label>
                <select
                  id="forecast-crop-select"
                  value={selectedCrop}
                  onChange={(e) => {
                    setSelectedCrop(e.target.value);
                    handleGenerateForecast(e.target.value, selectedRegion);
                  }}
                  className="p-2 text-xs sm:text-sm border border-gray-300 rounded-xl bg-white font-semibold"
                >
                  <option value="Tomato">Tomato (Hybrid)</option>
                  <option value="Onion">Onion (Garwa)</option>
                  <option value="Potato">Potato (Jyoti)</option>
                  <option value="Cauliflower">Cauliflower</option>
                  <option value="Capsicum">Capsicum (Polyhouse)</option>
                  <option value="Chilli">Green Chilli (G-4)</option>
                  <option value="Spinach">Spinach (Palak)</option>
                  <option value="Garlic">Garlic (Lahsun)</option>
                  <option value="Ginger">Ginger (Adrak)</option>
                  <option value="Carrot">Carrot (Pusa Kesar)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Target Market Region</label>
                <select
                  id="forecast-region-select"
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    handleGenerateForecast(selectedCrop, e.target.value);
                  }}
                  className="p-2 text-xs sm:text-sm border border-gray-300 rounded-xl bg-white font-semibold"
                >
                  <option value="Maharashtra (Nashik / Pune / Mumbai Belt)">Maharashtra (Nashik / Pune / Mumbai)</option>
                  <option value="Punjab & Haryana (Ludhiana / Delhi NCR)">Punjab & Haryana (Ludhiana / Delhi NCR)</option>
                  <option value="Karnataka & Telangana (Bengaluru / Hyderabad)">Karnataka & Telangana (Bengaluru / Hyderabad)</option>
                  <option value="Madhya Pradesh & Gujarat (Indore / Surat)">Madhya Pradesh & Gujarat (Indore / Surat)</option>
                </select>
              </div>
            </div>

            <button
              id="refresh-forecast-btn"
              onClick={() => handleGenerateForecast(selectedCrop, selectedRegion)}
              disabled={forecastLoading}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${forecastLoading ? 'animate-spin' : ''}`} />
              {forecastLoading ? 'Forecasting...' : 'Re-Analyze with AI'}
            </button>
          </div>

          {/* Forecast Results Grid */}
          {forecastData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary Card */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Expected Demand Trend
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {forecastData.demandTrend}
                    </span>
                  </div>

                  <div className="text-3xl font-black text-emerald-950 font-mono mb-1">
                    {forecastData.projectedPriceChange}
                  </div>

                  <div className="text-xs font-bold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mb-3">
                    Optimal Harvest Window: {forecastData.recommendedHarvestWindow}
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {forecastData.forecastSummary}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
                  <div className="text-xs font-bold text-gray-800">Key Demand Drivers:</div>
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    {forecastData.keyFactors.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Weekly Demand & Price Chart */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 lg:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        7-Day Demand Index & Projected Farm-Gate Rate (₹/kg)
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Based on mandi arrivals, consumption velocity, and festival patterns
                      </p>
                    </div>
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                      Peak on Day 5 (Festive Spike)
                    </span>
                  </div>

                  {/* Visual Chart Bar Visualization */}
                  <div className="grid grid-cols-7 gap-2 h-44 items-end pt-4 pb-2 border-b border-gray-100">
                    {forecastData.weeklyDemandIndex.map((d, i) => {
                      const barHeight = `${Math.min(100, Math.max(30, d.demandIndex))}%`;
                      const isPeak = d.demandIndex >= 90;
                      return (
                        <div key={i} className="flex flex-col items-center h-full justify-end group">
                          <div className="text-[10px] font-mono font-bold text-emerald-900 mb-1 group-hover:scale-110 transition-transform">
                            ₹{d.projectedRate}
                          </div>
                          <div
                            style={{ height: barHeight }}
                            className={`w-full max-w-[36px] rounded-t-lg transition-all ${
                              isPeak
                                ? 'bg-amber-400 group-hover:bg-amber-500 shadow-md'
                                : 'bg-emerald-600 group-hover:bg-emerald-700'
                            }`}
                          ></div>
                          <div className="text-[11px] font-semibold text-gray-600 mt-2">
                            {d.day}
                          </div>
                          <div className="text-[9px] text-gray-400 font-mono">
                            {d.demandIndex} pts
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Practical Recommendations for Roles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-2">
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                    <div className="text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                      <span>🧑‍🌾</span> Action for Farmers:
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      {forecastData.suggestedActionForFarmers}
                    </p>
                  </div>

                  <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                    <div className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                      <span>🏢</span> Action for Bulk Buyers:
                    </div>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      {forecastData.suggestedActionForBulkBuyers}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. AI Route Optimizer SubTab */}
      {activeSubTab === 'route' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Controls */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 space-y-4">
            <h2 className="text-sm font-bold text-gray-900">
              Configure Consolidated Rural Farm Collection Route
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Origin Aggregation Center</label>
                <input
                  id="route-origin-input"
                  type="text"
                  value={originHub}
                  onChange={(e) => setOriginHub(e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Destination Terminal Dock</label>
                <input
                  id="route-destination-input"
                  type="text"
                  value={destinationHub}
                  onChange={(e) => setDestinationHub(e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Participating Neighboring Farm Nodes for Milk-Run Collection:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {selectedFarms.map((farm, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="text-emerald-950 font-medium truncate">{farm}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              id="run-route-optimizer-btn"
              onClick={handleOptimizeRoute}
              disabled={routeLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {routeLoading ? 'Computing Fuel-Optimal Sequence...' : 'Compute AI Optimized Route'}
            </button>
          </div>

          {/* Route Results */}
          {routeData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Savings Dashboard */}
              <div className="bg-emerald-950 text-white p-5 rounded-2xl shadow-sm border border-emerald-800 space-y-4">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  Route Optimization Metrics
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <div className="text-[11px] text-emerald-300">Distance Saved</div>
                    <div className="text-xl font-black text-amber-300 font-mono">
                      -{routeData.originalUnoptimizedKm - routeData.totalDistanceKm} km
                    </div>
                    <div className="text-[10px] text-gray-300">
                      {routeData.totalDistanceKm} km vs {routeData.originalUnoptimizedKm} km
                    </div>
                  </div>

                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <div className="text-[11px] text-emerald-300">Diesel Saved</div>
                    <div className="text-xl font-black text-emerald-300 font-mono">
                      {routeData.fuelSavedLitres} L
                    </div>
                    <div className="text-[10px] text-gray-300">Direct fuel economy</div>
                  </div>

                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <div className="text-[11px] text-emerald-300">Transport Cost Saved</div>
                    <div className="text-xl font-black text-amber-300 font-mono">
                      ₹{routeData.costSavedInr}
                    </div>
                    <div className="text-[10px] text-gray-300">Shared multi-farm load</div>
                  </div>

                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <div className="text-[11px] text-emerald-300">CO₂ Reductions</div>
                    <div className="text-xl font-black text-emerald-300 font-mono">
                      {routeData.carbonEmissionSavedKg} kg
                    </div>
                    <div className="text-[10px] text-gray-300">Green corridor dispatch</div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-900/80 rounded-xl border border-emerald-700/60 text-xs">
                  <div className="font-bold text-white mb-1">Transit Time Reduction:</div>
                  <p className="text-emerald-200">
                    Total transit completed in <span className="text-amber-300 font-bold">{routeData.estimatedTransitTimeHours} hours</span>. Crops bypass midday sun holding, preventing up to 14% moisture shrinkage and spoilage.
                  </p>
                </div>
              </div>

              {/* Waypoints Sequence & Highlights */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">
                    Optimized Multi-Stop Rural Farm Sequence
                  </h3>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Milk-Run Dispatch Protocol
                  </span>
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-300">
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px] font-bold">
                      S
                    </div>
                    <div className="text-xs font-bold text-gray-900">Origin Depot Departure</div>
                    <div className="text-[11px] text-gray-500">{routeData.originMandiHub}</div>
                  </div>

                  {routeData.farmsToVisit.map((farm, i) => (
                    <div key={i} className="relative bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <div className="absolute -left-6 top-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                        {farm.sequence}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900">{farm.name}</span>
                        <span className="text-[11px] font-mono font-bold text-emerald-800">
                          +{farm.loadQuintals} Quintals {farm.crop}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">{farm.location} • Farm Gate Loading</div>
                    </div>
                  ))}

                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-amber-500 text-emerald-950 flex items-center justify-center text-[10px] font-bold">
                      D
                    </div>
                    <div className="text-xs font-bold text-gray-900">Final Destination Dock Ingress</div>
                    <div className="text-[11px] text-gray-500">{routeData.destinationCenter}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="text-xs font-bold text-gray-800 mb-2">Supply Chain Efficiency Notes:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                    {routeData.routeHighlights.map((hl, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. AI Krishi Advisor SubTab */}
      {activeSubTab === 'advisor' && (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-base font-bold text-gray-900">KrishiSetu AI Market & Harvest Advisor</h2>
              <p className="text-xs text-gray-500">
                Ask any question regarding price negotiation, quality grading, pest weather alerts, or direct supermarket contracts.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              id="advisor-question-input"
              rows={3}
              value={advisorQuestion}
              onChange={(e) => setAdvisorQuestion(e.target.value)}
              placeholder="e.g. How to store onions without weight loss before the price surge? Or how to pitch bulk produce to hotel chains?"
              className="w-full p-3 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-gray-500 font-medium py-1">Quick prompts:</span>
              <button
                type="button"
                onClick={() => setAdvisorQuestion('How can farmers bypass 8.5% APMC commission legally?')}
                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                Bypass 8.5% Commission
              </button>
              <button
                type="button"
                onClick={() => setAdvisorQuestion('What packaging prevents tomato transit bruises during hot summer hours?')}
                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                Prevent Tomato Bruises
              </button>
              <button
                type="button"
                onClick={() => setAdvisorQuestion('How can an FPO get 15-day forward contracts with supermarket chains?')}
                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                Supermarket Contracts
              </button>
            </div>
          </div>

          <button
            id="advisor-ask-submit-btn"
            onClick={handleAskAdvisor}
            disabled={advisorLoading}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {advisorLoading ? 'Analyzing Agricultural Knowledge Base...' : 'Ask KrishiSetu AI'}
          </button>

          {advisorAnswer && (
            <div className="mt-4 p-5 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs sm:text-sm text-gray-800 space-y-2">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                AI Recommendation:
              </div>
              <div className="whitespace-pre-line leading-relaxed">
                {advisorAnswer}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
