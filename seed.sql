USE sales_db;

-- Disable FK checks
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data
TRUNCATE TABLE Order_products;
TRUNCATE TABLE Orders;
TRUNCATE TABLE Outlet_stocks;
TRUNCATE TABLE Product_categories;
TRUNCATE TABLE Products;
TRUNCATE TABLE Outlets;
TRUNCATE TABLE Categories;
TRUNCATE TABLE Brands;
TRUNCATE TABLE Variants;
TRUNCATE TABLE Payments;
TRUNCATE TABLE Status_payments;
TRUNCATE TABLE Sales_person;

SET FOREIGN_KEY_CHECKS = 1;

-- ===== Sales Persons (8) =====
INSERT INTO Sales_person (id_sales_person, name, number_phone, created_at, created_by) VALUES
('sp-001', 'Budi Santoso', '081234567890', '2026-04-01', 'admin'),
('sp-002', 'Siti Rahayu', '082345678901', '2026-04-01', 'admin'),
('sp-003', 'Ahmad Fauzi', '083456789012', '2026-04-02', 'admin'),
('sp-004', 'Dewi Lestari', '084567890123', '2026-04-03', 'admin'),
('sp-005', 'Rizky Pratama', '085678901234', '2026-04-05', 'admin'),
('sp-006', 'Nur Hidayah', '086789012345', '2026-04-07', 'admin'),
('sp-007', 'Eko Wijaya', '087890123456', '2026-04-10', 'admin'),
('sp-008', 'Fitriani Putri', '088901234567', '2026-04-12', 'admin');

-- ===== Variants (6) =====
INSERT INTO Variants (id_variant, name, description, created_at, created_by) VALUES
('var-001', 'Regular', 'Ukuran standar', '2026-04-01', 'admin'),
('var-002', 'Jumbo', 'Ukuran besar', '2026-04-01', 'admin'),
('var-003', 'Mini', 'Ukuran kecil/sachet', '2026-04-01', 'admin'),
('var-004', 'Extra Large', 'Ukuran ekstra besar', '2026-04-02', 'admin'),
('var-005', 'Family Pack', 'Paket keluarga isi banyak', '2026-04-03', 'admin'),
('var-006', 'Premium', 'Varian premium kualitas tinggi', '2026-04-05', 'admin');

-- ===== Brands (8) =====
INSERT INTO Brands (id_brand, name, description, created_at, created_by) VALUES
('br-001', 'Indofood', 'PT Indofood Sukses Makmur', '2026-04-01', 'admin'),
('br-002', 'Wings', 'Wings Group Indonesia', '2026-04-01', 'admin'),
('br-003', 'Unilever', 'PT Unilever Indonesia', '2026-04-01', 'admin'),
('br-004', 'Mayora', 'PT Mayora Indah', '2026-04-02', 'admin'),
('br-005', 'Garuda Food', 'PT Garudafood Putra Putri Jaya', '2026-04-03', 'admin'),
('br-006', 'ABC', 'PT Heinz ABC Indonesia', '2026-04-04', 'admin'),
('br-007', 'Kapal Api', 'PT Santos Jaya Abadi', '2026-04-05', 'admin'),
('br-008', 'Sosro', 'PT Sinar Sosro', '2026-04-06', 'admin');

-- ===== Categories (6) =====
INSERT INTO Categories (id_category, name, description, created_at, created_by) VALUES
('cat-001', 'Makanan Ringan', 'Snack dan cemilan', '2026-04-01', 'admin'),
('cat-002', 'Minuman', 'Minuman kemasan', '2026-04-01', 'admin'),
('cat-003', 'Mie Instan', 'Mie instan berbagai rasa', '2026-04-01', 'admin'),
('cat-004', 'Bumbu Dapur', 'Kecap, saus, sambal', '2026-04-02', 'admin'),
('cat-005', 'Kopi & Teh', 'Kopi dan teh kemasan', '2026-04-03', 'admin'),
('cat-006', 'Susu & Dairy', 'Produk susu dan olahan', '2026-04-04', 'admin');

-- ===== Payments (4) =====
INSERT INTO Payments (id_payment, name, description, created_at, created_by) VALUES
('pay-001', 'Cash', 'Pembayaran tunai', '2026-04-01', 'admin'),
('pay-002', 'Transfer Bank', 'Transfer via bank BCA/BRI/Mandiri', '2026-04-01', 'admin'),
('pay-003', 'QRIS', 'Pembayaran via QR code', '2026-04-01', 'admin'),
('pay-004', 'COD', 'Cash on Delivery', '2026-04-02', 'admin');

-- ===== Status Payments (4) =====
INSERT INTO Status_payments (id_status_payment, name, description, created_at, created_by) VALUES
('st-001', 'Paid', 'Pembayaran lunas', '2026-04-01', 'admin'),
('st-002', 'Pending', 'Menunggu pembayaran', '2026-04-01', 'admin'),
('st-003', 'Failed', 'Pembayaran gagal', '2026-04-01', 'admin'),
('st-004', 'Refunded', 'Dana dikembalikan', '2026-04-02', 'admin');

-- ===== Products (15) =====
INSERT INTO Products (id_product, name, price, qty, variant_id, brand_id, created_at, created_by) VALUES
('prd-001', 'Indomie Goreng', 3000, 500, 'var-001', 'br-001', '2026-04-01', 'admin'),
('prd-002', 'Indomie Kuah Soto', 3000, 400, 'var-001', 'br-001', '2026-04-01', 'admin'),
('prd-003', 'Indomie Jumbo Ayam Panggang', 5000, 300, 'var-002', 'br-001', '2026-04-02', 'admin'),
('prd-004', 'Mie Sedaap Goreng', 3000, 350, 'var-001', 'br-002', '2026-04-02', 'admin'),
('prd-005', 'Teh Botol Sosro 450ml', 5000, 600, 'var-001', 'br-008', '2026-04-03', 'admin'),
('prd-006', 'Kopi Kapal Api Special', 2000, 800, 'var-003', 'br-007', '2026-04-03', 'admin'),
('prd-007', 'Kecap Manis ABC 275ml', 15000, 200, 'var-001', 'br-006', '2026-04-04', 'admin'),
('prd-008', 'Sambal ABC Extra Pedas', 12000, 180, 'var-001', 'br-006', '2026-04-04', 'admin'),
('prd-009', 'Chitato Sapi Panggang', 10000, 250, 'var-001', 'br-001', '2026-04-05', 'admin'),
('prd-010', 'Coklat Ngawi Premium', 25000, 150, 'var-006', 'br-004', '2026-04-05', 'admin'),
('prd-011', 'Kacang Garuda Atom', 8000, 300, 'var-001', 'br-005', '2026-04-06', 'admin'),
('prd-012', 'Teh Pucuk Harum 500ml', 4000, 500, 'var-001', 'br-004', '2026-04-07', 'admin'),
('prd-013', 'Sunlight Pencuci Piring 800ml', 18000, 120, 'var-004', 'br-003', '2026-04-08', 'admin'),
('prd-014', 'Rinso Anti Noda 900g', 22000, 100, 'var-002', 'br-003', '2026-04-09', 'admin'),
('prd-015', 'Kopiko 78C Latte 240ml', 7000, 400, 'var-001', 'br-004', '2026-04-10', 'admin');

-- ===== Product Categories =====
INSERT INTO Product_categories (id_product_category, product_id, category_id, created_at, created_by) VALUES
('pc-001', 'prd-001', 'cat-003', '2026-04-01', 'admin'),
('pc-002', 'prd-002', 'cat-003', '2026-04-01', 'admin'),
('pc-003', 'prd-003', 'cat-003', '2026-04-02', 'admin'),
('pc-004', 'prd-004', 'cat-003', '2026-04-02', 'admin'),
('pc-005', 'prd-005', 'cat-002', '2026-04-03', 'admin'),
('pc-006', 'prd-006', 'cat-005', '2026-04-03', 'admin'),
('pc-007', 'prd-007', 'cat-004', '2026-04-04', 'admin'),
('pc-008', 'prd-008', 'cat-004', '2026-04-04', 'admin'),
('pc-009', 'prd-009', 'cat-001', '2026-04-05', 'admin'),
('pc-010', 'prd-010', 'cat-001', '2026-04-05', 'admin'),
('pc-011', 'prd-011', 'cat-001', '2026-04-06', 'admin'),
('pc-012', 'prd-012', 'cat-002', '2026-04-07', 'admin'),
('pc-013', 'prd-015', 'cat-002', '2026-04-10', 'admin'),
('pc-014', 'prd-015', 'cat-005', '2026-04-10', 'admin');

-- ===== Outlets (8) =====
INSERT INTO Outlets (id_outlet, name_outlet, name_owner, location, number_phone, sales_person_id, created_at, created_by) VALUES
('out-001', 'Toko Mas Rusdi', 'Rusdi Hartono', 'Jl. Merdeka No. 45, Surabaya', '081111222333', 'sp-001', '2026-04-01', 'admin'),
('out-002', 'Toko Amba Jaya', 'Amba Pratiwi', 'Jl. Pahlawan No. 12, Malang', '082222333444', 'sp-002', '2026-04-01', 'admin'),
('out-003', 'Warung Bu Sari', 'Sari Mulyani', 'Jl. Diponegoro No. 88, Sidoarjo', '083333444555', 'sp-003', '2026-04-02', 'admin'),
('out-004', 'Minimart Berkah', 'Haji Rohman', 'Jl. Raya Darmo No. 100, Surabaya', '084444555666', 'sp-001', '2026-04-03', 'admin'),
('out-005', 'Toko Sejahtera', 'Agus Wibowo', 'Jl. Basuki Rahmat No. 33, Surabaya', '085555666777', 'sp-004', '2026-04-05', 'admin'),
('out-006', 'Warung Mak Ijah', 'Khadijah', 'Jl. Kertajaya No. 55, Surabaya', '086666777888', 'sp-005', '2026-04-07', 'admin'),
('out-007', 'Sumber Rezeki', 'Yanto Susilo', 'Jl. Ahmad Yani No. 200, Gresik', '087777888999', 'sp-006', '2026-04-10', 'admin'),
('out-008', 'Toko Makmur', 'Indra Gunawan', 'Jl. Raya Ngawi No. 15, Ngawi', '088888999000', 'sp-007', '2026-04-12', 'admin');

-- ===== Outlet Stocks =====
INSERT INTO Outlet_stocks (id_outlet_stock, retail_qty, retail_price, outlet_id, product_id, created_at, created_by) VALUES
('os-001', 50, 3500, 'out-001', 'prd-001', '2026-04-15', 'admin'),
('os-002', 40, 3500, 'out-001', 'prd-002', '2026-04-15', 'admin'),
('os-003', 30, 5500, 'out-001', 'prd-005', '2026-04-15', 'admin'),
('os-004', 60, 3500, 'out-002', 'prd-001', '2026-04-16', 'admin'),
('os-005', 25, 5500, 'out-002', 'prd-003', '2026-04-16', 'admin'),
('os-006', 40, 11000, 'out-002', 'prd-009', '2026-04-16', 'admin'),
('os-007', 80, 3500, 'out-003', 'prd-001', '2026-04-17', 'admin'),
('os-008', 70, 3500, 'out-003', 'prd-004', '2026-04-17', 'admin'),
('os-009', 100, 2500, 'out-003', 'prd-006', '2026-04-17', 'admin'),
('os-010', 45, 16000, 'out-004', 'prd-007', '2026-04-18', 'admin'),
('os-011', 35, 13000, 'out-004', 'prd-008', '2026-04-18', 'admin'),
('os-012', 50, 4500, 'out-004', 'prd-012', '2026-04-18', 'admin'),
('os-013', 30, 27000, 'out-005', 'prd-010', '2026-04-20', 'admin'),
('os-014', 40, 9000, 'out-005', 'prd-011', '2026-04-20', 'admin'),
('os-015', 60, 3500, 'out-006', 'prd-001', '2026-04-22', 'admin'),
('os-016', 50, 5500, 'out-006', 'prd-005', '2026-04-22', 'admin'),
('os-017', 35, 8000, 'out-007', 'prd-015', '2026-04-25', 'admin'),
('os-018', 45, 3500, 'out-007', 'prd-002', '2026-04-25', 'admin'),
('os-019', 30, 19000, 'out-008', 'prd-013', '2026-04-27', 'admin'),
('os-020', 25, 24000, 'out-008', 'prd-014', '2026-04-27', 'admin');

-- ===== Orders (20 orders spread over last 7 days) =====
INSERT INTO Orders (id_order, date, total, status_id, payment_id, outlet_id, created_at, created_by) VALUES
('ord-001', '2026-05-01', 54000, 'st-001', 'pay-001', 'out-001', '2026-05-01', 'admin'),
('ord-002', '2026-05-01', 75000, 'st-001', 'pay-002', 'out-002', '2026-05-01', 'admin'),
('ord-003', '2026-05-02', 120000, 'st-001', 'pay-001', 'out-003', '2026-05-02', 'admin'),
('ord-004', '2026-05-02', 45000, 'st-002', 'pay-003', 'out-004', '2026-05-02', 'admin'),
('ord-005', '2026-05-03', 250000, 'st-001', 'pay-002', 'out-005', '2026-05-03', 'admin'),
('ord-006', '2026-05-03', 36000, 'st-001', 'pay-001', 'out-006', '2026-05-03', 'admin'),
('ord-007', '2026-05-03', 90000, 'st-003', 'pay-003', 'out-001', '2026-05-03', 'admin'),
('ord-008', '2026-05-04', 180000, 'st-001', 'pay-001', 'out-007', '2026-05-04', 'admin'),
('ord-009', '2026-05-04', 60000, 'st-001', 'pay-004', 'out-008', '2026-05-04', 'admin'),
('ord-010', '2026-05-04', 150000, 'st-002', 'pay-002', 'out-002', '2026-05-04', 'admin'),
('ord-011', '2026-05-05', 95000, 'st-001', 'pay-001', 'out-003', '2026-05-05', 'admin'),
('ord-012', '2026-05-05', 200000, 'st-001', 'pay-003', 'out-005', '2026-05-05', 'admin'),
('ord-013', '2026-05-06', 72000, 'st-001', 'pay-001', 'out-001', '2026-05-06', 'admin'),
('ord-014', '2026-05-06', 110000, 'st-002', 'pay-002', 'out-004', '2026-05-06', 'admin'),
('ord-015', '2026-05-06', 48000, 'st-001', 'pay-004', 'out-006', '2026-05-06', 'admin'),
('ord-016', '2026-05-07', 315000, 'st-001', 'pay-001', 'out-005', '2026-05-07', 'admin'),
('ord-017', '2026-05-07', 84000, 'st-001', 'pay-003', 'out-002', '2026-05-07', 'admin'),
('ord-018', '2026-05-07', 160000, 'st-002', 'pay-002', 'out-007', '2026-05-07', 'admin'),
('ord-019', '2026-05-07', 42000, 'st-001', 'pay-001', 'out-003', '2026-05-07', 'admin'),
('ord-020', '2026-05-07', 225000, 'st-001', 'pay-001', 'out-008', '2026-05-07', 'admin');

-- ===== Order Products =====
INSERT INTO Order_products (id_order_product, qty, price, product__id, order_id, created_at, created_by) VALUES
-- ord-001: 54000
('op-001', 10, 3000, 'prd-001', 'ord-001', '2026-05-01', 'admin'),
('op-002', 8, 3000, 'prd-002', 'ord-001', '2026-05-01', 'admin'),
-- ord-002: 75000
('op-003', 5, 5000, 'prd-003', 'ord-002', '2026-05-01', 'admin'),
('op-004', 10, 5000, 'prd-005', 'ord-002', '2026-05-01', 'admin'),
-- ord-003: 120000
('op-005', 20, 3000, 'prd-001', 'ord-003', '2026-05-02', 'admin'),
('op-006', 10, 3000, 'prd-004', 'ord-003', '2026-05-02', 'admin'),
('op-007', 4, 15000, 'prd-007', 'ord-003', '2026-05-02', 'admin'),
-- ord-004: 45000
('op-008', 15, 3000, 'prd-002', 'ord-004', '2026-05-02', 'admin'),
-- ord-005: 250000
('op-009', 10, 25000, 'prd-010', 'ord-005', '2026-05-03', 'admin'),
-- ord-006: 36000
('op-010', 12, 3000, 'prd-001', 'ord-006', '2026-05-03', 'admin'),
-- ord-007: 90000
('op-011', 6, 15000, 'prd-007', 'ord-007', '2026-05-03', 'admin'),
-- ord-008: 180000
('op-012', 20, 3000, 'prd-001', 'ord-008', '2026-05-04', 'admin'),
('op-013', 15, 8000, 'prd-011', 'ord-008', '2026-05-04', 'admin'),
-- ord-009: 60000
('op-014', 20, 3000, 'prd-004', 'ord-009', '2026-05-04', 'admin'),
-- ord-010: 150000
('op-015', 10, 3000, 'prd-001', 'ord-010', '2026-05-04', 'admin'),
('op-016', 8, 15000, 'prd-007', 'ord-010', '2026-05-04', 'admin'),
-- ord-011: 95000
('op-017', 5, 3000, 'prd-002', 'ord-011', '2026-05-05', 'admin'),
('op-018', 10, 8000, 'prd-011', 'ord-011', '2026-05-05', 'admin'),
-- ord-012: 200000
('op-019', 8, 25000, 'prd-010', 'ord-012', '2026-05-05', 'admin'),
-- ord-013: 72000
('op-020', 24, 3000, 'prd-001', 'ord-013', '2026-05-06', 'admin'),
-- ord-014: 110000
('op-021', 10, 3000, 'prd-001', 'ord-014', '2026-05-06', 'admin'),
('op-022', 10, 8000, 'prd-011', 'ord-014', '2026-05-06', 'admin'),
-- ord-015: 48000
('op-023', 16, 3000, 'prd-004', 'ord-015', '2026-05-06', 'admin'),
-- ord-016: 315000
('op-024', 5, 25000, 'prd-010', 'ord-016', '2026-05-07', 'admin'),
('op-025', 10, 3000, 'prd-001', 'ord-016', '2026-05-07', 'admin'),
('op-026', 10, 5000, 'prd-005', 'ord-016', '2026-05-07', 'admin'),
('op-027', 2, 15000, 'prd-007', 'ord-016', '2026-05-07', 'admin'),
-- ord-017: 84000
('op-028', 12, 7000, 'prd-015', 'ord-017', '2026-05-07', 'admin'),
-- ord-018: 160000
('op-029', 20, 8000, 'prd-011', 'ord-018', '2026-05-07', 'admin'),
-- ord-019: 42000
('op-030', 14, 3000, 'prd-001', 'ord-019', '2026-05-07', 'admin'),
-- ord-020: 225000
('op-031', 5, 25000, 'prd-010', 'ord-020', '2026-05-07', 'admin'),
('op-032', 10, 5000, 'prd-003', 'ord-020', '2026-05-07', 'admin'),
('op-033', 5, 10000, 'prd-009', 'ord-020', '2026-05-07', 'admin');
