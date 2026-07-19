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

function parseDurationToMinutes(durationStr) {
  if (!durationStr) {
    return 0;
  }

  let totalMinutes = 0;
  const durationText = durationStr.toLowerCase().trim();

  // Regex to find all number-unit pairs like "2d", "1h", "30min"
  const matches = durationText.match(/(\d+\.?\d*)\s*(days?|h|min|m)/g) || [];

  if (matches.length === 0) {
    // If no units, assume the whole string is a number of minutes
    const value = parseFloat(durationText);
    return isNaN(value) ? 0 : Math.round(value);
  }

  matches.forEach(match => {
    const value = parseFloat(match);
    if (match.includes('d')) { // day or days
      totalMinutes += value * 24 * 60;
    } else if (match.includes('h')) {
      totalMinutes += value * 60;
    } else { // min or m
      totalMinutes += value;
    }
  });

  return Math.round(totalMinutes);
}

function scrapeTripData() {
  const tripCards = getTripCards();
  const trips = [];

  // Define field patterns for robust, order-independent matching.
  const fieldPatterns = {
    started: /Started(.+)/,
    duration: /Duration(.+)/,
    charged: /Charged(.+)/,
    vehicle: /Vehicle(.+)/,
    distance: /Distance(.+)/,
    service: /Service(.+)/,
    city: /City(.+)/,
  };

  tripCards.forEach((card) => {
    const trip = {};

    // Use a more generic selector to find all potential data fields within a card.
    // This is more resilient to changes in the DOM structure than a highly specific path.
    const potentialFields = card.querySelectorAll('.MuiGrid-item');

    potentialFields.forEach(field => {
      const text = field.textContent || '';
      // Check the text against each pattern.
      for (const key in fieldPatterns) {
        const match = text.match(fieldPatterns[key]);
        if (match && match[1]) {
          trip[key] = match[1].trim();
          // Once a field is matched, we can stop checking other patterns for this element.
          break;
        }
      }
    });

    // Only process the trip if we have the essential data.
    if (!trip.started) {
      return; // Continue to the next card if no start date is found.
    }

    // Ensure all properties exist before parsing.
    const fullTrip = {
      started: trip.started || '',
      duration: trip.duration || '',
      charged: trip.charged || '',
      vehicle: trip.vehicle || '',
      distance: trip.distance || '',
      service: trip.service || '',
      city: trip.city || '',
    };

    // Parse values
    fullTrip.durationMinutes = parseDurationToMinutes(fullTrip.duration);
    fullTrip.chargedAmount = parseFloat(fullTrip.charged.replace(/[^\d.]/g, '')) || 0;
    fullTrip.distanceKm = parseFloat(fullTrip.distance.replace(/[^\d.]/g, '')) || 0;

    // Date parsing with better error handling
    const dateMatch = fullTrip.started.match(/([A-Za-z]+ \d{1,2}, \d{4} \d{1,2}:\d{2} [AP]M)/);
    if (dateMatch) {
      try {
        const dateStr = dateMatch[0];
        const tempDate = new Date(dateStr);
        const localOffset = tempDate.getTimezoneOffset();
        const vancouverDateInUTC = new Date(tempDate.toLocaleString('en-US', { timeZone: 'UTC' }));
        const vancouverDateInVancouver = new Date(tempDate.toLocaleString('en-US', { timeZone: 'America/Vancouver' }));
        const vancouverOffset = (vancouverDateInUTC.getTime() - vancouverDateInVancouver.getTime()) / 60000;
        const offsetDifference = localOffset - vancouverOffset;
        const correctTimestamp = tempDate.getTime() - (offsetDifference * 60 * 1000);
        fullTrip.date = new Date(correctTimestamp);
        fullTrip.dayOfWeek = fullTrip.date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/Vancouver' });

        trips.push(fullTrip);
      } catch (e) {
        console.warn('Date parsing error:', e, 'for date string:', fullTrip.started);
      }
    } else {
      console.warn('Could not parse date from "started" field:', fullTrip.started);
    }
  });

  return trips;
}

const serviceUrl = 'http://localhost:8080';
// const serviceUrl = 'https://evostats.cc';


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