async function autoScrollUntilLoaded() {
  return new Promise((resolve) => {
    let lastHeight = 0;
    let sameHeightCount = 0;
    const maxSameHeight = 3; // Number of consecutive same heights before stopping
    const maxScrollAttempts = 50; // Safety limit
    let scrollAttempts = 0;

    console.log('Starting auto-scroll...');

    const scrollInterval = setInterval(() => {
      // Check if we've reached maximum attempts
      if (scrollAttempts >= maxScrollAttempts) {
        clearInterval(scrollInterval);
        console.log('Reached maximum scroll attempts');
        resolve();
        return;
      }

      const scrollContainer = document.querySelector('.infinite-scroll-component');
      const currentHeight = scrollContainer ? scrollContainer.scrollHeight : document.documentElement.scrollHeight;

      // Scroll to bottom
      window.scrollTo(0, document.documentElement.scrollHeight);
      scrollAttempts++;

      console.log(`Scroll attempt ${scrollAttempts}, height: ${currentHeight}`);

      // Check if height has changed
      if (currentHeight === lastHeight) {
        sameHeightCount++;
        if (sameHeightCount >= maxSameHeight) {
          clearInterval(scrollInterval);
          console.log('No more content loading. Finished scrolling.');
          resolve();
        }
      } else {
        sameHeightCount = 0; // Reset counter if height changed
        lastHeight = currentHeight;
      }

      // Additional check: look for loading indicators
      const loadingIndicators = document.querySelectorAll('[class*="loading"], [class*="Loading"], .loader, .spinner');
      const isLoading = Array.from(loadingIndicators).some(el =>
        el.offsetParent !== null // Element is visible
      );

      if (!isLoading && sameHeightCount >= 1) {
        clearInterval(scrollInterval);
        console.log('No loading indicators found. Finished scrolling.');
        resolve();
      }

    }, 1000); // Scroll every 1 second
  });
}

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

const serviceUrl = 'http://localhost:8080';


async function scrapeAndRedirect() {

  console.log('Starting auto-scroll...')
  await autoScrollUntilLoaded();


  try {
    const tripData = scrapeTripData();
    console.log(tripData);
    let processUrl = `${serviceUrl}/process`;

    const response = await fetch(processUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tripData),
    });

    const { id } = await response.json();
    let redirectUrl = `${serviceUrl}/report/${id}`;
    console.log(redirectUrl);

    if (redirectUrl) {
      window.open(redirectUrl, '_blank');
      return { success: true };
    }
    throw new Error("No redirect URL received");
  } catch (error) {
    console.error("Scrape/redirect failed:", error);
    return { success: false, error: error.message };
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeAndRedirect') {
    console.log('Received scrapeAndRedirect message');
    scrapeAndRedirect().then(sendResponse);
    return true; // Keep message channel open for async response
  }
});