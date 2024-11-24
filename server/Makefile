.PHONY: all
all: build

.PHONY: build
build:
	go build -o build/mirror-server .

.PHONY: dist
dist: assets
	go build -o dist/mirror-server .

.PHONY: clean
clean:
	rm -rf build/* dist/* server/assets/*

.PHONY: debug
debug: build
	@trap 'kill 0' INT TERM;
	yarn dev &
	RELEASE_STAGE=development ENV=debug LOG_LEVEL=debug build/mirror-server

.PHONY: debug_backend
debug_backend: build
	RELEASE_STAGE=development ENV=debug LOG_LEVEL=info MAPS_PATH=`pwd`/tmp/maps build/mirror-server

.PHONY: debug_frontend
debug_frontend:
	yarn dev

.PHONY: deps
deps: assets
	go get
	go install honnef.co/go/tools/cmd/staticcheck@v0.5.1

.PHONY: update
update:
	go get -u

.PHONY: test
test:
	go test -race -timeout 30s -coverprofile=coverage.out -v ./...
	# yarn test --run

.PHONY: lint
lint:
	staticcheck -f stylish ./...
	# yarn lint

.PHONY: coverage
coverage: test
	go tool cover -html=coverage.out

.PHONY: assets
assets:
	yarn install
	yarn dist
