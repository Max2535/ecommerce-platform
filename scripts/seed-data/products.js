// Seed data for product-service (MongoDB)
// Run with: docker exec -i ecommerce-mongodb mongosh productdb < scripts/seed-data/products.js

db = db.getSiblingDB('productdb');

// Clear existing data
db.products.drop();

// Insert products
db.products.insertMany([
  // Electronics - Smartphones
  {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    name: "iPhone 15 Pro Max",
    slug: "iphone-15-pro-max",
    description: "Apple iPhone 15 Pro Max with A17 Pro chip, titanium design, and advanced camera system. Features 48MP main camera, USB-C, and Action button.",
    shortDescription: "Latest iPhone with titanium design",
    sku: "APPL-IPH15PM-256",
    price: 48900,
    compareAtPrice: 52900,
    cost: 35000,
    category: "Electronics",
    subcategory: "Smartphones",
    brand: "Apple",
    tags: ["smartphone", "apple", "5g", "premium", "new"],
    images: [
      { url: "https://picsum.photos/seed/iphone15/800/800", alt: "iPhone 15 Pro Max", isPrimary: true },
      { url: "https://picsum.photos/seed/iphone15b/800/800", alt: "iPhone 15 Pro Max Back", isPrimary: false }
    ],
    stock: 50,
    lowStockThreshold: 10,
    weight: { value: 221, unit: "g" },
    dimensions: { length: 15.99, width: 7.69, height: 0.83, unit: "cm" },
    attributes: { color: "Natural Titanium", storage: "256GB", ram: "8GB" },
    isActive: true,
    isFeatured: true,
    rating: { average: 4.8, count: 256 },
    viewCount: 15420,
    salesCount: 892,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439012"),
    name: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    description: "Samsung Galaxy S24 Ultra with Snapdragon 8 Gen 3, S Pen, and AI features. 200MP camera with advanced zoom capabilities.",
    shortDescription: "AI-powered flagship smartphone",
    sku: "SAMS-S24U-256",
    price: 44900,
    compareAtPrice: 47900,
    cost: 32000,
    category: "Electronics",
    subcategory: "Smartphones",
    brand: "Samsung",
    tags: ["smartphone", "samsung", "5g", "premium", "ai"],
    images: [
      { url: "https://picsum.photos/seed/s24ultra/800/800", alt: "Samsung Galaxy S24 Ultra", isPrimary: true }
    ],
    stock: 75,
    lowStockThreshold: 15,
    weight: { value: 232, unit: "g" },
    dimensions: { length: 16.26, width: 7.9, height: 0.86, unit: "cm" },
    attributes: { color: "Titanium Black", storage: "256GB", ram: "12GB" },
    isActive: true,
    isFeatured: true,
    rating: { average: 4.7, count: 189 },
    viewCount: 12350,
    salesCount: 654,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Electronics - Laptops
  {
    _id: ObjectId("507f1f77bcf86cd799439013"),
    name: "MacBook Pro 14 M3 Pro",
    slug: "macbook-pro-14-m3-pro",
    description: "MacBook Pro 14-inch with M3 Pro chip. Features Liquid Retina XDR display, up to 18 hours battery life, and pro-level performance.",
    shortDescription: "Pro laptop with M3 Pro chip",
    sku: "APPL-MBP14-M3P",
    price: 69900,
    compareAtPrice: 74900,
    cost: 52000,
    category: "Electronics",
    subcategory: "Laptops",
    brand: "Apple",
    tags: ["laptop", "apple", "macbook", "professional", "m3"],
    images: [
      { url: "https://picsum.photos/seed/mbp14/800/800", alt: "MacBook Pro 14", isPrimary: true }
    ],
    stock: 30,
    lowStockThreshold: 5,
    weight: { value: 1.55, unit: "kg" },
    dimensions: { length: 31.26, width: 22.12, height: 1.55, unit: "cm" },
    attributes: { color: "Space Black", storage: "512GB SSD", ram: "18GB" },
    isActive: true,
    isFeatured: true,
    rating: { average: 4.9, count: 145 },
    viewCount: 8920,
    salesCount: 234,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Electronics - Headphones
  {
    _id: ObjectId("507f1f77bcf86cd799439014"),
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    description: "Industry-leading noise canceling headphones with Auto NC Optimizer, crystal clear hands-free calling, and up to 30-hour battery life.",
    shortDescription: "Premium noise canceling headphones",
    sku: "SONY-WH1000XM5",
    price: 12900,
    compareAtPrice: 14900,
    cost: 8500,
    category: "Electronics",
    subcategory: "Headphones",
    brand: "Sony",
    tags: ["headphones", "sony", "noise-canceling", "wireless", "premium"],
    images: [
      { url: "https://picsum.photos/seed/sonyxm5/800/800", alt: "Sony WH-1000XM5", isPrimary: true }
    ],
    stock: 100,
    lowStockThreshold: 20,
    weight: { value: 250, unit: "g" },
    dimensions: { length: 20, width: 18, height: 8, unit: "cm" },
    attributes: { color: "Black", batteryLife: "30 hours", noiseCanceling: true },
    isActive: true,
    isFeatured: false,
    rating: { average: 4.8, count: 512 },
    viewCount: 25680,
    salesCount: 1205,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439015"),
    name: "AirPods Pro 2",
    slug: "airpods-pro-2",
    description: "AirPods Pro 2nd generation with H2 chip, Active Noise Cancellation, Adaptive Transparency, and Personalized Spatial Audio.",
    shortDescription: "Premium wireless earbuds by Apple",
    sku: "APPL-APP2-WHT",
    price: 8990,
    compareAtPrice: 9490,
    cost: 6000,
    category: "Electronics",
    subcategory: "Headphones",
    brand: "Apple",
    tags: ["earbuds", "apple", "wireless", "noise-canceling"],
    images: [
      { url: "https://picsum.photos/seed/airpodspro/800/800", alt: "AirPods Pro 2", isPrimary: true }
    ],
    stock: 150,
    lowStockThreshold: 30,
    weight: { value: 50, unit: "g" },
    dimensions: { length: 4.5, width: 6, height: 2.1, unit: "cm" },
    attributes: { color: "White", batteryLife: "6 hours", chargingCase: "MagSafe" },
    isActive: true,
    isFeatured: true,
    rating: { average: 4.7, count: 890 },
    viewCount: 45230,
    salesCount: 2341,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Fashion - Men
  {
    _id: ObjectId("507f1f77bcf86cd799439021"),
    name: "Classic Polo Shirt",
    slug: "classic-polo-shirt-navy",
    description: "Premium cotton polo shirt with classic fit. Perfect for casual and semi-formal occasions. Breathable fabric for all-day comfort.",
    shortDescription: "Classic fit cotton polo",
    sku: "FSH-POLO-NVY-M",
    price: 990,
    compareAtPrice: 1290,
    cost: 450,
    category: "Fashion",
    subcategory: "Men",
    brand: "StyleCo",
    tags: ["polo", "shirt", "men", "casual", "cotton"],
    images: [
      { url: "https://picsum.photos/seed/polo/800/800", alt: "Classic Polo Shirt", isPrimary: true }
    ],
    stock: 200,
    lowStockThreshold: 40,
    weight: { value: 250, unit: "g" },
    dimensions: { length: 30, width: 25, height: 2, unit: "cm" },
    attributes: { color: "Navy Blue", size: "M", material: "100% Cotton" },
    isActive: true,
    isFeatured: false,
    rating: { average: 4.5, count: 234 },
    viewCount: 8920,
    salesCount: 567,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439022"),
    name: "Slim Fit Jeans",
    slug: "slim-fit-jeans-dark-blue",
    description: "Modern slim fit jeans with stretch denim for comfortable wear. Classic 5-pocket styling with premium quality construction.",
    shortDescription: "Comfortable stretch denim jeans",
    sku: "FSH-JEAN-DBL-32",
    price: 1590,
    compareAtPrice: 1990,
    cost: 680,
    category: "Fashion",
    subcategory: "Men",
    brand: "DenimPro",
    tags: ["jeans", "denim", "men", "casual", "slim-fit"],
    images: [
      { url: "https://picsum.photos/seed/jeans/800/800", alt: "Slim Fit Jeans", isPrimary: true }
    ],
    stock: 150,
    lowStockThreshold: 30,
    weight: { value: 600, unit: "g" },
    dimensions: { length: 40, width: 30, height: 3, unit: "cm" },
    attributes: { color: "Dark Blue", size: "32", material: "98% Cotton, 2% Elastane" },
    isActive: true,
    isFeatured: false,
    rating: { average: 4.4, count: 189 },
    viewCount: 6540,
    salesCount: 423,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Fashion - Women
  {
    _id: ObjectId("507f1f77bcf86cd799439023"),
    name: "Floral Summer Dress",
    slug: "floral-summer-dress",
    description: "Beautiful floral print summer dress with A-line silhouette. Lightweight and breathable fabric perfect for warm weather.",
    shortDescription: "Elegant floral print dress",
    sku: "FSH-DRSS-FLR-S",
    price: 1290,
    compareAtPrice: 1690,
    cost: 520,
    category: "Fashion",
    subcategory: "Women",
    brand: "Elegance",
    tags: ["dress", "women", "floral", "summer", "casual"],
    images: [
      { url: "https://picsum.photos/seed/dress/800/800", alt: "Floral Summer Dress", isPrimary: true }
    ],
    stock: 80,
    lowStockThreshold: 15,
    weight: { value: 300, unit: "g" },
    dimensions: { length: 35, width: 28, height: 2, unit: "cm" },
    attributes: { color: "Multicolor", size: "S", material: "100% Viscose" },
    isActive: true,
    isFeatured: true,
    rating: { average: 4.6, count: 156 },
    viewCount: 12340,
    salesCount: 289,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Home & Living
  {
    _id: ObjectId("507f1f77bcf86cd799439031"),
    name: "Smart Air Purifier",
    slug: "smart-air-purifier",
    description: "HEPA air purifier with smart controls via app. Covers up to 50 sqm, with real-time air quality monitoring and auto mode.",
    shortDescription: "Smart HEPA air purifier",
    sku: "HOM-AIRP-WHT",
    price: 5990,
    compareAtPrice: 7490,
    cost: 3200,
    category: "Home & Living",
    subcategory: "Appliances",
    brand: "CleanAir",
    tags: ["air-purifier", "smart-home", "hepa", "appliance"],
    images: [
      { url: "https://picsum.photos/seed/airpurifier/800/800", alt: "Smart Air Purifier", isPrimary: true }
    ],
    stock: 45,
    lowStockThreshold: 10,
    weight: { value: 5.2, unit: "kg" },
    dimensions: { length: 35, width: 35, height: 60, unit: "cm" },
    attributes: { color: "White", coverage: "50 sqm", filterType: "HEPA H13" },
    isActive: true,
    isFeatured: false,
    rating: { average: 4.5, count: 98 },
    viewCount: 5670,
    salesCount: 145,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439032"),
    name: "Ergonomic Office Chair",
    slug: "ergonomic-office-chair",
    description: "Premium ergonomic office chair with lumbar support, adjustable armrests, and breathable mesh back. Perfect for long working hours.",
    shortDescription: "Comfortable ergonomic chair",
    sku: "HOM-CHAIR-BLK",
    price: 8990,
    compareAtPrice: 11990,
    cost: 4800,
    category: "Home & Living",
    subcategory: "Furniture",
    brand: "ErgoMax",
    tags: ["chair", "office", "ergonomic", "furniture", "work-from-home"],
    images: [
      { url: "https://picsum.photos/seed/chair/800/800", alt: "Ergonomic Office Chair", isPrimary: true }
    ],
    stock: 25,
    lowStockThreshold: 5,
    weight: { value: 15, unit: "kg" },
    dimensions: { length: 65, width: 65, height: 120, unit: "cm" },
    attributes: { color: "Black", material: "Mesh + Metal", maxWeight: "150kg" },
    isActive: true,
    isFeatured: true,
    rating: { average: 4.7, count: 234 },
    viewCount: 9870,
    salesCount: 312,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Sports & Outdoors
  {
    _id: ObjectId("507f1f77bcf86cd799439041"),
    name: "Running Shoes Pro",
    slug: "running-shoes-pro",
    description: "Professional running shoes with advanced cushioning technology. Lightweight design with excellent grip for all surfaces.",
    shortDescription: "High-performance running shoes",
    sku: "SPT-RUN-BLK-42",
    price: 3990,
    compareAtPrice: 4990,
    cost: 1800,
    category: "Sports & Outdoors",
    subcategory: "Footwear",
    brand: "SpeedRun",
    tags: ["shoes", "running", "sports", "athletic", "comfortable"],
    images: [
      { url: "https://picsum.photos/seed/runshoes/800/800", alt: "Running Shoes Pro", isPrimary: true }
    ],
    stock: 120,
    lowStockThreshold: 25,
    weight: { value: 600, unit: "g" },
    dimensions: { length: 32, width: 12, height: 10, unit: "cm" },
    attributes: { color: "Black/Red", size: "42", material: "Mesh + Rubber" },
    isActive: true,
    isFeatured: false,
    rating: { average: 4.6, count: 345 },
    viewCount: 15670,
    salesCount: 567,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439042"),
    name: "Yoga Mat Premium",
    slug: "yoga-mat-premium",
    description: "Extra thick 6mm yoga mat with non-slip surface. Eco-friendly TPE material, perfect for yoga, pilates, and floor exercises.",
    shortDescription: "Eco-friendly non-slip yoga mat",
    sku: "SPT-YOGA-PRP",
    price: 890,
    compareAtPrice: 1190,
    cost: 380,
    category: "Sports & Outdoors",
    subcategory: "Fitness",
    brand: "ZenFit",
    tags: ["yoga", "mat", "fitness", "exercise", "eco-friendly"],
    images: [
      { url: "https://picsum.photos/seed/yogamat/800/800", alt: "Yoga Mat Premium", isPrimary: true }
    ],
    stock: 200,
    lowStockThreshold: 40,
    weight: { value: 1.2, unit: "kg" },
    dimensions: { length: 183, width: 61, height: 0.6, unit: "cm" },
    attributes: { color: "Purple", thickness: "6mm", material: "TPE" },
    isActive: true,
    isFeatured: false,
    rating: { average: 4.4, count: 178 },
    viewCount: 7890,
    salesCount: 423,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Beauty & Personal Care
  {
    _id: ObjectId("507f1f77bcf86cd799439051"),
    name: "Vitamin C Serum",
    slug: "vitamin-c-serum-30ml",
    description: "20% Vitamin C serum with hyaluronic acid and vitamin E. Brightens skin, reduces dark spots, and provides antioxidant protection.",
    shortDescription: "Brightening vitamin C serum",
    sku: "BTY-SERUM-VTC",
    price: 790,
    compareAtPrice: 990,
    cost: 280,
    category: "Beauty & Personal Care",
    subcategory: "Skincare",
    brand: "GlowSkin",
    tags: ["serum", "skincare", "vitamin-c", "brightening", "anti-aging"],
    images: [
      { url: "https://picsum.photos/seed/serum/800/800", alt: "Vitamin C Serum", isPrimary: true }
    ],
    stock: 300,
    lowStockThreshold: 50,
    weight: { value: 80, unit: "g" },
    dimensions: { length: 10, width: 3, height: 3, unit: "cm" },
    attributes: { size: "30ml", skinType: "All", ingredients: "Vitamin C 20%, Hyaluronic Acid" },
    isActive: true,
    isFeatured: true,
    rating: { average: 4.7, count: 567 },
    viewCount: 23450,
    salesCount: 1234,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create indexes
db.products.createIndex({ slug: 1 }, { unique: true });
db.products.createIndex({ sku: 1 }, { unique: true });
db.products.createIndex({ category: 1, subcategory: 1 });
db.products.createIndex({ name: "text", description: "text" });
db.products.createIndex({ isActive: 1, isFeatured: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ createdAt: -1 });

// Verify data
print("Products seeded: " + db.products.countDocuments());
print("Categories: " + db.products.distinct("category"));
