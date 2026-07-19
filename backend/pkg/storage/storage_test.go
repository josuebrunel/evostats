package storage

import (
	"errors"
	"testing"
)

func TestToByte(t *testing.T) {
	data := map[string]string{"key": "value"}
	b, err := ToByte(data)
	if err != nil {
		t.Fatalf("ToByte() error = %v", err)
	}
	if len(b) == 0 {
		t.Error("ToByte() returned empty bytes")
	}
}

func TestFromByte(t *testing.T) {
	b := []byte(`{"key":"value"}`)
	var result map[string]string
	if err := FromByte(b, &result); err != nil {
		t.Fatalf("FromByte() error = %v", err)
	}
	if result["key"] != "value" {
		t.Errorf("FromByte() result[%s] = %s, want %s", "key", result["key"], "value")
	}
}

func TestMust(t *testing.T) {
	result := Must([]byte("data"), nil)
	if string(result) != "data" {
		t.Errorf("Must() = %s, want %s", result, "data")
	}
}

func TestMustPanic(t *testing.T) {
	defer func() {
		if r := recover(); r == nil {
			t.Error("Must() did not panic on error")
		}
	}()
	Must([]byte{}, errors.New("test error"))
}
