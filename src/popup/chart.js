import Chart from 'https://cdn.jsdelivr.net/npm/chart.js/+esm';

let costChart, durationChart, dayOfWeekChart;

export function renderCharts(data) {
  renderCostChart(data.trips);
  renderDurationChart(data.trips);
  renderDayOfWeekChart(data.trips);
}

function groupTripsByDate(trips, valueProperty) {
  const dataByDate = {};
  trips.forEach(trip => {
    // const dateStr = trip.date ? trip.date.toLocaleDateString() : 'Unknown';
    console.log(typeof (trip.date));
    const dateStr = trip.date ? trip.date : 'Unknown';
    if (!dataByDate[dateStr]) {
      dataByDate[dateStr] = 0;
    }
    dataByDate[dateStr] += trip[valueProperty];
  });
  return dataByDate;
}

function renderCostChart(trips) {
  const ctx = document.getElementById('costChart').getContext('2d');
  const costByDate = groupTripsByDate(trips, 'chargedAmount');
  const labels = Object.keys(costByDate);
  const values = Object.values(costByDate);

  if (costChart) {
    costChart.destroy();
  }

  costChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cost (CAD)',
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Cost (CAD)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      }
    }
  });
}

function renderDurationChart(trips) {
  const ctx = document.getElementById('durationChart').getContext('2d');
  const durationByDate = groupTripsByDate(trips, 'durationMinutes');
  const labels = Object.keys(durationByDate);
  const values = Object.values(durationByDate);

  if (durationChart) {
    durationChart.destroy();
  }

  durationChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Duration (min)',
        data: values,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Duration (min)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      }
    }
  });
}

function renderDayOfWeekChart(trips) {
  const ctx = document.getElementById('dayOfWeekChart').getContext('2d');

  // Count trips by day of week
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const counts = Array(7).fill(0);

  trips.forEach(trip => {
    if (trip.dayOfWeek) {
      const index = days.indexOf(trip.dayOfWeek);
      if (index !== -1) {
        counts[index]++;
      }
    }
  });

  if (dayOfWeekChart) {
    dayOfWeekChart.destroy();
  }

  dayOfWeekChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: days,
      datasets: [{
        data: counts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Trips by Day of Week'
        }
      }
    }
  });
}
