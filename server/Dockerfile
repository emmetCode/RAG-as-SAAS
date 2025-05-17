FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install all dependencies including dev (for build)
RUN npm install

# Copy all source files
COPY . .



CMD ["npm", "start"]
