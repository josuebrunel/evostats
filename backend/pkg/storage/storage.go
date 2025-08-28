package storage

import (
	"encoding/json"
	"errors"

	"github.com/josuebrunel/gopkg/xlog"
)

var ErrNotFound = errors.New("not found")

type Storer interface {
	Save(string, []byte) error
	Load(string) ([]byte, error)
	Delete(string) error
	Close() error
}

func ToByte[T any](data T) ([]byte, error) {
	return json.Marshal(data)
}

func FromByte[T any](data []byte, result T) error {
	return json.Unmarshal(data, result)
}

func Must[T any](data T, err error) T {
	if err != nil {
		xlog.Error("failed to marshal data", "error", err)
		panic(err)
	}
	return data
}
