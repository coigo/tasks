# Stage 1: Build vite
FROM node:24-alpine AS front-build
WORKDIR /app
COPY ./web/yarn.lock ./web/package.json ./
RUN yarn --frozen-lockfile
COPY ./web ./
RUN yarn build

# Stage 2: Build the binary
FROM golang:1.26-alpine AS builder
WORKDIR /app
RUN apk add --no-cache ca-certificates
COPY ./api/go.mod ./api/go.sum ./
RUN go mod download
COPY ./api .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o /app/server ./cmd/main

# Stage 3: Create minimal runtime image
FROM alpine
COPY --from=front-build /app/dist ./internal/static
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
