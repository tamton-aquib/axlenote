export interface Vehicle {
    id: number
    name: string
    make: string
    model: string
    year: number
    type: string
    vin: string
    license_plate: string
    image_url: string
    created_at: string
}

export interface ServiceRecord {
    id: number
    vehicle_id: number
    date: string
    odometer: number
    cost: number
    notes: string
    service_type: string
    document_url?: string
}

export interface FuelLog {
    id: number
    vehicle_id: number
    date: string
    odometer: number
    liters: number
    price_per_liter: number
    total_cost: number
    full_tank: boolean
    notes: string
    mileage: number
}

export interface Reminder {
    id: number
    vehicle_id: number
    title: string
    due_date?: string
    due_odometer?: number
    is_recurring: boolean
    interval_km?: number
    interval_months?: number
    notes: string
    is_completed: boolean
    type?: string // 'Service', 'Insurance', etc.
}

export interface Document {
    id: number
    vehicle_id: number
    name: string
    type: string
    file_url: string
    expiry_date?: string
    notes: string
}

export interface VehicleStats {
    total_fuel_cost: number
    total_service_cost: number
    total_liters: number
    total_services: number
    total_fuel_logs: number
    total_cost: number
}
