# Use the official Node.js image as the base image
FROM node:22

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN apt-get update && apt-get install -y build-essential gcc g++ make mysql-server
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Configure MySQL
RUN service mysql start && \
    mysql -e "CREATE DATABASE my_database;" && \
    mysql -e "CREATE USER 'user'@'%' IDENTIFIED BY 'password';" && \
    mysql -e "GRANT ALL PRIVILEGES ON my_database.* TO 'user'@'%';" && \
    mysql -e "FLUSH PRIVILEGES;"

# Expose the ports for the app and MySQL
EXPOSE 3000 3306

# Launch both MySQL and the Node.js app
CMD service mysql start && npm start
