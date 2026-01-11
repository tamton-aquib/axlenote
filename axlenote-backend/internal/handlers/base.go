package handlers

import (
	"github.com/axlenote/axlenote-backend/internal/repository"
)

type Handler struct {
	queries *repository.Queries
}

func New(queries *repository.Queries) *Handler {
	return &Handler{
		queries: queries,
	}
}
