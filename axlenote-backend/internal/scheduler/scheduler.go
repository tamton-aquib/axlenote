package scheduler

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/axlenote/axlenote-backend/internal/notification"
	"github.com/axlenote/axlenote-backend/internal/repository"
)

type Scheduler struct {
	db       *sql.DB
	queries  *repository.Queries
	notifier *notification.Service
}

func New(db *sql.DB, queries *repository.Queries, notifier *notification.Service) *Scheduler {
	return &Scheduler{
		db:       db,
		queries:  queries,
		notifier: notifier,
	}
}

func (s *Scheduler) Start() {
	// Run immediately on start
	go s.checkReminders()

	// Then run every hour
	ticker := time.NewTicker(1 * time.Hour)
	go func() {
		for range ticker.C {
			s.checkReminders()
		}
	}()
}

func (s *Scheduler) checkReminders() {
	ctx := context.Background()

	// Get all vehicles
	vehicles, err := s.queries.ListVehicles(ctx)
	if err != nil {
		log.Printf("Scheduler: Failed to list vehicles: %v", err)
		return
	}

	for _, v := range vehicles {
		// Get reminders for vehicle
		reminders, err := s.queries.ListRemindersByVehicle(ctx, sql.NullInt32{Int32: v.ID, Valid: true})
		if err != nil {
			continue
		}

		if len(reminders) == 0 {
			continue
		}

		// Calculate current odometer (max of service or fuel logs)
		// We can get this from a custom query or just separate checks.
		// For simplicity/performance, let's just make a helper map or query.
		// Using GetVehicleStats could be heavy if called in loop but fine for small user base.

		currentOdo := int32(0) // Default
		// Wait, GetVehicleStats returns sums, not max odometer.
		// We'll need a quick query execution here or assume 'currentOdo' logic.
		// Let's execute a raw query to get max odometer for accuracy.
		var maxOdo sql.NullInt32
		err = s.db.QueryRowContext(ctx, `
			SELECT GREATEST(
				(SELECT COALESCE(MAX(odometer), 0) FROM service_records WHERE vehicle_id = $1),
				(SELECT COALESCE(MAX(odometer), 0) FROM fuel_logs WHERE vehicle_id = $1)
			)
		`, v.ID).Scan(&maxOdo)

		if err == nil && maxOdo.Valid {
			currentOdo = maxOdo.Int32
		}

		for _, r := range reminders {
			shouldNotify := false
			trigger := ""

			// Date Check
			if r.DueDate.Valid && !r.DueDate.Time.IsZero() {
				// Due today or in the past
				if time.Now().After(r.DueDate.Time) {
					shouldNotify = true
					trigger = fmt.Sprintf("Date Due: %s", r.DueDate.Time.Format("2006-01-02"))
				}
				// Warning: Due within 7 days
				if time.Until(r.DueDate.Time) < 7*24*time.Hour && time.Until(r.DueDate.Time) > 0 {
					shouldNotify = true
					trigger = fmt.Sprintf("Upcoming Due Date: %s", r.DueDate.Time.Format("2006-01-02"))
				}
			}

			// Odometer Check
			if r.DueOdometer.Valid && r.DueOdometer.Int32 > 0 {
				if currentOdo >= r.DueOdometer.Int32 {
					shouldNotify = true
					trigger = fmt.Sprintf("Odometer Reached: %d km", r.DueOdometer.Int32)
				} else if r.DueOdometer.Int32-currentOdo < 500 {
					shouldNotify = true
					trigger = fmt.Sprintf("Odometer Approaching: %d km (Current: %d)", r.DueOdometer.Int32, currentOdo)
				}
			}

			if shouldNotify {
				msg := fmt.Sprintf("Vehicle: %s\nReminder: %s\nTrigger: %s", v.Name, r.Title, trigger)
				log.Printf("Sending notification: %s", msg)
				err := s.notifier.Send(fmt.Sprintf("Reminder: %s", r.Title), msg)
				if err != nil {
					log.Printf("Failed to send notification: %v", err)
				}
			}
		}
	}
}
