package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/axlenote/axlenote-backend/internal/handlers"
	"github.com/axlenote/axlenote-backend/internal/notification"
	"github.com/axlenote/axlenote-backend/internal/repository"
	"github.com/axlenote/axlenote-backend/internal/scheduler"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	_ "github.com/lib/pq"
)

func main() {
	// Database Connection
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Printf("Warning: Database not ready: %v", err)
	} else {
		log.Println("Connected to Database")
	}

	// Simple Migration Runner
	migrationFiles := []string{
		"db/migrations/001_initial_schema.sql",
		"db/migrations/002_expanded_schema.sql",
		"db/migrations/003_ensure_schema_columns.sql",
		"db/migrations/004_documents_and_reminders.sql",
	}

	for _, file := range migrationFiles {
		schema, err := os.ReadFile(file)
		if err != nil {
			log.Printf("Warning: Could not read migration file %s: %v", file, err)
			continue
		}
		_, err = db.Exec(string(schema))
		if err != nil {
			log.Printf("Error: Failed to apply migration %s: %v", file, err)
		} else {
			log.Printf("Migration %s applied successfully", file)
		}
	}

	queries := repository.New(db)
	h := handlers.New(queries)

	// Notification & Scheduler
	notifier := notification.New()
	sched := scheduler.New(db, queries, notifier)
	sched.Start()

	app := fiber.New()

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New())

	// Routes
	app.Get("/health", h.HealthCheck)

	// API Group
	api := app.Group("/api/v1")
	api.Get("/vehicles", h.GetVehicles)
	api.Post("/vehicles", h.CreateVehicle)
	api.Get("/vehicles/:id", h.GetVehicle)
	api.Put("/vehicles/:id", h.UpdateVehicle)
	api.Delete("/vehicles/:id", h.DeleteVehicle)

	api.Get("/vehicles/:vehicleId/services", h.ListServiceRecords)
	api.Post("/services", h.CreateServiceRecord)
	api.Put("/services/:id", h.UpdateServiceRecord)
	api.Delete("/services/:id", h.DeleteServiceRecord)

	api.Get("/vehicles/:vehicleId/fuel", h.ListFuelLogs)
	api.Post("/fuel", h.CreateFuelLog)
	api.Put("/fuel/:id", h.UpdateFuelLog)
	api.Delete("/fuel/:id", h.DeleteFuelLog)

	api.Get("/vehicles/:vehicleId/reminders", h.ListReminders)
	api.Post("/reminders", h.CreateReminder)
	api.Put("/reminders/:id/complete", h.CompleteReminder)

	api.Get("/vehicles/:id/stats", h.GetVehicleStats)

	api.Get("/vehicles/:vehicleId/documents", h.ListDocuments)
	api.Post("/documents", h.CreateDocument)
	api.Delete("/documents/:id", h.DeleteDocument)

	api.Get("/config", h.GetConfig)

	log.Fatal(app.Listen(":3000"))
}
