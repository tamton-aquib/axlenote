-- Up Migration

-- Fuel Logs Table
CREATE TABLE IF NOT EXISTS fuel_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    odometer INTEGER NOT NULL, -- km
    liters DECIMAL(10, 2) NOT NULL,
    price_per_liter DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL, -- Calculated usually, but good to store
    full_tank BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fuel_vehicle_id ON fuel_logs(vehicle_id);

-- Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL, -- e.g. "Oil Change"
    due_date DATE,
    due_odometer INTEGER, -- km
    is_recurring BOOLEAN DEFAULT FALSE,
    interval_km INTEGER,
    interval_months INTEGER,
    notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reminders_vehicle_id ON reminders(vehicle_id);

-- Expand Service Records if needed (optional, 'service_type' exists but we can add 'parts_cost' specifically if not calculated from parts table)
-- For now, service_records.cost is total cost.
