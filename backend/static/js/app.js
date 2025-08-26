function initializeCharts(days, tripsByDay, chargesByDay, costPerTrip, distances, costs, colors) {
    // Convert chargesByDay object into sorted arrays
    const chargeDates = Object.keys(chargesByDay).sort();
    const chargeValues = chargeDates.map(d => chargesByDay[d]);

    // Convert tripsByDay object into sorted arrays
    const tripDates = Object.keys(tripsByDay).sort();
    const tripValues = tripDates.map(d => tripsByDay[d]);

    // Trips by Day Chart
    new Chart(document.getElementById('tripsByDayChart'), {
        type: 'bar',
        data: {
            labels: tripDates,
            datasets: [{
                data: tripValues,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Trips by Day'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.raw + ' trips';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return value + ' trips';
                        }
                    }
                }
            }
        }
    });

    // Charges by Day Chart
    new Chart(document.getElementById('chargesByDayChart'), {
        type: 'line',
        data: {
            labels: chargeDates,
            datasets: [{
                data: chargeValues,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: 'rgba(255,99,132,1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Charges by Day'
                },
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return '$' + context.raw.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { autoSkip: true, maxRotation: 45, minRotation: 45 }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });

    // Cost per Trip Chart
    new Chart(document.getElementById('costPerTripChart'), {
        type: 'bar',
        data: {
            labels: Array.from({ length: costPerTrip.length }, (_, i) => `Trip ${i + 1}`),
            datasets: [{
                data: costPerTrip,
                backgroundColor: 'rgba(75, 192, 192, 0.7)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Cost per Trip'
                }
            }
        }
    });

    // Distance vs Cost
    console.log(distances, costs);
    new Chart(document.getElementById("distanceVsCostChart"), {
        type: "scatter",
        data: {
            datasets: [{
                label: "Trips",
                data: distances.map((d, i) => ({ x: d, y: costs[i] })),
                backgroundColor: "#f59e0b"
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: "Distance (km)" } },
                y: { title: { display: true, text: "Cost ($)" } }
            }
        }
    });
}
