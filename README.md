# AxleNote

**A lightweight, self-hosted vehicle maintenance tracker.**

![Docker Image Size](https://img.shields.io/badge/Docker_Image_Size-%3C75MB-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Stack](https://img.shields.io/badge/Built_With-Go_%2B_React-purple?style=flat-square)

I built AxleNote because I wanted a simple, fast way to track my vehicle maintenance without the overhead of heavy, complex alternatives. It tracks everything from fuel fill-ups to service records, and it's optimized to run on minimal hardware.

## Why AxleNote?

Most self-hosted apps are surprisingly heavy. AxleNote is designed to be the opposite:
- **Tiny Footprint**: The entire Docker image is under 75MB.
- **Efficient**: The backend is written in Go and the frontend in React. It idles with negligible memory usage.
- **Simple Deployment**: Everything (Frontend, Backend, Nginx) is packaged into a single Alpine-based container.
- **Clean UI**: A straightforward dark-mode interface that focuses on the data you need.

## Features

- **Garage Management**: Manage multiple vehicles with details like VIN and license plates.
- **Service Logs**: Keep a history of maintenance, repairs, and upgrades with costs and file attachments.
- **Fuel Tracking**: Log your fill-ups to see efficiency calculations (MPG/KPL) and spending trends over time.
- **Reminders**: Set recurring reminders based on dates (e.g., annual inspection) or odometer readings (e.g., oil change every 5000km).
- **Document Storage**: Store digital copies of insurance papers, registration, and receipts.
- **Analytics**: Get a visual breakdown of your costs and recent activity.

---

## Installation

### Option 1: Full Stack (Recommended)
You can use this `docker-compose.yml` to deploy both the application and the database.

```yaml
services:
  axlenote:
    image: axlenote:latest # Or build locally: build: .
    container_name: axlenote
    restart: unless-stopped
    ports:
      - "3000:80" # Access UI at http://localhost:3000
    environment:
      - DB_HOST=postgres
      - DB_USER=axleuser
      - DB_PASSWORD=axlepass
      - DB_NAME=axlenote
      - APP_CURRENCY=₹          # Change to $, €, etc.
      - METRICS_UNIT=km        # km or miles
      - TZ=Asia/Kolkata
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    container_name: axlenote-db
    restart: unless-stopped
    environment:
      - POSTGRES_USER=axleuser
      - POSTGRES_PASSWORD=axlepass
      - POSTGRES_DB=axlenote
    volumes:
      - axlenote_data:/var/lib/postgresql/data

volumes:
  axlenote_data:
```

### Option 2: App Only (Existing Database)
If you already have a PostgreSQL instance running, you can run just the application container.

```yaml
services:
  axlenote:
    image: axlenote:latest
    container_name: axlenote
    restart: unless-stopped
    ports:
      - "3000:80"
    environment:
      - DB_HOST=192.168.1.50   # Your Postgres IP
      - DB_PORT=5432
      - DB_USER=myuser
      - DB_PASSWORD=mypassword
      - DB_NAME=axlenote
      - APP_CURRENCY=$
      - METRICS_UNIT=miles
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `postgres` | Hostname/IP of PostgreSQL database |
| `DB_PORT` | `5432` | Database port |
| `DB_USER` | `axleuser` | Database username |
| `DB_PASSWORD` | `axlepass` | Database password |
| `DB_NAME` | `axlenote` | Database name |
| `APP_CURRENCY` | `₹` | Currency symbol displayed in UI (e.g. $, £, €) |
| `METRICS_UNIT` | `km` | Distance unit (`km` or `miles`) |
| `TZ` | `Asia/Kolkata` | Timezone for logs and dates |

## A Note on Authentication

AxleNote does **not** have built-in authentication at the moment. It is designed to be a simple tool managed by a single user.

If you plan to expose this to the internet, please put it behind a secure reverse proxy or VPN. Common solutions include:
- Cloudflare Zero Trust
- Authelia
- Authentik
- Tailscale

## Development

### Backend (Go)
```bash
cd axlenote-backend
go run cmd/api/main.go
```

### Frontend (React)
```bash
cd axlenote-frontend
npm install
npm run dev
```

## License

MIT
