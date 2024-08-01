# Stage 1: Build the Next.js frontend
FROM node:20-alpine AS web-build

WORKDIR /app

COPY pnpm-lock.yaml package.json ./apps/web/ ./

RUN npm install -g pnpm

RUN pnpm install

RUN pnpm build

# Stage 2: Build the Go backend
FROM golang:1.22-alpine AS api-build

WORKDIR /app

COPY apps/api-go/ ./

RUN go mod tidy

RUN go build -o dist/api-go .

# Stage 3: Final stage to combine both builds
FROM alpine:latest AS final

# Install necessary dependencies for running Next.js
RUN apk add --no-cache nodejs npm

WORKDIR /app

# Copy the built frontend from the web-build stage
COPY --from=web-build /app/.next ./.next
COPY --from=web-build /app/node_modules ./node_modules
COPY --from=web-build /app/package.json ./package.json

# Copy the built backend from the api-build stage
COPY --from=api-build /app/dist/api-go ./api-go

EXPOSE 3000 4000

CMD ["sh", "-c", "node_modules/.bin/next start & ./api-go"]
