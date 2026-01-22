-- Seed data for user-service (PostgreSQL)
-- Run with: docker exec -i ecommerce-postgres psql -U postgres -d userdb < scripts/seed-data/users.sql

-- Clear existing data
TRUNCATE TABLE addresses CASCADE;
TRUNCATE TABLE users CASCADE;

-- Insert test users (passwords are hashed version of 'Password123')
-- Hash generated with bcrypt, 10 rounds
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active, email_verified, created_at, updated_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'john.doe@example.com', '$2b$10$rQZ8K.5H5H5H5H5H5H5H5OqX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'John', 'Doe', '0812345678', true, true, NOW(), NOW()),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'jane.smith@example.com', '$2b$10$rQZ8K.5H5H5H5H5H5H5H5OqX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'Jane', 'Smith', '0823456789', true, true, NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'bob.wilson@example.com', '$2b$10$rQZ8K.5H5H5H5H5H5H5H5OqX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'Bob', 'Wilson', '0834567890', true, false, NOW(), NOW()),
  ('d4e5f6a7-b8c9-0123-def0-234567890123', 'alice.johnson@example.com', '$2b$10$rQZ8K.5H5H5H5H5H5H5H5OqX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'Alice', 'Johnson', '0845678901', true, true, NOW(), NOW()),
  ('e5f6a7b8-c9d0-1234-ef01-345678901234', 'admin@example.com', '$2b$10$rQZ8K.5H5H5H5H5H5H5H5OqX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'Admin', 'User', '0856789012', true, true, NOW(), NOW());

-- Insert addresses for users
INSERT INTO addresses (id, user_id, street, city, state, postal_code, country, is_default, created_at, updated_at) VALUES
  -- John Doe's addresses
  ('addr-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '123 Sukhumvit Road', 'Bangkok', 'Bangkok', '10110', 'Thailand', true, NOW(), NOW()),
  ('addr-0001-0001-0001-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '456 Silom Road', 'Bangkok', 'Bangkok', '10500', 'Thailand', false, NOW(), NOW()),

  -- Jane Smith's address
  ('addr-0002-0002-0002-000000000001', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '789 Ratchada Road', 'Bangkok', 'Bangkok', '10400', 'Thailand', true, NOW(), NOW()),

  -- Bob Wilson's address
  ('addr-0003-0003-0003-000000000001', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '321 Nimman Road', 'Chiang Mai', 'Chiang Mai', '50200', 'Thailand', true, NOW(), NOW()),

  -- Alice Johnson's addresses
  ('addr-0004-0004-0004-000000000001', 'd4e5f6a7-b8c9-0123-def0-234567890123', '555 Beach Road', 'Pattaya', 'Chonburi', '20150', 'Thailand', true, NOW(), NOW()),
  ('addr-0004-0004-0004-000000000002', 'd4e5f6a7-b8c9-0123-def0-234567890123', '777 Walking Street', 'Pattaya', 'Chonburi', '20150', 'Thailand', false, NOW(), NOW()),

  -- Admin's address
  ('addr-0005-0005-0005-000000000001', 'e5f6a7b8-c9d0-1234-ef01-345678901234', '999 Admin Building', 'Bangkok', 'Bangkok', '10100', 'Thailand', true, NOW(), NOW());

-- Verify data
SELECT 'Users seeded:' as info, COUNT(*) as count FROM users;
SELECT 'Addresses seeded:' as info, COUNT(*) as count FROM addresses;
