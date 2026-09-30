import React, { useState } from 'react';
import { Search, Filter, ShoppingCart, ShieldCheck, MapPin, Calendar, Sparkles, CheckCircle2, TrendingUp, AlertCircle, Eye, Phone, Tag, Camera } from 'lucide-react';
import { Product, User, Order, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface MarketplaceViewProps {
  products: Product[];
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onPlaceOrder: (orderPayload: any) => Promise<void>;
  onOpenAddProductModal: () => void;
  onOpenCropPhotoModal: (product: Product) => void;
  onOpenCropLightbox: (product: Product) => void;
  lang: Language;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  products,
  currentUser,
  onOpenAuthModal,
  onPlaceOrder,
  onOpenAddProductModal,
  onOpenCropPhotoModal,
  onOpenCropLightbox,
  lang
}) => {
  const t = getTranslation(lang);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [organicOnly, setOrganicCertified] = useState(false);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<Product | null>(null);
  const [orderQuantity, setOrderQuantity] = useState('20');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '');
  const [deliveryPincode, setDeliveryPincode] = useState(currentUser?.pincode || '400001');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'UPI / Bank Transfer' | 'Escrow Guarantee'>('UPI / Bank Transfer');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState('');

  const categories = ['All', 'Vegetables', 'Leafy Greens', 'Fruits', 'Grains & Pulses', 'Spices'];

  const filteredProducts = products.filter(p => {
    const matchSearch =
      p.cropName.toLowerCase().includes(search.toLowerCase()) ||
      p.variety.toLowerCase().includes(search.toLowerCase()) ||
      p.farmerLocation.toLowerCase().includes(search.toLowerCase()) ||
      p.farmerName.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchOrganic = !organicOnly || p.organicCertified;
    return matchSearch && matchCat && matchOrganic;
  });

  const handleOpenOrderModal = (product: Product) => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    setSelectedProductForOrder(product);
    // Set smart initial quantity: if bulk buyer, set 100kg, if customer set 10kg
    const defaultQty = currentUser.role === 'bulk_buyer' ? Math.max(100, product.minOrderKg) : Math.max(5, product.minOrderKg);
    setOrderQuantity(String(defaultQty));
    setDeliveryAddress(currentUser.address || '');
    setDeliveryPincode(currentUser.pincode || '400001');
    setOrderSuccessMessage('');
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForOrder || !currentUser) return;

    const qty = Number(orderQuantity);
    if (qty <= 0) return;
    if (qty > selectedProductForOrder.quantityKg) {
      alert(`Only ${selectedProductForOrder.quantityKg} kg available in stock.`);
      return;
    }

    setOrderSubmitting(true);
    try {
      const orderPayload = {
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        buyerMobile: currentUser.mobile,
        buyerRole: currentUser.role,
        deliveryAddress: deliveryAddress.trim() || 'Direct Farm Pickup Gate',
        deliveryPincode: deliveryPincode.trim(),
        paymentMethod,
        specialInstructions,
        items: [
          {
            productId: selectedProductForOrder.id,
            cropName: selectedProductForOrder.cropName,
            farmerId: selectedProductForOrder.farmerId,
            farmerName: selectedProductForOrder.farmerName,
            quantityKg: qty,
            pricePerKg: selectedProductForOrder.pricePerKg,
            subtotal: qty * selectedProductForOrder.pricePerKg,
            imageUrl: selectedProductForOrder.images[0]
          }
        ]
      };

      await onPlaceOrder(orderPayload);
      setOrderSuccessMessage(`Order placed successfully! Total: ₹${qty * selectedProductForOrder.pricePerKg}`);
      setTimeout(() => {
        setSelectedProductForOrder(null);
        setOrderSuccessMessage('');
      }, 2000);
    } catch (err: any) {
      alert('Failed to submit order. Please try again.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div id="marketplace-view-container" className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            id="marketplace-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search farm fresh vegetables, tomatoes, onions, potatoes, location..."
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Category Pills & Organic Checkbox */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 cursor-pointer select-none">
            <input
              id="organic-filter-checkbox"
              type="checkbox"
              checked={organicOnly}
              onChange={(e) => setOrganicCertified(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            🌿 Organic Only
          </label>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const farmerGainVsMandiPercent = Math.round(
            ((product.pricePerKg - product.marketMandiPricePerKg) / product.marketMandiPricePerKg) * 100
          );
          const buyerSavingsPerKg = Math.max(0, product.retailPricePerKg - product.pricePerKg);

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-xs hover:shadow-md transition-shadow border border-gray-200 overflow-hidden flex flex-col group"
            >
              {/* Product Image */}
              <div
                onClick={() => onOpenCropLightbox(product)}
                className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100 cursor-pointer"
                title={lang === 'mr' ? 'पिकाचे सर्व फोटो व तपशील पहा' : 'View full photos & harvest details'}
              >
                <img
                  src={product.images[0]}
                  alt={product.cropName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />

                {/* Grade and Organic Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/95 text-emerald-950 backdrop-blur-xs shadow-xs border border-gray-200">
                    {product.grade.split(' ')[0]} {product.grade.split(' ')[1]}
                  </span>
                  {product.organicCertified && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-700 text-white shadow-xs flex items-center gap-1">
                      🌿 100% Organic
                    </span>
                  )}
                </div>

                {/* Crop Photo Count Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCropLightbox(product);
                  }}
                  className="absolute bottom-2.5 left-2.5 bg-black/75 hover:bg-black text-white text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md cursor-pointer transition-colors backdrop-blur-xs"
                >
                  <Camera className="w-3 h-3 text-amber-300" />
                  <span>{product.images?.length || 1} {lang === 'mr' ? 'फोटो' : 'Photos'}</span>
                </button>

                {/* Direct Farmer Badge */}
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-amber-400 text-emerald-950 shadow-md">
                    +{farmerGainVsMandiPercent}% Over Mandi
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-base group-hover:text-emerald-800 transition-colors">
                      {product.cropName}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    Variety: <span className="text-gray-700 font-semibold">{product.variety}</span>
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{product.farmerLocation}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-emerald-800 font-semibold truncate">{product.farmerName}</span>
                  </div>

                  {/* Pricing Comparison Module */}
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 mb-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-gray-500 font-medium block">Direct Farm Rate:</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-emerald-900 font-mono">
                            ₹{product.pricePerKg}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">/ kg</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-gray-400 line-through block font-mono">
                          Retail: ₹{product.retailPricePerKg}/kg
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          Save ₹{buyerSavingsPerKg}/kg!
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-gray-600">
                      <span>APMC Mandi Base: ₹{product.marketMandiPricePerKg}/kg</span>
                      <span className="text-emerald-800 font-semibold">Min Order: {product.minOrderKg} kg</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {product.description}
                  </p>
                </div>

                {/* Stock & Action */}
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pt-2 border-t border-gray-100">
                    <span className="font-semibold text-gray-800">
                      Available: <span className="text-emerald-800 font-bold font-mono">{product.quantityKg.toLocaleString()} kg</span>
                    </span>
                    <span className="text-[11px]">Harvest: {product.harvestDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`buy-direct-btn-${product.id}`}
                      onClick={() => handleOpenOrderModal(product)}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {currentUser?.role === 'bulk_buyer' ? t.placeBulkOrder : t.buyDirect}
                    </button>

                    <a
                      href={`tel:${product.farmerMobile}`}
                      className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors shrink-0"
                      title={t.directContact}
                    >
                      <Phone className="w-4 h-4 text-emerald-700" />
                    </a>
                  </div>

                  {/* Farmer Crop Photos Action */}
                  {currentUser?.role === 'farmer' && (
                    <button
                      type="button"
                      onClick={() => onOpenCropPhotoModal(product)}
                      className="w-full mt-2 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{lang === 'mr' ? '📸 पिकाचे फोटो बदला / जोडा' : lang === 'hi' ? '📸 फसल की तस्वीरें जोड़ें' : '📸 Add / Manage Crop Photos'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No Farm Produce Matches Your Search</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try adjusting filters or categories. Farmers add fresh morning harvests continuously.
          </p>
        </div>
      )}

      {/* Order Placement & Delivery Address Confirmation Modal */}
      {selectedProductForOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 my-6">
            <div className="bg-emerald-900 text-white p-4 px-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Confirm Farm-Direct Order</h3>
                <p className="text-xs text-emerald-200">
                  Direct connection with {selectedProductForOrder.farmerName}
                </p>
              </div>
              <button
                onClick={() => setSelectedProductForOrder(null)}
                className="text-white/80 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmOrder} className="p-6 space-y-4 text-xs sm:text-sm">
              {orderSuccessMessage ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-bold text-base">{orderSuccessMessage}</div>
                  <p className="text-xs text-emerald-700">
                    Order confirmed and dispatched to farmer for immediate packing.
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary of Selected Crop */}
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <img
                      src={selectedProductForOrder.images[0]}
                      alt={selectedProductForOrder.cropName}
                      className="w-14 h-14 object-cover rounded-lg border border-gray-300 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{selectedProductForOrder.cropName}</div>
                      <div className="text-xs text-gray-500">{selectedProductForOrder.variety} • {selectedProductForOrder.farmerLocation}</div>
                      <div className="font-mono font-bold text-emerald-800 text-sm mt-0.5">
                        ₹{selectedProductForOrder.pricePerKg} / kg
                      </div>
                    </div>
                  </div>

                  {/* Quantity selection */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-gray-800">Order Quantity (kg) *</label>
                      <span className="text-[11px] text-gray-500">
                        Min: {selectedProductForOrder.minOrderKg} kg • Stock: {selectedProductForOrder.quantityKg} kg
                      </span>
                    </div>
                    <input
                      id="order-modal-quantity-input"
                      type="number"
                      min={selectedProductForOrder.minOrderKg}
                      max={selectedProductForOrder.quantityKg}
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(e.target.value)}
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-xl font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Delivery Address Field (Requested: bulk buyer & customer can add delivery address) */}
                  <div>
                    <label className="font-bold text-gray-800 block mb-1">
                      Delivery Address & Warehouse / Destination *
                    </label>
                    <textarea
                      id="order-modal-address-input"
                      required
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter flat / society / warehouse dock number, landmark, city"
                      className="w-full p-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-medium text-gray-700 block mb-1">Delivery Pincode</label>
                      <input
                        id="order-modal-pincode-input"
                        type="text"
                        value={deliveryPincode}
                        onChange={(e) => setDeliveryPincode(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 block mb-1">Payment Protection</label>
                      <select
                        id="order-modal-payment-select"
                        value={paymentMethod}
                        onChange={(e: any) => setPaymentMethod(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-xl bg-white"
                      >
                        <option value="UPI / Bank Transfer">UPI / Instant Bank</option>
                        <option value="Cash on Delivery">Cash on Delivery</option>
                        <option value="Escrow Guarantee">Escrow Protection (Bulk)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-gray-700 block mb-1">Special Handling / Gate Entry Notes</label>
                    <input
                      id="order-modal-instructions-input"
                      type="text"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g. Please check freshness upon arrival, morning delivery preferred"
                      className="w-full p-2 text-xs border border-gray-300 rounded-xl"
                    />
                  </div>

                  {/* Financial Bill & Savings breakdown */}
                  <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 space-y-1.5 font-medium text-xs text-gray-700">
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span>₹{selectedProductForOrder.pricePerKg} × {orderQuantity} kg</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-semibold">
                      <span>Your Direct Savings vs Retail:</span>
                      <span>
                        -₹{(Math.max(0, selectedProductForOrder.retailPricePerKg - selectedProductForOrder.pricePerKg) * Number(orderQuantity)).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-emerald-950 pt-1.5 border-t border-emerald-200">
                      <span>Total Payable:</span>
                      <span className="font-mono text-base">
                        ₹{(selectedProductForOrder.pricePerKg * Number(orderQuantity)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setSelectedProductForOrder(null)}
                      className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      id="order-modal-confirm-btn"
                      type="submit"
                      disabled={orderSubmitting}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                    >
                      {orderSubmitting ? 'Confirming Order...' : 'Confirm Direct Purchase'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
