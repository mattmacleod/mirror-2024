#!/bin/bash
set -euf -o pipefail

# The container running this script will send the script a SIGTERM when it shuts
# down. By default, this signal will not be passed down to child processes,
# and the container will continue to run until it eventually gets killed. We
# trap any appropriate signals and kill any child processes we started.
trap "trap - SIGTERM && pkill -e -TERM -ns 1" SIGINT SIGTERM EXIT

# Start Weston in the background
weston --config=/root/weston.ini &

# Capture the PID and wait for Weston to complete (hopefully never…)
WESTON_PID=$!
echo "Weston is running with PID $WESTON_PID. Waiting for termination."
wait "$WESTON_PID"