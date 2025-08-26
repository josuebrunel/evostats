package storage

import (
	"encoding/json"
)

type Storer interface {
	Save(string, []byte) error
	Load(string) ([]byte, error)
	Delete(string) error
}

func ToByte[T any](data T) ([]byte, error) {
	return json.Marshal(data)
}

func FromByte[T any](data []byte, result T) error {
	return json.Unmarshal(data, result)
}

func Must[T any](data T, err error) T {
	if err != nil {
		panic(err)
	}
	return data
}
