# syntax = docker/dockerfile:1

# Adjust versions as desired
ARG NODE_VERSION=20.12.1
ARG BUN_VERSION=1.1.3

# Base image with Node.js installed
FROM node:${NODE_VERSION}-slim as node-base
LABEL fly_launch_runtime="Next.js"

# Install Bun in the Node.js base image
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl unzip ca-certificates && \
    curl -fsSL https://bun.sh/install | bash

# Set the PATH to include Bun binary
ENV PATH="${PATH}:/root/.bun/bin"

# Next.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Copy application code and install dependencies
COPY package.json bun.lockb ./
RUN bun install

COPY . .

# Build application
RUN bun run build

# Remove development dependencies
RUN rm -rf node_modules && \
    bun install --ci

# Expose port and set the start command
EXPOSE 3000
CMD ["bun", "run", "start"]
