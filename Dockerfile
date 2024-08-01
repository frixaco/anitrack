# Stage 1: Build the Next.js web app
FROM node:20 AS web-build

# Set the working directory
WORKDIR /app

# Copy the package.json and pnpm-lock.yaml files
COPY apps/web/package.json apps/web/pnpm-lock.yaml ./

# Install dependencies using PNPM
RUN npm install -g pnpm && pnpm install

# Copy the rest of the web app files
COPY apps/web .

# Build the Next.js app
RUN pnpm build

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
COPY --from=web-build /app/.next ./.next
COPY --from=web-build /app/public ./public
COPY --from=web-build /app/package.json ./package.json
COPY --from=web-build /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install only production dependencies for the web app
RUN npm install -g pnpm && pnpm install --prod

# Copy the built Go binary from the api-build stage
COPY --from=api-build /app/main ./api-go/main

# Expose the necessary ports
EXPOSE 3000 4000

# Start both applications
CMD ["sh", "-c", "node_modules/.bin/next start & ./api-go/main"]
