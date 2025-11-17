# Use Node.js LTS
FROM node:18

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all backend files
COPY . .

# Expose port
EXPOSE 5000

# Start the app
CMD ["node", "server.js"]
