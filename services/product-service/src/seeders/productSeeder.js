const Product = require('../models/Product');
const database = require('../config/database');

/**
 * Sample products data
 */
const sampleProducts = [
  {
    name: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max',
    description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Features include 6.7-inch Super Retina XDR display, 48MP main camera, and up to 1TB storage.',
    shortDescription: 'The most powerful iPhone ever with titanium design',
    price: 42900,
    compareAtPrice: 45900,
    category: 'Electronics',
    subcategory: 'Smartphones',
    brand: 'Apple',
    images: [
      { url: 'https://picsum.photos/seed/iphone1/800/800', alt: 'iPhone 15 Pro Max Front', position: 0 },
      { url: 'https://picsum.photos/seed/iphone2/800/800', alt: 'iPhone 15 Pro Max Back', position: 1 },
    ],
    stock: 50,
    sku: 'IPH15PM-256-BLK',
    weight: { value: 221, unit: 'g' },
    dimensions: { length: 15.99, width: 7.67, height: 0.83, unit: 'cm' },
    tags: ['smartphone', 'apple', 'iphone', '5g', 'titanium'],
    features: [
      { name: 'Display', value: '6.7" Super Retina XDR' },
      { name: 'Chip', value: 'A17 Pro' },
      { name: 'Camera', value: '48MP Main, 12MP Ultra Wide, 12MP Telephoto' },
      { name: 'Battery', value: 'Up to 29 hours video playback' },
    ],
    isFeatured: true,
  },
  {
    name: 'MacBook Pro 16" M3 Max',
    slug: 'macbook-pro-16-m3-max',
    description: 'Professional laptop with M3 Max chip for ultimate performance. Perfect for video editing, 3D rendering, and software development.',
    price: 89900,
    category: 'Electronics',
    subcategory: 'Laptops',
    brand: 'Apple',
    images: [
      { url: 'https://picsum.photos/seed/macbook1/800/800', alt: 'MacBook Pro', position: 0 },
    ],
    stock: 25,
    sku: 'MBP16-M3MAX-1TB',
    weight: { value: 2.15, unit: 'kg' },
    tags: ['laptop', 'apple', 'macbook', 'professional'],
    isFeatured: true,
  },
  {
    name: 'Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    description: 'Industry-leading noise canceling headphones with exceptional sound quality and all-day comfort.',
    price: 13900,
    compareAtPrice: 15900,
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'Sony',
    images: [
      { url: 'https://picsum.photos/seed/sony1/800/800', alt: 'Sony Headphones', position: 0 },
    ],
    stock: 100,
    sku: 'SONY-WH1000XM5-BLK',
    weight: { value: 250, unit: 'g' },
    tags: ['headphones', 'wireless', 'noise-canceling', 'sony'],
    isFeatured: true,
  },
  {
    name: 'Nike Air Max 270',
    slug: 'nike-air-max-270',
    description: 'Comfortable running shoes with Max Air cushioning for all-day wear.',
    price: 5500,
    category: 'Clothing',
    subcategory: 'Shoes',
    brand: 'Nike',
    images: [
      { url: 'https://picsum.photos/seed/nike1/800/800', alt: 'Nike Shoes', position: 0 },
    ],
    stock: 200,
    sku: 'NIKE-AM270-BLK-42',
    tags: ['shoes', 'nike', 'running', 'sports'],
  },
  {
    name: 'Atomic Habits by James Clear',
    slug: 'atomic-habits-by-james-clear',
    description: 'An easy & proven way to build good habits & break bad ones. Transform your life one tiny change at a time.',
    price: 450,
    category: 'Books',
    subcategory: 'Self-Help',
    brand: 'Avery',
    images: [
      { url: 'https://picsum.photos/seed/book1/800/800', alt: 'Atomic Habits Book', position: 0 },
    ],
    stock: 150,
    sku: 'BOOK-ATOMIC-EN',
    weight: { value: 380, unit: 'g' },
    tags: ['book', 'self-help', 'habits', 'productivity'],
    isFeatured: true,
  },
];

/**
 * Seed database with sample products
 */
async function seedProducts() {
  try {
    console.log('🌱 Starting product seeding...');

    // Connect to database
    await database.connect();

    // Clear existing products
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${products.length} products`);

    // Display created products
    products.forEach((product) => {
      console.log(`   - ${product.name} (${product.sku})`);
    });

    console.log('🎉 Seeding completed successfully!');

    // Disconnect
    await database.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeder
seedProducts();