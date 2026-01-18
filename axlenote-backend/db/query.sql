-- name: CreateVehicle :one
INSERT INTO vehicles (
  name, make, model, year, type, vin, license_plate, image_url
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING *;

-- name: GetVehicle :one
SELECT * FROM vehicles
WHERE id = $1 LIMIT 1;

-- name: ListVehicles :many
SELECT * FROM vehicles
ORDER BY created_at DESC;

-- name: UpdateVehicle :one
UPDATE vehicles
SET name = $2, make = $3, model = $4, year = $5, type = $6, vin = $7, license_plate = $8, image_url = $9, updated_at = NOW()
WHERE id = $1
RETURNING *;
-- name: UpdateVehicle :one
UPDATE vehicles
SET name = $2, make = $3, model = $4, year = $5, type = $6, vin = $7, license_plate = $8, image_url = $9, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteVehicle :exec
DELETE FROM vehicles
WHERE id = $1;

-- name: CreateFuelLog :one
INSERT INTO fuel_logs (vehicle_id, date, odometer, liters, price_per_liter, total_cost, full_tank, notes)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: UpdateFuelLog :one
UPDATE fuel_logs
SET date = $2, odometer = $3, liters = $4, price_per_liter = $5, total_cost = $6, full_tank = $7, notes = $8
WHERE id = $1
RETURNING *;

-- name: ListFuelLogsByVehicle :many
SELECT * FROM fuel_logs
WHERE vehicle_id = $1
ORDER BY date DESC;

-- name: DeleteFuelLog :exec
DELETE FROM fuel_logs WHERE id = $1;

-- name: CreateReminder :one
INSERT INTO reminders (vehicle_id, title, due_date, due_odometer, is_recurring, interval_km, interval_months, notes, type)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- name: UpdateReminder :one
UPDATE reminders
SET title = $2, due_date = $3, due_odometer = $4, is_recurring = $5, interval_km = $6, interval_months = $7, notes = $8, type = $9
WHERE id = $1
RETURNING *;

-- name: ListRemindersByVehicle :many
SELECT * FROM reminders
WHERE vehicle_id = $1 AND is_completed = FALSE
ORDER BY due_date ASC;

-- name: CompleteReminder :exec
UPDATE reminders SET is_completed = TRUE WHERE id = $1;

-- name: CreateServiceRecord :one
INSERT INTO service_records (
  vehicle_id, date, odometer, cost, notes, service_type, document_url
) VALUES (
  $1, $2, $3, $4, $5, $6, $7
)
RETURNING *;

-- name: UpdateServiceRecord :one
UPDATE service_records
SET date = $2, odometer = $3, cost = $4, notes = $5, service_type = $6, document_url = $7
WHERE id = $1
RETURNING *;

-- name: ListServiceRecordsByVehicle :many
SELECT * FROM service_records
WHERE vehicle_id = $1
ORDER BY date DESC;

-- name: DeleteServiceRecord :exec
DELETE FROM service_records WHERE id = $1;

-- name: CreatePart :one
INSERT INTO parts (
  service_record_id, name, part_number, cost, link
) VALUES (
  $1, $2, $3, $4, $5
)
RETURNING *;

-- name: ListPartsByServiceRecord :many
SELECT * FROM parts
WHERE service_record_id = $1;

-- name: GetVehicleStats :one
SELECT
    (SELECT COALESCE(SUM(total_cost), 0.0)::float8 FROM fuel_logs WHERE fuel_logs.vehicle_id = $1) AS total_fuel_cost,
    (SELECT COALESCE(SUM(cost), 0.0)::float8 FROM service_records WHERE service_records.vehicle_id = $1) AS total_service_cost,
    (SELECT COALESCE(SUM(liters), 0.0)::float8 FROM fuel_logs WHERE fuel_logs.vehicle_id = $1) AS total_liters,
    (SELECT COUNT(*) FROM service_records WHERE service_records.vehicle_id = $1) AS total_services,
    (SELECT COUNT(*) FROM fuel_logs WHERE fuel_logs.vehicle_id = $1) AS total_fuel_logs
;

-- name: CreateDocument :one
INSERT INTO documents (vehicle_id, name, type, file_url, expiry_date, notes)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: ListDocumentsByVehicle :many
SELECT * FROM documents
WHERE vehicle_id = $1
ORDER BY created_at DESC;

-- name: DeleteDocument :exec
DELETE FROM documents WHERE id = $1;
