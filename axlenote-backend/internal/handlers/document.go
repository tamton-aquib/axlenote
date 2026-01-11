package handlers

import (
	"database/sql"
	"strconv"
	"time"

	"github.com/axlenote/axlenote-backend/internal/repository"
	"github.com/gofiber/fiber/v2"
)

type CreateDocumentRequest struct {
	VehicleID  int32  `json:"vehicle_id"`
	Name       string `json:"name"`
	Type       string `json:"type"`
	FileUrl    string `json:"file_url"`
	ExpiryDate string `json:"expiry_date"`
	Notes      string `json:"notes"`
}

type DocumentResponse struct {
	ID         int32  `json:"id"`
	VehicleID  int32  `json:"vehicle_id"`
	Name       string `json:"name"`
	Type       string `json:"type"`
	FileUrl    string `json:"file_url"`
	ExpiryDate string `json:"expiry_date"`
	Notes      string `json:"notes"`
}

func mapDocumentToResponse(d repository.Document) DocumentResponse {
	var expiry string
	if d.ExpiryDate.Valid {
		expiry = d.ExpiryDate.Time.Format("2006-01-02")
	}
	return DocumentResponse{
		ID:         d.ID,
		VehicleID:  d.VehicleID.Int32,
		Name:       d.Name,
		Type:       d.Type.String,
		FileUrl:    d.FileUrl,
		ExpiryDate: expiry,
		Notes:      d.Notes.String,
	}
}

func (h *Handler) CreateDocument(c *fiber.Ctx) error {
	var req CreateDocumentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var expiryDate sql.NullTime
	if req.ExpiryDate != "" {
		parsed, err := time.Parse("2006-01-02", req.ExpiryDate)
		if err == nil {
			expiryDate = sql.NullTime{Time: parsed, Valid: true}
		}
	}

	doc, err := h.queries.CreateDocument(c.Context(), repository.CreateDocumentParams{
		VehicleID:  sql.NullInt32{Int32: req.VehicleID, Valid: true},
		Name:       req.Name,
		Type:       sql.NullString{String: req.Type, Valid: req.Type != ""},
		FileUrl:    req.FileUrl,
		ExpiryDate: expiryDate,
		Notes:      sql.NullString{String: req.Notes, Valid: req.Notes != ""},
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create document", "details": err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{"data": mapDocumentToResponse(doc)})
}

func (h *Handler) ListDocuments(c *fiber.Ctx) error {
	vehicleId, err := strconv.Atoi(c.Params("vehicleId"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid vehicle ID"})
	}

	docs, err := h.queries.ListDocumentsByVehicle(c.Context(), sql.NullInt32{Int32: int32(vehicleId), Valid: true})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch documents"})
	}

	response := make([]DocumentResponse, len(docs))
	for i, d := range docs {
		response[i] = mapDocumentToResponse(d)
	}

	return c.JSON(fiber.Map{"data": response})
}

func (h *Handler) DeleteDocument(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid document ID"})
	}

	err = h.queries.DeleteDocument(c.Context(), int32(id))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete document"})
	}
	return c.JSON(fiber.Map{"message": "Deleted"})
}
