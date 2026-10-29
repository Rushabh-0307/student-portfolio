FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source files (P11)
COPY server.js cache.js events.js listeners.js ./
COPY models ./models
COPY middleware ./middleware

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
