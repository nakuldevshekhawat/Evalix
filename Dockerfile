FROM node:20-alpine

WORKDIR /app

# Copy root package.json
COPY package.json ./

# Copy the entire webapp directory
COPY webapp ./webapp

# Run the root install command which installs both API and Client dependencies
RUN npm run install:all

# Build the frontend client
RUN cd webapp/client && npm run build

# Start the backend API (which serves the frontend)
CMD ["npm", "start"]
