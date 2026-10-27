FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js cache.js events.js listeners.js ./
COPY models ./models

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
