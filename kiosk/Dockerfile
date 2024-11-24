FROM balenalib/raspberrypi3-64-debian:bookworm-run

RUN install_packages chromium=130.0.6723.91-1~deb12u1 chromium-common=130.0.6723.91-1~deb12u1 libegl1

ENV XDG_RUNTIME_DIR=/run/shm/wayland

# # Install the i3 configuration file and the Chromium launcher.
# COPY src/i3.config /etc/i3/config
# COPY src/chromium.launcher /root

# # Install a policy for Chromium. This will let us limit the capabilities of the
# # browser.
# RUN mkdir -p /etc/chromium/policies/managed
# COPY src/chrome-policy.json /etc/chromium/policies/managed

# Copy the runner script into the container.
COPY src/run.sh /bin

# Run the runner script.
CMD ["/bin/run.sh"]
