package app

import (
	"testing"
)

func TestNewReportData(t *testing.T) {
	id := "test-id"
	rd := NewReportData(id)

	if rd.ID != id {
		t.Errorf("NewReportData().ID = %s, want %s", rd.ID, id)
	}
	if rd.ChargesByDay == nil {
		t.Error("NewReportData().ChargesByDay is nil")
	}
	if rd.TripsByDay == nil {
		t.Error("NewReportData().TripsByDay is nil")
	}
	if rd.TotalTrips != 0 {
		t.Errorf("NewReportData().TotalTrips = %d, want 0", rd.TotalTrips)
	}
}
