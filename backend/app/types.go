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
	ID            string             `json:"id"`
	ChargesByDay  map[string]float64 `json:"chargesByDay"`
	TotalCharged  float64            `json:"totalCharged"`  // in CAD
	TotalDistance float64            `json:"totalDistance"` // in km
	TotalDuration int                `json:"totalDuration"` // in minutes
	TotalTrips    int                `json:"totalTrips"`
	TripsByDay    map[string]int     `json:"tripsByDay"`
	AllTrips      []Trip             `json:"allTrips"`
}
