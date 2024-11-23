FROM balenalib/raspberrypi3-64-ubuntu:noble-run

RUN curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/noble.noarmor.gpg > /usr/share/keyrings/tailscale-archive-keyring.gpg
RUN curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/noble.tailscale-keyring.list > /etc/apt/sources.list.d/tailscale.list
RUN install_packages network-manager iptables tailscale=1.76.6

# Update container bashrc with a better prompt
RUN echo 'export PS1="\\u@\\h[\$BALENA_SERVICE_NAME]:\\w\$ "' >> /root/.bashrc

# Execute the runner script
COPY ./run.sh /bin
CMD ["/bin/run.sh"]
