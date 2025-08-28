package storage

import (
	"fmt"
	"time"

	cache "github.com/patrickmn/go-cache"
)

type GoCacheStorage struct {
	client *cache.Cache
}

func NewGoCacheStorage(defaultExpiration, cleanupInterval time.Duration) (*GoCacheStorage, error) {
	c := cache.New(defaultExpiration, cleanupInterval)
	return &GoCacheStorage{client: c}, nil
}

// Save stores a value for a given key.
func (s *GoCacheStorage) Save(key string, value []byte) error {
	s.client.Set(key, value, cache.DefaultExpiration)
	return nil
}

// Load retrieves a value for a given key.
func (s *GoCacheStorage) Load(key string) ([]byte, error) {
	if x, found := s.client.Get(key); found {
		if data, ok := x.([]byte); ok {
			return data, nil
		}
		return nil, fmt.Errorf("invalid data type in cache for key: %s", key)
	}
	return nil, ErrNotFound
}

// Delete removes a key-value pair from the store.
func (s *GoCacheStorage) Delete(key string) error {
	s.client.Delete(key)
	return nil
}

// Close is a no-op for go-cache as it's in-memory and doesn't need closing.
func (s *GoCacheStorage) Close() error {
	return nil
}
