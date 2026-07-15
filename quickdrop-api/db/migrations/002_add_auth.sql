-- Level 2, Task 2: Authentication and Authorization
-- Run this AFTER schema.sql, against your existing 'quickdrop' database:
-- psql -U postgres -d quickdrop -f db\migrations\002_add_auth.sql

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer'
        CHECK (role IN ('customer', 'courier')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Link delivery requests to the customer who created them
-- and (optionally) the courier assigned to handle it
ALTER TABLE delivery_requests
    ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS courier_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_delivery_requests_customer_id ON delivery_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_courier_id ON delivery_requests(courier_id);