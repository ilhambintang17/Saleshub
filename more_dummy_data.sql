USE sales_db;

-- ===== Sales Persons =====
INSERT INTO Sales_person (id_sales_person, name, number_phone, created_at, created_by) VALUES
('sp-011', 'Lina Marlina', '085511223344', '2026-05-08', 'admin'),
('sp-012', 'Rudi Heryanto', '085522334455', '2026-05-08', 'admin');

-- ===== Variants =====
INSERT INTO Variants (id_variant, name, description, created_at, created_by) VALUES
('var-008', 'Kotak Besar', 'Kemasan kotak isi banyak', '2026-05-08', 'admin');

-- ===== Brands =====
INSERT INTO Brands (id_brand, name, description, created_at, created_by) VALUES
('br-010', 'Dua Kelinci', 'PT Dua Kelinci', '2026-05-08', 'admin');

-- ===== Categories =====
INSERT INTO Categories (id_category, name, description, created_at, created_by) VALUES
('cat-008', 'Kacang-Kacangan', 'Snack kacang dan sejenisnya', '2026-05-08', 'admin');

-- ===== Products =====
INSERT INTO Products (id_product, name, price, qty, variant_id, brand_id, created_at, created_by) VALUES
('prd-018', 'Kacang Garing Dua Kelinci 200g', 12000, 150, 'var-001', 'br-010', '2026-05-08', 'admin'),
('prd-019', 'Sukro Dua Kelinci 120g', 8500, 250, 'var-001', 'br-010', '2026-05-08', 'admin');

-- ===== Product Categories =====
INSERT INTO Product_categories (id_product_category, product_id, category_id, created_at, created_by) VALUES
('pc-017', 'prd-018', 'cat-008', '2026-05-08', 'admin'),
('pc-018', 'prd-019', 'cat-008', '2026-05-08', 'admin');

-- ===== Outlets =====
INSERT INTO Outlets (id_outlet, name_outlet, name_owner, location, number_phone, sales_person_id, created_at, created_by) VALUES
('out-010', 'Toko Rejeki Nomplok', 'Ibu Rejeki', 'Jl. Sudirman No. 99, Jakarta', '081234560000', 'sp-011', '2026-05-08', 'admin');

-- ===== Outlet Stocks =====
INSERT INTO Outlet_stocks (id_outlet_stock, retail_qty, retail_price, outlet_id, product_id, created_at, created_by) VALUES
('os-023', 30, 13000, 'out-010', 'prd-018', '2026-05-08', 'admin'),
('os-024', 40, 9500, 'out-010', 'prd-019', '2026-05-08', 'admin');

-- ===== Orders =====
INSERT INTO Orders (id_order, date, total, status_id, payment_id, outlet_id, created_at, created_by) VALUES
('ord-023', '2026-05-08', 52000, 'st-001', 'pay-001', 'out-010', '2026-05-08', 'admin'),
('ord-024', '2026-05-08', 38000, 'st-002', 'pay-002', 'out-010', '2026-05-08', 'admin');

-- ===== Order Products =====
INSERT INTO Order_products (id_order_product, qty, price, product__id, order_id, created_at, created_by) VALUES
('op-036', 4, 13000, 'prd-018', 'ord-023', '2026-05-08', 'admin'),
('op-037', 4, 9500, 'prd-019', 'ord-024', '2026-05-08', 'admin');
