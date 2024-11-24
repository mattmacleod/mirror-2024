#!/bin/bash
set -euf -o pipefail

# The container running this script will send the script a SIGTERM when it shuts
# down. By default, this signal will not be passed down to child processes,
# and the container will continue to run until it eventually gets killed. We
# trap any appropriate signals and kill any child processes we started.
trap "trap - SIGTERM && pkill -e -TERM -ns 1" SIGINT SIGTERM EXIT

export PORT=8888
export ENV=${ENV:-release}
export LOG_LEVEL=${LOG_LEVEL:-info}

mirror-server &

# Sleep until the app dies
CHILD_PID=$!
echo "App is running with PID $CHILD_PID. Waiting for termination."
wait "$CHILD_PID"
