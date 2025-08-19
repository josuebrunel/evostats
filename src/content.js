function getTripCards() {
  // Try multiple selection strategies
  const selectors = [
    '[class*="MuiPaper-root"]', // Any element with MuiPaper-root in class
    '.MuiGrid-item .MuiPaper-root', // Grid item containing paper
    'div > div > div > div > .MuiPaper-root' // DOM path fallback
  ];

  for (const selector of selectors) {
    const cards = document.querySelectorAll(selector);
    if (cards.length > 0) {
      return Array.from(cards);
    }
  }

  return [];
}

function scrapeTripData() {
  const tripCards = getTripCards();
  const trips = [];

  tripCards.forEach((card) => {
    // More robust field extraction using text pattern matching
    const fields = Array.from(card.querySelectorAll('div.MuiGrid-container > div.MuiGrid-container > div.MuiGrid-item'));

    const trip = {
      started: fields[0]?.textContent.match(/Started(.+)/)?.[1]?.trim() || '',
      duration: fields[1]?.textContent.match(/Duration(.+)/)?.[1]?.trim() || '',
      charged: fields[2]?.textContent.match(/Charged(.+)/)?.[1]?.trim() || '',
      vehicle: fields[3]?.textContent.match(/Vehicle(.+)/)?.[1]?.trim() || '',
      distance: fields[4]?.textContent.match(/Distance(.+)/)?.[1]?.trim() || '',
      service: fields[5]?.textContent.match(/Service(.+)/)?.[1]?.trim() || '',
      city: fields[6]?.textContent.match(/City(.+)/)?.[1]?.trim() || ''
    };

    // Parse values
    trip.durationMinutes = parseInt(trip.duration) || 0;
    trip.chargedAmount = parseFloat(trip.charged.replace(/[^\d.]/g, '')) || 0;
    trip.distanceKm = parseFloat(trip.distance.replace(/[^\d.]/g, '')) || 0;

    // Date parsing with better error handling
    const dateMatch = trip.started.match(/([A-Za-z]+ \d{1,2}, \d{4} \d{1,2}:\d{2} [AP]M)/);
    if (dateMatch) {
      try {
        trip.date = new Date(dateMatch[0]);
        trip.dayOfWeek = trip.date.toLocaleDateString('en-US', { weekday: 'long' });
      } catch (e) {
        console.warn('Date parsing error:', e);
      }
    }

    trips.push(trip);
  });

  return trips;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeTrips') {
    console.log("start scraping trips");
    const trips = scrapeTripData();
    console.log("end scraping trips", trips);
    sendResponse({ trips });
  }
});