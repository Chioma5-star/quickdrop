-- Run this once against your 'quickdrop' database to create the table
-- psql -U postgres -d quickdrop -f db/schema.sql

CREATE TABLE IF NOT EXISTS delivery_requests (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    pickup_location VARCHAR(150) NOT NULL,
    dropoff_location VARCHAR(150) NOT NULL,
    item_description VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Optional: a few seed rows so you have something to test GET requests with
INSERT INTO delivery_requests (customer_name, pickup_location, dropoff_location, item_description, status)
VALUES
    ('Ama Boateng', 'Osu, Accra', 'East Legon, Accra', 'Small parcel', 'pending'),
    ('Kwame Mensah', 'Adenta', 'Tema Station', 'Documents envelope', 'in_transit')
ON CONFLICT DO NOTHING;