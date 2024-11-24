FROM balenalib/raspberrypi3-64-debian:bookworm-build AS builder

# Install the Go toolchain
COPY --from=golang:1.22 /usr/local/go/ /usr/local/go/
ENV PATH="/usr/local/go/bin:/root/go/bin:${PATH}"

# Install the APT repos for nodejs and Yarn, and install
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN install_packages \
  nodejs \
  yarn

# Build the app
WORKDIR /go/src/github.com/mattmacleod/mirror-2024
COPY . /go/src/github.com/mattmacleod/mirror-2024
RUN rm -rf .git

RUN make deps
RUN make assets
RUN make lint
RUN make test
RUN make dist

# Build the runner image
FROM balenalib/raspberrypi3-64-debian:bookworm-run
WORKDIR /root

COPY --from=builder /go/src/github.com/mattmacleod/mirror-2024/dist/mirror-server /bin

RUN echo 'export PS1="\\u@\\h[\$BALENA_SERVICE_NAME]:\\w\$ "' >> /root/.bashrc

# Load the modules using the runner script
COPY ./scripts/run.sh /bin
CMD ["/bin/run.sh"]
