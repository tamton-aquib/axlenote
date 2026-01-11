package handlers

import (
	"database/sql"
	"strconv"
	"time"

	"github.com/axlenote/axlenote-backend/internal/repository"
	"github.com/gofiber/fiber/v2"
)

type CreateFuelLogRequest struct {
	VehicleID     int32   `json:"vehicle_id"`
	Date          string  `json:"date"` // YYYY-MM-DD
	Odometer      int32   `json:"odometer"`
	Liters        float64 `json:"liters"`
	PricePerLiter float64 `json:"price_per_liter"`
	TotalCost     float64 `json:"total_cost"`
	FullTank      bool    `json:"full_tank"`
	Notes         string  `json:"notes"`
}

type FuelLogResponse struct {
	ID            int32   `json:"id"`
	VehicleID     int32   `json:"vehicle_id"`
	Date          string  `json:"date"`
	Odometer      int32   `json:"odometer"`
	Liters        float64 `json:"liters"`
	PricePerLiter float64 `json:"price_per_liter"`
	TotalCost     float64 `json:"total_cost"`
	FullTank      bool    `json:"full_tank"`
	Notes         string  `json:"notes"`
	Mileage       float64 `json:"mileage"` // Calculated field if possible, or frontend handles it
}

func mapFuelLogToResponse(f repository.FuelLog) FuelLogResponse {
	liters, _ := strconv.ParseFloat(f.Liters, 64)
	price, _ := strconv.ParseFloat(f.PricePerLiter, 64)
	total, _ := strconv.ParseFloat(f.TotalCost, 64)

	// Mileage calculation could go here if we had previous log, but for now simple mapping
	return FuelLogResponse{
		ID:            f.ID,
		VehicleID:     f.VehicleID.Int32,
		Date:          f.Date.Format("2006-01-02"),
		Odometer:      f.Odometer,
		Liters:        liters,
		PricePerLiter: price,
		TotalCost:     total,
		FullTank:      f.FullTank.Bool,
		Notes:         f.Notes.String,
		Mileage:       0, // Placeholder
	}
}

func (h *Handler) CreateFuelLog(c *fiber.Ctx) error {
	var req CreateFuelLogRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	parsedDate, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid date format, use YYYY-MM-DD"})
	}

	log, err := h.queries.CreateFuelLog(c.Context(), repository.CreateFuelLogParams{
		VehicleID:     sql.NullInt32{Int32: req.VehicleID, Valid: true},
		Date:          parsedDate,
		Odometer:      req.Odometer,
		Liters:        stringToNumeric(req.Liters),
		PricePerLiter: stringToNumeric(req.PricePerLiter),
		TotalCost:     stringToNumeric(req.TotalCost),
		FullTank:      sql.NullBool{Bool: req.FullTank, Valid: true},
		Notes:         sql.NullString{String: req.Notes, Valid: req.Notes != ""},
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create fuel log", "details": err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{"data": mapFuelLogToResponse(log)})
}

func (h *Handler) ListFuelLogs(c *fiber.Ctx) error {
	vehicleId, err := strconv.Atoi(c.Params("vehicleId"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid vehicle ID"})
	}

	logs, err := h.queries.ListFuelLogsByVehicle(c.Context(), sql.NullInt32{Int32: int32(vehicleId), Valid: true})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch fuel logs"})
	}

	response := make([]FuelLogResponse, len(logs))
	for i, l := range logs {
		response[i] = mapFuelLogToResponse(l)
	}

	return c.JSON(fiber.Map{"data": response})
}

func (h *Handler) UpdateFuelLog(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid fuel log ID"})
	}

	var req CreateFuelLogRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	parsedDate, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid date format, use YYYY-MM-DD"})
	}

	log, err := h.queries.UpdateFuelLog(c.Context(), repository.UpdateFuelLogParams{
		ID:            int32(id),
		Date:          parsedDate,
		Odometer:      req.Odometer,
		Liters:        stringToNumeric(req.Liters),
		PricePerLiter: stringToNumeric(req.PricePerLiter),
		TotalCost:     stringToNumeric(req.TotalCost),
		FullTank:      sql.NullBool{Bool: req.FullTank, Valid: true},
		Notes:         sql.NullString{String: req.Notes, Valid: req.Notes != ""},
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update fuel log"})
	}

	return c.JSON(fiber.Map{"data": mapFuelLogToResponse(log)})
}

func (h *Handler) DeleteFuelLog(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid fuel log ID"})
	}

	err = h.queries.DeleteFuelLog(c.Context(), int32(id))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete fuel log"})
	}

	return c.JSON(fiber.Map{"message": "Deleted successfully"})
}
