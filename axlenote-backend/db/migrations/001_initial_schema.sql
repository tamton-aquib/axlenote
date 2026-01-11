CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    type VARCHAR(20) DEFAULT 'bike', -- 'bike', 'car'
    vin VARCHAR(50),
    license_plate VARCHAR(20),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_records (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    odometer INTEGER NOT NULL,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    service_type VARCHAR(50), -- 'maintenance', 'repair', 'modification'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parts (
    id SERIAL PRIMARY KEY,
    service_record_id INTEGER REFERENCES service_records(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    part_number VARCHAR(100),
    cost DECIMAL(10, 2),
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicle_id ON service_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_service_record_id ON parts(service_record_id);
