package app

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"evostat/pkg/storage"

	"github.com/a-h/templ"
	"github.com/google/uuid"
	"github.com/josuebrunel/gopkg/xlog"
	"github.com/labstack/echo"
)

func Process(s storage.Storer) echo.HandlerFunc {
	return func(c echo.Context) error {
		var req = []Trip{}
		if err := c.Bind(&req); err != nil {
			xlog.Error("failed to bind request", "error", err)
			return err
		}
		xlog.Debug("request received", "request", req)
		var (
			id     = uuid.New().String()
			report = NewReportData(id)
		)

		for _, trip := range req {
			if trip.Charged == 0 || trip.Duration == 0 {
				continue
			}
			tripDate := trip.Date.Format(time.DateOnly)
			report.AllTrips = append(report.AllTrips, trip)
			report.TotalCharged += trip.Charged
			report.TotalDistance += trip.Distance
			report.TotalDuration += trip.Duration
			report.ChargesByDay[tripDate] += trip.Charged
			report.TripsByDay[tripDate]++
			report.CostPerTrip = append(report.CostPerTrip, trip.Charged)
			report.DistancePerTrip = append(report.DistancePerTrip, trip.Distance)
			report.Days = append(report.Days, tripDate)
			report.TotalTrips++

		}
		report.DateEnd = report.AllTrips[0].Date
		report.DateStart = report.AllTrips[len(report.AllTrips)-1].Date

		// Calculate averages after the loop to ensure correctness
		if report.TotalTrips > 0 {
			report.AvgCostPerTrip = report.TotalCharged / float64(report.TotalTrips)
			report.AvgDistance = report.TotalDistance / float64(report.TotalTrips)
		}
		if report.TotalDistance > 0 {
			report.AvgCostPerDistance = report.TotalCharged / report.TotalDistance
		}

		xlog.Debug("request processed", "report", report)
		if err := s.Save(id, storage.Must(storage.ToByte(report))); err != nil {
			xlog.Error("failed to save request", "error", err)
			return err
		}
		xlog.Info("request processed", "id", id)
		return c.JSON(200, map[string]string{"id": id})
	}
}

func ExportCSV(s storage.Storer) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		data, err := s.Load(id)
		if err != nil {
			xlog.Error("failed to load request for CSV export", "id", id, "error", err)
			return render(c, http.StatusNotFound, ErrorPage(err.Error()))
		}

		var report ReportData
		if err := storage.FromByte(data, &report); err != nil {
			xlog.Error("failed to parse request for CSV export", "id", id, "error", err)
			return render(c, http.StatusInternalServerError, ErrorPage(err.Error()))
		}

		// Set headers for CSV download
		c.Response().Header().Set(echo.HeaderContentType, "text/csv")
		c.Response().Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"trip_report_%s.csv\"", id))

		writer := csv.NewWriter(c.Response().Writer)
		defer writer.Flush()

		// Write CSV header
		header := []string{"Date", "Vehicle", "Duration (min)", "Cost (CAD)", "Distance (km)"}
		if err := writer.Write(header); err != nil {
			return err
		}

		loc, _ := time.LoadLocation("America/Vancouver")

		// Write trip data
		for _, trip := range report.AllTrips {
			record := []string{
				trip.Date.In(loc).Format(time.DateTime),
				trip.Vehicle,
				strconv.Itoa(trip.Duration),
				fmt.Sprintf("%.2f", trip.Charged),
				fmt.Sprintf("%.2f", trip.Distance),
			}
			if err := writer.Write(record); err != nil {
				return err
			}
		}
		return nil
	}
}

func Report(s storage.Storer) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		xlog.Debug("request received", "id", id)
		data, err := s.Load(id)
		if err != nil {
			xlog.Error("failed to load request", "error", err)
			return render(c, http.StatusNotFound, ErrorPage(err.Error()))
		}
		var report = ReportData{}
		if err := storage.FromByte(data, &report); err != nil {
			xlog.Error("failed to parse request", "error", err)
			return render(c, http.StatusInternalServerError, ErrorPage(err.Error()))
		}
		return render(c, 200, Layout(report))
	}
}

func render(c echo.Context, status int, tpl templ.Component) error {
	c.Response().Header().Set(echo.HeaderContentType, echo.MIMETextHTML)
	c.Response().WriteHeader(status)
	if err := tpl.Render(c.Request().Context(), c.Response().Writer); err != nil {
		xlog.Error("failed to render template", "error", err)
		return err
	}
	return nil
}

func Ternary[T any](cond bool, a, b T) T {
	if cond {
		return a
	}
	return b
}
