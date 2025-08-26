package storage

import (
	"time"

	"github.com/go-redis/redis"
)

type RedisStorage struct {
	client *redis.Client
	ttl    time.Duration
}

func NewRedisStorage(addr, password string, ttl time.Duration) (*RedisStorage, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
	})
	_, err := client.Ping().Result()
	if err != nil {
		return nil, err
	}
	return &RedisStorage{
		client: client,
		ttl:    ttl,
	}, nil
}

func (r *RedisStorage) Save(key string, value []byte) error {
	return r.client.Set(key, value, r.ttl).Err()
}

func (r *RedisStorage) Load(key string) ([]byte, error) {
	return r.client.Get(key).Bytes()
}

func (r *RedisStorage) Delete(key string) error {
	if r := r.client.Del(key); r.Err() != nil {
		return r.Err()
	}
	return nil
}

func (r *RedisStorage) Close() {
	r.client.Close()
}
