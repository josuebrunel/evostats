package app

import (
	"log/slog"

	"evostat/pkg/storage"

	"github.com/a-h/templ"
	"github.com/google/uuid"
	"github.com/labstack/echo"
)

func Process(s storage.Storer) echo.HandlerFunc {
	return func(c echo.Context) error {
		// var req = []map[string]any{}
		var req = []Trip{}
		if err := c.Bind(&req); err != nil {
			slog.Error("failed to bind request", "error", err)
			return err
		}
		slog.Debug("request received", "request", req)
		var (
			id     = uuid.New().String()
			report = ReportData{
				ID: id,
			}
		)
		for _, trip := range req {
			if trip.Charged == 0 {
				continue
			}
			report.AllTrips = append(report.AllTrips, trip)
			report.TotalCharged += trip.Charged
			report.TotalDistance += trip.Distance
			report.TotalDuration += trip.Duration
			report.TotalTrips++
		}
		if err := s.Save(id, storage.Must(storage.ToByte(report))); err != nil {
			slog.Error("failed to save request", "error", err)
			return err
		}
		slog.Info("request processed", "id", id)
		return c.JSON(200, map[string]string{"id": id})
	}
}

func Report(s storage.Storer) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		slog.Debug("request received", "id", id)
		data, err := s.Load(id)
		if err != nil {
			slog.Error("failed to load request", "error", err)
			return err
		}
		var report = ReportData{}
		if err := storage.FromByte(data, &report); err != nil {
			slog.Error("failed to parse request", "error", err)
			return err
		}
		return render(c, 200, Layout(report))
	}
}

func render(c echo.Context, status int, tpl templ.Component) error {
	c.Response().Header().Set(echo.HeaderContentType, echo.MIMETextHTML)
	c.Response().WriteHeader(status)
	if err := tpl.Render(c.Request().Context(), c.Response().Writer); err != nil {
		slog.Error("failed to render template", "error", err)
		return err
	}
	return nil
}
