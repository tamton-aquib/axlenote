package handlers

import (
	"database/sql"
	"strconv"
	"time"

	"github.com/axlenote/axlenote-backend/internal/repository"
	"github.com/gofiber/fiber/v2"
)

type CreateReminderRequest struct {
	VehicleID      int32  `json:"vehicle_id"`
	Title          string `json:"title"`
	DueDate        string `json:"due_date"`     // YYYY-MM-DD
	DueOdometer    int32  `json:"due_odometer"` // km
	IsRecurring    bool   `json:"is_recurring"`
	IntervalKm     int32  `json:"interval_km"`
	IntervalMonths int32  `json:"interval_months"`
	Notes          string `json:"notes"`
}

type ReminderResponse struct {
	ID             int32  `json:"id"`
	VehicleID      int32  `json:"vehicle_id"`
	Title          string `json:"title"`
	DueDate        string `json:"due_date"`
	DueOdometer    int32  `json:"due_odometer"`
	IsRecurring    bool   `json:"is_recurring"`
	IntervalKm     int32  `json:"interval_km"`
	IntervalMonths int32  `json:"interval_months"`
	Notes          string `json:"notes"`
	IsCompleted    bool   `json:"is_completed"`
}

func mapReminderToResponse(r repository.Reminder) ReminderResponse {
	var dateStr string
	if r.DueDate.Valid {
		dateStr = r.DueDate.Time.Format("2006-01-02")
	}

	return ReminderResponse{
		ID:             r.ID,
		VehicleID:      r.VehicleID.Int32,
		Title:          r.Title,
		DueDate:        dateStr,
		DueOdometer:    r.DueOdometer.Int32,
		IsRecurring:    r.IsRecurring.Bool,
		IntervalKm:     r.IntervalKm.Int32,
		IntervalMonths: r.IntervalMonths.Int32,
		Notes:          r.Notes.String,
		IsCompleted:    r.IsCompleted.Bool,
	}
}

func (h *Handler) CreateReminder(c *fiber.Ctx) error {
	var req CreateReminderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var dueDate sql.NullTime
	if req.DueDate != "" {
		parsedDate, err := time.Parse("2006-01-02", req.DueDate)
		if err == nil {
			dueDate = sql.NullTime{Time: parsedDate, Valid: true}
		}
	}

	reminder, err := h.queries.CreateReminder(c.Context(), repository.CreateReminderParams{
		VehicleID:      sql.NullInt32{Int32: req.VehicleID, Valid: true},
		Title:          req.Title,
		DueDate:        dueDate,
		DueOdometer:    sql.NullInt32{Int32: req.DueOdometer, Valid: req.DueOdometer > 0},
		IsRecurring:    sql.NullBool{Bool: req.IsRecurring, Valid: true},
		IntervalKm:     sql.NullInt32{Int32: req.IntervalKm, Valid: req.IntervalKm > 0},
		IntervalMonths: sql.NullInt32{Int32: req.IntervalMonths, Valid: req.IntervalMonths > 0},
		Notes:          sql.NullString{String: req.Notes, Valid: req.Notes != ""},
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create reminder", "details": err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{"data": mapReminderToResponse(reminder)})
}

func (h *Handler) ListReminders(c *fiber.Ctx) error {
	vehicleId, err := strconv.Atoi(c.Params("vehicleId"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid vehicle ID"})
	}

	reminders, err := h.queries.ListRemindersByVehicle(c.Context(), sql.NullInt32{Int32: int32(vehicleId), Valid: true})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch reminders"})
	}

	response := make([]ReminderResponse, len(reminders))
	for i, r := range reminders {
		response[i] = mapReminderToResponse(r)
	}

	return c.JSON(fiber.Map{"data": response})
}

func (h *Handler) CompleteReminder(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid reminder ID"})
	}

	err = h.queries.CompleteReminder(c.Context(), int32(id))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to complete reminder"})
	}

	return c.JSON(fiber.Map{"message": "Reminder completed"})
}
