import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_MANDI_PRICES,
  INITIAL_VEHICLES,
  INITIAL_BOOKINGS,
  INITIAL_ORDERS,
  SAMPLE_USERS,
  SAMPLE_PRODUCTS,
  SAMPLE_BOOKINGS,
  SAMPLE_ORDERS
} from './src/data/mockDatabase.ts';
import { Product, User, Order, LogisticsBooking, MandiPriceItem, OrderDeliveryTracking } from './src/types.ts';
import { agriculturalMLModel } from './src/ml/agriculturalModel.ts';


dotenv.config();

const PORT = 3000;

// In-memory persistent data store during server lifecycle
let users: User[] = [...INITIAL_USERS];
let products: Product[] = [...INITIAL_PRODUCTS];
let mandiPrices: MandiPriceItem[] = [...INITIAL_MANDI_PRICES];
let vehicles = [...INITIAL_VEHICLES];
let bookings: LogisticsBooking[] = [...INITIAL_BOOKINGS];
let orders: Order[] = [...INITIAL_ORDERS];

// Initialize Gemini client safely with lazy getter
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // --- REST API ENDPOINTS ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 1. Auth & Users
  app.post('/api/auth/login', (req, res) => {
    const { mobile, password, role } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ error: 'Mobile number and password are required' });
    }

    const cleanMobile = mobile.trim();
    let user = users.find(u => u.mobile === cleanMobile);
    if (!user) {
      return res.status(404).json({
        error: `या मोबाईल क्रमांकाचे (${cleanMobile}) कोणतेही खाते सापडले नाही. कृपया आधी नवीन नोंदणी (Register) करा. (No account found for mobile: ${cleanMobile}. Please register first.)`
      });
    }

    if (user.password && user.password !== password) {
      return res.status(401).json({
        error: 'चुकीचा पासवर्ड टाकला आहे. कृपया तपासून योग्य पासवर्ड टाका. (Incorrect password. Please check and try again.)'
      });
    }

    // Check role consistency if provided
    if (role && user.role !== role) {
      const roleNames: Record<string, string> = {
        farmer: 'शेतकरी (Farmer)',
        bulk_buyer: 'घाऊक खरेदीदार (Bulk Buyer)',
        customer: 'ग्राहक (Customer)',
        transporter: 'वाहतूकदार (Transporter)'
      };
      return res.status(403).json({
        error: `हे खाते "${roleNames[user.role] || user.role}" म्हणून नोंदणीकृत आहे. कृपया योग्य भूमिका निवडा किंवा नवीन खात्याची नोंदणी करा.`
      });
    }

    res.json({ success: true, user });
  });

  app.post('/api/auth/register', (req, res) => {
    const {
      name,
      mobile,
      password,
      role,
      state,
      district,
      address,
      pincode,
      villageOrCity,
      fpoName,
      farmSizeAcres,
      primaryCrops,
      businessName,
      businessType,
      gstin,
      transportAgencyName,
      vehicleTypes,
      totalVehicles,
      operatingRoutes,
      drivingLicenseNo
    } = req.body;

    if (!mobile || !password || !name || !role) {
      return res.status(400).json({ error: 'Name, mobile, password, and role are required' });
    }

    const cleanMobile = mobile.trim();
    const existing = users.find(u => u.mobile === cleanMobile);
    if (existing) {
      return res.status(409).json({ error: 'An account with this mobile number already exists. Please login instead.' });
    }

    const newUser: User = {
      id: `user-${role}-${Date.now()}`,
      name: name.trim(),
      mobile: cleanMobile,
      password,
      role,
      state: state || 'Maharashtra',
      district: district || 'Nashik',
      villageOrCity: villageOrCity || '',
      address: address || 'Main Market Road',
      pincode: pincode || '422001',
      fpoName,
      farmSizeAcres: farmSizeAcres ? Number(farmSizeAcres) : undefined,
      primaryCrops: Array.isArray(primaryCrops) ? primaryCrops : (primaryCrops ? [primaryCrops] : []),
      businessName,
      businessType,
      gstin,
      transportAgencyName,
      vehicleTypes: Array.isArray(vehicleTypes) ? vehicleTypes : (vehicleTypes ? [vehicleTypes] : []),
      totalVehicles: totalVehicles ? Number(totalVehicles) : undefined,
      operatingRoutes: Array.isArray(operatingRoutes) ? operatingRoutes : (operatingRoutes ? [operatingRoutes] : []),
      drivingLicenseNo,
      createdAt: new Date().toISOString().split('T')[0]
    };

    users.unshift(newUser);
    res.status(201).json({ success: true, user: newUser });
  });

  app.get('/api/users/current/:mobile', (req, res) => {
    const user = users.find(u => u.mobile === req.params.mobile);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  // 2. Products Marketplace
  app.get('/api/products', (req, res) => {
    const { category, farmerId, search, minOrder, organicOnly } = req.query;
    let filtered = [...products];

    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (farmerId) {
      filtered = filtered.filter(p => p.farmerId === farmerId);
    }
    if (organicOnly === 'true') {
      filtered = filtered.filter(p => p.organicCertified);
    }
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(p =>
        p.cropName.toLowerCase().includes(q) ||
        p.variety.toLowerCase().includes(q) ||
        p.farmerLocation.toLowerCase().includes(q) ||
        p.farmerName.toLowerCase().includes(q)
      );
    }

    res.json(filtered);
  });

  app.post('/api/products', (req, res) => {
    const {
      farmerId,
      farmerName,
      farmerMobile,
      farmerLocation,
      fpoName,
      category,
      cropName,
      variety,
      quantityKg,
      pricePerKg,
      minOrderKg,
      harvestDate,
      grade,
      organicCertified,
      images,
      description
    } = req.body;

    if (!cropName || !pricePerKg || !quantityKg) {
      return res.status(400).json({ error: 'Crop name, price per kg, and quantity are required.' });
    }

    const price = Number(pricePerKg);
    const estimatedMandi = Math.round(price * 0.78);
    const estimatedRetail = Math.round(price * 1.65);

    const defaultCropPhotos: Record<string, string> = {
      Tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
      Onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
      Potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80',
      Cauliflower: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=800&auto=format&fit=crop&q=80',
      Capsicum: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&auto=format&fit=crop&q=80',
      Spinach: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80',
      Chilli: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80',
      Garlic: 'https://images.unsplash.com/photo-1615477032219-bc188649a50d?w=800&auto=format&fit=crop&q=80',
      Ginger: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
      Carrot: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop&q=80'
    };

    let finalImages: string[] = [];
    if (Array.isArray(images) && images.length > 0 && images[0]) {
      finalImages = images;
    } else {
      const matchKey = Object.keys(defaultCropPhotos).find(k => cropName.toLowerCase().includes(k.toLowerCase()));
      finalImages = [matchKey ? defaultCropPhotos[matchKey] : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'];
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      farmerId: farmerId || 'user-farmer-1',
      farmerName: farmerName || 'Verified Farm Partner',
      farmerMobile: farmerMobile || '9822000000',
      farmerLocation: farmerLocation || 'Nashik, Maharashtra',
      fpoName: fpoName || 'FPO Producer Group',
      category: category || 'Vegetables',
      cropName: cropName.trim(),
      variety: variety || 'High Quality Hybrid',
      quantityKg: Number(quantityKg),
      pricePerKg: price,
      marketMandiPricePerKg: estimatedMandi,
      retailPricePerKg: estimatedRetail,
      minOrderKg: Number(minOrderKg) || 10,
      harvestDate: harvestDate || new Date().toISOString().split('T')[0],
      grade: grade || 'Grade A (Export/Premium)',
      organicCertified: Boolean(organicCertified),
      images: finalImages,
      description: description || `Fresh farm harvest direct from fields. Graded and packed with zero middleman holding.`,
      status: 'available',
      viewsCount: 1,
      createdAt: new Date().toISOString().split('T')[0]
    };

    products.unshift(newProduct);
    res.status(201).json({ success: true, product: newProduct });
  });

  app.delete('/api/products/:id', (req, res) => {
    const prevCount = products.length;
    products = products.filter(p => p.id !== req.params.id);
    if (products.length < prevCount) {
      res.json({ success: true, message: 'Product removed' });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  });

  // Update crop images
  app.patch('/api/products/:id/images', (req, res) => {
    const { images } = req.body;
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Images array is required.' });
    }
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    product.images = images;
    res.json({ success: true, product });
  });

  // Update user profile
  app.put('/api/users/:id', (req, res) => {
    const userIndex = users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }
    users[userIndex] = {
      ...users[userIndex],
      ...req.body,
      id: users[userIndex].id
    };
    res.json({ success: true, user: users[userIndex] });
  });

  // 3. Live Mandi Vegetable Prices
  app.get('/api/mandi-prices', (req, res) => {
    const { commodity, state, search } = req.query;
    let list = [...mandiPrices];

    if (commodity && commodity !== 'All') {
      list = list.filter(m => m.commodity.toLowerCase() === String(commodity).toLowerCase());
    }
    if (state && state !== 'All') {
      list = list.filter(m => m.state.toLowerCase() === String(state).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(m =>
        m.commodity.toLowerCase().includes(q) ||
        m.mandiName.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q)
      );
    }

    res.json(list);
  });

  // 4. Logistics & Fleet
  app.get('/api/logistics/vehicles', (req, res) => {
    res.json(vehicles);
  });

  app.get('/api/logistics/bookings', (req, res) => {
    res.json(bookings);
  });

  app.post('/api/logistics/book', (req, res) => {
    const {
      senderName,
      senderMobile,
      pickupLocation,
      recipientName,
      recipientMobile,
      deliveryLocation,
      cropName,
      weightQuintals,
      vehicleType,
      pickupDate
    } = req.body;

    const baseFareLookup: Record<string, number> = {
      'Mini Truck (1-1.5T)': 2400,
      'Pickup 407 (2.5T)': 3800,
      'Reefer Cold Van (4T)': 5800,
      'Tractor Trolley (3T)': 3100,
      'Heavy Truck (10T)': 9500
    };

    const calculatedFare = baseFareLookup[vehicleType] || 3500;

    const newBooking: LogisticsBooking = {
      id: `book-${Date.now()}`,
      bookingCode: `KS-LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      senderName: senderName || 'Farmer Pickup Gate',
      senderMobile: senderMobile || '9822000000',
      pickupLocation: pickupLocation || 'Farm Gate, Nashik (MH)',
      recipientName: recipientName || 'Consignee / Buyer Hub',
      recipientMobile: recipientMobile || '9890000000',
      deliveryLocation: deliveryLocation || 'Mandi Terminal / City Cold Hub',
      cropName: cropName || 'Mixed Fresh Produce',
      weightQuintals: Number(weightQuintals) || 20,
      vehicleType: vehicleType || 'Pickup 407 (2.5T)',
      status: 'driver_assigned',
      pickupDate: pickupDate || 'Today, Scheduled',
      deliveryDate: 'Within 4-6 Hours Same Day',
      fareInr: calculatedFare,
      temperatureReading: vehicleType.includes('Reefer') ? '6.8°C (Monitored)' : undefined,
      estimatedArrivalMinutes: 45,
      waypoints: ['Pickup Farm Gate', 'Toll Plaza Bypass', 'Central Sorting Hub', 'Destination Dock'],
      createdAt: new Date().toISOString().split('T')[0]
    };

    bookings.unshift(newBooking);
    res.status(201).json({ success: true, booking: newBooking });
  });

  // 5. Orders & Bidding
  app.get('/api/orders', (req, res) => {
    const { buyerId, farmerId } = req.query;
    let list = [...orders];
    if (buyerId) {
      list = list.filter(o => o.buyerId === buyerId);
    }
    if (farmerId) {
      list = list.filter(o => o.items.some(i => i.farmerId === farmerId));
    }
    res.json(list);
  });

  app.post('/api/orders', (req, res) => {
    const {
      buyerId,
      buyerName,
      buyerMobile,
      buyerRole,
      deliveryAddress,
      deliveryPincode,
      items,
      paymentMethod,
      specialInstructions
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required.' });
    }

    let total = 0;
    let savings = 0;

    for (const item of items) {
      const p = products.find(prod => prod.id === item.productId);
      const qty = Number(item.quantityKg);
      const price = Number(item.pricePerKg);
      total += qty * price;
      if (p) {
        // Savings vs traditional retail price
        const retailDiff = Math.max(0, p.retailPricePerKg - price);
        savings += retailDiff * qty;
        // reduce available quantity
        p.quantityKg = Math.max(0, p.quantityKg - qty);
      }
    }

    const orderNum = `SM-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTracking: OrderDeliveryTracking = {
      orderId: `ord-${Date.now()}`,
      orderNumber: orderNum,
      currentLat: 20.1706,
      currentLng: 73.9877,
      originLat: 20.1706,
      originLng: 73.9877,
      originName: items[0]?.farmerName ? `${items[0].farmerName}'s Farm Gate` : 'Local Farm Gate',
      destLat: 19.0760,
      destLng: 72.8777,
      destName: deliveryAddress || 'Buyer Destination Dock',
      progressPercent: 15,
      vehicleNumber: 'MH-15-SM-2026 (Direct Agri Carrier)',
      driverName: 'Kailas Borse',
      driverPhone: '+91 98223 88771',
      speedKmh: 48,
      temperatureCelsius: 6.5,
      estimatedArrivalMinutes: 95,
      distanceRemainingKm: 85,
      checkpoints: [
        { title: 'Harvest Inspected & Crated', location: 'Farm Gate', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), completed: true, isCurrent: false },
        { title: 'Dispatched via Agri Expressway', location: 'Rural Corridor', time: 'In Progress', completed: true, isCurrent: true },
        { title: 'State Toll & Temperature Inspection', location: 'Highway Checkpoint', time: 'Pending', completed: false, isCurrent: false },
        { title: 'Direct Buyer Delivery Point', location: deliveryAddress || 'Buyer Dock', time: 'Estimated 2 hrs', completed: false, isCurrent: false }
      ],
      routePath: [
        { lat: 20.1706, lng: 73.9877, name: 'Farm Gate' },
        { lat: 20.0063, lng: 73.7902, name: 'Expressway Hub' },
        { lat: 19.6974, lng: 73.5358, name: 'Ghat Checkpoint' },
        { lat: 19.0760, lng: 72.8777, name: 'Delivery Point' }
      ]
    };

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      buyerId: buyerId || 'user-customer-1',
      buyerName: buyerName || 'Direct Marketplace Buyer',
      buyerMobile: buyerMobile || '9923000000',
      buyerRole: buyerRole || 'customer',
      deliveryAddress: deliveryAddress || 'Registered Delivery Point',
      deliveryPincode: deliveryPincode || '400001',
      items,
      totalAmount: Math.round(total),
      totalSavingsVsRetail: Math.round(savings),
      status: 'accepted',
      paymentMethod: paymentMethod || 'Cash on Delivery',
      orderDate: new Date().toLocaleString(),
      specialInstructions,
      tracking: newTracking
    };

    orders.unshift(newOrder);
    res.status(201).json({ success: true, order: newOrder });
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = status;
    res.json({ success: true, order });
  });

  // 6. AI Demand Forecasting Engine (Powered by Gemini 3.8 Flash with algorithmic fallback)
  app.post('/api/ai/forecast', async (req, res) => {
    const { cropName, region } = req.body;
    const crop = cropName || 'Tomato';
    const reg = region || 'Maharashtra / Western India';

    const ai = getGenAI();
    if (ai) {
      try {
        const prompt = `You are an expert Agricultural Demand & Mandi Price Forecasting AI for Indian agriculture.
Analyze current market dynamics for:
Crop: "${crop}"
Region: "${reg}"

Provide a structured, data-grounded JSON response according to this schema:
{
  "cropName": "${crop}",
  "region": "${reg}",
  "demandTrend": "High Surge" | "Moderate Growth" | "Stable" | "Excess Supply",
  "projectedPriceChange": "e.g. +14% to +18% over next 10 days",
  "recommendedHarvestWindow": "e.g. Next 3 to 5 days before festival spike",
  "forecastSummary": "2-3 concise sentences explaining the arrival volume, weather impact, and consumer/bulk buyer demand.",
  "weeklyDemandIndex": [
    {"day": "Day 1", "demandIndex": 75, "projectedRate": 22},
    {"day": "Day 2", "demandIndex": 80, "projectedRate": 24},
    {"day": "Day 3", "demandIndex": 85, "projectedRate": 25},
    {"day": "Day 4", "demandIndex": 92, "projectedRate": 27},
    {"day": "Day 5", "demandIndex": 98, "projectedRate": 29},
    {"day": "Day 6", "demandIndex": 90, "projectedRate": 27},
    {"day": "Day 7", "demandIndex": 82, "projectedRate": 25}
  ],
  "keyFactors": ["factor 1", "factor 2", "factor 3", "factor 4"],
  "suggestedActionForFarmers": "Actionable advice on harvesting, holding, or direct selling.",
  "suggestedActionForBulkBuyers": "Advice for bulk buyers on procurement timing and volume contracts."
}
Return ONLY valid raw JSON with no markdown formatting.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ success: true, data: parsed, source: 'gemini-ai' });
        }
      } catch (err: any) {
        console.error('Gemini forecast error:', err?.message || err);
      }
    }

    // Heuristic fallbacks for agricultural demand forecasting
    const baseRates: Record<string, number> = {
      Tomato: 20,
      Onion: 24,
      Potato: 16,
      Cauliflower: 22,
      Capsicum: 35,
      Chilli: 45,
      Spinach: 25,
      Garlic: 140,
      Ginger: 75
    };
    const base = baseRates[crop] || 25;

    const mockForecast = {
      cropName: crop,
      region: reg,
      demandTrend: 'High Surge',
      projectedPriceChange: '+12% to +18% expected over next 7 days',
      recommendedHarvestWindow: 'Immediate harvest over next 48-72 hours',
      forecastSummary: `Strong institutional and festival demand observed across urban consumer hubs. Mandi arrivals from southern belts are currently delayed by 15%, creating a favorable price window for direct farm dispatch.`,
      weeklyDemandIndex: [
        { day: 'Mon', demandIndex: 72, projectedRate: base },
        { day: 'Tue', demandIndex: 78, projectedRate: Math.round(base * 1.05) },
        { day: 'Wed', demandIndex: 86, projectedRate: Math.round(base * 1.10) },
        { day: 'Thu', demandIndex: 94, projectedRate: Math.round(base * 1.18) },
        { day: 'Fri', demandIndex: 98, projectedRate: Math.round(base * 1.22) },
        { day: 'Sat', demandIndex: 91, projectedRate: Math.round(base * 1.16) },
        { day: 'Sun', demandIndex: 85, projectedRate: Math.round(base * 1.10) }
      ],
      keyFactors: [
        'Upcoming regional festivities driving 25% higher supermarket footfall',
        'Direct bulk procurement from hotel chains eliminating terminal APMC delays',
        'Lower rainfall disruption along national transit highways',
        'Cold-chain availability enables holding Grade A produce without spoilage'
      ],
      suggestedActionForFarmers: `Do not sell in distress to local village middlemen at below ₹${Math.round(base * 0.75)}/kg. List directly on KrishiSetu at ₹${Math.round(base * 1.1)}/kg for bulk dispatch on Wednesday-Friday.`,
      suggestedActionForBulkBuyers: `Lock in 1-week advance farm forward contracts to hedge against anticipated APMC wholesale spikes.`
    };

    res.json({ success: true, data: mockForecast, source: 'algorithmic-forecast' });
  });

  // 7. AI Route Optimization Engine
  app.post('/api/ai/route-optimize', async (req, res) => {
    const { originHub, destinationCity, selectedFarms } = req.body;
    const origin = originHub || 'Nashik APMC Aggregation Center';
    const dest = destinationCity || 'Mumbai / Pune Mega Terminal';

    const ai = getGenAI();
    if (ai) {
      try {
        const prompt = `You are an AI logistics dispatch optimizer for an agricultural farm-to-fork supply chain.
Optimize a consolidated multi-farm pickup route:
Origin: "${origin}"
Destination: "${dest}"
Selected Farm nodes: ${JSON.stringify(selectedFarms || ['Farm A (Pimpalgaon - 15Q Tomato)', 'Farm B (Niphad - 20Q Onion)', 'Farm C (Dindori - 10Q Capsicum)'])}

Calculate optimized sequence, distance reduction, fuel savings, and food spoilage minimization.
Return ONLY valid JSON:
{
  "originMandiHub": "${origin}",
  "destinationCenter": "${dest}",
  "farmsToVisit": [
    {"name": "Sahyadri Cluster 1", "location": "Pimpalgaon", "crop": "Tomatoes", "loadQuintals": 18, "sequence": 1},
    {"name": "Niphad Onion Cooperative", "location": "Niphad", "crop": "Onions", "loadQuintals": 22, "sequence": 2},
    {"name": "Dindori Polyhouse Collective", "location": "Dindori", "crop": "Capsicum", "loadQuintals": 12, "sequence": 3}
  ],
  "totalDistanceKm": 218,
  "originalUnoptimizedKm": 325,
  "fuelSavedLitres": 32.5,
  "costSavedInr": 3450,
  "carbonEmissionSavedKg": 86.2,
  "estimatedTransitTimeHours": 4.8,
  "routeHighlights": [
    "Consolidated 3 separate trips into a single 4T Reefer dispatch",
    "Avoided return deadhead travel via circular rural collection loop",
    "Reduced farm-to-table transit time by 3.5 hours, saving 12% perishability loss",
    "Zero toll congestion by utilizing early-morning green corridor timing"
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ success: true, data: parsed, source: 'gemini-ai' });
        }
      } catch (err: any) {
        console.error('Gemini route optimize error:', err?.message || err);
      }
    }

    // Heuristic route optimization
    const fallbackRoute = {
      originMandiHub: origin,
      destinationCenter: dest,
      farmsToVisit: [
        { name: 'Ramesh Patil Farm Gate', location: 'Pimpalgaon Baswant', crop: 'Vaishnavi Tomatoes', loadQuintals: 18, sequence: 1 },
        { name: 'Niphad FPO Collection Hub', location: 'Niphad Rural', crop: 'Garwa Onions', loadQuintals: 20, sequence: 2 },
        { name: 'Dindori Organic Farm Net', location: 'Dindori Phata', crop: 'Green Capsicum', loadQuintals: 10, sequence: 3 }
      ],
      totalDistanceKm: 214,
      originalUnoptimizedKm: 318,
      fuelSavedLitres: 31.2,
      costSavedInr: 3350,
      carbonEmissionSavedKg: 82.5,
      estimatedTransitTimeHours: 4.5,
      routeHighlights: [
        'Consolidated 3 individual farmer dispatches into 1 temperature-controlled truck',
        'Cut 104 km of redundant highway travel via intelligent circular pickup loop',
        'Farm-gate collection completed in 2.2 hrs before midday heat, minimizing fresh crop weight loss',
        'Direct delivery dock arrival timed perfectly for evening supermarket staging'
      ]
    };

    res.json({ success: true, data: fallbackRoute, source: 'algorithmic-route' });
  });

  // 8. AI Crop Advisory / Krishi Sahayak
  app.post('/api/ai/crop-advisory', async (req, res) => {
    const { question, crop, role } = req.body;
    const ai = getGenAI();

    if (ai) {
      try {
        const prompt = `You are "KrishiSetu AI Sahayak", a practical, encouraging, and highly knowledgeable agricultural advisor for Indian farmers, bulk buyers, and consumers.
User Role: ${role || 'farmer'}
Subject Crop: ${crop || 'Vegetables'}
User Query: "${question || 'What is the best way to get maximum price for my tomato harvest without giving commission to APMC agents?'}"

Provide a clear, practical, bulleted answer that empowers the user with pricing strategies, direct selling tips, logistics packing, and quality sorting. Keep it empathetic and professional.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        });

        if (response.text) {
          return res.json({ success: true, answer: response.text });
        }
      } catch (err: any) {
        console.error('Gemini advisory error:', err?.message || err);
      }
    }

    res.json({
      success: true,
      answer: `Here are 4 key recommendations to maximize your returns:
1. **Grade Before Dispatch**: Segregate your harvest into Grade A (uniform size, zero blemishes for supermarkets/hotels) and Grade B (standard for retail markets). Grade A yields 35-45% higher realization.
2. **Bypass Traditional 8.5% Adat (Commission)**: In conventional mandis, commissions, weighment charges, and delayed payment reduce your net take-home to only 55-60% of retail price. By selling directly on KrishiSetu, you keep 95%+ of the transaction value.
3. **Group Dispatch via FPO**: Combine your produce with 2-3 neighboring farmers to fill a 2.5T or 4T vehicle. This slashes per-kg logistics cost from ₹3.50/kg to under ₹1.20/kg.
4. **Monitor Live Mandi Ticker**: Check KrishiSetu's live ticker every morning at 07:00 AM. If terminal prices are climbing, hold dry vegetables (like onions and potatoes) for 3-4 days to capture the upward swing.`
    });
  });

  // =========================================================================
  // 9. Fresh Website Clean Slate & Sample Seeding Endpoints
  // =========================================================================
  // Allows user to wipe all demo products, orders, and bookings for a completely fresh website
  app.post('/api/clean-slate', (req, res) => {
    products = [];
    orders = [];
    bookings = [];
    res.json({
      success: true,
      message: 'Clean slate activated: All demo products, orders, and bookings have been cleared. Ready to add fresh data!',
      productsCount: products.length,
      ordersCount: orders.length
    });
  });

  // Allows user to reload baseline samples if desired
  app.post('/api/seed-sample', (req, res) => {
    products = [...SAMPLE_PRODUCTS];
    orders = [...SAMPLE_ORDERS];
    bookings = [...SAMPLE_BOOKINGS];
    res.json({
      success: true,
      message: 'Baseline agricultural samples reloaded successfully.',
      productsCount: products.length,
      ordersCount: orders.length
    });
  });

  // =========================================================================
  // 10. Machine Learning Training & Inference Endpoints
  // =========================================================================
  // Returns currently trained ML model evaluation metrics and feature weights
  app.get('/api/ml/metrics', (req, res) => {
    res.json({ success: true, metrics: agriculturalMLModel.getMetrics() });
  });

  // Executes model training with user-specified hyperparameters
  app.post('/api/ml/train', async (req, res) => {
    const { epochs, learningRate, l2Regularization, batchSize } = req.body || {};
    try {
      const trainedMetrics = await agriculturalMLModel.train(undefined, {
        epochs: Number(epochs) || 120,
        learningRate: Number(learningRate) || 0.04,
        l2Regularization: Number(l2Regularization) || 0.01,
        batchSize: Number(batchSize) || 8
      });
      res.json({ success: true, metrics: trainedMetrics });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Training failed' });
    }
  });

  // Executes forward inference to predict fair farm-gate prices and market demand
  app.post('/api/ml/predict', (req, res) => {
    try {
      const result = agriculturalMLModel.predict(req.body);
      res.json({ success: true, prediction: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err?.message || 'Inference failed' });
    }
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KrishiSetu Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
