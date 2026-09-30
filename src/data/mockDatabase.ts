import { User, Product, MandiPriceItem, LogisticsVehicle, LogisticsBooking, Order } from '../types';
import { ALL_VEGETABLES_MANDI_PRICES } from './allVegetablesMandiData';

// Baseline production data: starts completely fresh without demo clutter
export const INITIAL_USERS: User[] = [
  {
    id: 'user-farmer-1',
    name: 'Ramesh Patil',
    mobile: '9822012345',
    password: 'password123',
    role: 'farmer',
    state: 'Maharashtra',
    district: 'Nashik',
    villageOrCity: 'Pimpalgaon Baswant',
    address: 'Survey No. 42, Pimpalgaon-Niphad Road',
    pincode: '422209',
    fpoName: 'Sahyadri Agro Farmers Producer Co.',
    farmSizeAcres: 8.5,
    primaryCrops: ['Tomato', 'Onion', 'Capsicum'],
    createdAt: '2026-08-10'
  },
  {
    id: 'user-farmer-2',
    name: 'Harpreet Singh',
    mobile: '9814054321',
    password: 'password123',
    role: 'farmer',
    state: 'Punjab',
    district: 'Ludhiana',
    villageOrCity: 'Samrala',
    address: 'VPO Khanna Khurd, Samrala Block',
    pincode: '141114',
    fpoName: 'Doaba Organic Farm Cluster',
    farmSizeAcres: 14.0,
    primaryCrops: ['Potato', 'Cauliflower', 'Carrot'],
    createdAt: '2026-08-15'
  },
  {
    id: 'user-buyer-1',
    name: 'Vikram Agrawal (FreshMart)',
    mobile: '9890011223',
    password: 'password123',
    role: 'bulk_buyer',
    state: 'Maharashtra',
    district: 'Pune',
    villageOrCity: 'Hadapsar',
    address: 'Warehouse Hub 4, Hadapsar Industrial Estate, Pune',
    pincode: '411028',
    businessName: 'FreshMart Supermarkets Pvt Ltd',
    businessType: 'Supermarket',
    gstin: '27AABCF1234F1Z8',
    createdAt: '2026-08-20'
  },
  {
    id: 'user-buyer-2',
    name: 'Chef Ananya Verma (GreenTable)',
    mobile: '9711099887',
    password: 'password123',
    role: 'bulk_buyer',
    state: 'Delhi',
    district: 'South Delhi',
    villageOrCity: 'Okhla',
    address: 'Central Kitchen 12, Okhla Phase 2',
    pincode: '110020',
    businessName: 'GreenTable Hospitality & Catering Group',
    businessType: 'Hotel/Restaurant',
    gstin: '07AAECG8765P1Z3',
    createdAt: '2026-08-22'
  },
  {
    id: 'user-customer-1',
    name: 'Pooja Deshmukh',
    mobile: '9923055443',
    password: 'password123',
    role: 'customer',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    villageOrCity: 'Thane West',
    address: 'Flat 502, Neelkanth Woods, Manpada, Thane West',
    pincode: '400607',
    createdAt: '2026-09-01'
  },
  {
    id: 'user-transporter-1',
    name: 'Santosh Shinde (Kisan Express Transport)',
    mobile: '9823411223',
    password: 'password123',
    role: 'transporter',
    state: 'Maharashtra',
    district: 'Nashik',
    villageOrCity: 'Pimpalgaon Baswant',
    address: 'Transport Nagar, Plot 14, Mumbai-Agra Highway',
    pincode: '422209',
    transportAgencyName: 'Kisan Cold-Chain & Rural Express',
    vehicleTypes: ['Tata Ace Reefer Cold Van (4T)', 'Mahindra Bolero Maxi Truck (2.5T)'],
    totalVehicles: 6,
    operatingRoutes: ['Nashik - Mumbai APMC (Vashi)', 'Nashik - Pune Hadapsar', 'Niphad - Thane'],
    drivingLicenseNo: 'MH15 20120034821',
    createdAt: '2026-08-25'
  }
];

export const SAMPLE_USERS: User[] = [
  {
    id: 'user-farmer-1',
    name: 'Ramesh Patil',
    mobile: '9822012345',
    password: 'password123',
    role: 'farmer',
    state: 'Maharashtra',
    district: 'Nashik',
    villageOrCity: 'Pimpalgaon Baswant',
    address: 'Survey No. 42, Pimpalgaon-Niphad Road',
    pincode: '422209',
    fpoName: 'Sahyadri Agro Farmers Producer Co.',
    farmSizeAcres: 8.5,
    primaryCrops: ['Tomato', 'Onion', 'Capsicum'],
    createdAt: '2026-08-10'
  },
  {
    id: 'user-farmer-2',
    name: 'Harpreet Singh',
    mobile: '9814054321',
    password: 'password123',
    role: 'farmer',
    state: 'Punjab',
    district: 'Ludhiana',
    villageOrCity: 'Samrala',
    address: 'VPO Khanna Khurd, Samrala Block',
    pincode: '141114',
    fpoName: 'Doaba Organic Farm Cluster',
    farmSizeAcres: 14.0,
    primaryCrops: ['Potato', 'Cauliflower', 'Carrot'],
    createdAt: '2026-08-15'
  },
  {
    id: 'user-buyer-1',
    name: 'Vikram Agrawal (FreshMart)',
    mobile: '9890011223',
    password: 'password123',
    role: 'bulk_buyer',
    state: 'Maharashtra',
    district: 'Pune',
    villageOrCity: 'Hadapsar',
    address: 'Warehouse Hub 4, Hadapsar Industrial Estate, Pune',
    pincode: '411028',
    businessName: 'FreshMart Supermarkets Pvt Ltd',
    businessType: 'Supermarket',
    gstin: '27AABCF1234F1Z8',
    createdAt: '2026-08-20'
  },
  {
    id: 'user-buyer-2',
    name: 'Chef Ananya Verma (GreenTable)',
    mobile: '9711099887',
    password: 'password123',
    role: 'bulk_buyer',
    state: 'Delhi',
    district: 'South Delhi',
    villageOrCity: 'Okhla',
    address: 'Central Kitchen 12, Okhla Phase 2',
    pincode: '110020',
    businessName: 'GreenTable Hospitality & Catering Group',
    businessType: 'Hotel/Restaurant',
    gstin: '07AAECG8765P1Z3',
    createdAt: '2026-08-22'
  },
  {
    id: 'user-customer-1',
    name: 'Pooja Deshmukh',
    mobile: '9923055443',
    password: 'password123',
    role: 'customer',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    villageOrCity: 'Thane West',
    address: 'Flat 502, Neelkanth Woods, Manpada, Thane West',
    pincode: '400607',
    createdAt: '2026-09-01'
  },
  {
    id: 'user-transporter-1',
    name: 'Santosh Shinde (Kisan Express Transport)',
    mobile: '9823411223',
    password: 'password123',
    role: 'transporter',
    state: 'Maharashtra',
    district: 'Nashik',
    villageOrCity: 'Pimpalgaon Baswant',
    address: 'Transport Nagar, Plot 14, Mumbai-Agra Highway',
    pincode: '422209',
    transportAgencyName: 'Kisan Cold-Chain & Rural Express',
    vehicleTypes: ['Tata Ace Reefer Cold Van (4T)', 'Mahindra Bolero Maxi Truck (2.5T)'],
    totalVehicles: 6,
    operatingRoutes: ['Nashik - Mumbai APMC (Vashi)', 'Nashik - Pune Hadapsar', 'Niphad - Thane'],
    drivingLicenseNo: 'MH15 20120034821',
    createdAt: '2026-08-25'
  }
];

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    farmerId: 'user-farmer-1',
    farmerName: 'Ramesh Patil',
    farmerMobile: '9822012345',
    farmerLocation: 'Pimpalgaon, Nashik (MH)',
    fpoName: 'Sahyadri Agro FPO',
    category: 'Vegetables',
    cropName: 'Red Round Hybrid Tomatoes',
    variety: 'Vaishnavi F1 High Yield',
    quantityKg: 2800,
    pricePerKg: 19,
    marketMandiPricePerKg: 14,
    retailPricePerKg: 32,
    minOrderKg: 10,
    harvestDate: '2026-09-18',
    grade: 'Grade A (Export/Premium)',
    organicCertified: false,
    images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546470427-227c7369a4d3?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Freshly harvested vine-ripened firm tomatoes. Zero cold storage delay. Ideal for both daily retail and wholesale kitchen consumption. Sorted and graded.',
    status: 'available',
    viewsCount: 142,
    createdAt: '2026-09-18'
  },
  {
    id: 'prod-2',
    farmerId: 'user-farmer-1',
    farmerName: 'Ramesh Patil',
    farmerMobile: '9822012345',
    farmerLocation: 'Pimpalgaon, Nashik (MH)',
    fpoName: 'Sahyadri Agro FPO',
    category: 'Vegetables',
    cropName: 'Nashik Red Quality Onions',
    variety: 'Garwa Winter Onion',
    quantityKg: 6500,
    pricePerKg: 24,
    marketMandiPricePerKg: 18,
    retailPricePerKg: 38,
    minOrderKg: 25,
    harvestDate: '2026-09-15',
    grade: 'Grade A (Export/Premium)',
    organicCertified: false,
    images: [
      'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508747703725-719777637510?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Famous Nashik medium-large dry pungent onions with long shelf life (45+ days). Cleaned, cured in shed, and bagged in 50kg ventilated mesh.',
    status: 'available',
    viewsCount: 230,
    createdAt: '2026-09-16'
  },
  {
    id: 'prod-3',
    farmerId: 'user-farmer-2',
    farmerName: 'Harpreet Singh',
    farmerMobile: '9814054321',
    farmerLocation: 'Samrala, Ludhiana (PB)',
    fpoName: 'Doaba Organic Farm Cluster',
    category: 'Vegetables',
    cropName: 'Chandramukhi Seed Potatoes',
    variety: 'Kufri Jyoti / Pukhraj',
    quantityKg: 9200,
    pricePerKg: 16,
    marketMandiPricePerKg: 11,
    retailPricePerKg: 28,
    minOrderKg: 20,
    harvestDate: '2026-09-14',
    grade: 'Grade A (Export/Premium)',
    organicCertified: true,
    images: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Golden skin, low-sugar table potatoes directly from Punjab loam fields. No sprouting, no green patches. High dry matter suitable for fries & cooking.',
    status: 'available',
    viewsCount: 189,
    createdAt: '2026-09-15'
  },
  {
    id: 'prod-4',
    farmerId: 'user-farmer-2',
    farmerName: 'Harpreet Singh',
    farmerMobile: '9814054321',
    farmerLocation: 'Samrala, Ludhiana (PB)',
    fpoName: 'Doaba Organic Farm Cluster',
    category: 'Vegetables',
    cropName: 'Snowball White Cauliflower',
    variety: 'Snow Crown Early White',
    quantityKg: 1400,
    pricePerKg: 22,
    marketMandiPricePerKg: 15,
    retailPricePerKg: 40,
    minOrderKg: 5,
    harvestDate: '2026-09-19',
    grade: 'Grade A (Export/Premium)',
    organicCertified: true,
    images: [
      'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Compact curd snowy white heads, tightly wrapped in outer leaves to preserve moisture and crispness. Zero chemical pesticides used.',
    status: 'available',
    viewsCount: 95,
    createdAt: '2026-09-19'
  },
  {
    id: 'prod-5',
    farmerId: 'user-farmer-1',
    farmerName: 'Ramesh Patil',
    farmerMobile: '9822012345',
    farmerLocation: 'Pimpalgaon, Nashik (MH)',
    category: 'Vegetables',
    cropName: 'Crisp Green Bell Capsicum',
    variety: 'Indra Dark Green',
    quantityKg: 850,
    pricePerKg: 34,
    marketMandiPricePerKg: 25,
    retailPricePerKg: 60,
    minOrderKg: 5,
    harvestDate: '2026-09-18',
    grade: 'Grade A (Export/Premium)',
    organicCertified: false,
    images: [
      'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Polyhouse shade-net grown thick-walled dark green capsicum. Glossy finish, 3-4 lobes, great shelf stability for hotels and retail packs.',
    status: 'available',
    viewsCount: 78,
    createdAt: '2026-09-18'
  },
  {
    id: 'prod-6',
    farmerId: 'user-farmer-2',
    farmerName: 'Harpreet Singh',
    farmerMobile: '9814054321',
    farmerLocation: 'Samrala, Ludhiana (PB)',
    fpoName: 'Doaba Organic Farm Cluster',
    category: 'Leafy Greens',
    cropName: 'Tender Farm Spinach (Palak)',
    variety: 'All Green Broadleaf',
    quantityKg: 450,
    pricePerKg: 25,
    marketMandiPricePerKg: 16,
    retailPricePerKg: 45,
    minOrderKg: 2,
    harvestDate: '2026-09-19',
    grade: 'Grade A (Export/Premium)',
    organicCertified: true,
    images: [
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Crisp morning-cut succulent spinach bundles. Washed with clean tube-well water and packed in breathable craft paper cartons for zero wilt.',
    status: 'available',
    viewsCount: 110,
    createdAt: '2026-09-19'
  }
];

export const INITIAL_PRODUCTS: Product[] = [...SAMPLE_PRODUCTS];

export const INITIAL_MANDI_PRICES: MandiPriceItem[] = ALL_VEGETABLES_MANDI_PRICES;

export const INITIAL_VEHICLES: LogisticsVehicle[] = [
  {
    id: 'veh-1',
    name: 'Tata Ace Gold (Chhota Hathi)',
    type: 'Mini Truck (1-1.5T)',
    capacityQuintals: 12,
    temperatureControlled: false,
    baseFarePerKm: 18,
    availability: 'Immediate (2 hrs)',
    driverName: 'Sanjay Shinde',
    driverPhone: '9822456789',
    vehicleNo: 'MH-15-EG-4412',
    currentLocation: 'Pimpalgaon Hub (Nashik)',
    rating: 4.8
  },
  {
    id: 'veh-2',
    name: 'Mahindra Bolero Maxi Truck Plus',
    type: 'Pickup 407 (2.5T)',
    capacityQuintals: 25,
    temperatureControlled: false,
    baseFarePerKm: 24,
    availability: 'Scheduled Today',
    driverName: 'Gurdeep Sandhu',
    driverPhone: '9814123890',
    vehicleNo: 'PB-10-BX-9021',
    currentLocation: 'Samrala Bypass (Ludhiana)',
    rating: 4.9
  },
  {
    id: 'veh-3',
    name: 'Eicher Pro Reefer Cold Van (-4°C to 12°C)',
    type: 'Reefer Cold Van (4T)',
    capacityQuintals: 40,
    temperatureControlled: true,
    baseFarePerKm: 35,
    availability: 'Immediate (2 hrs)',
    driverName: 'Mahesh Kulkarni',
    driverPhone: '9890887766',
    vehicleNo: 'MH-12-RN-7733',
    currentLocation: 'Chakan Cold Hub (Pune)',
    rating: 4.95
  },
  {
    id: 'veh-4',
    name: 'Mahindra 575 DI Farm Tractor Trolley',
    type: 'Tractor Trolley (3T)',
    capacityQuintals: 30,
    temperatureControlled: false,
    baseFarePerKm: 20,
    availability: 'Tomorrow Morning',
    driverName: 'Babasaheb More',
    driverPhone: '9765432109',
    vehicleNo: 'MH-15-TR-2022',
    currentLocation: 'Dindori Farm Gate',
    rating: 4.7
  }
];

export const SAMPLE_BOOKINGS: LogisticsBooking[] = [
  {
    id: 'book-1',
    bookingCode: 'SM-LOG-9821',
    senderName: 'Ramesh Patil (Farmer)',
    senderMobile: '9822012345',
    pickupLocation: 'Pimpalgaon Baswant, Nashik',
    recipientName: 'FreshMart Warehouse (Vikram Agrawal)',
    recipientMobile: '9890011223',
    deliveryLocation: 'Hadapsar Industrial Area, Pune',
    cropName: 'Red Round Hybrid Tomatoes',
    weightQuintals: 25,
    vehicleType: 'Reefer Cold Van (4T)',
    status: 'in_transit',
    pickupDate: '2026-09-19 06:30 AM',
    deliveryDate: '2026-09-19 01:30 PM',
    fareInr: 5800,
    temperatureReading: '8.4°C (Optimal)',
    estimatedArrivalMinutes: 85,
    waypoints: ['Farm Gate (Pimpalgaon)', 'Nashik Phata Expressway', 'Chakan Bypass', 'Hadapsar Warehouse'],
    createdAt: '2026-09-19'
  }
];

export const INITIAL_BOOKINGS: LogisticsBooking[] = [...SAMPLE_BOOKINGS];

export const SAMPLE_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'SM-ORD-5501',
    buyerId: 'user-buyer-1',
    buyerName: 'Vikram Agrawal (FreshMart)',
    buyerMobile: '9890011223',
    buyerRole: 'bulk_buyer',
    deliveryAddress: 'Warehouse Hub 4, Hadapsar Industrial Estate, Pune, MH',
    deliveryPincode: '411028',
    items: [
      {
        productId: 'prod-1',
        cropName: 'Red Round Hybrid Tomatoes',
        farmerId: 'user-farmer-1',
        farmerName: 'Ramesh Patil',
        quantityKg: 500,
        pricePerKg: 19,
        subtotal: 9500,
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80'
      },
      {
        productId: 'prod-2',
        cropName: 'Nashik Red Quality Onions',
        farmerId: 'user-farmer-1',
        farmerName: 'Ramesh Patil',
        quantityKg: 800,
        pricePerKg: 24,
        subtotal: 19200,
        imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80'
      }
    ],
    totalAmount: 28700,
    totalSavingsVsRetail: 17700,
    status: 'dispatched',
    paymentMethod: 'Escrow Guarantee',
    orderDate: '2026-09-18 11:20 AM',
    specialInstructions: 'Direct dock entry via Gate 3. Require moisture meter check upon arrival.',
    tracking: {
      orderId: 'ord-101',
      orderNumber: 'SM-ORD-5501',
      currentLat: 19.6974,
      currentLng: 73.5358,
      originLat: 20.1706,
      originLng: 73.9877,
      originName: 'Pimpalgaon Baswant Farm Gate, Nashik',
      destLat: 18.5089,
      destLng: 73.9260,
      destName: 'FreshMart Dock Hub, Hadapsar, Pune',
      progressPercent: 54,
      vehicleNumber: 'MH-15-EG-4821 (Tata Ace Reefer)',
      driverName: 'Santosh Shinde',
      driverPhone: '+91 98234 11223',
      speedKmh: 54,
      temperatureCelsius: 6.8,
      estimatedArrivalMinutes: 72,
      distanceRemainingKm: 58,
      checkpoints: [
        { title: 'Harvest Inspected & Cold-Loaded', location: 'Pimpalgaon Farm', time: '06:30 AM', completed: true, isCurrent: false },
        { title: 'Farm-Gate Dispatched', location: 'Nashik Agro Expressway', time: '07:15 AM', completed: true, isCurrent: false },
        { title: 'Highway Transit & Temperature Verified', location: 'Igatpuri Ghat Toll', time: '08:45 AM', completed: true, isCurrent: true },
        { title: 'Pune Metro Perimeter Hub', location: 'Chakan Bypass', time: '10:00 AM (Est)', completed: false, isCurrent: false },
        { title: 'Direct Buyer Dock Delivery', location: 'Hadapsar Warehouse', time: '10:45 AM (Est)', completed: false, isCurrent: false }
      ],
      routePath: [
        { lat: 20.1706, lng: 73.9877, name: 'Pimpalgaon Farm Gate' },
        { lat: 20.0063, lng: 73.7902, name: 'Nashik Highway Hub' },
        { lat: 19.6974, lng: 73.5358, name: 'Igatpuri Ghat' },
        { lat: 18.7557, lng: 73.8447, name: 'Chakan Pune Toll' },
        { lat: 18.5089, lng: 73.9260, name: 'Hadapsar Dock' }
      ]
    }
  },
  {
    id: 'ord-102',
    orderNumber: 'SM-ORD-5502',
    buyerId: 'user-customer-1',
    buyerName: 'Pooja Deshmukh',
    buyerMobile: '9923055443',
    buyerRole: 'customer',
    deliveryAddress: 'Flat 502, Neelkanth Woods, Manpada, Thane West, MH',
    deliveryPincode: '400607',
    items: [
      {
        productId: 'prod-1',
        cropName: 'Red Round Hybrid Tomatoes',
        farmerId: 'user-farmer-1',
        farmerName: 'Ramesh Patil',
        quantityKg: 5,
        pricePerKg: 19,
        subtotal: 95,
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80'
      },
      {
        productId: 'prod-4',
        cropName: 'Snowball White Cauliflower',
        farmerId: 'user-farmer-2',
        farmerName: 'Harpreet Singh',
        quantityKg: 3,
        pricePerKg: 22,
        subtotal: 66,
        imageUrl: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&auto=format&fit=crop&q=80'
      },
      {
        productId: 'prod-6',
        cropName: 'Tender Farm Spinach (Palak)',
        farmerId: 'user-farmer-2',
        farmerName: 'Harpreet Singh',
        quantityKg: 2,
        pricePerKg: 25,
        subtotal: 50,
        imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop&q=80'
      }
    ],
    totalAmount: 211,
    totalSavingsVsRetail: 119,
    status: 'accepted',
    paymentMethod: 'UPI / Bank Transfer',
    orderDate: '2026-09-19 08:45 AM',
    specialInstructions: 'Ring doorbell twice. Eco-friendly packaging requested.',
    tracking: {
      orderId: 'ord-102',
      orderNumber: 'SM-ORD-5502',
      currentLat: 19.3562,
      currentLng: 73.3478,
      originLat: 20.1706,
      originLng: 73.9877,
      originName: 'Pimpalgaon Baswant, Nashik Farm Gate',
      destLat: 19.2183,
      destLng: 72.9781,
      destName: 'Thane West Residential Point',
      progressPercent: 68,
      vehicleNumber: 'MH-04-AZ-2940 (Mahindra Bolero Maxi)',
      driverName: 'Kishore Jadhav',
      driverPhone: '+91 97654 33211',
      speedKmh: 46,
      temperatureCelsius: 7.2,
      estimatedArrivalMinutes: 45,
      distanceRemainingKm: 32,
      checkpoints: [
        { title: 'Fresh Harvest Crated', location: 'Nashik Farm', time: '07:00 AM', completed: true, isCurrent: false },
        { title: 'Dispatched via Samruddhi Corridor', location: 'Igatpuri Route', time: '08:15 AM', completed: true, isCurrent: false },
        { title: 'Thane Perimeter Entry', location: 'Asangaon Highway', time: '09:20 AM', completed: true, isCurrent: true },
        { title: 'Direct Consumer Doorstep', location: 'Thane West', time: '10:05 AM (Est)', completed: false, isCurrent: false }
      ],
      routePath: [
        { lat: 20.1706, lng: 73.9877, name: 'Pimpalgaon Farm' },
        { lat: 19.6974, lng: 73.5358, name: 'Igatpuri Toll' },
        { lat: 19.3562, lng: 73.3478, name: 'Asangaon' },
        { lat: 19.2183, lng: 72.9781, name: 'Thane West' }
      ]
    }
  }
];

export const INITIAL_ORDERS: Order[] = [...SAMPLE_ORDERS];
