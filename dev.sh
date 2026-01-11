#!/bin/bash

# Kill background processes on exit
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

# Start Docker dependencies (Postgres)
echo "Starting Database..."
docker compose up -d postgres

# Wait for DB
echo "Waiting for DB to be ready..."
sleep 3

# Start Backend
echo "Starting Backend..."
export DB_HOST=127.0.0.1
export DB_PORT=5432
export DB_USER=axleuser
export DB_PASSWORD=axlepass
export DB_NAME=axlenote
(cd axlenote-backend && go run cmd/api/main.go) &
BACKEND_PID=$!

# Start Frontend
echo "Starting Frontend..."
cd axlenote-frontend
npm run dev &
FRONTEND_PID=$!

echo "------------------------------------------------"
echo "  AxleNote running locally!"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3000"
echo "------------------------------------------------"

wait
