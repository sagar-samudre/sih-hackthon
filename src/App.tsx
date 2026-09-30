/**
 * =========================================================================================
 * SetiMitra (शेतीमित्र) - Direct Digital Agriculture Marketplace
 * =========================================================================================
 * 
 * Main Application Hub:
 *   - Problem Statement: Multiple intermediaries reduce farmer earnings and increase consumer prices.
 *   - Solution Provided:
 *       1. Connects farmers/FPOs directly with consumers and bulk buyers (Marketplace).
 *       2. Live APMC Mandi Market Prices for all vegetables (AgMarkNet daily feed contrast).
 *       3. Cold chain logistics & refrigerated fleet support.
 *       4. In-browser Trained Machine Learning (ML) Model Studio for agricultural price prediction.
 *       5. Real-time Google Maps Consignment & Delivery Vehicle GPS Tracking.
 *       6. Trilingual localization in Marathi (मराठी), Hindi (हिंदी), and English (EN).
 *       7. Role-based Authentication for Farmers, Bulk Buyers, and Consumers with dropdown profile.
 *       8. High-Resolution Crop Camera & Gallery Photo Uploads with Multi-Image Lightbox.
 * =========================================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Product,
  MandiPriceItem,
  LogisticsVehicle,
  LogisticsBooking,
  Order,
  Language
} from './types';
import { Navbar, NavTab } from './components/Navbar';
import { IntermediarySavingsBanner } from './components/IntermediarySavingsBanner';
import { MarketplaceView } from './components/MarketplaceView';
import { LiveMandiPricesView } from './components/LiveMandiPricesView';
import { MLModelView } from './components/MLModelView';
import { LogisticsView } from './components/LogisticsView';
import { TransporterOrdersView } from './components/TransporterOrdersView';
import { OrdersView } from './components/OrdersView';
import { AuthModal } from './components/AuthModal';
import { AddProductModal } from './components/AddProductModal';
import { ProfileModal } from './components/ProfileModal';
import { CropPhotoModal } from './components/CropPhotoModal';
import { CropLightboxModal } from './components/CropLightboxModal';
import { getTranslation } from './utils/translations';
import { SAMPLE_USERS, SAMPLE_PRODUCTS } from './data/mockDatabase';

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<NavTab>('marketplace');

  // Trilingual state (Marathi, Hindi, English) - default to Marathi as requested
  const [lang, setLang] = useState<Language>('mr');
  const t = getTranslation(lang);

  // Authenticated user state (initialized to Farmer Ramesh Patil for immediate access)
  const [currentUser, setCurrentUser] = useState<User | null>(SAMPLE_USERS[0]);

  // Application Data States
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [mandiPrices, setMandiPrices] = useState<MandiPriceItem[]>([]);
  const [vehicles, setVehicles] = useState<LogisticsVehicle[]>([]);
  const [bookings, setBookings] = useState<LogisticsBooking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Crop photo management modals
  const [cropPhotoModalOpen, setCropPhotoModalOpen] = useState(false);
  const [selectedCropForPhotos, setSelectedCropForPhotos] = useState<Product | null>(null);

  // Crop lightbox modal
  const [lightboxModalOpen, setLightboxModalOpen] = useState(false);
  const [selectedCropForLightbox, setSelectedCropForLightbox] = useState<Product | null>(null);

  // Fetch initial data from Express backend
  const fetchData = async () => {
    try {
      const [prodRes, mandiRes, vehRes, bookRes, ordRes] = await Promise.all([
        fetch('/api/products').then(r => r.json()).catch(() => null),
        fetch('/api/mandi-prices').then(r => r.json()).catch(() => null),
        fetch('/api/logistics/vehicles').then(r => r.json()).catch(() => null),
        fetch('/api/logistics/bookings').then(r => r.json()).catch(() => null),
        fetch('/api/orders').then(r => r.json()).catch(() => null)
      ]);

      if (Array.isArray(prodRes)) {
        setProducts(prodRes);
      } else if (prodRes?.products && Array.isArray(prodRes.products)) {
        setProducts(prodRes.products);
      }

      if (Array.isArray(mandiRes)) {
        setMandiPrices(mandiRes);
      } else if (mandiRes?.mandiPrices && Array.isArray(mandiRes.mandiPrices)) {
        setMandiPrices(mandiRes.mandiPrices);
      }

      if (Array.isArray(vehRes)) {
        setVehicles(vehRes);
      } else if (vehRes?.vehicles && Array.isArray(vehRes.vehicles)) {
        setVehicles(vehRes.vehicles);
      }

      if (Array.isArray(bookRes)) {
        setBookings(bookRes);
      } else if (bookRes?.bookings && Array.isArray(bookRes.bookings)) {
        setBookings(bookRes.bookings);
      }

      if (Array.isArray(ordRes)) {
        setOrders(ordRes);
      } else if (ordRes?.orders && Array.isArray(ordRes.orders)) {
        setOrders(ordRes.orders);
      }
    } catch (err) {
      console.error('Error fetching backend data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Farmer adds new crop listing
  const handleProductAdded = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
    setActiveTab('marketplace');
  };

  // Farmer updates crop images
  const handleUpdateProductImages = (productId: string, newImages: string[]) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, images: newImages } : p))
    );
    if (selectedCropForLightbox?.id === productId) {
      setSelectedCropForLightbox(prev => (prev ? { ...prev, images: newImages } : null));
    }
  };

  // User profile update
  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  // Role switch helper for quick demo testing
  const handleSwitchRole = (newRole: UserRole) => {
    const matched = SAMPLE_USERS.find(u => u.role === newRole);
    if (matched) {
      setCurrentUser(matched);
    } else if (currentUser) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
  };

  // Open Crop Photo Modal
  const handleOpenCropPhotoModal = (product: Product) => {
    setSelectedCropForPhotos(product);
    setCropPhotoModalOpen(true);
  };

  // Open Crop Lightbox Modal
  const handleOpenCropLightbox = (product: Product) => {
    setSelectedCropForLightbox(product);
    setLightboxModalOpen(true);
  };

  // Bulk Buyer / Consumer places direct order
  const handlePlaceOrder = async (orderPayload: any) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const data = await res.json();
    if (res.ok && data.order) {
      setOrders(prev => [data.order, ...prev]);
      // Deduct available stock locally
      setProducts(prev =>
        prev.map(p => {
          const item = orderPayload.items.find((i: any) => i.productId === p.id);
          if (item) {
            return { ...p, quantityKg: Math.max(0, p.quantityKg - item.quantityKg) };
          }
          return p;
        })
      );
      setActiveTab('orders');
    }
  };

  // Logistics refrigerated booking
  const handleBookLogistics = async (bookingPayload: any) => {
    const res = await fetch('/api/logistics/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });
    const data = await res.json();
    if (res.ok && data.booking) {
      setBookings(prev => [data.booking, ...prev]);
      setActiveTab('logistics');
    }
  };

  // Status progression with GPS tracking
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (res.ok && data.order) {
      setOrders(prev => prev.map(o => (o.id === orderId ? data.order : o)));
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white overflow-x-hidden max-w-full w-full">
      {/* Top Navigation with Trilingual Selector, Sub-Navbar & Live APMC Ticker */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenAddProductModal={() => setAddProductModalOpen(true)}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        onLogout={() => setCurrentUser(null)}
        mandiTicker={mandiPrices}
        lang={lang}
        onLanguageChange={setLang}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 overflow-x-hidden">
        {/* Core Middleman Elimination & Rural Earnings Banner */}
        <IntermediarySavingsBanner
          onExploreRates={() => setActiveTab('mandi-prices')}
          onOpenPostProduct={() => {
            if (currentUser?.role === 'farmer') {
              setAddProductModalOpen(true);
            } else {
              setActiveTab('marketplace');
            }
          }}
          lang={lang}
        />

        {/* Tab Routing */}
        {activeTab === 'marketplace' && (
          <MarketplaceView
            products={products}
            currentUser={currentUser}
            onOpenAuthModal={() => setAuthModalOpen(true)}
            onPlaceOrder={handlePlaceOrder}
            onOpenAddProductModal={() => setAddProductModalOpen(true)}
            onOpenCropPhotoModal={handleOpenCropPhotoModal}
            onOpenCropLightbox={handleOpenCropLightbox}
            lang={lang}
          />
        )}

        {activeTab === 'mandi-prices' && (
          <LiveMandiPricesView
            mandiPrices={mandiPrices}
            onRefresh={fetchData}
            lang={lang}
          />
        )}

        {activeTab === 'ml-model' && (
          <MLModelView
            lang={lang}
          />
        )}

        {activeTab === 'logistics' && (
          <LogisticsView
            vehicles={vehicles}
            bookings={bookings}
            currentUser={currentUser}
            onBookLogistics={handleBookLogistics}
            onOpenAuthModal={() => setAuthModalOpen(true)}
            onGoToTransporterHub={() => setActiveTab('transporter-hub')}
            lang={lang}
          />
        )}

        {activeTab === 'transporter-hub' && (
          <TransporterOrdersView
            orders={orders}
            bookings={bookings}
            currentUser={currentUser}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenAuthModal={() => setAuthModalOpen(true)}
            lang={lang}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            currentUser={currentUser}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenAuthModal={() => setAuthModalOpen(true)}
            lang={lang}
          />
        )}
      </main>

      {/* User Login / Register Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccessLogin={(user) => {
          setCurrentUser(user);
        }}
        lang={lang}
      />

      {/* Add Produce Modal for Farmers with Camera/Device Image Upload */}
      <AddProductModal
        isOpen={addProductModalOpen}
        onClose={() => setAddProductModalOpen(false)}
        currentUser={currentUser}
        onProductAdded={handleProductAdded}
        lang={lang}
      />

      {/* Profile Details & Settings Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        products={products}
        onOpenAddProductModal={() => {
          setProfileModalOpen(false);
          setAddProductModalOpen(true);
        }}
        onOpenCropPhotoModal={(product) => {
          setProfileModalOpen(false);
          handleOpenCropPhotoModal(product);
        }}
        lang={lang}
        onSwitchRole={handleSwitchRole}
      />

      {/* Crop Photo Manager Modal (Camera/Gallery/Upload/Delete/Set Primary) */}
      <CropPhotoModal
        isOpen={cropPhotoModalOpen}
        onClose={() => {
          setCropPhotoModalOpen(false);
          setSelectedCropForPhotos(null);
        }}
        product={selectedCropForPhotos}
        onUpdateProductImages={handleUpdateProductImages}
        lang={lang}
      />

      {/* Crop Lightbox Modal for Full-Resolution Multi-Image Viewing */}
      <CropLightboxModal
        isOpen={lightboxModalOpen}
        onClose={() => {
          setLightboxModalOpen(false);
          setSelectedCropForLightbox(null);
        }}
        product={selectedCropForLightbox}
        currentUser={currentUser}
        onOpenOrderModal={() => {
          setLightboxModalOpen(false);
          setActiveTab('marketplace');
        }}
        onOpenCropPhotoModal={(prod) => {
          setLightboxModalOpen(false);
          handleOpenCropPhotoModal(prod);
        }}
        lang={lang}
      />

      {/* Clean SetiMitra Footer */}
      <footer className="bg-emerald-950 text-emerald-100 border-t border-emerald-900 mt-12 py-8 text-xs overflow-x-hidden max-w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="font-bold text-sm text-white flex items-center justify-center md:justify-start gap-1.5 font-serif">
              <span>🌱</span> {t.appName} — {t.tagline}
            </div>
            <p className="text-emerald-300 mt-1 max-w-md">
              {t.subTagline}. Direct trade between farmers, FPOs, bulk buyers, and consumers.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-emerald-200">
            <button
              onClick={() => setActiveTab('marketplace')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              {t.subNavbarMarketplace || t.tabMarketplace}
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('mandi-prices')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              {t.subNavbarMandi || t.tabMandiRates}
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('ml-model')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              {t.subNavbarML || t.tabMLPredictor}
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('logistics')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              {t.subNavbarLogistics || t.tabLogistics}
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('orders')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              {t.subNavbarOrders || t.tabOrders} & {t.liveGpsTracking}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
