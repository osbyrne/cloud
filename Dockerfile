# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and frontend package files
COPY package*.json tsconfig.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies for both backend and frontend
RUN npm ci
RUN npm --prefix frontend install

# Copy all source files
COPY src ./src
COPY frontend ./frontend

# Build backend (TypeScript compilation)
RUN npx tsc

# Build frontend (Vite)
RUN npm --prefix frontend run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files
COPY package*.json ./

# Install only production dependencies for the backend
RUN npm ci --only=production

# Copy compiled files and static assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/frontend/dist ./frontend/dist

# Expose server port
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]
