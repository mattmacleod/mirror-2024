# Use a recent Debian install
FROM balenalib/raspberrypi3-64-ubuntu:noble-run
WORKDIR /root

# We need to install the Weston compositor, and `mesa-utils` brings in
# everything else we need.
RUN install_packages weston mesa-utils

# We need to set the default user data dir – this is where the Wayland socket
# will be stored.
ENV XDG_RUNTIME_DIR=/run/shm/wayland

# Copy the Weston configuration and the runner script into the image
COPY src/weston.ini /root
COPY src/run.sh /bin

# We need access to udev so that we can identify input devices. This isn't
# actually needed for normal operation, but it's useful for debugging.
ENV UDEV=1

# Run the runner script.
CMD ["/bin/run.sh"]
