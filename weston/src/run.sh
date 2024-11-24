#!/bin/bash
set -euf -o pipefail

# The container running this script will send the script a SIGTERM when it shuts
# down. By default, this signal will not be passed down to child processes,
# and the container will continue to run until it eventually gets killed. We
# trap any appropriate signals and kill any child processes we started.
trap "trap - SIGTERM && pkill -e -TERM -ns 1" SIGINT SIGTERM EXIT

# Ensure the VT is in text mode. This is a bit of a hack; ideally we would be
# able to use the actual weston-launch app, but it really doesn't like working
# with our container setup.
#
# All this basically does is call the KDSETMODE ioctl on /dev/tty2 and tells
# the VT to switch to text mode. I suppose this could break things if we weren't
# careful.
perl -e 'require "sys/ioctl.ph"; open (my $fh, "<", "/dev/tty2") or die("failed"); ioctl($fh, 0x4B3A, 0x00)'

# Start Weston in the background
weston --tty=2 --config=/root/weston.ini &

# Capture the PID and wait for Weston to complete (hopefully never…)
WESTON_PID=$!
echo "Weston is running with PID $WESTON_PID. Waiting for termination."
wait "$WESTON_PID"
