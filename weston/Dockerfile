FROM balenalib/raspberrypi3-64-debian:bookworm-run
WORKDIR /root

RUN install_packages weston mesa-utils

ENV XDG_RUNTIME_DIR=/run/shm/wayland

COPY src/weston.ini /root
COPY src/run.sh /bin

ENV UDEV=1

CMD ["/bin/run.sh"]
