CREATE DATABASE IF NOT EXISTS sales_db;
USE sales_db;

CREATE TABLE IF NOT EXISTS Sales_person (
    id_sales_person VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    number_phone VARCHAR(15),
    created_at DATE,
    created_by VARCHAR(50),
    updated_at DATE,
    updated_by VARCHAR(50),
    deleted_at DATE,
    deleted_by VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Variants (
    id_variant VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    description VARCHAR(255),
    created_at DATE,
    created_by VARCHAR(50),
    updated_at DATE,
    updated_by VARCHAR(50),
    deleted_at DATE,
    deleted_by VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Brands (
    id_brand VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    description VARCHAR(255),
    created_at DATE,
    created_by VARCHAR(50),
    updated_at DATE,
    updated_by VARCHAR(50),
    deleted_at DATE,
    deleted_by VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Categories (
    id_category VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    description VARCHAR(255),
    created_at DATE,
    created_by VARCHAR(50),
    updated_at DATE,
    updated_by VARCHAR(50),
    deleted_at DATE,
    deleted_by VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Payments (
    id_payment VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    description VARCHAR(255),
    created_at DATE,
    created_by VARCHAR(50),
    updated_at DATE,
    updated_by VARCHAR(50),
    deleted_at DATE,
    deleted_by VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Status_payments (
    id_status_payment VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50),
    description VARCHAR(255),
    created_at DATE,
    created_by VARCHAR(50),
    updated_at DATE,
    updated_by VARCHAR(50),
    deleted_at DATE,
    deleted_by VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Products (
    id_product VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255),
    price INT,
    qty INT,
    variant_id VARCHAR(50),
    brand_id VARCHAR(50),
    created_at DATE,
    created_by VARCHAR(50),
    updated_at DATE,
    updated_by VARCHAR(50),
    deleted_at DATE,
    deleted_by VARCHAR(50),
    FOREIGN KEY (variant_id) REFERENCES Variants(id_variant) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES Brands(id_brand) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Product_categories (
    id_product_category VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50),
    category_id VARCHAR(50),
    created_at DATE,
    created_by VARCHAR(50),
    updated_at DATE,
    updated_by VARCHAR(50),
    deleted_at DATE,
    deleted_by VARCHAR(50),
    FOREIGN KEY (product_id) REFERENCES Products(id_product) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(id_category) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Outlets (
    id_outlet VARCHAR(50) PRIMARY KEY,
    name_outlet VARCHAR(255),
    name_owner VARCHAR(255),
    location VARCHAR(255),
    number_phone VARCHAR(15),
    sales_person_id VARCHAR(50),
    created_at DATE,
    created_by VARCHAR(50),
    updated_at DATE,
    updated_by VARCHAR(50),
    deleted_at DATE,
    deleted_by VARCHAR(50),
    FOREIGN KEY (sales_person_id) REFERENCES Sales_person(id_sales_person) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Outlet_stocks (
    id_outlet_stock VARCHAR(50) PRIMARY KEY,
    retail_qty INT,
    retail_price INT,
    outlet_id VARCHAR(50),
    product_id VARCHAR(50),
    created_at DATE,
    created_by VARCHAR(50),
    updated_at DATE,
    updated_by VARCHAR(50),
    deleted_at DATE,
    deleted_by VARCHAR(50),
    FOREIGN KEY (outlet_id) REFERENCES Outlets(id_outlet) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id_product) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Orders (
    id_order VARCHAR(50) PRIMARY KEY,
    date DATE,
    total INT,
    status_id VARCHAR(50),
    payment_id VARCHAR(50),
    outlet_id VARCHAR(50),
    created_at DATE,
    created_by VARCHAR(50),
    updated_at DATE,
    updated_by VARCHAR(50),
    deleted_at DATE,
    deleted_by VARCHAR(50),
    FOREIGN KEY (status_id) REFERENCES Status_payments(id_status_payment) ON DELETE SET NULL,
    FOREIGN KEY (payment_id) REFERENCES Payments(id_payment) ON DELETE SET NULL,
    FOREIGN KEY (outlet_id) REFERENCES Outlets(id_outlet) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Order_products (
    id_order_product VARCHAR(50) PRIMARY KEY,
    qty INT,
    price INT,
    product__id VARCHAR(50),
    order_id VARCHAR(50),
    created_at DATE,
    created_by VARCHAR(50),
    updated_at DATE,
    updated_by VARCHAR(50),
    deleted_at DATE,
    deleted_by VARCHAR(50),
    FOREIGN KEY (product__id) REFERENCES Products(id_product) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES Orders(id_order) ON DELETE CASCADE
);
