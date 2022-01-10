CREATE TYPE auth AS ENUM (
    'super', 'admin', 'user', 'client'
)

CREATE TYPE item_type AS ENUM (
    'food', 'meat', 'ingredient', 'other'
)

CREATE TYPE order_type AS ENUM (
    'pickUp', 'toGo', 'other'
)

CREATE TABLE businesses(
    id SERIAL PRIMARY KEY,
    businessname VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE  
)

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    businessname VARCHAR(100) NOT NULL,
    phone VARCHAR(100) DEFAULT NULL UNIQUE,
    city VARCHAR(100) DEFAULT NULL,
    state VARCHAR(100) DEFAULT NULL,
    street VARCHAR(100) DEFAULT NULL,
    apt VARCHAR(100) DEFAULT NULL,
    ppic VARCHAR(255) DEFAULT NULL,
    auth auth NOT NULL
)

CREATE TABLE orders(
    id SERIAL PRIMARY KEY,
    credit BOOLEAN DEFAULT FALSE,
    dateTime TIMESTAMPTZ now(),
    description TEXT,
    employee VARCHAR(100),
    items text[],
    name VARCHAR(100),
    paid BOOLEAN DEFAULT FALSE,
    subTotal DECIMAL(12,2),
    tax DECIMAL(10,2),
    type order_type NOT NULL,
    custom json DEFAULT NULL
)

CREATE TABLE items(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(7,2) DEFAULT 0.00,
    type item_type NOT NULL,
    description TEXT DEFAULT NULL,
    custom json DEFAULT NULL)