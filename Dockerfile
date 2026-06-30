# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and frontend package files
COPY package.json tsconfig.json ./
COPY frontend/package.json ./frontend/

# Install dependencies for both backend and frontend
RUN npm install
RUN npm --prefix frontend install

# Copy all source files
COPY src ./src
COPY frontend ./frontend

# Build backend (TypeScript compilation)
RUN npx tsc

# Build frontend (Vite)
RUN npm --prefix frontend run build

# Prune devDependencies to keep production image small
RUN npm prune --omit=dev

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files
COPY package.json ./

# Copy node_modules and compiled/built files from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/frontend/dist ./frontend/dist

# Expose server port
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]
