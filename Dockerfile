# Stage 1: Build
FROM node:22 AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application (if applicable, e.g., for TypeScript or bundling)
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy only the necessary files from the build stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
# COPY --from=builder /usr/src/app/.env.local ./.env.local IN THE DOCKER COMPOSE

# Install only production dependencies
RUN npm install --only=production

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/index.js"]
