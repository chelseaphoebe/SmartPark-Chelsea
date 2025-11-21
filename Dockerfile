# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm install --production

COPY backend/ ./

EXPOSE 5000

CMD ["npm", "start"]