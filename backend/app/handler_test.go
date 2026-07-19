package app

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"evostat/pkg/storage"

	"github.com/labstack/echo"
)

func TestProcessHandler(t *testing.T) {
	store, err := storage.NewGoCacheStorage(300, 300)
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	e := echo.New()
	body := `[{"chargedAmount":10.5,"distanceKm":5.0,"durationMinutes":30,"date":"2024-01-15T10:00:00Z","vehicle":"ABC123","city":"Vancouver","dayOfWeek":"Monday","service":"evo","started":"10:00"}]`
	req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	h := Process(store)
	if err := h(c); err != nil {
		t.Fatalf("Process() error = %v", err)
	}

	if rec.Code != http.StatusOK {
		t.Errorf("Process() status = %d, want %d", rec.Code, http.StatusOK)
	}

	var resp map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("json.Unmarshal error = %v", err)
	}
	if resp["id"] == "" {
		t.Error("Process() returned empty id")
	}
}

func TestProcessHandler_BadJSON(t *testing.T) {
	store, err := storage.NewGoCacheStorage(300, 300)
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(`invalid json`))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	h := Process(store)
	if err := h(c); err == nil {
		t.Error("Process() expected error for invalid JSON")
	}
}
