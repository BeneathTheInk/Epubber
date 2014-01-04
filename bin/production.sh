#!/bin/sh

# variables
export NODE_ENV=production
export PORT=8006
export MONGO_URL="mongodb://localhost:27017/dashboard"

# start the server
node app.js > ./output.log 2>&1 &

# log PID for stopping
echo $! >> .pid

# logging
echo "PID = $!"
echo "Logging output to ./output.log"
echo "Stop with 'npm stop'\n"