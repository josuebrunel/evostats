document.getElementById('scrape-and-redirect').addEventListener('click', async () => {
  const scrapeButton = document.getElementById('scrape-and-redirect');
  const errorMessageEl = document.getElementById('error-message');
  const originalButtonText = scrapeButton.textContent;

  try {
    // Update UI to show loading state
    scrapeButton.setAttribute('aria-busy', 'true');
    scrapeButton.textContent = 'Processing...';
    scrapeButton.disabled = true;
    errorMessageEl.style.display = 'none';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    console.log("Sending message to tab", tab.id);
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'scrapeAndRedirect',
    });
    console.log("Received response:", response);
    if (response?.success) {
      scrapeButton.textContent = 'Redirecting...';
    } else {
      throw new Error(response?.error || 'Failed to process trips. Check the console for details.');
    }
  } catch (error) {
    errorMessageEl.textContent = `Error: ${error.message}`;
    errorMessageEl.style.display = 'block';
    scrapeButton.setAttribute('aria-busy', 'false');
    scrapeButton.textContent = originalButtonText;
    scrapeButton.disabled = false;
    console.error(error);
  }
});