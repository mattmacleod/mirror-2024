#!/bin/bash
set -euf -o pipefail

# The container running this script will send the script a SIGTERM when it shuts
# down. By default, this signal will not be passed down to child processes,
# and the container will continue to run until it eventually gets killed. We
# trap any appropriate signals and kill any child processes we started.
trap "trap - SIGTERM && pkill -e -TERM -ns 1" SIGINT SIGTERM EXIT

export APP_URL=${APP_URL:-"http://localhost:8888"}
export WAYLAND_DISPLAY=${WAYLAND_DISPLAY:-"wayland-1"}

echo "Starting UI container..."
echo
echo "UI configuration"
echo "-------------------------------------------------------------------------"
echo "App URL    | $APP_URL"
echo


chromium \
    --start-fullscreen \
    --kiosk \
    --no-default-browser-check \
    --no-first-run \
    --noerrdialogs \
    --disable-restore-session-state \
    --disable-infobars \
    --disable-java \
    --disable-translate \
    --disable-suggestions-service \
    --disable-save-password-bubble \
    --disable-gpu-sandbox \
    --no-sandbox \
    --dbus-stub \
    --enable-logging=stderr \
    --password-store=basic \
    --ignore-gpu-blacklist \
    --class=ui \
    --profile-directory=Default \
    --ozone-platform=wayland \
    $APP_URL

wait -n
