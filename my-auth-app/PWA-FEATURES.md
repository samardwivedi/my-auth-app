# VolunteerHub Service Marketplace - Progressive Web App Features

The VolunteerHub Service Marketplace now includes Progressive Web App (PWA) functionality, allowing users to install the app on their devices and access it offline.

## PWA Features Implemented

- **Installable**: Users can add the app to their home screen on mobile devices or desktop
- **Offline Support**: Basic app functionality works without an internet connection
- **Fast Loading**: Static assets are cached for improved performance
- **App-like Experience**: Full-screen mode without browser UI when launched from home screen
- **Push Notification Ready**: Infrastructure for future push notification features

## How to Use PWA Features

### Installing the App on Mobile

1. Open the VolunteerHub app in your mobile browser (Chrome, Safari, etc.)
2. For most browsers, you'll see a banner or "Add to Home Screen" prompt
3. If not prompted automatically:
   - In Chrome: Tap the menu button (⋮) and select "Add to Home Screen"
   - In Safari: Tap the Share button and select "Add to Home Screen"

### Installing the App on Desktop

1. Open the VolunteerHub app in Chrome, Edge, or another supported browser
2. Look for the install icon (⊕) in the address bar, or:
3. Click the menu button and select "Install VolunteerHub"

### Offline Usage

Once installed:
1. The app will work even when you have no internet connection or poor connectivity
2. Cached pages and assets will load from the device storage
3. When offline, you can still access previously loaded:
   - Service provider profiles
   - Home page and service categories
   - Safety guidelines and resources

### Updating the App

The app will automatically check for updates when online, ensuring you always have the latest version.

## Technical Implementation

The PWA implementation includes:
- A Web App Manifest (manifest.json) defining app properties
- A Service Worker for caching and offline support
- Proper meta tags for iOS/Android integration
- Cache management for app updates

## Troubleshooting

If you encounter issues with the PWA features:
1. Ensure your browser is updated to the latest version
2. Try clearing your browser cache
3. For installation issues, make sure you're using a supported browser (Chrome, Safari, Firefox, Edge)

---

For more information on using the VolunteerHub Service Marketplace, refer to the main README.md file.
