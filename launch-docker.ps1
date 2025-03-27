# Remove the container if it already exists
if (docker ps -aq -f name=le_recyclotron_container) {
    docker rm -f le_recyclotron_container
}

# Remove the image if it already exists
if (docker images -q le_recyclotron) {
    docker rmi -f le_recyclotron
}

# Build the Docker image
docker build -t le_recyclotron .

# Run the Docker container
docker run -p 3000:3000 --name le_recyclotron_container le_recyclotron
