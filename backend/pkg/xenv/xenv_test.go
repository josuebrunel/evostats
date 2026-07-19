package xenv

import (
	"os"
	"testing"
)

func TestGetOrDefaultDefault(t *testing.T) {
	os.Unsetenv(AppAddrN)
	got := GetOrDefault(AppAddrN)
	if got != AppAddrV {
		t.Errorf("GetOrDefault(%s) = %s, want %s", AppAddrN, got, AppAddrV)
	}
}

func TestGetOrDefaultEnvSet(t *testing.T) {
	os.Setenv(AppAddrN, ":9999")
	defer os.Unsetenv(AppAddrN)

	got := GetOrDefault(AppAddrN)
	if got != ":9999" {
		t.Errorf("GetOrDefault(%s) = %s, want %s", AppAddrN, got, ":9999")
	}
}

func TestGetOrDefaultUnsetKey(t *testing.T) {
	os.Unsetenv("NONEXISTENT_VAR")
	got := GetOrDefault("NONEXISTENT_VAR")
	if got != "" {
		t.Errorf("GetOrDefault(%s) = %s, want empty string", "NONEXISTENT_VAR", got)
	}
}
