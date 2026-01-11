# Multi-stage build for AXLENOTE (Frontend + Backend)

# Stage 1: Build Frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/axlenote-frontend

COPY axlenote-frontend/package.json axlenote-frontend/package-lock.json ./
RUN npm ci

COPY axlenote-frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM golang:1.25-alpine AS backend-builder

WORKDIR /app/axlenote-backend

COPY axlenote-backend/go.mod axlenote-backend/go.sum ./
RUN go mod download

COPY axlenote-backend/ ./
# Build with -s -w to strip debug information and reduce binary size
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o axlenote-api ./cmd/api

# Stage 3: Final Image with Nginx + Backend
FROM nginx:alpine

WORKDIR /app

# Copy frontend build
COPY --from=frontend-builder /app/axlenote-frontend/dist /usr/share/nginx/html

# Copy backend binary
COPY --from=backend-builder /app/axlenote-backend/axlenote-api /usr/local/bin/axlenote-api

# Copy db folder (includes migrations)
COPY --from=backend-builder /app/axlenote-backend/db /app/db

# Copy nginx config
COPY axlenote-frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80 3000
CMD ["/docker-entrypoint.sh"]
