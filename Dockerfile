version: '3.8'

services:
    app:
        build:
            context: .
            dockerfile: Dockerfile
        ports:
            - "3000:3000"
        depends_on:
            - db
        environment:
            DB_HOST: db
            DB_PORT: 3306
            DB_USER: root
            DB_PASSWORD: example
# Expose the port the app runs on
EXPOSE 3000

# Launch
CMD ["npm", "start"]
