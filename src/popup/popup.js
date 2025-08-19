import { renderCharts } from './chart.js';

document.addEventListener('DOMContentLoaded', function () {
  const analyzeBtn = document.getElementById('analyze-btn');
  const exportBtn = document.getElementById('export-btn');

  analyzeBtn.addEventListener('click', analyzeTrips);
  exportBtn.addEventListener('click', exportData);

  // Initialize with empty data
  updateSummary({ trips: [] });
  // renderCharts({ trips: [] });
});

function analyzeTrips() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    console.log("start analyzing trips")
    chrome.tabs.sendMessage(tabs[0].id, { action: 'scrapeTrips' }, function (response) {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        alert('Error: Could not scrape trip data. Make sure you are on the correct page.');
        return;
      }
      console.log("end analyzing trips", response);
      if (response && response.trips) {
        updateSummary(response);
        renderCharts(response);

        // Store data for export
        chrome.storage.local.set({ tripData: response.trips });
      }
    });
  });
}

function updateSummary(data) {
  const totalTrips = data.trips.length;
  const totalCost = data.trips.reduce((sum, trip) => sum + trip.chargedAmount, 0);
  const totalDistance = data.trips.reduce((sum, trip) => sum + trip.distanceKm, 0);

  document.getElementById('total-trips').textContent = totalTrips;
  document.getElementById('total-cost').textContent = `$${totalCost.toFixed(2)} CAD`;
  document.getElementById('total-distance').textContent = `${totalDistance.toFixed(2)} km`;
}

function exportData() {
  chrome.storage.local.get(['tripData'], function (result) {
    if (!result.tripData || result.tripData.length === 0) {
      alert('No data to export. Please analyze trips first.');
      return;
    }

    const csv = convertToCSV(result.tripData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
      url: url,
      filename: 'trip_data_export.csv'
    });
  });
}

function convertToCSV(trips) {
  const headers = ['Date', 'Day', 'Duration (min)', 'Cost (CAD)', 'Distance (km)', 'Vehicle', 'Service', 'City'];
  const rows = trips.map(trip => [
    trip.started.split(' ').slice(0, 3).join(' '),
    trip.dayOfWeek,
    trip.durationMinutes,
    trip.chargedAmount.toFixed(2),
    trip.distanceKm.toFixed(2),
    trip.vehicle,
    trip.service,
    trip.city
  ]);

  return [headers, ...rows].map(row =>
    row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}
