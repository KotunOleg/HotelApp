# Stage 1 — build React
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2 — build Go
FROM golang:1.26-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o hotel-app ./cmd/main.go

# Stage 3 — final image
FROM alpine:latest
WORKDIR /app
COPY --from=builder  /app/hotel-app    .
COPY --from=frontend /app/frontend/dist ./static/
EXPOSE 8080
CMD ["./hotel-app"]
