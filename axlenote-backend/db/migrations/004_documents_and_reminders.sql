-- Up Migration

-- Enable categories for reminders
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Service'; -- Service, Insurance, Tax, Other

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "RC Copy", "Invoice 123"
    type VARCHAR(50), -- 'License', 'Registration', 'Insurance', 'Invoice', 'Other'
    file_url TEXT NOT NULL,
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_vehicle_id ON documents(vehicle_id);

-- Add file attachment to service records (optional single file as requested)
ALTER TABLE service_records ADD COLUMN IF NOT EXISTS document_url TEXT;
