package handlers

import "github.com/gofiber/fiber/v2"

func (h *Handler) HealthCheck(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status":  "ok",
		"message": "AxleNote API is running",
	})
}
