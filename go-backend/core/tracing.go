
package core

import (
    "context"
    "os"
    "log"
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/sdk/resource"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
    semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
    "go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
    "time"
)

func InitTracing(ctx context.Context) func(context.Context) error {
    endpoint := os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
    if endpoint == "" {
        // no-op tracer; return noop shutdown
        return func(context.Context) error { return nil }
    }
    // configure OTLP HTTP exporter
    client := otlptracehttp.NewClient(otlptracehttp.WithEndpoint(endpoint), otlptracehttp.WithInsecure())
    exp, err := otlptracehttp.New(ctx, client)
    if err != nil {
        log.Printf("otel exporter error: %v", err)
        return func(context.Context) error { return nil }
    }
    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exp),
        sdktrace.WithResource(resource.NewWithAttributes(
            semconv.SchemaURL,
            semconv.ServiceNameKey.String(Conf.ServiceName),
        )),
    )
    otel.SetTracerProvider(tp)
    // return shutdown func
    return tp.Shutdown
}
