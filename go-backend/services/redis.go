
package services

import (
    "context"
    "time"
    "fmt"

    "github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func InitRedis(addr string) error {
    if addr == "" { return nil }
    opt, err := redis.ParseURL(addr)
    if err != nil {
        // try as host:port
        RedisClient = redis.NewClient(&redis.Options{Addr: addr})
    } else {
        RedisClient = redis.NewClient(opt)
    }
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    if err := RedisClient.Ping(ctx).Err(); err != nil {
        return err
    }
    return nil
}

// Simple token bucket using Redis INCR + TTL
func AllowRequestRedis(ctx context.Context, key string, capacity int, windowSeconds int) (bool, error) {
    if RedisClient == nil { return true, nil }
    k := fmt.Sprintf("rate:%s", key)
    ttl := time.Duration(windowSeconds) * time.Second
    txf := func(tx *redis.Tx) error {
        cnt, err := tx.Get(ctx, k).Int()
        if err != nil && err != redis.Nil { return err }
        if cnt >= capacity { return fmt.Errorf("limit") }
        pipe := tx.TxPipeline()
        pipe.Incr(ctx, k)
        pipe.Expire(ctx, k, ttl)
        _, err = pipe.Exec(ctx)
        return err
    }
    for i := 0; i < 3; i++ {
        err := RedisClient.Watch(ctx, txf, k)
        if err == nil { return true, nil }
        if err != redis.TxFailedErr {
            if err.Error() == "limit" { return false, nil }
            return false, err
        }
    }
    return false, nil
}

// PubSub helper
func Subscribe(ctx context.Context, channel string, handler func(msg string)) error {
    if RedisClient == nil { return nil }
    sub := RedisClient.Subscribe(ctx, channel)
    _, err := sub.Receive(ctx)
    if err != nil { return err }
    ch := sub.Channel()
    go func() {
        for m := range ch {
            handler(m.Payload)
        }
    }()
    return nil
}

func Publish(ctx context.Context, channel string, msg string) error {
    if RedisClient == nil { return nil }
    return RedisClient.Publish(ctx, channel, msg).Err()
}
