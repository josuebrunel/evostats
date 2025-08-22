document.getElementById('scrape-and-redirect').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');

  try {
    statusEl.textContent = "Processing your trips...";
    statusEl.className = "status-message loading";

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    console.log("Sending message to tab", tab.id);
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'scrapeAndRedirect'
    });
    console.log("Received response:", response);
    if (response?.success) {
      statusEl.textContent = "Redirecting to your report...";
    } else {
      throw new Error("Failed to process trips");
    }
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
    statusEl.className = "status-message error";
    console.log(error);
  }
});