# Use the official Node.js image as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package.json yarn.lock ./

# Install dependencies
RUN npm install --legacy-peer-deps && yarn install && yarn add recharts

# Copy the rest of the application code to the working directory
COPY . .

# Build the React app (optional if the app will be served statically)
RUN yarn build

# Expose the port that the React app runs on
EXPOSE 3001

# Start the React development server
CMD ["yarn", "start", "dev"]
