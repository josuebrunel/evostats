# EvoStats Chrome Extension

A privacy-focused Chrome extension that analyzes your evo trip data and generates comprehensive visual reports.

## How It Works

### Data Flow
1. **User Initiation**: Click the extension icon while on a trip history page
2. **Auto-Scrolling**: Extension automatically scrolls to load all available trip data
3. **Data Extraction**: Trip information is scraped from the page DOM
4. **Secure Transmission**: Data is sent to our analysis service via HTTPS
5. **Temporary Storage**: Data stored in Redis with automatic expiration (TTL)
6. **Report Generation**: Interactive visual report is generated with charts
7. **User Redirect**: User is redirected to their personalized report page

### Technical Architecture

```
Browser → Chrome Extension → HTTPS → Go Backend → Redis (TTL) → Report Generation → User Redirect
```


## Privacy & Security

### Data Handling
- **No Data Persistence**: We never store your trip data permanently
- **Redis TTL**: All data automatically expires from memory after 24 hours
- **Temporary Processing**: Data exists only during your active session
- **No Tracking**: We don't track users across sessions or websites

### Security Features
- **HTTPS Encryption**: All communications are encrypted end-to-end
- **UUID-Based Access**: Reports are accessible only via unique, unguessable URLs
- **No Personal Data**: We only process trip metadata, not personal information
- **Open Source**: Complete transparency - anyone can audit our code

### What We Collect
- Trip dates and times
- Duration and distance
- Vehicle information (make/model, license plate)
- Cost information
- Service location (city/area)

### What We Never Collect
- Personal identification information
- Login credentials
- Payment details
- Contact information
- Location data beyond trip context

## Installation

1. Download the extension files from our GitHub repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your toolbar

## Usage

1. Navigate to your car sharing service's trip history page
2. Click the Trip Analyzer extension icon
3. Click "Analyze & View Report"
4. Wait for automatic scrolling and data collection
5. You'll be redirected to your personalized report

## Features

### Automatic Data Collection
- Handles infinite scroll pages
- Detects and clicks "Load More" buttons
- Smart scrolling with multiple fallback strategies
- Progress feedback during loading

### Comprehensive Reports
- Total trip statistics (count, duration, cost, distance)
- Interactive charts and visualizations
- Breakdowns by day of week and vehicle
- Cost analysis and trends
- Raw data export capability

### Privacy Protections
- Local data processing in your browser
- Secure API communications
- Automatic data expiration
- No persistent storage

## Safety Guarantees

### Open Source Verification
Since this extension is fully open source:
- Security researchers can audit the code
- Users can verify no malicious behavior
- Community can suggest improvements
- Transparency in all operations

### Data Lifecycle
1. **Collection**: Only from pages you explicitly visit
2. **Transmission**: Encrypted via HTTPS to our secure API
3. **Processing**: Temporary in-memory storage only
4. **Expiration**: Automatic deletion after 10 minutes
5. **Access**: Only via unique, time-limited URLs

### Browser Permissions
The extension requires minimal permissions:
- `activeTab`: To access only the current tab's content
- `storage`: For local extension settings (not your data)
- `webRequest`: For secure API communication

## Frequently Asked Questions

### Is my data safe?
Yes. We designed this extension with privacy as the top priority:
- Data never leaves your browser without your explicit action
- All external communications are encrypted
- No personal information is collected
- All data automatically expires

### Can I see what data is being sent?
Yes! The extension shows exactly what data will be sent before any transmission occurs. You can review and cancel if desired.

### How long is my data stored?
Maximum 24 hours in our temporary Redis storage, after which it's automatically deleted.

### Can I delete my data sooner?
Yes. Simply close the report tab and the data will expire naturally within 24 hours, or you can manually delete the Redis key if you have access.

### Is this extension free?
Yes, completely free and open source under the MIT License.
