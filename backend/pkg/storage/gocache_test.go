package storage

import (
	"testing"
	"time"
)

func TestGoCacheSaveLoad(t *testing.T) {
	s, err := NewGoCacheStorage(300*time.Second, 300*time.Second)
	if err != nil {
		t.Fatalf("NewGoCacheStorage() error = %v", err)
	}
	defer s.Close()

	key := "test-key"
	value := []byte("test-value")

	if err := s.Save(key, value); err != nil {
		t.Errorf("Save() error = %v", err)
	}

	loaded, err := s.Load(key)
	if err != nil {
		t.Errorf("Load() error = %v", err)
	}
	if string(loaded) != string(value) {
		t.Errorf("Load() = %s, want %s", loaded, value)
	}
}

func TestGoCacheLoadNotFound(t *testing.T) {
	s, err := NewGoCacheStorage(300*time.Second, 300*time.Second)
	if err != nil {
		t.Fatalf("NewGoCacheStorage() error = %v", err)
	}
	defer s.Close()

	_, err = s.Load("nonexistent")
	if err != ErrNotFound {
		t.Errorf("Load() error = %v, want %v", err, ErrNotFound)
	}
}

func TestGoCacheDelete(t *testing.T) {
	s, err := NewGoCacheStorage(300*time.Second, 300*time.Second)
	if err != nil {
		t.Fatalf("NewGoCacheStorage() error = %v", err)
	}
	defer s.Close()

	s.Save("key", []byte("value"))
	if err := s.Delete("key"); err != nil {
		t.Errorf("Delete() error = %v", err)
	}

	_, err = s.Load("key")
	if err != ErrNotFound {
		t.Errorf("Load() after delete error = %v, want %v", err, ErrNotFound)
	}
}
