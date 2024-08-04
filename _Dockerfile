# Base image for Node.js
FROM node:20-alpine AS base-node
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Base image for Go
FROM golang:1.22-alpine AS base-go

# Builder stage for Node.js
FROM base-node AS builder-node
RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g turbo@^2

COPY . .

RUN turbo prune --scope=web --docker

# Installer stage for Node.js
FROM base-node AS installer-node
RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY --from=builder-node /app/out/json/ .
COPY --from=builder-node /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build the Node.js project
COPY --from=builder-node /app/out/full/ .
RUN pnpm dlx turbo run build --filter=web...

# Builder stage for Go
FROM base-go AS builder-go
WORKDIR /app
COPY apps/api-go/ .

RUN go mod tidy
RUN go build -o dist/api-go .

# Runner stage
FROM node:20-alpine AS runner

# Set up non-root user for Node.js
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Node.js app
WORKDIR /app
COPY --from=installer-node /app/apps/web/next.config.mjs .
COPY --from=installer-node /app/apps/web/package.json .
COPY --from=installer-node --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer-node --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer-node --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Copy Go app
COPY --from=builder-go /app/dist/api-go ./

# Expose ports for both applications
EXPOSE 3000 4000

CMD sh -c "node apps/web/server.js & ./api-go"
