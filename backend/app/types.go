package app

import "time"

type Trip struct {
	Charged   float64   `json:"chargedAmount"`
	City      string    `json:"city"`
	DayOfWeek string    `json:"dayOfWeek"`
	Distance  float64   `json:"distanceKm"`
	Duration  int       `json:"durationMinutes"`
	Date      time.Time `json:"date"`
	Service   string    `json:"service"`
	Started   string    `json:"started"`
	Vehicle   string    `json:"vehicle"`
}

type ReportData struct {
	ID                 string             `json:"id"`
	AllTrips           []Trip             `json:"allTrips"`
	AvgCostPerTrip     float64            `json:"avgCostPerTrip"`
	AvgDistance        float64            `json:"avgDistance"`
	AvgCostPerDistance float64            `json:"avgCostPerDistance"`
	ChargesByDay       map[string]float64 `json:"chargesByDay"`
	CostPerTrip        []float64          `json:"costPerTrip"`
	DateEnd            time.Time          `json:"dateEnd"`
	DateStart          time.Time          `json:"dateStart"`
	Days               []string           `json:"days"`
	DistancePerTrip    []float64          `json:"distancePerTrip"`
	TotalCharged       float64            `json:"totalCharged"`  // in CAD
	TotalDistance      float64            `json:"totalDistance"` // in km
	TotalDuration      int                `json:"totalDuration"` // in minutes
	TotalTrips         int                `json:"totalTrips"`
	TripsByDay         map[string]int     `json:"tripsByDay"`
}

func NewReportData(id string) ReportData {
	return ReportData{
		ID:           id,
		ChargesByDay: make(map[string]float64),
		TripsByDay:   make(map[string]int),
	}
}
