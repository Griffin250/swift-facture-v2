-- SwiftFacture Data Import Template
-- Run this in your NEW Supabase project's SQL Editor
-- Replace the sample data with your actual backed-up data

-- IMPORTANT: Import in this exact order to maintain foreign key relationships

-- 1. PROFILES (Import first - other tables reference this)
INSERT INTO profiles (id, email, first_name, last_name, company_name, avatar_url, created_at, updated_at) VALUES
-- Replace with your actual profile data from backup
-- Example:
-- ('user-uuid-1', 'user@example.com', 'John', 'Doe', 'Acme Corp', null, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
-- ('user-uuid-2', 'jane@example.com', 'Jane', 'Smith', 'Smith LLC', null, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z');

-- 2. USER_ROLES (Import after profiles)
INSERT INTO user_roles (id, user_id, role, created_at, updated_at) VALUES
-- Replace with your actual role data
-- Example:
-- ('role-uuid-1', 'user-uuid-1', 'user', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
-- ('role-uuid-2', 'user-uuid-2', 'admin', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z');

-- 3. USER_SETTINGS (Import after profiles)
INSERT INTO user_settings (user_id, default_currency, default_tax_rate, invoice_prefix, estimate_prefix, receipt_prefix, default_template, language, timezone, date_format, created_at, updated_at) VALUES
-- Replace with your actual settings data
-- Example:
-- ('user-uuid-1', 'USD', 0.1, 'INV-', 'EST-', 'REC-', 'template1', 'en', 'UTC', 'MM/DD/YYYY', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z');

-- 4. CUSTOMERS (Import after profiles)
INSERT INTO customers (id, user_id, name, email, phone, address, city, postal_code, country, created_at, updated_at) VALUES
-- Replace with your actual customer data
-- Example:
-- ('customer-uuid-1', 'user-uuid-1', 'Customer One', 'customer1@example.com', '+1234567890', '123 Main St', 'City', '12345', 'USA', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z');

-- 5. INVOICES (Import after customers and profiles)
INSERT INTO invoices (id, user_id, customer_id, invoice_number, date, due_date, status, subtotal, tax, total, notes, template_name, created_at, updated_at) VALUES
-- Replace with your actual invoice data
-- Example:
-- ('invoice-uuid-1', 'user-uuid-1', 'customer-uuid-1', 'INV-0001', '2024-01-01', '2024-01-31', 'draft', 100.00, 10.00, 110.00, 'Sample invoice', 'template1', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z');

-- 6. INVOICE_ITEMS (Import after invoices)
INSERT INTO invoice_items (id, invoice_id, user_id, description, quantity, unit_price, tax_rate, total, sort_order, created_at, updated_at) VALUES
-- Replace with your actual invoice item data
-- Example:
-- ('item-uuid-1', 'invoice-uuid-1', 'user-uuid-1', 'Sample Item', 1, 100.00, 0.1, 100.00, 0, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z');

-- 7. ESTIMATES (Import after customers and profiles)
INSERT INTO estimates (id, user_id, customer_id, estimate_number, date, expiry_date, template_name, subtotal, tax, total, notes, status, created_at, updated_at) VALUES
-- Replace with your actual estimate data (if any)

-- 8. ESTIMATE_ITEMS (Import after estimates)
INSERT INTO estimate_items (id, estimate_id, user_id, description, quantity, unit_price, tax_rate, total, sort_order, created_at, updated_at) VALUES
-- Replace with your actual estimate item data (if any)

-- 9. RECEIPTS (Import after customers and profiles)
INSERT INTO receipts (id, user_id, customer_id, receipt_number, date, payment_method, subtotal, tax, total, notes, created_at, updated_at) VALUES
-- Replace with your actual receipt data (if any)

-- 10. RECEIPT_ITEMS (Import after receipts)
INSERT INTO receipt_items (id, receipt_id, user_id, description, quantity, unit_price, total, sort_order, created_at, updated_at) VALUES
-- Replace with your actual receipt item data (if any)

-- VERIFICATION QUERIES (Run these to verify import success)
SELECT 'Import verification results:' as status;
SELECT 'Profiles:' as table_name, COUNT(*) as count FROM profiles;
SELECT 'User Roles:' as table_name, COUNT(*) as count FROM user_roles;
SELECT 'User Settings:' as table_name, COUNT(*) as count FROM user_settings;
SELECT 'Customers:' as table_name, COUNT(*) as count FROM customers;
SELECT 'Invoices:' as table_name, COUNT(*) as count FROM invoices;
SELECT 'Invoice Items:' as table_name, COUNT(*) as count FROM invoice_items;
SELECT 'Estimates:' as table_name, COUNT(*) as count FROM estimates;
SELECT 'Estimate Items:' as table_name, COUNT(*) as count FROM estimate_items;
SELECT 'Receipts:' as table_name, COUNT(*) as count FROM receipts;
SELECT 'Receipt Items:' as table_name, COUNT(*) as count FROM receipt_items;

-- Check for any data integrity issues
SELECT 'Checking foreign key relationships...' as status;
SELECT 'Profiles without user roles:' as issue, COUNT(*) as count 
FROM profiles p LEFT JOIN user_roles ur ON p.id = ur.user_id 
WHERE ur.user_id IS NULL;

SELECT 'Invoices without customers:' as issue, COUNT(*) as count 
FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id 
WHERE i.customer_id IS NOT NULL AND c.id IS NULL;

SELECT 'Migration verification complete!' as status;