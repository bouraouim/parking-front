# Parking Machine Assistant - React Native Android App

A React Native Android application for parking workers to manage and maintain parking payment machines. Workers receive mission notifications, track tasks, and submit completion reports.

## Features

✅ **Server Configuration** - Enter and validate backend server URL on first launch  
✅ **User Authentication** - Secure login with JWT token persistence  
✅ **FCM Push Notifications** - Receive mission notifications in foreground and background  
✅ **Mission Management** - View, track, and complete parking machine maintenance missions  
✅ **Local Storage** - Missions cached locally for offline access  
✅ **Task Checklist** - Interactive task validation for collection, refill, and maintenance  
✅ **QR Code Display** - Show mission QR codes with automatic brightness adjustment  
✅ **Status Tracking** - Track missions through unopened, in progress, and completed states  

## Tech Stack

- **React Native 0.73** - Android app framework
- **React Navigation** - Screen navigation
- **Firebase Cloud Messaging** - Push notifications
- **Notifee** - Local notification display
- **AsyncStorage** - Local data persistence
- **Axios** - HTTP client for API requests
- **react-native-qrcode-svg** - QR code generation
- **react-native-device-brightness** - Screen brightness control

## Prerequisites

- Node.js >= 18
- Java JDK 17 or higher
- Android Studio with Android SDK (API 34)
- React Native CLI: `npm install -g react-native-cli`

## Installation

1. **Install dependencies**
   ```bash
   cd app
   npm install
   ```

2. **Configure Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Add an Android app to your Firebase project
   - Package name: `com.parkingmachineassistant`
   - Download `google-services.json`
   - Place it in `android/app/google-services.json`

3. **Start Metro bundler**
   ```bash
   npm start
   ```

4. **Run on Android device/emulator**
   ```bash
   npm run android
   ```

## Project Structure

```
app/
├── android/                    # Android native code
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/parkingmachineassistant/
│   │   │   └── res/
│   │   ├── build.gradle
│   │   └── google-services.json  # Add your Firebase config here
│   ├── build.gradle
│   └── gradle.properties
├── src/
│   ├── context/
│   │   └── AuthContext.js      # Authentication state management
│   ├── screens/
│   │   ├── ServerUrlScreen.js  # Server configuration
│   │   ├── LoginScreen.js      # User login
│   │   ├── MissionListScreen.js # Mission list with pull-to-refresh
│   │   └── MissionDetailsScreen.js # Mission details and task completion
│   ├── services/
│   │   ├── api.js              # API client
│   │   ├── storage.js          # Local storage utilities
│   │   └── notification.js     # FCM notification handler
│   └── App.js                  # Main app component with navigation
├── index.js                    # App entry point
├── package.json
└── README.md
```

## App Flow

### 1. First Launch - Server Configuration
- User enters backend server URL (e.g., `http://192.168.1.100:3000`)
- App validates URL by calling `/health` endpoint
- URL is stored in AsyncStorage

### 2. Login
- User enters username and password
- App sends credentials to `/auth/login`
- JWT token is stored in AsyncStorage
- FCM token is automatically registered with backend

### 3. Mission List
- Fetches missions from `/api/missions`
- Displays missions sorted by status (unopened first) and date
- Pull-to-refresh to sync with server
- Shows notification permission banner if disabled
- Tap mission to view details

### 4. Mission Details
- Displays mission information (machine, cashier, date)
- Shows collection, refill, and maintenance tasks
- Interactive checkboxes for task validation
- Opens mission on first view (status: unopened → in_progress)
- QR code display with automatic brightness boost
- Submit button to complete mission

### 5. Notifications
- FCM notifications received in background/foreground
- Tapping notification opens mission details
- Missions automatically saved to local storage
- Badge shows "New" for unopened missions

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Validate server URL |
| `/auth/login` | POST | User authentication |
| `/api/users/:id/fcm-token` | POST | Register FCM token |
| `/api/missions` | GET | Fetch all missions |
| `/api/missions/:id` | GET | Fetch mission details |
| `/api/missions/:id/open` | POST | Mark mission as in progress |
| `/api/missions/:id/update` | POST | Update/complete mission |

## Notification Payload

FCM notifications from the backend should include:

```json
{
  "data": {
    "id": "mission-001",
    "payload": "{...mission JSON...}"
  }
}
```

The app automatically:
- Displays a local notification with Notifee
- Saves the mission to local storage
- Opens the mission when notification is tapped

## Local Storage

Missions are stored locally using AsyncStorage:

```javascript
{
  "missionId": "mission-001",
  "payload": { /* full mission data */ },
  "status": "unopened" | "in_progress" | "completed",
  "createdAt": "2025-11-26T10:00:00.000Z",
  "openedAt": "2025-11-26T10:05:00.000Z",
  "completedAt": "2025-11-26T10:30:00.000Z"
}
```

## Configuration

### Change Server URL
Delete app data or reinstall to reconfigure server URL.

### Notification Permissions
Android 13+ requires notification permissions. The app:
- Requests permission on first launch
- Shows banner if permission is disabled
- Provides link to enable in settings

### Firebase Setup
1. Download `google-services.json` from Firebase Console
2. Place in `android/app/google-services.json`
3. Rebuild the app

## Building for Production

1. **Generate release keystore**
   ```bash
   cd android/app
   keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias release-key -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Update gradle config** (android/app/build.gradle)
   ```gradle
   signingConfigs {
       release {
           storeFile file('release.keystore')
           storePassword 'YOUR_PASSWORD'
           keyAlias 'release-key'
           keyPassword 'YOUR_PASSWORD'
       }
   }
   ```

3. **Build APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

4. **APK location**: `android/app/build/outputs/apk/release/app-release.apk`

## Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

### Android Build Failures
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Notification Not Received
- Check Firebase console for FCM token registration
- Verify `google-services.json` is in `android/app/`
- Check notification permissions in device settings
- Ensure backend is sending correct payload format

### Cannot Connect to Server
- Verify server URL is correct (include http:// or https://)
- Check server is running and accessible
- Try server IP instead of localhost if using emulator
- For emulator, use `10.0.2.2` instead of `localhost`

## Development Tips

### Enable Hot Reload
Shake device or press `Ctrl+M` (emulator) to open developer menu

### Debug Menu
- `Ctrl+M` (emulator) or shake device
- Enable "Fast Refresh"
- Enable "Show Perf Monitor" for performance

### View Logs
```bash
npm run android
# In another terminal:
npx react-native log-android
```

## Backend Integration

This app requires the backend server from the `server/` folder. Make sure:

1. Backend is running on accessible network
2. MongoDB is connected
3. Firebase Admin SDK is configured
4. Test user is created (e.g., `worker1`/`password123`)

See `server/README.md` for backend setup instructions.

## License

ISC

## Support

For issues or questions, please refer to the backend API documentation in `server/README.md` and `server/API_TESTING.md`.
