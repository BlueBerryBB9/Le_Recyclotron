#!/bin/bash

docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=password -v mysql-data:/var/lib/mysql -p 3306:3306 mysql:latest
docker run -d --name mysql_test -e MYSQL_ROOT_PASSWORD=password -v mysql-data-test:/var/lib/mysql -p 3307:3307 mysql:latest
