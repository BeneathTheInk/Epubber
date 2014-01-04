#!/bin/sh

# variables
export NODE_ENV=development
export PORT=3000
export MONGO_URL="mongodb://localhost:27017/epubber"

# start the server
echo "Starting the server with Nodemon...\n"
nodemon app.js