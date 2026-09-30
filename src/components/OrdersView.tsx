/**
 * =========================================================================================
 * SetiMitra (शेतीमित्र) - Direct Trade Orders & Live Google Map Delivery Tracker
 * =========================================================================================
 * 
 * Capabilities:
 *   1. Displays direct orders placed by Bulk Buyers and Consumers from Farmers/FPOs.
 *   2. Real-time Google Map Order Tracker modal with animated live vehicle GPS simulation.
 *   3. Route polyline visualization, distance remaining, driver contacts, and reefer temperature.
 *   4. Order status transitions (Pending -> Accepted -> Dispatched -> Delivered).
 *   5. Full Trilingual localization (मराठी / हिंदी / English).
 * =========================================================================================
 */

import React, { useState } from 'react';
import {
  PackageCheck,
  MapPin,
  Truck,
  CheckCircle,
  ShoppingBag,
  Navigation,
  X,
  ExternalLink,
  Clock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Order, User as UserType, Language, OrderDeliveryTracking } from '../types';
import { GoogleMapOrderTracker } from './GoogleMapOrderTracker';
import { getTranslation } from '../utils/translations';

interface OrdersViewProps {
  orders: Order[];
  currentUser: UserType | null;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  onOpenAuthModal: () => void;
  lang: Language;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  currentUser,
  onUpdateOrderStatus,
  onOpenAuthModal,
  lang
}) => {
  const [filterRole, setFilterRole] = useState<'all' | 'my'>('all');
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const t = getTranslation(lang);

  // Filter orders relevant to current user
  const displayedOrders = orders.filter((o) => {
    if (filterRole === 'my' && currentUser) {
      if (currentUser.role === 'farmer') {
        return o.items.some((i) => i.farmerId === currentUser.id || i.farmerName === currentUser.name);
      } else {
        return o.buyerId === currentUser.id || o.buyerMobile === currentUser.mobile;
      }
    }
    return true;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            ✓ Delivered
          </span>
        );
      case 'dispatched':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
            <Truck className="w-3 h-3" /> Dispatched
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            ⚡ Accepted
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-300">
            ⏳ Pending
          </span>
        );
    }
  };

  return (
    <div id="orders-view-container" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-700" />
            {t.tabOrders} & {t.liveGpsTracking}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Transparent direct farm trade with live Google Map consignment delivery tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser && (
            <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterRole('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterRole === 'all' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterRole('my')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterRole === 'my' ? 'bg-white text-emerald-900 font-bold shadow-xs' : 'text-stone-600'
                }`}
              >
                My Orders
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {displayedOrders.map((order) => {
          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-xs border border-stone-200 p-5 space-y-4 hover:border-emerald-300 transition-colors"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">{order.orderDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
                    Payment: <span className="font-semibold text-stone-800">{order.paymentMethod}</span>
                  </span>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.cropName}
                        className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-stone-900">{item.cropName}</span>
                        <span className="font-mono font-bold text-emerald-900 text-sm">
                          ₹{item.subtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 flex items-center justify-between mt-0.5">
                        <span>
                          Producer: <span className="font-medium text-emerald-800">{item.farmerName}</span>
                        </span>
                        <span>
                          {item.quantityKg} kg @ ₹{item.pricePerKg}/kg
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Address & Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
                <div>
                  <span className="text-stone-500 block mb-0.5 font-medium">Consignee / Buyer:</span>
                  <div className="font-bold text-stone-900">{order.buyerName}</div>
                  <div className="text-stone-600">📱 +91 {order.buyerMobile} ({order.buyerRole.replace('_', ' ')})</div>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-stone-500 block mb-0.5 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    Delivery Destination / Warehouse Address:
                  </span>
                  <div className="font-semibold text-stone-800">{order.deliveryAddress}</div>
                  <div className="text-stone-500 text-[11px]">Pincode: {order.deliveryPincode}</div>
                </div>
              </div>

              {/* Total, Google Maps Tracking Button & Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div>
                  <span className="text-xs text-stone-500 block">Total Transaction Value:</span>
                  <span className="text-lg font-black text-emerald-950 font-mono">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Google Map Order Tracker Button */}
                  <button
                    id={`track-map-${order.id}`}
                    onClick={() => setSelectedOrderForTracking(order)}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t.trackOnGoogleMap}</span>
                  </button>

                  {/* Status transitions */}
                  {order.status === 'pending' && (
                    <button
                      id={`accept-order-${order.id}`}
                      onClick={() => onUpdateOrderStatus(order.id, 'accepted')}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Accept Direct Order
                    </button>
                  )}

                  {order.status === 'accepted' && (
                    <button
                      id={`dispatch-order-${order.id}`}
                      onClick={() => onUpdateOrderStatus(order.id, 'dispatched')}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Mark Dispatched (Assign Vehicle)
                    </button>
                  )}

                  {order.status === 'dispatched' && (
                    <button
                      id={`deliver-order-${order.id}`}
                      onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark Delivered & Release Payment
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {displayedOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <div className="font-bold text-stone-800 text-base">No Orders in System</div>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
              In fresh mode, no demo orders exist. Place a fresh direct order from the Marketplace or reload sample data from the top bar.
            </p>
          </div>
        )}
      </div>

      {/* Google Map Order Tracking Modal */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-emerald-700" />
                  {t.liveGpsTracking} — {selectedOrderForTracking.orderNumber}
                </h3>
                <p className="text-xs text-stone-500">
                  Real-time GPS vehicle positioning with Google Map navigation
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Render interactive Google Map Order Tracker */}
            <GoogleMapOrderTracker
              order={selectedOrderForTracking}
              lang={lang}
              onClose={() => setSelectedOrderForTracking(null)}
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
