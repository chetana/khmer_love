# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# API key NOT baked into bundle — the service worker proxy handles it server-side
RUN npm run build

# ---- Run stage ----
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY server.js .

EXPOSE 8080
CMD ["node", "server.js"]
