package handlers

import (
	"os"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetConfig(c *fiber.Ctx) error {
	currency := os.Getenv("APP_CURRENCY")
	if currency == "" {
		currency = "₹"
	}
	return c.JSON(fiber.Map{
		"currency": currency,
	})
}
