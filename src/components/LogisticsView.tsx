import React, { useState } from 'react';
import { Truck, Thermometer, ShieldCheck, MapPin, Clock, Phone, CheckCircle, AlertCircle, PlusCircle, ArrowRight, User } from 'lucide-react';
import { LogisticsVehicle, LogisticsBooking, User as UserType, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface LogisticsViewProps {
  vehicles: LogisticsVehicle[];
  bookings: LogisticsBooking[];
  currentUser: UserType | null;
  onBookLogistics: (bookingPayload: any) => Promise<void>;
  onOpenAuthModal: () => void;
  onGoToTransporterHub?: () => void;
  lang?: Language;
}

export const LogisticsView: React.FC<LogisticsViewProps> = ({
  vehicles,
  bookings,
  currentUser,
  onBookLogistics,
  onOpenAuthModal,
  onGoToTransporterHub,
  lang = 'mr'
}) => {
  const t = getTranslation(lang);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState('Reefer Cold Van (4T)');
  const [pickupLocation, setPickupLocation] = useState(currentUser?.address ? `${currentUser.address}, ${currentUser.district}` : 'Pimpalgaon Farm Gate, Nashik');
  const [deliveryLocation, setDeliveryLocation] = useState('Hadapsar Warehouse Terminal, Pune');
  const [cropName, setCropName] = useState('Tomatoes & Onions (Mixed)');
  const [weightQuintals, setWeightQuintals] = useState('25');
  const [pickupDate, setPickupDate] = useState('Today, Morning 07:00 AM');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const handleOpenBooking = (vehType?: string) => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    if (vehType) setSelectedVehicleType(vehType);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setBookingSubmitting(true);
    try {
      await onBookLogistics({
        senderName: currentUser.name,
        senderMobile: currentUser.mobile,
        pickupLocation: pickupLocation.trim(),
        recipientName: 'Consignee Dock Receiver',
        recipientMobile: '9890011223',
        deliveryLocation: deliveryLocation.trim(),
        cropName,
        weightQuintals: Number(weightQuintals) || 20,
        vehicleType: selectedVehicleType,
        pickupDate
      });
      setBookingModalOpen(false);
    } catch (err: any) {
      alert('Failed to schedule logistics booking.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div id="logistics-support-container" className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-cyan-950 text-white rounded-2xl p-6 shadow-md border border-emerald-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-semibold mb-2">
              <Truck className="w-3.5 h-3.5" />
              Direct Rural Transport & Cold-Chain Fleet
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              On-Demand Farm Logistics & Reefer Support
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl mt-1">
              Connect directly with verified mini-trucks, tractors, and temperature-controlled cold vans. Cut transit damage from 25% down to under 3% with real-time temperature tracking and automated milk-run routing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {onGoToTransporterHub && (
              <button
                id="logistics-view-customer-details-btn"
                onClick={onGoToTransporterHub}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer border border-blue-400/40"
              >
                <Truck className="w-4 h-4 text-cyan-200" />
                <span>
                  {lang === 'mr'
                    ? 'ग्राहकांचे पत्ते व तपशील पहा'
                    : lang === 'hi'
                    ? 'ग्राहकों के पते व विवरण देखें'
                    : 'View Customer Locations'}
                </span>
              </button>
            )}
            <button
              id="book-pickup-vehicle-btn"
              onClick={() => handleOpenBooking()}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Book Farm-Gate Vehicle
            </button>
          </div>
        </div>
      </div>

      {/* Available Fleet Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Available Rural & Highway Transport Fleet</h2>
          <span className="text-xs text-gray-500">Live GPS Connected</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-2xl p-4 shadow-xs border border-gray-200 flex flex-col justify-between hover:border-emerald-500 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-gray-900">{v.name}</span>
                  {v.temperatureControlled ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200 flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      Reefer Cold
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                      Standard
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-gray-600 mb-3">
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="font-bold text-gray-900 font-mono">{v.capacityQuintals} Quintals</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Fare:</span>
                    <span className="font-bold text-emerald-800 font-mono">₹{v.baseFarePerKm}/km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Hub:</span>
                    <span className="text-gray-700 font-medium">{v.currentLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Availability:</span>
                    <span className="text-emerald-700 font-semibold">{v.availability}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-2 rounded-xl text-[11px] text-gray-600 mb-3 flex items-center justify-between">
                  <span>Driver: {v.driverName}</span>
                  <a href={`tel:${v.driverPhone}`} className="text-emerald-700 font-bold flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Call
                  </a>
                </div>
              </div>

              <button
                id={`book-vehicle-${v.id}`}
                onClick={() => handleOpenBooking(v.type)}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs border border-emerald-200 transition-colors"
              >
                Schedule This Vehicle
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Logistics Dispatches */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Active Live Dispatches & Cold-Chain Tracking</h2>
            <p className="text-xs text-gray-500">Real-time status of shipments moving from farm gate to market</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            {bookings.length} Dispatches Tracked
          </span>
        </div>

        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded">
                    {b.bookingCode}
                  </span>
                  <span className="font-bold text-sm text-gray-900">{b.cropName}</span>
                  <span className="text-xs text-gray-500 font-mono">({b.weightQuintals} Quintals)</span>
                </div>

                <div className="flex items-center gap-2">
                  {b.temperatureReading && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-100 text-cyan-900 border border-cyan-300 flex items-center gap-1 font-mono">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-700" />
                      {b.temperatureReading}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    {b.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Pickup and Delivery details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block mb-0.5">Farm Pickup:</span>
                  <div className="font-semibold text-gray-800">{b.pickupLocation}</div>
                  <div className="text-gray-500 text-[11px]">{b.senderName} • {b.pickupDate}</div>
                </div>

                <div>
                  <span className="text-gray-400 block mb-0.5">Destination Hub:</span>
                  <div className="font-semibold text-gray-800">{b.deliveryLocation}</div>
                  <div className="text-gray-500 text-[11px]">{b.recipientName} • {b.deliveryDate}</div>
                </div>

                <div>
                  <span className="text-gray-400 block mb-0.5">Vehicle & Estimated Arrival:</span>
                  <div className="font-semibold text-emerald-900">{b.vehicleType}</div>
                  <div className="text-emerald-700 font-bold font-mono">
                    Est. Arrival in ~{b.estimatedArrivalMinutes || 60} mins
                  </div>
                </div>
              </div>

              {/* Waypoints */}
              {b.waypoints && b.waypoints.length > 0 && (
                <div className="pt-2 border-t border-gray-200/60 flex items-center gap-2 overflow-x-auto text-[11px] text-gray-600">
                  <span className="font-bold text-gray-500 shrink-0">Route Path:</span>
                  {b.waypoints.map((wp, i) => (
                    <React.Fragment key={i}>
                      <span className="bg-white px-2 py-0.5 rounded border border-gray-200 shrink-0">
                        {wp}
                      </span>
                      {i < b.waypoints!.length - 1 && <span className="text-gray-400">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 my-6">
            <div className="bg-emerald-900 text-white p-4 px-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Schedule Farm Logistics Dispatch</h3>
                <p className="text-xs text-emerald-200">Shared vehicle or dedicated reefer van</p>
              </div>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-6 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Select Vehicle Type</label>
                <select
                  id="booking-vehicle-type-select"
                  value={selectedVehicleType}
                  onChange={(e) => setSelectedVehicleType(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl bg-white font-medium"
                >
                  <option value="Mini Truck (1-1.5T)">Tata Ace Gold (1-1.5T) - Ideal for local mandi</option>
                  <option value="Pickup 407 (2.5T)">Mahindra Bolero Maxi Truck (2.5T) - Medium loads</option>
                  <option value="Reefer Cold Van (4T)">Eicher Reefer Cold Van (4T) - Perishables & cold chain</option>
                  <option value="Tractor Trolley (3T)">Farm Tractor Trolley (3T) - Village cluster</option>
                  <option value="Heavy Truck (10T)">Heavy Multi-Axle (10T) - Interstate bulk</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Crop Being Moved</label>
                  <input
                    id="booking-crop-input"
                    type="text"
                    required
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Weight (Quintals)</label>
                  <input
                    id="booking-weight-input"
                    type="number"
                    required
                    min="1"
                    value={weightQuintals}
                    onChange={(e) => setWeightQuintals(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Pickup Farm Gate / Village</label>
                <input
                  id="booking-pickup-location-input"
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Delivery Destination / Market Dock</label>
                <input
                  id="booking-delivery-location-input"
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Pickup Date & Time Window</label>
                <input
                  id="booking-pickup-date-input"
                  type="text"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-emerald-950 block">Estimated Trip Fare</span>
                  <span className="text-[11px] text-emerald-700">Fuel, driver & toll included</span>
                </div>
                <div className="text-xl font-black text-emerald-950 font-mono">
                  {selectedVehicleType.includes('Reefer') ? '₹5,800' : selectedVehicleType.includes('Mini') ? '₹2,400' : '₹3,800'}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  id="confirm-booking-submit-btn"
                  type="submit"
                  disabled={bookingSubmitting}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {bookingSubmitting ? 'Confirming Fleet Booking...' : 'Dispatch Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
