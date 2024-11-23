#!/bin/bash
set -euf -o pipefail

# The container running this script will send the script a SIGTERM when it shuts
# down. By default, this signal will not be passed down to child processes,
# and the container will continue to run until it eventually gets killed. We
# trap any appropriate signals and kill any child processes we started.
trap "trap - SIGTERM && pkill -e -TERM -ns 1" SIGINT SIGTERM EXIT

echo "Starting networking control container in 5 seconds..."
sleep 5

export TAILSCALE_KEY=${TAILSCALE_KEY:-}
export TAILSCALE_HOSTNAME=${TAILSCALE_HOSTNAME:-$BALENA_DEVICE_NAME_AT_INIT}
export TAILSCALE_KEY_CENSORED=`[[ -z $TAILSCALE_KEY ]] && echo "(missing)" || echo "(supplied)"`

echo "Configuration"
echo "-------------------------------------------------------------------------"
echo "TAILSCALE_KEY                        | $TAILSCALE_KEY_CENSORED"
echo "TAILSCALE_HOSTNAME                   | $TAILSCALE_HOSTNAME"
echo

if [[ -z $TAILSCALE_KEY ]]; then
  echo "No Tailscale key supplied. Please set the environment variable TAILSCALE_KEY."
  exit 1
fi

echo "Starting tailscaled..."
tailscaled -state=/tailscale/tailscaled.state &


echo "Bringing up Tailnet..."
if tailscale up \
  --reset \
  --timeout 60s \
  --accept-routes \
  --authkey "${TAILSCALE_KEY}" \
; then
  echo "Tailscale has started"
else
  echo "Tailscale failed to start"
  sleep 2
  exit 1
fi

wait -n
