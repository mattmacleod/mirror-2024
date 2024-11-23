FROM balenalib/raspberrypi3-64-debian:bookworm-run

RUN curl -fsSL https://pkgs.tailscale.com/stable/debian/bookworm.noarmor.gpg > /usr/share/keyrings/tailscale-archive-keyring.gpg
RUN curl -fsSL https://pkgs.tailscale.com/stable/debian/bookworm.tailscale-keyring.list > /etc/apt/sources.list.d/tailscale.list
RUN install_packages network-manager iptables tailscale=1.76.6

RUN echo 'export PS1="\\u@\\h[\$BALENA_SERVICE_NAME]:\\w\$ "' >> /root/.bashrc

COPY ./run.sh /bin
CMD ["/bin/run.sh"]
