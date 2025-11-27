
FROM golang:1.20-bullseye AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o neuroedge ./main.go

FROM gcr.io/distroless/static-debian11
COPY --from=builder /app/neuroedge /neuroedge
EXPOSE 9000
ENTRYPOINT ["/neuroedge"]
