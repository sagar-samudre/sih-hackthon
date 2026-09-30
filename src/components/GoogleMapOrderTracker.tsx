/**
 * =========================================================================================
 * SetiMitra (शेतीमित्र) - Live Google Maps Order Tracking Component
 * =========================================================================================
 * 
 * Features:
 *   1. Real-time embedded Google Maps tracking iframe centered on current GPS coordinates.
 *   2. Interactive SVG route polyline with simulated vehicle movement, speed, and ETA.
 *   3. Direct deep-link to Google Maps Navigation for mobile turn-by-turn driving directions.
 *   4. Cold-chain IoT temperature sensor monitoring (4°C - 12°C) for perishable vegetables.
 *   5. Waypoint delivery checkpoints timeline from Farm-Gate to Buyer's Doorstep.
 *   6. Full Trilingual Support (Marathi, Hindi, English).
 * =========================================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Truck,
  Navigation,
  ExternalLink,
  Thermometer,
  Gauge,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Play,
  Pause,
  RotateCcw,
  Layers
} from 'lucide-react';
import { Order, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface GoogleMapOrderTrackerProps {
  order: Order;
  lang: Language;
  onClose?: () => void;
}

export const GoogleMapOrderTracker: React.FC<GoogleMapOrderTrackerProps> = ({
  order,
  lang,
  onClose
}) => {
  const t = getTranslation(lang);

  // High-fidelity predefined delivery routes across Maharashtra agricultural corridors
  // e.g. Pimpalgaon / Nashik -> Mumbai / Thane / Pune
  const defaultRoute = [
    { lat: 20.1706, lng: 73.9877, name: 'Sahyadri Farm Gate (Pimpalgaon Baswant)' },
    { lat: 20.0063, lng: 73.7902, name: 'Nashik Agro Logistics Hub (Dwarka)' },
    { lat: 19.6974, lng: 73.5358, name: 'Igatpuri Ghat Toll Checkpoint' },
    { lat: 19.3562, lng: 73.3478, name: 'Asangaon Highway Rest Stop' },
    { lat: 19.2437, lng: 73.1355, name: 'Kalyan / Bhiwandi City Gate' },
    { lat: 19.0760, lng: 72.8777, name: 'Destination Hub (APMC Market / Direct Buyer Dock)' }
  ];

  const trackingData = order.tracking || {
    orderId: order.id,
    orderNumber: order.orderNumber,
    currentLat: 19.6974,
    currentLng: 73.5358,
    originLat: 20.1706,
    originLng: 73.9877,
    originName: 'Pimpalgaon Baswant, Nashik (Farm Gate)',
    destLat: 19.0760,
    destLng: 72.8777,
    destName: order.deliveryAddress || 'Mumbai Metro Hub',
    progressPercent: 48,
    vehicleNumber: 'MH-15-EG-4821 (Tata Ace Gold)',
    driverName: 'Santosh Shinde',
    driverPhone: '+91 98234 11223',
    speedKmh: 54,
    temperatureCelsius: 6.8,
    estimatedArrivalMinutes: 85,
    distanceRemainingKm: 68,
    checkpoints: [
      { title: 'Harvest Inspected & Loaded', location: 'Pimpalgaon Farm', time: '06:30 AM', completed: true, isCurrent: false },
      { title: 'Farm-Gate Dispatch', location: 'Nashik Rural', time: '07:15 AM', completed: true, isCurrent: false },
      { title: 'Highway Transit & Temperature Check', location: 'Igatpuri Ghat', time: '08:45 AM', completed: true, isCurrent: true },
      { title: 'City Logistics Entry Dock', location: 'Bhiwandi Hub', time: '10:00 AM (Est)', completed: false, isCurrent: false },
      { title: 'Direct Delivery to Buyer', location: order.deliveryAddress, time: '10:45 AM (Est)', completed: false, isCurrent: false }
    ],
    routePath: defaultRoute
  };

  // State for live GPS movement simulation
  const [currentProgress, setCurrentProgress] = useState(trackingData.progressPercent);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [mapMode, setMapMode] = useState<'google-embed' | 'route-canvas'>('google-embed');
  const [currentCoord, setCurrentCoord] = useState({ lat: trackingData.currentLat, lng: trackingData.currentLng });
  const [liveSpeed, setLiveSpeed] = useState(trackingData.speedKmh);
  const [liveTemp, setLiveTemp] = useState(trackingData.temperatureCelsius || 6.8);

  // Linear GPS interpolation along multi-point route path
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        const next = prev >= 99 ? 15 : prev + 0.4 * speedMultiplier;
        
        // Calculate interpolated Lat/Lng based on progress percentage
        const path = trackingData.routePath;
        const totalSegments = path.length - 1;
        const normalizedProgress = (next / 100) * totalSegments;
        const segmentIndex = Math.min(Math.floor(normalizedProgress), totalSegments - 1);
        const segmentFraction = normalizedProgress - segmentIndex;

        const p1 = path[segmentIndex];
        const p2 = path[segmentIndex + 1] || p1;

        const newLat = p1.lat + (p2.lat - p1.lat) * segmentFraction;
        const newLng = p1.lng + (p2.lng - p1.lng) * segmentFraction;

        setCurrentCoord({
          lat: Number(newLat.toFixed(4)),
          lng: Number(newLng.toFixed(4))
        });

        // Add subtle realistic fluctuation to speed and temperature
        setLiveSpeed(Math.round(48 + Math.sin(next * 0.5) * 8));
        setLiveTemp(Number((6.5 + Math.cos(next * 0.3) * 0.5).toFixed(1)));

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, trackingData.routePath]);

  // Google Maps external navigation URL
  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(trackingData.originName)}&destination=${encodeURIComponent(trackingData.destName)}&travelmode=driving`;

  // Embed URL for real-time Google Map preview
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${currentCoord.lat},${currentCoord.lng}&hl=${lang === 'mr' ? 'mr' : lang === 'hi' ? 'hi' : 'en'}&z=13&output=embed`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Header bar */}
      <div className="bg-emerald-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-700/80 flex items-center justify-center text-emerald-300">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">
                {t.ordersTitle} - #{order.orderNumber}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-emerald-100 animate-pulse">
                ● Live GPS Active
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              {trackingData.originName} ➔ {trackingData.destName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Google Maps button */}
          <a
            id="open-google-maps-ext-btn"
            href={googleMapsNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{t.openGoogleMapsBtn}</span>
          </a>

          {onClose && (
            <button
              onClick={onClose}
              className="text-stone-300 hover:text-white p-1 text-sm font-semibold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Telemetry Strip */}
      <div className="bg-stone-50 border-b border-stone-200 p-3 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-emerald-700" />
          <div>
            <span className="text-stone-500 block">{t.vehicleSpeed}</span>
            <span className="font-bold text-stone-900">{liveSpeed} km/h</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-blue-600" />
          <div>
            <span className="text-stone-500 block">{t.coolingTemp}</span>
            <span className="font-bold text-blue-700">{liveTemp}°C (Optimal 4-10°C)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <div>
            <span className="text-stone-500 block">{t.etaMinutes}</span>
            <span className="font-bold text-stone-900">
              {Math.max(12, Math.round(trackingData.estimatedArrivalMinutes * (1 - currentProgress / 100)))} mins
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-purple-600" />
          <div>
            <span className="text-stone-500 block">{t.distRemaining}</span>
            <span className="font-bold text-stone-900">
              {Math.max(3, Math.round(trackingData.distanceRemainingKm * (1 - currentProgress / 100)))} km
            </span>
          </div>
        </div>
      </div>

      {/* Map Display Options Bar */}
      <div className="p-3 bg-stone-100/70 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            id="toggle-google-embed"
            onClick={() => setMapMode('google-embed')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              mapMode === 'google-embed'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Google Map Live View
          </button>

          <button
            id="toggle-route-canvas"
            onClick={() => setMapMode('route-canvas')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              mapMode === 'route-canvas'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Route GPS Polyline
          </button>
        </div>

        {/* GPS Simulation Controls */}
        <div className="flex items-center gap-2">
          <button
            id="gps-play-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 bg-white hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-700 font-semibold"
            title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            id="gps-speed-btn"
            onClick={() => setSpeedMultiplier(s => (s === 1 ? 2 : s === 2 ? 4 : 1))}
            className="px-2 py-1 bg-white hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-700 font-bold"
            title="Toggle simulation playback speed"
          >
            {speedMultiplier}x Speed
          </button>

          <button
            id="gps-reset-btn"
            onClick={() => setCurrentProgress(10)}
            className="p-1.5 bg-white hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-700"
            title="Reset to Origin"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map Viewer */}
      <div className="relative w-full h-80 sm:h-96 bg-stone-200 overflow-hidden">
        {mapMode === 'google-embed' ? (
          <div className="w-full h-full relative">
            <iframe
              title={`Google Map - Order #${order.orderNumber}`}
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={googleMapsEmbedUrl}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Overlay badge with current coordinate */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-stone-200 shadow-md rounded-xl p-2 text-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
              <div>
                <span className="font-bold text-stone-900 block">
                  GPS: {currentCoord.lat}° N, {currentCoord.lng}° E
                </span>
                <span className="text-stone-500 text-[10px]">
                  Vehicle: {trackingData.vehicleNumber}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* SVG Interactive Route Canvas View */
          <div className="w-full h-full bg-stone-900 p-6 relative flex flex-col justify-between select-none">
            {/* Header info */}
            <div className="flex justify-between items-start text-white text-xs z-10">
              <div>
                <span className="text-emerald-400 font-bold">🛣️ Maharashtra NH-3 & Expressway Corridor</span>
                <p className="text-stone-400 text-[11px] mt-0.5">Farm Gate (Pimpalgaon) ➔ Metro APMC Consumption Dock</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-amber-400">{currentProgress.toFixed(0)}% Completed</span>
              </div>
            </div>

            {/* SVG Visual Route */}
            <div className="relative w-full my-auto py-8">
              <svg className="w-full h-28" viewBox="0 0 800 120" fill="none" preserveAspectRatio="none">
                {/* Background Route Line */}
                <path
                  d="M 40 60 Q 200 10, 400 60 T 760 60"
                  stroke="#374151"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Completed Active Route Segment */}
                <path
                  d="M 40 60 Q 200 10, 400 60 T 760 60"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray="800"
                  strokeDashoffset={800 - (800 * currentProgress) / 100}
                  strokeLinecap="round"
                />

                {/* Origin Marker */}
                <circle cx="40" cy="60" r="10" fill="#059669" />
                <circle cx="40" cy="60" r="5" fill="#ffffff" />

                {/* Waypoint 1: Nashik */}
                <circle cx="210" cy="38" r="6" fill="#4b5563" />

                {/* Waypoint 2: Igatpuri */}
                <circle cx="400" cy="60" r="7" fill={currentProgress >= 50 ? '#10b981' : '#6b7280'} />

                {/* Waypoint 3: Kalyan */}
                <circle cx="580" cy="80" r="6" fill={currentProgress >= 75 ? '#10b981' : '#4b5563'} />

                {/* Destination Marker */}
                <circle cx="760" cy="60" r="10" fill="#f59e0b" />
                <circle cx="760" cy="60" r="5" fill="#ffffff" />
              </svg>

              {/* Animated Moving Truck Indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 flex flex-col items-center"
                style={{
                  left: `calc(${Math.min(94, Math.max(5, currentProgress))}% - 22px)`
                }}
              >
                <div className="w-11 h-11 rounded-full bg-emerald-500 border-2 border-white text-white flex items-center justify-center shadow-lg animate-bounce">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold bg-stone-900/90 text-white px-2 py-0.5 rounded-full border border-stone-700 whitespace-nowrap mt-1">
                  {liveSpeed} km/h
                </span>
              </div>
            </div>

            {/* Waypoint labels */}
            <div className="flex justify-between text-[11px] text-stone-300 font-medium z-10 px-2">
              <div>📍 Pimpalgaon Farm</div>
              <div className="hidden sm:block">🏛️ Nashik Hub</div>
              <div>⛰️ Igatpuri Toll</div>
              <div className="hidden sm:block">🏭 Kalyan Gate</div>
              <div>🏁 Buyer Dock</div>
            </div>
          </div>
        )}
      </div>

      {/* Driver and Consignment Details Footer */}
      <div className="p-4 sm:p-5 bg-white border-t border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Driver Contact Card */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              {trackingData.driverName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-stone-900">{trackingData.driverName}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs text-stone-500 block font-mono">{trackingData.vehicleNumber}</span>
            </div>
          </div>

          <a
            href={`tel:${trackingData.driverPhone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Driver</span>
          </a>
        </div>

        {/* Checkpoints Status */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
          <span className="font-bold text-stone-900 block mb-2">{t.currentCheckpoint}</span>
          <div className="space-y-1.5">
            {trackingData.checkpoints.slice(0, 3).map((cp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    cp.completed
                      ? 'text-emerald-600'
                      : cp.isCurrent
                      ? 'text-amber-500 animate-spin'
                      : 'text-stone-300'
                  }`}
                />
                <span className={`truncate ${cp.isCurrent ? 'font-bold text-emerald-900' : 'text-stone-600'}`}>
                  {cp.title} ({cp.location}) - <span className="text-stone-400">{cp.time}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
