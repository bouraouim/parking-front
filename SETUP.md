# Setup Guide - Parking Machine Assistant App

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Expo Go app on Android (SDK 50) or web browser
- ✅ Backend server accessible

## Quick Setup (5 minutes)

### 1. Install Dependencies

```powershell
cd c:\Users\21697\Desktop\hssan\app
npm install
```

### 2. Start Development Server

```powershell
npm start
```

This starts the Expo development server. You'll see:
- QR code for mobile testing
- URL for web testing (http://localhost:8081)

### 3. Run the App

**Option A: Mobile (Full Features)**
1. Install Expo Go for SDK 50: https://expo.dev/go?sdkVersion=50&platform=android&device=true
2. Scan QR code from terminal
3. App opens on your device

**Option B: Web Browser (UI Testing)**
1. Press `w` in terminal, OR
2. Open http://localhost:8081 in browser

**Note:** Push notifications, brightness control, and secure storage only work on mobile.

## Current Configuration

**SDK Version:** Expo SDK 50  
**React Native:** 0.73.4  
**Entry Point:** `index.js` using `registerRootComponent`

### Installed Packages
- ✅ expo-notifications (~0.27.6)
- ✅ expo-brightness (~11.8.0)
- ✅ expo-secure-store (~12.8.1)
- ✅ expo-device (~5.9.3)
- ✅ @react-navigation/native (^6.1.9)
- ✅ axios (^1.6.2)

## First Time App Usage

### Step 1: Configure Server
- App opens to "Configure Server" screen
- Enter backend URL (e.g., `http://192.168.1.100:3000`)
- Tap "Continue"

### Step 2: Login
- Enter username
- Enter password
- Tap "Login"

### Step 3: Enable Notifications (Mobile Only)
- If prompted, tap "Enable Notifications"
- Grant permission in system dialog

### Step 4: View Missions
- Pull down to refresh missions
- Tap any mission to view details
- Complete tasks and submit

## Environment Variables (Optional)

If you need to set default API URL or other config:

1. Create `.env` file:
```env
API_URL=http://your-backend-url:3000
```

2. Install dotenv:
```powershell
npm install react-native-dotenv
```

3. Update `babel.config.js`:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }]
    ]
  };
};
```

## Common Issues & Solutions

### Issue: "SDK 54 vs SDK 50" Error
**Solution:** Project is configured for SDK 50. Download Expo Go SDK 50 from the link above.

### Issue: "main has not been registered"
**Solution:** Already fixed! `index.js` now uses `registerRootComponent(App)`.

### Issue: "PlatformConstants not found"
**Solution:** Already fixed! Using compatible React Native 0.73.4 with Expo SDK 50.

### Issue: "Cannot read properties of undefined (reading 'S')"
**Solution:** Use mobile device for native features. Web browser has limited support.

### Issue: Metro bundler errors
**Solution:**
```powershell
# Clear cache and restart
npm start -- --reset-cache
```

### Issue: Dependencies out of sync
**Solution:**
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## Development Commands

```powershell
# Start development server
npm start

# Open on Android (requires emulator or connected device)
npm run android

# Open in web browser
npm run web

# Open on iOS (Mac only)
npm run ios

# Clear cache
npm start -- --reset-cache
```

## Folder Structure

```
app/
├── src/
│   ├── screens/              ← UI screens
│   │   ├── ServerUrlScreen.js
│   │   ├── LoginScreen.js
│   │   ├── MissionListScreen.js
│   │   └── MissionDetailsScreen.js
│   ├── services/             ← API, storage, notifications
│   │   ├── api.js
│   │   ├── storage.js
│   │   └── notification.js
│   ├── context/              ← Auth state management
│   │   └── AuthContext.js
│   └── App.js               ← Main app component
├── assets/                   ← Icons & images
├── index.js                 ← App entry point
├── app.json                 ← Expo configuration
└── package.json             ← Dependencies
```

## Testing Flow

### Web Testing (Limited)
1. Press `w` in terminal
2. Test UI navigation and layouts
3. Test API calls (if backend is accessible)
4. ⚠️ Notifications won't work

### Mobile Testing (Full Features)
1. Scan QR code with Expo Go SDK 50
2. Test all screens and navigation
3. Test notifications (requires backend)
4. Test brightness control
5. Test secure storage

## Keyboard Shortcuts (Metro)

- `r` - Reload app
- `m` - Toggle menu
- `d` - Open developer menu
- `w` - Open in web browser
- `a` - Open on Android
- `?` - Show all commands

## Next Steps

- [ ] Set up backend server
- [ ] Configure server URL in app
- [ ] Test login flow
- [ ] Test mission list and details
- [ ] Test notifications (mobile only)
- [ ] Build standalone APK (if needed)

## Building for Production

To create a standalone APK:

```powershell
# Build with EAS (Expo Application Services)
npm install -g eas-cli
eas login
eas build --platform android
```

Or use classic build:
```powershell
expo build:android
```

## Support

- Expo Documentation: https://docs.expo.dev
- React Navigation: https://reactnavigation.org/docs/getting-started
- Project Issues: Check error logs in Metro terminal
