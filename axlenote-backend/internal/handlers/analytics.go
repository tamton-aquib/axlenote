package handlers

import (
	"database/sql"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type AnalyticsResponse struct {
	TotalFuelCost    float64 `json:"total_fuel_cost"`
	TotalServiceCost float64 `json:"total_service_cost"`
	TotalLiters      float64 `json:"total_liters"`
	TotalServices    int64   `json:"total_services"`
	TotalFuelLogs    int64   `json:"total_fuel_logs"`
	TotalCost        float64 `json:"total_cost"`
}

func (h *Handler) GetVehicleStats(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid vehicle ID"})
	}

	stats, err := h.queries.GetVehicleStats(c.Context(), sql.NullInt32{Int32: int32(id), Valid: true})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch stats", "details": err.Error()})
	}

	response := AnalyticsResponse{
		TotalFuelCost:    stats.TotalFuelCost,
		TotalServiceCost: stats.TotalServiceCost,
		TotalLiters:      stats.TotalLiters,
		TotalServices:    stats.TotalServices,
		TotalFuelLogs:    stats.TotalFuelLogs,
		TotalCost:        stats.TotalFuelCost + stats.TotalServiceCost,
	}

	return c.JSON(fiber.Map{"data": response})
}
