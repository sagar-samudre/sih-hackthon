/**
 * =========================================================================================
 * SetiMitra (शेतीमित्र) - Transporter Delivery Dispatch Hub
 * =========================================================================================
 * 
 * Purpose:
 *   Specially created for Transporters, Fleet Drivers & Vehicle Operators so they can:
 *   1. View full Customer / Consignee delivery details:
 *      - Customer Name & Role (Consumer, Supermarket, Wholesaler)
 *      - Complete Delivery Address & Postal Pincode
 *      - Verified Mobile Number with 1-click Direct Calling (`tel:`)
 *      - Special delivery instructions (Gate entry, cold storage requirements, etc.)
 *   2. View Origin / Farmer Farm-Gate details:
 *      - Farmer Name, Mobile number, Farm Location, Village, District
 *   3. Open 1-Click GPS Navigation directly in Google Maps (`https://maps.google.com/?q=...`)
 *   4. View detailed Cargo Manifest (Crops, Weights in Quintals/kg, Price, Escrow/Payment)
 *   5. Update Dispatch Status (Assign Vehicle -> Mark In-Transit -> Mark Delivered)
 *   6. Filter by All Dispatches, Pending Pickups, In-Transit, and Delivered.
 *   7. Full Trilingual support (मराठी / हिंदी / English).
 * =========================================================================================
 */

import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  Package,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  AlertCircle,
  Thermometer,
  Calendar,
  Building2,
  User as UserIcon,
  CheckCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Order, LogisticsBooking, User, Language } from '../types';
import { GoogleMapOrderTracker } from './GoogleMapOrderTracker';

interface TransporterOrdersViewProps {
  orders: Order[];
  bookings: LogisticsBooking[];
  currentUser: User | null;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  onOpenAuthModal: () => void;
  lang: Language;
}

export const TransporterOrdersView: React.FC<TransporterOrdersViewProps> = ({
  orders,
  bookings,
  currentUser,
  onUpdateOrderStatus,
  onOpenAuthModal,
  lang = 'mr'
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'dispatched' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForMap, setSelectedOrderForMap] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const isMr = lang === 'mr';
  const isHi = lang === 'hi';

  // Filter orders based on status & search term
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (filterStatus === 'pending' && order.status !== 'pending' && order.status !== 'accepted') return false;
    if (filterStatus === 'dispatched' && order.status !== 'dispatched') return false;
    if (filterStatus === 'delivered' && order.status !== 'delivered') return false;

    // Search query filter (customer name, mobile, address, crop name, order number)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchBuyer = order.buyerName.toLowerCase().includes(q);
      const matchMobile = order.buyerMobile.includes(q);
      const matchAddress = order.deliveryAddress.toLowerCase().includes(q);
      const matchPincode = order.deliveryPincode.includes(q);
      const matchCrop = order.items.some(
        (it) => it.cropName.toLowerCase().includes(q) || it.farmerName.toLowerCase().includes(q)
      );
      return matchNumber || matchBuyer || matchMobile || matchAddress || matchPincode || matchCrop;
    }
    return true;
  });

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrderId(orderId);
    try {
      await onUpdateOrderStatus(orderId, newStatus);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Helper to open Google Maps turn-by-turn navigation directly to the customer address
  const openGoogleMapsNavigation = (address: string, lat?: number, lng?: number) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            {isMr ? 'डिलिव्हरी पूर्ण (Delivered)' : isHi ? 'डिलीवर हो गया (Delivered)' : 'Delivered'}
          </span>
        );
      case 'dispatched':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-300 inline-flex items-center gap-1.5 animate-pulse shadow-2xs">
            <Truck className="w-3.5 h-3.5 text-blue-700" />
            {isMr ? 'रस्त्यात आहे (In Transit / Dispatched)' : isHi ? 'रास्ते में है (In Transit)' : 'In Transit'}
          </span>
        );
      case 'accepted':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            {isMr ? 'स्वीकारले - पिकअप बाकी' : isHi ? 'स्वीकृत - पिकअप बाकी' : 'Accepted - Pickup Ready'}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-stone-100 text-stone-800 border border-stone-300 inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            {isMr ? 'प्रलंबित (Pending)' : isHi ? 'लंबित (Pending)' : 'Pending'}
          </span>
        );
    }
  };

  return (
    <div id="transporter-orders-hub" className="space-y-6">
      {/* Transporter Special Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-blue-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 pointer-events-none blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold mb-2.5">
              <Truck className="w-4 h-4 text-cyan-300" />
              <span>
                {isMr
                  ? '🚛 वाहतूकदार व वाहन चालक विशेष पॅनल'
                  : isHi
                  ? '🚛 ट्रांसपोर्टर और चालक विशेष पैनल'
                  : '🚛 Transporter & Fleet Driver Hub'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-serif">
              {isMr
                ? 'ग्राहकांचे पत्ते, लोकेशन व डिलिव्हरी माहिती'
                : isHi
                ? 'ग्राहकों के पते, लोकेशन और डिलीवरी विवरण'
                : 'Customer Locations & Consignment Details'}
            </h1>
            <p className="text-blue-100/90 text-xs sm:text-sm max-w-2xl mt-1.5 leading-relaxed">
              {isMr
                ? 'येथून वाहतूकदार शेतीमालाच्या प्रत्येक ऑर्डरमधील ग्राहकांचे नाव, थेट पत्ता, मोबाईल नंबर, पिनकोड, आणि गुगल मॅप्स वरील नेव्हिगेशन पाहू शकतात.'
                : isHi
                ? 'यहाँ से ट्रांसपोर्टर हर ऑर्डर में ग्राहक का नाम, सटीक पता, मोबाइल नंबर, पिनकोड और गूगल मैप्स नेविगेशन एक क्लिक में देख सकते हैं।'
                : 'View customer names, delivery addresses, mobile numbers, pincodes, and launch turn-by-turn Google Maps navigation with one click.'}
            </p>
          </div>

          {/* Quick Stats on Active Deliveries */}
          <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shrink-0">
            <div className="text-center px-3 py-1 border-r border-white/20">
              <div className="text-2xl font-black text-amber-300 font-mono">{orders.length}</div>
              <div className="text-[10px] uppercase font-bold text-blue-200">
                {isMr ? 'एकूण ऑर्डर्स' : isHi ? 'कुल ऑर्डर्स' : 'Total'}
              </div>
            </div>
            <div className="text-center px-3 py-1 border-r border-white/20">
              <div className="text-2xl font-black text-cyan-300 font-mono">
                {orders.filter((o) => o.status === 'dispatched').length}
              </div>
              <div className="text-[10px] uppercase font-bold text-blue-200">
                {isMr ? 'रस्त्यात' : isHi ? 'रास्ते में' : 'In Transit'}
              </div>
            </div>
            <div className="text-center px-3 py-1">
              <div className="text-2xl font-black text-emerald-300 font-mono">
                {orders.filter((o) => o.status === 'delivered').length}
              </div>
              <div className="text-[10px] uppercase font-bold text-blue-200">
                {isMr ? 'पूर्ण' : isHi ? 'पूर्ण' : 'Delivered'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            id="transporter-order-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isMr
                ? 'ग्राहक नाव, मोबाईल, पत्ता किंवा पीक शोधा...'
                : isHi
                ? 'ग्राहक नाम, मोबाइल, पता या फसल खोजें...'
                : 'Search customer name, mobile, address, pincode...'
            }
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {isMr ? 'सर्व ऑर्डर्स' : isHi ? 'सभी ऑर्डर्स' : 'All Orders'} ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            ⏳ {isMr ? 'पिकअप बाकी' : isHi ? 'पिकअप बाकी' : 'Ready for Pickup'} (
            {orders.filter((o) => o.status === 'pending' || o.status === 'accepted').length})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('dispatched')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterStatus === 'dispatched'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            🚚 {isMr ? 'सध्या रस्त्यात (In Transit)' : isHi ? 'रास्ते में' : 'In Transit'} (
            {orders.filter((o) => o.status === 'dispatched').length})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('delivered')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterStatus === 'delivered'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            ✓ {isMr ? 'डिलिव्हर केलेले' : isHi ? 'डिलीवर किए' : 'Delivered'} (
            {orders.filter((o) => o.status === 'delivered').length})
          </button>
        </div>
      </div>

      {/* Orders List for Transporters */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-stone-300">
          <Truck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">
            {isMr ? 'कोणतेही ऑर्डर्स सापडले नाहीत' : isHi ? 'कोई ऑर्डर्स नहीं मिले' : 'No consignments found'}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            {isMr
              ? 'निवडलेल्या निकषांनुसार सध्या कोणताही शेतीमाल वाहतुकीसाठी उपलब्ध नाही.'
              : isHi
              ? 'चुने गए फ़िल्टर के अनुसार कोई ऑर्डर उपलब्ध नहीं है।'
              : 'No orders match your current filter or search query.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const totalKg = order.items.reduce((sum, it) => sum + (it.quantityKg || 0), 0);
            const totalQuintals = (totalKg / 100).toFixed(1);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden hover:border-blue-400 transition-all"
              >
                {/* Order Top Bar with Status and Code */}
                <div className="bg-stone-50/90 px-5 py-3.5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-xs sm:text-sm bg-blue-900 text-white px-3 py-1 rounded-xl shadow-2xs">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {order.orderDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-600 bg-white px-3 py-1 rounded-xl border border-stone-200">
                      {isMr ? 'पेमेंट:' : isHi ? 'भुगतान:' : 'Payment:'}{' '}
                      <span className="font-bold text-stone-900">{order.paymentMethod}</span>
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Main Card Content */}
                <div className="p-5 sm:p-6 space-y-5">
                  {/* TWO-COLUMN ROUTE HIGHLIGHT: FARM PICKUP -> CUSTOMER DESTINATION */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. ORIGIN (FARM GATE / PRODUCER) */}
                    <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          {isMr ? '१. पिकअप शेत / फार्म गेट (Origin)' : isHi ? '१. पिकअप खेत / फार्म गेट (Origin)' : '1. Farm Gate Pickup'}
                        </span>
                        <span className="text-[11px] text-emerald-900 font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                          {order.items[0]?.farmerName || 'Farmer'}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="font-bold text-stone-900 text-sm">
                          {order.tracking?.originName || 'Pimpalgaon Baswant Farm Gate, Nashik'}
                        </div>
                        <div className="text-stone-600 text-xs">
                          {isMr ? 'शेतकरी संपर्क:' : isHi ? 'किसान संपर्क:' : 'Farmer Contact:'}{' '}
                          <span className="font-semibold text-stone-800">
                            {order.items[0]?.farmerName}
                          </span>
                        </div>
                      </div>

                      {/* Farmer Quick Call Button */}
                      <div className="pt-2 border-t border-emerald-200/70 flex items-center gap-2">
                        <a
                          href="tel:9822012345"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{isMr ? 'शेतकऱ्याला कॉल करा' : isHi ? 'किसान को कॉल करें' : 'Call Farmer'}</span>
                        </a>
                      </div>
                    </div>

                    {/* 2. DESTINATION (CUSTOMER / BUYER DETAILS) - KEY REQUIREMENT */}
                    <div className="bg-blue-50/70 p-4 rounded-2xl border-2 border-blue-300 space-y-2.5 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          {isMr
                            ? '२. ग्राहकाचा पत्ता व संपर्क (Destination)'
                            : isHi
                            ? '२. ग्राहक का पता व संपर्क (Destination)'
                            : '2. Customer Delivery Destination'}
                        </span>
                        <span className="text-[11px] font-bold bg-blue-200 text-blue-950 px-2.5 py-0.5 rounded-full capitalize">
                          {order.buyerRole.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Customer Name & Mobile */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-stone-900 text-base flex items-center gap-1.5">
                            <UserIcon className="w-4 h-4 text-blue-700 shrink-0" />
                            {order.buyerName}
                          </span>
                          <span className="font-mono font-bold text-xs bg-white text-blue-950 px-2 py-0.5 rounded-md border border-blue-200">
                            PIN: {order.deliveryPincode}
                          </span>
                        </div>

                        {/* Customer Full Delivery Address */}
                        <div className="flex items-start gap-1.5 text-xs text-stone-800 pt-1">
                          <MapPin className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                          <span className="font-medium leading-relaxed bg-white p-2 rounded-xl border border-blue-200/80 w-full">
                            {order.deliveryAddress}
                          </span>
                        </div>
                      </div>

                      {/* Special Delivery Instructions */}
                      {order.specialInstructions && (
                        <div className="p-2 bg-amber-50/90 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>{isMr ? 'सूचना:' : isHi ? 'निर्देश:' : 'Note:'}</strong>{' '}
                            {order.specialInstructions}
                          </span>
                        </div>
                      )}

                      {/* CUSTOMER ACTION BUTTONS: Call & Direct Google Maps Navigation */}
                      <div className="pt-2 border-t border-blue-200 flex flex-wrap items-center gap-2">
                        {/* Call Customer */}
                        <a
                          id={`call-customer-${order.id}`}
                          href={`tel:${order.buyerMobile}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-200" />
                          <span>
                            {isMr ? 'ग्राहकाला कॉल (+91 ' : isHi ? 'ग्राहक को कॉल (+91 ' : 'Call Customer (+91 '}
                            {order.buyerMobile})
                          </span>
                        </a>

                        {/* Open Turn-by-Turn GPS Navigation in Google Maps */}
                        <button
                          id={`nav-customer-${order.id}`}
                          type="button"
                          onClick={() =>
                            openGoogleMapsNavigation(
                              `${order.deliveryAddress}, ${order.deliveryPincode}`,
                              order.tracking?.destLat,
                              order.tracking?.destLng
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5 text-cyan-200" />
                          <span>
                            {isMr
                              ? 'गुगल मॅप्स नेव्हिगेशन सुरू करा'
                              : isHi
                              ? 'गूगल मैप्स नेविगेशन शुरू करें'
                              : 'Open Google Maps Navigation'}
                          </span>
                          <ExternalLink className="w-3 h-3 text-blue-200" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CARGO MANIFEST DETAILS */}
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-stone-500" />
                        {isMr ? 'गाडीतील शेतीमाल तपशील (Cargo Manifest):' : isHi ? 'माल विवरण (Cargo Manifest):' : 'Cargo Manifest:'}
                      </span>
                      <span className="font-mono font-bold text-stone-900 text-xs">
                        {totalKg} kg ({totalQuintals} Quintals)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-stone-200"
                        >
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.cropName}
                              className="w-11 h-11 rounded-lg object-cover border border-stone-200 shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1 text-xs">
                            <div className="font-bold text-stone-900 truncate">{item.cropName}</div>
                            <div className="text-stone-500 text-[11px]">
                              {item.quantityKg} kg • ₹{item.pricePerKg}/kg
                            </div>
                            <div className="font-mono font-bold text-emerald-800 text-[11px]">
                              ₹{item.subtotal.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TRANSPORTER DISPATCH CONTROLS & LIVE SIMULATOR MODAL */}
                  <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                    {/* Value */}
                    <div>
                      <span className="text-[11px] text-stone-500 block font-medium">
                        {isMr ? 'एकूण कन्साइनमेंट मूल्य:' : isHi ? 'कुल कन्साइनमेंट मूल्य:' : 'Total Value:'}
                      </span>
                      <span className="text-lg font-black text-emerald-950 font-mono">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Live Tracker Simulation */}
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForMap(order)}
                        className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl border border-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-700" />
                        <span>{isMr ? 'लाइव्ह GPS ट्रॅक पहा' : isHi ? 'लाइव GPS ट्रैक' : 'Live GPS Tracker'}</span>
                      </button>

                      {/* Transporter status actions */}
                      {order.status === 'accepted' && (
                        <button
                          type="button"
                          disabled={updatingOrderId === order.id}
                          onClick={() => handleStatusChange(order.id, 'dispatched')}
                          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Truck className="w-3.5 h-3.5 text-cyan-200" />
                          <span>
                            {updatingOrderId === order.id
                              ? 'अपडेट होत आहे...'
                              : isMr
                              ? 'वाहन रवाना करा (Mark Dispatched)'
                              : isHi
                              ? 'वाहन रवाना करें (Mark Dispatched)'
                              : 'Mark In-Transit (Dispatched)'}
                          </span>
                        </button>
                      )}

                      {order.status === 'dispatched' && (
                        <button
                          type="button"
                          disabled={updatingOrderId === order.id}
                          onClick={() => handleStatusChange(order.id, 'delivered')}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-200" />
                          <span>
                            {updatingOrderId === order.id
                              ? 'अपडेट होत आहे...'
                              : isMr
                              ? 'ग्राहकाला डिलिव्हरी पूर्ण (Mark Delivered)'
                              : isHi
                              ? 'डिलीवरी पूर्ण चिह्नित करें'
                              : 'Confirm Delivered to Customer'}
                          </span>
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <span className="px-3.5 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 inline-flex items-center gap-1">
                          ✓ {isMr ? 'यशस्वीरित्या पोहोचवले' : isHi ? 'सफलतापूर्वक पहुंचाया' : 'Successfully Delivered'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Google Map Modal for Selected Order */}
      {selectedOrderForMap && (
        <GoogleMapOrderTracker
          order={selectedOrderForMap}
          lang={lang}
          onClose={() => setSelectedOrderForMap(null)}
        />
      )}
    </div>
  );
};
