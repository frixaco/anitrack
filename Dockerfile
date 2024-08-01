# Stage 1: Build the Next.js web app
FROM node:20 AS web-build

# Set the working directory
WORKDIR /app

# Copy the root-level pnpm-lock.yaml and package.json files
COPY pnpm-lock.yaml package.json ./

# Copy the web app package.json
COPY apps/web/package.json ./apps/web/

# Install dependencies using PNPM
RUN npm install -g pnpm && pnpm install

# Copy the rest of the web app files
COPY apps/web ./apps/web

# Change directory to the web app and build the Next.js app
WORKDIR /app/apps/web
RUN pnpm run build

# Stage 2: Build the Golang backend API
FROM golang:1.22 AS api-build

# Set the working directory
WORKDIR /app

# Copy the Go module files
COPY apps/api-go/go.mod apps/api-go/go.sum ./

# Download Go modules
RUN go mod download

# Copy the rest of the Go source files
COPY apps/api-go .

# Build the Go binary
RUN go build -o main .

# Stage 3: Create the final image
FROM node:20 AS final

# Set the working directory
WORKDIR /app

# Copy the built Next.js app from the web-build stage
COPY --from=web-build /app/apps/web/.next ./apps/web/.next
COPY --from=web-build /app/apps/web/public ./apps/web/public
COPY --from=web-build /app/apps/web/package.json ./apps/web/package.json

# Copy the root-level pnpm-lock.yaml and package.json files
COPY pnpm-lock.yaml package.json ./

# Install only production dependencies for the web app
RUN npm install -g pnpm && pnpm install

# Copy the built Go binary from the api-build stage
COPY --from=api-build /app/main ./api-go/main

# Expose the necessary ports
EXPOSE 3000 4000

# Start both applications and ensure they have access to environment variables
CMD ["sh", "-c", "node_modules/.bin/next start & ./api-go/main"]
