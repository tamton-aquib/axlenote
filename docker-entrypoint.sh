#!/bin/sh
set -e

cd /app

# Start the AxleNote backend service in the background
/usr/local/bin/axlenote-api &
BACKEND_PID=$!

# Start Nginx in the foreground
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait for any process to exit
wait -n $BACKEND_PID $NGINX_PID

# Exit with status of process that exited first
exit $?
