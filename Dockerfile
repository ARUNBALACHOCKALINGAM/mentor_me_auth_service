# Use a lightweight official Node.js image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies first (better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the rest of the application
COPY . .

# Use a smaller runtime image for the final build
FROM node:18-alpine AS runner

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app /app

# Set environment variables (optional)
ENV NODE_ENV=production

# Expose the port (for documentation, does not actually bind the port)
EXPOSE $PORT

# Use a non-root user for security
USER node

# Start the application
CMD ["node", "app.js"]
