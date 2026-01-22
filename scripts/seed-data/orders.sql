-- Seed data for order-service (MySQL)
-- Run with: docker exec -i ecommerce-mysql mysql -u root -pmysql_password orderdb < scripts/seed-data/orders.sql

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert sample orders
-- Order 1: John Doe - Delivered order
INSERT INTO orders (
  id, order_number, user_id, status, subtotal, tax, shipping_cost, discount, total_amount,
  shipping_address, payment_method, payment_status, paid_at, tracking_number, shipped_at, delivered_at,
  customer_notes, created_at, updated_at
) VALUES (
  'ord-0001-0001-0001-000000000001',
  'ORD2501150001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'delivered',
  57890.00,
  4052.30,
  0.00,
  0.00,
  61942.30,
  '{"street": "123 Sukhumvit Road", "city": "Bangkok", "state": "Bangkok", "postalCode": "10110", "country": "Thailand"}',
  'credit_card',
  'paid',
  DATE_SUB(NOW(), INTERVAL 10 DAY),
  'TH123456789',
  DATE_SUB(NOW(), INTERVAL 8 DAY),
  DATE_SUB(NOW(), INTERVAL 5 DAY),
  'Please deliver in the morning',
  DATE_SUB(NOW(), INTERVAL 12 DAY),
  DATE_SUB(NOW(), INTERVAL 5 DAY)
);

-- Order 2: Jane Smith - Shipped order
INSERT INTO orders (
  id, order_number, user_id, status, subtotal, tax, shipping_cost, discount, total_amount,
  shipping_address, payment_method, payment_status, paid_at, tracking_number, shipped_at,
  created_at, updated_at
) VALUES (
  'ord-0002-0002-0002-000000000001',
  'ORD2501180001',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'shipped',
  13890.00,
  972.30,
  0.00,
  500.00,
  14362.30,
  '{"street": "789 Ratchada Road", "city": "Bangkok", "state": "Bangkok", "postalCode": "10400", "country": "Thailand"}',
  'e_wallet',
  'paid',
  DATE_SUB(NOW(), INTERVAL 3 DAY),
  'TH987654321',
  DATE_SUB(NOW(), INTERVAL 1 DAY),
  DATE_SUB(NOW(), INTERVAL 5 DAY),
  DATE_SUB(NOW(), INTERVAL 1 DAY)
);

-- Order 3: Bob Wilson - Processing order
INSERT INTO orders (
  id, order_number, user_id, status, subtotal, tax, shipping_cost, discount, total_amount,
  shipping_address, payment_method, payment_status, paid_at,
  created_at, updated_at
) VALUES (
  'ord-0003-0003-0003-000000000001',
  'ORD2501200001',
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'processing',
  8990.00,
  629.30,
  0.00,
  0.00,
  9619.30,
  '{"street": "321 Nimman Road", "city": "Chiang Mai", "state": "Chiang Mai", "postalCode": "50200", "country": "Thailand"}',
  'bank_transfer',
  'paid',
  DATE_SUB(NOW(), INTERVAL 1 DAY),
  DATE_SUB(NOW(), INTERVAL 2 DAY),
  NOW()
);

-- Order 4: Alice Johnson - Pending order
INSERT INTO orders (
  id, order_number, user_id, status, subtotal, tax, shipping_cost, discount, total_amount,
  shipping_address, payment_method, payment_status,
  customer_notes, created_at, updated_at
) VALUES (
  'ord-0004-0004-0004-000000000001',
  'ORD2501210001',
  'd4e5f6a7-b8c9-0123-def0-234567890123',
  'pending',
  2580.00,
  180.60,
  50.00,
  0.00,
  2810.60,
  '{"street": "555 Beach Road", "city": "Pattaya", "state": "Chonburi", "postalCode": "20150", "country": "Thailand"}',
  'cash_on_delivery',
  'pending',
  'Leave at the front door',
  NOW(),
  NOW()
);

-- Order 5: John Doe - Cancelled order
INSERT INTO orders (
  id, order_number, user_id, status, subtotal, tax, shipping_cost, discount, total_amount,
  shipping_address, payment_method, payment_status, cancelled_at, cancellation_reason,
  created_at, updated_at
) VALUES (
  'ord-0005-0005-0005-000000000001',
  'ORD2501100001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'cancelled',
  4990.00,
  349.30,
  50.00,
  0.00,
  5389.30,
  '{"street": "123 Sukhumvit Road", "city": "Bangkok", "state": "Bangkok", "postalCode": "10110", "country": "Thailand"}',
  'credit_card',
  'refunded',
  DATE_SUB(NOW(), INTERVAL 15 DAY),
  'Customer requested cancellation - changed mind',
  DATE_SUB(NOW(), INTERVAL 20 DAY),
  DATE_SUB(NOW(), INTERVAL 15 DAY)
);

-- Insert order items
-- Order 1 items (iPhone + AirPods)
INSERT INTO order_items (id, order_id, product_id, product_name, product_sku, quantity, unit_price, subtotal, discount, total, product_image, created_at, updated_at) VALUES
  ('item-0001-0001-0001-000000000001', 'ord-0001-0001-0001-000000000001', '507f1f77bcf86cd799439011', 'iPhone 15 Pro Max', 'APPL-IPH15PM-256', 1, 48900.00, 48900.00, 0.00, 48900.00, 'https://picsum.photos/seed/iphone15/800/800', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
  ('item-0001-0001-0001-000000000002', 'ord-0001-0001-0001-000000000001', '507f1f77bcf86cd799439015', 'AirPods Pro 2', 'APPL-APP2-WHT', 1, 8990.00, 8990.00, 0.00, 8990.00, 'https://picsum.photos/seed/airpodspro/800/800', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY));

-- Order 2 items (Sony Headphones + Running Shoes)
INSERT INTO order_items (id, order_id, product_id, product_name, product_sku, quantity, unit_price, subtotal, discount, total, product_image, created_at, updated_at) VALUES
  ('item-0002-0002-0002-000000000001', 'ord-0002-0002-0002-000000000001', '507f1f77bcf86cd799439014', 'Sony WH-1000XM5', 'SONY-WH1000XM5', 1, 12900.00, 12900.00, 500.00, 12400.00, 'https://picsum.photos/seed/sonyxm5/800/800', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
  ('item-0002-0002-0002-000000000002', 'ord-0002-0002-0002-000000000001', '507f1f77bcf86cd799439042', 'Yoga Mat Premium', 'SPT-YOGA-PRP', 1, 890.00, 890.00, 0.00, 890.00, 'https://picsum.photos/seed/yogamat/800/800', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Order 3 items (Ergonomic Chair)
INSERT INTO order_items (id, order_id, product_id, product_name, product_sku, quantity, unit_price, subtotal, discount, total, product_image, created_at, updated_at) VALUES
  ('item-0003-0003-0003-000000000001', 'ord-0003-0003-0003-000000000001', '507f1f77bcf86cd799439032', 'Ergonomic Office Chair', 'HOM-CHAIR-BLK', 1, 8990.00, 8990.00, 0.00, 8990.00, 'https://picsum.photos/seed/chair/800/800', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Order 4 items (Polo + Jeans)
INSERT INTO order_items (id, order_id, product_id, product_name, product_sku, quantity, unit_price, subtotal, discount, total, product_image, created_at, updated_at) VALUES
  ('item-0004-0004-0004-000000000001', 'ord-0004-0004-0004-000000000001', '507f1f77bcf86cd799439021', 'Classic Polo Shirt', 'FSH-POLO-NVY-M', 1, 990.00, 990.00, 0.00, 990.00, 'https://picsum.photos/seed/polo/800/800', NOW(), NOW()),
  ('item-0004-0004-0004-000000000002', 'ord-0004-0004-0004-000000000001', '507f1f77bcf86cd799439022', 'Slim Fit Jeans', 'FSH-JEAN-DBL-32', 1, 1590.00, 1590.00, 0.00, 1590.00, 'https://picsum.photos/seed/jeans/800/800', NOW(), NOW());

-- Order 5 items (Running Shoes - cancelled)
INSERT INTO order_items (id, order_id, product_id, product_name, product_sku, quantity, unit_price, subtotal, discount, total, product_image, created_at, updated_at) VALUES
  ('item-0005-0005-0005-000000000001', 'ord-0005-0005-0005-000000000001', '507f1f77bcf86cd799439041', 'Running Shoes Pro', 'SPT-RUN-BLK-42', 1, 3990.00, 3990.00, 0.00, 3990.00, 'https://picsum.photos/seed/runshoes/800/800', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
  ('item-0005-0005-0005-000000000002', 'ord-0005-0005-0005-000000000001', '507f1f77bcf86cd799439021', 'Classic Polo Shirt', 'FSH-POLO-NVY-M', 1, 990.00, 990.00, 0.00, 990.00, 'https://picsum.photos/seed/polo/800/800', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY));

-- Verify data
SELECT 'Orders seeded:' as info, COUNT(*) as count FROM orders;
SELECT 'Order items seeded:' as info, COUNT(*) as count FROM order_items;
SELECT 'Orders by status:' as info, status, COUNT(*) as count FROM orders GROUP BY status;
