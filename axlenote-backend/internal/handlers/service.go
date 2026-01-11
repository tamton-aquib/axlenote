package handlers

import (
	"database/sql"
	"strconv"
	"time"

	"github.com/axlenote/axlenote-backend/internal/repository"
	"github.com/gofiber/fiber/v2"
)

type CreateServiceRequest struct {
	VehicleId   int32   `json:"vehicle_id"`
	Date        string  `json:"date"` // YYYY-MM-DD
	Odometer    int32   `json:"odometer"`
	Cost        float64 `json:"cost"`
	Notes       string  `json:"notes"`
	ServiceType string  `json:"service_type"`
	DocumentUrl string  `json:"document_url"`
}

type ServiceRecordResponse struct {
	ID          int32   `json:"id"`
	VehicleID   int32   `json:"vehicle_id"`
	Date        string  `json:"date"`
	Odometer    int32   `json:"odometer"`
	Cost        float64 `json:"cost"`
	Notes       string  `json:"notes"`
	ServiceType string  `json:"service_type"`
	DocumentUrl string  `json:"document_url"`
}

func mapServiceToResponse(s repository.ServiceRecord) ServiceRecordResponse {
	cost, _ := strconv.ParseFloat(s.Cost, 64)
	return ServiceRecordResponse{
		ID:          s.ID,
		VehicleID:   s.VehicleID.Int32,
		Date:        s.Date.Format("2006-01-02"),
		Odometer:    s.Odometer,
		Cost:        cost,
		Notes:       s.Notes.String,
		ServiceType: s.ServiceType.String,
		DocumentUrl: s.DocumentUrl.String, // Now available from query gen
	}
}

func (h *Handler) CreateServiceRecord(c *fiber.Ctx) error {
	var req CreateServiceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	parsedDate, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid date format, use YYYY-MM-DD"})
	}

	record, err := h.queries.CreateServiceRecord(c.Context(), repository.CreateServiceRecordParams{
		VehicleID:   sql.NullInt32{Int32: req.VehicleId, Valid: true},
		Date:        parsedDate,
		Odometer:    req.Odometer,
		Cost:        stringToNumeric(req.Cost),
		Notes:       sql.NullString{String: req.Notes, Valid: req.Notes != ""},
		ServiceType: sql.NullString{String: req.ServiceType, Valid: req.ServiceType != ""},
		DocumentUrl: sql.NullString{String: req.DocumentUrl, Valid: req.DocumentUrl != ""},
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create service record", "details": err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{"data": mapServiceToResponse(record)})
}

// Helper for decimal
func stringToNumeric(val float64) string {
	return strconv.FormatFloat(val, 'f', 2, 64)
}

func (h *Handler) ListServiceRecords(c *fiber.Ctx) error {
	vehicleId, err := strconv.Atoi(c.Params("vehicleId"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid vehicle ID"})
	}

	records, err := h.queries.ListServiceRecordsByVehicle(c.Context(), sql.NullInt32{Int32: int32(vehicleId), Valid: true})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch records"})
	}

	response := make([]ServiceRecordResponse, len(records))
	for i, r := range records {
		response[i] = mapServiceToResponse(r)
	}

	return c.JSON(fiber.Map{"data": response})
}

func (h *Handler) UpdateServiceRecord(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid service ID"})
	}

	var req CreateServiceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	parsedDate, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid date format, use YYYY-MM-DD"})
	}

	record, err := h.queries.UpdateServiceRecord(c.Context(), repository.UpdateServiceRecordParams{
		ID:          int32(id),
		Date:        parsedDate,
		Odometer:    req.Odometer,
		Cost:        stringToNumeric(req.Cost),
		Notes:       sql.NullString{String: req.Notes, Valid: req.Notes != ""},
		ServiceType: sql.NullString{String: req.ServiceType, Valid: req.ServiceType != ""},
		DocumentUrl: sql.NullString{String: req.DocumentUrl, Valid: req.DocumentUrl != ""},
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update service record"})
	}

	return c.JSON(fiber.Map{"data": mapServiceToResponse(record)})
}

func (h *Handler) DeleteServiceRecord(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid service ID"})
	}

	err = h.queries.DeleteServiceRecord(c.Context(), int32(id))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete service record"})
	}

	return c.JSON(fiber.Map{"message": "Deleted successfully"})
}
