// Supported languages across the entire SetiMitra application
export type Language = 'mr' | 'hi' | 'en'; // Marathi, Hindi, English

export type UserRole = 'farmer' | 'bulk_buyer' | 'customer' | 'transporter';

export interface User {
  id: string;
  name: string;
  mobile: string;
  password?: string;
  role: UserRole;
  state: string;
  district: string;
  villageOrCity?: string;
  address: string;
  pincode: string;
  // Role specific fields
  fpoName?: string;
  farmSizeAcres?: number;
  primaryCrops?: string[];
  businessName?: string;
  businessType?: 'Supermarket' | 'Hotel/Restaurant' | 'Food Processor' | 'Wholesale Trader' | 'Exporter';
  gstin?: string;
  // Transporter specific fields
  transportAgencyName?: string;
  vehicleTypes?: string[];
  totalVehicles?: number;
  operatingRoutes?: string[];
  drivingLicenseNo?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  farmerLocation: string; // e.g., "Nashik, Maharashtra"
  fpoName?: string;
  category: 'Vegetables' | 'Fruits' | 'Grains & Pulses' | 'Spices' | 'Leafy Greens';
  cropName: string; // e.g. "Tomato (Hybrid)"
  variety: string; // e.g. "Vaishnavi / Red Round"
  quantityKg: number;
  pricePerKg: number; // Farmer direct price
  marketMandiPricePerKg: number; // Current local APMC mandi price
  retailPricePerKg: number; // Typical consumer retail price
  minOrderKg: number;
  harvestDate: string;
  grade: 'Grade A (Export/Premium)' | 'Grade B (Standard)' | 'Grade C (Processing)';
  organicCertified: boolean;
  images: string[];
  description: string;
  status: 'available' | 'sold_out' | 'in_transit';
  viewsCount?: number;
  createdAt: string;
}

export interface MandiPriceItem {
  id: string;
  commodity: string;
  localName?: string; // e.g. "टोमॅटो / टमाटर"
  category?: 'Fruiting Vegetables' | 'Leafy Greens' | 'Root & Tuber' | 'Gourds & Cucurbits' | 'Legumes & Pods' | 'Aromatics & Spices' | 'Exotic';
  variety: string;
  state: string;
  district: string;
  mandiName: string;
  minPrice: number; // per quintal (100kg)
  maxPrice: number; // per quintal
  modalPrice: number; // per quintal (most common trade price)
  modalPricePerKg: number;
  farmerDirectPricePerKg: number;
  consumerRetailPricePerKg: number;
  intermediaryMarkupPercent: number;
  trend: 'up' | 'down' | 'stable';
  dailyChangePercent: number;
  arrivalTons: number;
  date: string;
}

export interface LogisticsVehicle {
  id: string;
  name: string;
  type: 'Mini Truck (1-1.5T)' | 'Pickup 407 (2.5T)' | 'Reefer Cold Van (4T)' | 'Tractor Trolley (3T)' | 'Heavy Truck (10T)';
  capacityQuintals: number;
  temperatureControlled: boolean;
  baseFarePerKm: number;
  availability: 'Immediate (2 hrs)' | 'Scheduled Today' | 'Tomorrow Morning';
  driverName: string;
  driverPhone: string;
  vehicleNo: string;
  currentLocation: string;
  rating: number;
}

export interface LogisticsBooking {
  id: string;
  bookingCode: string;
  senderName: string;
  senderMobile: string;
  pickupLocation: string;
  recipientName: string;
  recipientMobile: string;
  deliveryLocation: string;
  cropName: string;
  weightQuintals: number;
  vehicleType: string;
  status: 'booked' | 'driver_assigned' | 'in_transit' | 'delivered';
  pickupDate: string;
  deliveryDate: string;
  fareInr: number;
  temperatureReading?: string;
  estimatedArrivalMinutes?: number;
  waypoints?: string[];
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  cropName: string;
  farmerId: string;
  farmerName: string;
  quantityKg: number;
  pricePerKg: number;
  subtotal: number;
  imageUrl?: string;
}

export interface OrderTrackingCheckpoint {
  title: string;
  location: string;
  time: string;
  completed: boolean;
  isCurrent: boolean;
}

export interface OrderDeliveryTracking {
  orderId: string;
  orderNumber: string;
  currentLat: number;
  currentLng: number;
  originLat: number;
  originLng: number;
  originName: string;
  destLat: number;
  destLng: number;
  destName: string;
  progressPercent: number;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  speedKmh: number;
  temperatureCelsius?: number;
  estimatedArrivalMinutes: number;
  distanceRemainingKm: number;
  checkpoints: OrderTrackingCheckpoint[];
  routePath: { lat: number; lng: number; name: string }[];
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerMobile: string;
  buyerRole: UserRole;
  deliveryAddress: string;
  deliveryPincode: string;
  items: OrderItem[];
  totalAmount: number;
  totalSavingsVsRetail: number;
  status: 'pending' | 'accepted' | 'dispatched' | 'delivered' | 'cancelled';
  paymentMethod: 'Cash on Delivery' | 'UPI / Bank Transfer' | 'Escrow Guarantee';
  orderDate: string;
  specialInstructions?: string;
  tracking?: OrderDeliveryTracking;
}

/**
 * ML Model Training and Inference Types
 * Multiple Linear Regression with Ridge Regularization & Gradient Descent
 */
export interface MLTrainingSample {
  crop: string;
  rainfallMm: number;
  tempCelsius: number;
  arrivalsQtl: number;
  fuelIndex: number;
  festiveFactor: number;
  shelfLifeDays: number;
  soilNitrogen: number;
  actualPriceKg: number;
  actualDemandScore: number;
  actualYieldQtl: number;
}

export interface MLModelHyperparams {
  epochs: number;
  learningRate: number;
  l2Regularization: number; // Ridge penalty lambda
  batchSize: number;
}

export interface MLTrainingLossRecord {
  epoch: number;
  loss: number;
  rmse: number;
  r2Score: number;
}

export interface MLModelMetrics {
  isTrained: boolean;
  trainingSamplesCount: number;
  epochsCompleted: number;
  finalLoss: number;
  rmse: number;
  r2Score: number; // Coefficient of determination (0 - 1)
  featureWeights: { [featureName: string]: number };
  bias: number;
  lastTrainedAt: string;
  lossHistory: MLTrainingLossRecord[];
}

export interface MLPredictionInput {
  cropName: string;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  rainfallMm: number;
  tempCelsius: number;
  mandiArrivalsQtl: number;
  fuelIndex: number;
  festiveFactor: number;
  shelfLifeDays: number;
  soilNitrogen: number;
}

export interface MLPredictionOutput {
  predictedPricePerKg: number;
  confidenceRange: { min: number; max: number };
  predictedDemandScore: number; // 0 to 100
  demandLevel: 'Very High' | 'High' | 'Normal' | 'Sluggish';
  predictedYieldPerAcreQtl: number;
  modelConfidence: number; // e.g. 94.2%
  primaryPriceDrivers: { factor: string; impact: 'positive' | 'negative'; description: string }[];
  marketAdvice: string;
}

export interface DemandForecastResult {
  cropName: string;
  region: string;
  demandTrend: 'High Surge' | 'Moderate Growth' | 'Stable' | 'Excess Supply';
  projectedPriceChange: string;
  recommendedHarvestWindow: string;
  forecastSummary: string;
  weeklyDemandIndex: { day: string; demandIndex: number; projectedRate: number }[];
  keyFactors: string[];
  suggestedActionForFarmers: string;
  suggestedActionForBulkBuyers: string;
}

export interface RouteOptimizationResult {
  originMandiHub: string;
  destinationCenter: string;
  farmsToVisit: { name: string; location: string; crop: string; loadQuintals: number; sequence: number }[];
  totalDistanceKm: number;
  originalUnoptimizedKm: number;
  fuelSavedLitres: number;
  costSavedInr: number;
  carbonEmissionSavedKg: number;
  estimatedTransitTimeHours: number;
  routeHighlights: string[];
}

