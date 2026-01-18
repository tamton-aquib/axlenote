package handlers

import (
	"database/sql"
	"strconv"
	"time"

	"github.com/axlenote/axlenote-backend/internal/repository"
	"github.com/gofiber/fiber/v2"
)

type CreateVehicleRequest struct {
	Name         string `json:"name"`
	Make         string `json:"make"`
	Model        string `json:"model"`
	Year         int32  `json:"year"`
	Type         string `json:"type"`
	Vin          string `json:"vin"`
	LicensePlate string `json:"license_plate"`
	ImageUrl     string `json:"image_url"`
}

type VehicleResponse struct {
	ID           int32  `json:"id"`
	Name         string `json:"name"`
	Make         string `json:"make"`
	Model        string `json:"model"`
	Year         int32  `json:"year"`
	Type         string `json:"type"`
	Vin          string `json:"vin"`
	LicensePlate string `json:"license_plate"`
	ImageUrl     string `json:"image_url"`
	CreatedAt    string `json:"created_at"`
}

func mapVehicleToResponse(v repository.Vehicle) VehicleResponse {
	return VehicleResponse{
		ID:           v.ID,
		Name:         v.Name,
		Make:         v.Make.String,
		Model:        v.Model.String,
		Year:         v.Year.Int32,
		Type:         v.Type.String,
		Vin:          v.Vin.String,
		LicensePlate: v.LicensePlate.String,
		ImageUrl:     v.ImageUrl.String,
		CreatedAt:    v.CreatedAt.Time.Format(time.RFC3339),
	}
}

func (h *Handler) CreateVehicle(c *fiber.Ctx) error {
	var req CreateVehicleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Name is required"})
	}

	vehicle, err := h.queries.CreateVehicle(c.Context(), repository.CreateVehicleParams{
		Name:         req.Name,
		Make:         sql.NullString{String: req.Make, Valid: req.Make != ""},
		Model:        sql.NullString{String: req.Model, Valid: req.Model != ""},
		Year:         sql.NullInt32{Int32: req.Year, Valid: req.Year > 0},
		Type:         sql.NullString{String: req.Type, Valid: req.Type != ""},
		Vin:          sql.NullString{String: req.Vin, Valid: req.Vin != ""},
		LicensePlate: sql.NullString{String: req.LicensePlate, Valid: req.LicensePlate != ""},
		ImageUrl:     sql.NullString{String: req.ImageUrl, Valid: req.ImageUrl != ""},
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create vehicle", "details": err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{"data": mapVehicleToResponse(vehicle)})
}

func (h *Handler) UpdateVehicle(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid vehicle ID"})
	}

	var req CreateVehicleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Name is required"})
	}

	vehicle, err := h.queries.UpdateVehicle(c.Context(), repository.UpdateVehicleParams{
		ID:           int32(id),
		Name:         req.Name,
		Make:         sql.NullString{String: req.Make, Valid: req.Make != ""},
		Model:        sql.NullString{String: req.Model, Valid: req.Model != ""},
		Year:         sql.NullInt32{Int32: req.Year, Valid: req.Year > 0},
		Type:         sql.NullString{String: req.Type, Valid: req.Type != ""},
		Vin:          sql.NullString{String: req.Vin, Valid: req.Vin != ""},
		LicensePlate: sql.NullString{String: req.LicensePlate, Valid: req.LicensePlate != ""},
		ImageUrl:     sql.NullString{String: req.ImageUrl, Valid: req.ImageUrl != ""},
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update vehicle", "details": err.Error()})
	}

	return c.JSON(fiber.Map{"data": mapVehicleToResponse(vehicle)})
}

func (h *Handler) DeleteVehicle(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid vehicle ID"})
	}

	err = h.queries.DeleteVehicle(c.Context(), int32(id))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete vehicle"})
	}

	return c.JSON(fiber.Map{"message": "Vehicle deleted successfully"})
}

func (h *Handler) GetVehicle(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid vehicle ID"})
	}

	vehicle, err := h.queries.GetVehicle(c.Context(), int32(id))
	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(404).JSON(fiber.Map{"error": "Vehicle not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Database error"})
	}

	return c.JSON(fiber.Map{"data": mapVehicleToResponse(vehicle)})
}

func (h *Handler) GetVehicles(c *fiber.Ctx) error {
	vehicles, err := h.queries.ListVehicles(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	response := make([]VehicleResponse, len(vehicles))
	for i, v := range vehicles {
		response[i] = mapVehicleToResponse(v)
	}

	return c.JSON(fiber.Map{"data": response})
}
