
.PHONY: build run test docker-up docker-down lint

build:
	go build -v ./...

run:
	go run main.go

test:
	go test ./...

docker-up:
	docker-compose up --build -d

docker-down:
	docker-compose down -v
