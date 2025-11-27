# Parking Machine Assistant App - TODO & Known Issues

## ⚠️ Required Actions Before Running

### 1. Firebase Configuration (REQUIRED)
- [ ] Create Firebase project at https://console.firebase.google.com
- [ ] Add Android app with package name: `com.parkingmachineassistant`
- [ ] Download `google-services.json`
- [ ] Place file in: `app/android/app/google-services.json`
- [ ] **Note**: App will not build without this file!

### 2. Backend Server
- [ ] Ensure backend server is running (see `server/SETUP.md`)
- [ ] Create test user: `npm run create-user worker1 password123`
- [ ] Verify server is accessible from device/emulator

## 📝 Implementation Notes

### Completed Features ✅

1. **Server Configuration**
   - ✅ Server URL input screen
   - ✅ URL validation with `/health` endpoint
   - ✅ Persistent URL storage

2. **Authentication**
   - ✅ Login with username/password
   - ✅ JWT token storage
   - ✅ Persistent sessions
   - ✅ Auto-login on app restart

3. **FCM Notifications**
   - ✅ FCM token generation
   - ✅ Token registration with backend
   - ✅ Foreground notifications
   - ✅ Background notifications
   - ✅ Notification click handling
   - ✅ Token refresh handling

4. **Mission List**
   - ✅ Fetch missions from API
   - ✅ Local storage caching
   - ✅ Pull-to-refresh
   - ✅ Sort by status (unopened first) and date
   - ✅ Visual indicators for unopened missions
   - ✅ Status badges

5. **Mission Details**
   - ✅ Display full mission information
   - ✅ Auto-open on first view (unopened → in_progress)
   - ✅ Task checklist (collect, refill, maintenance)
   - ✅ Submit mission functionality
   - ✅ QR code display
   - ✅ Brightness boost for QR code
   - ✅ Error handling for submission failures

6. **Permissions**
   - ✅ Notification permission request
   - ✅ Permission status check
   - ✅ Banner to enable if disabled
   - ✅ Android 13+ POST_NOTIFICATIONS support

### Known Limitations

1. **Platform Support**
   - Android only (as per requirements)
   - No iOS support

2. **Offline Functionality**
   - Missions cached locally
   - Can view cached missions offline
   - Cannot fetch new missions or submit without connection
   - No retry queue for failed submissions

3. **Notification Edge Cases**
   - If app is killed by system, background handler may not run
   - Duplicate notifications possible if mission already exists
   - No notification sound customization

4. **UI/UX**
   - No loading skeleton screens
   - Basic error messages (could be more user-friendly)
   - No mission search or filter functionality
   - No dark mode support

## 🔧 Potential Improvements

### High Priority
- [ ] Add retry queue for failed mission submissions
- [ ] Implement better offline sync mechanism
- [ ] Add more detailed error messages
- [ ] Implement mission search/filter
- [ ] Add loading skeleton screens

### Medium Priority
- [ ] Add mission history view
- [ ] Implement dark mode
- [ ] Add app settings screen
- [ ] Custom notification sounds
- [ ] Add mission notes/comments
- [ ] Image capture for mission verification

### Low Priority
- [ ] Localization support
- [ ] Accessibility improvements
- [ ] Animation polish
- [ ] Haptic feedback
- [ ] App tutorial/onboarding

## 🐛 Known Issues

### Issue 1: Brightness Control
**Description**: `react-native-device-brightness` may not work on all devices  
**Workaround**: QR code still displays, just without brightness adjustment  
**Fix**: Consider alternative brightness libraries or manual implementation

### Issue 2: Notification Icon
**Description**: Default notification icon may not match app branding  
**Fix**: Create custom notification icons in `android/app/src/main/res/drawable-*/`

### Issue 3: Server URL Change
**Description**: No UI to change server URL after initial setup  
**Workaround**: Clear app data or reinstall  
**Fix**: Add settings screen with server URL configuration

## 📱 Testing Checklist

### Before Release
- [ ] Test on physical Android device
- [ ] Test on Android 12, 13, 14
- [ ] Test notification permissions flow
- [ ] Test FCM foreground notifications
- [ ] Test FCM background notifications
- [ ] Test notification tap navigation
- [ ] Test offline mission viewing
- [ ] Test online mission submission
- [ ] Test QR code display
- [ ] Test brightness adjustment
- [ ] Test pull-to-refresh
- [ ] Test mission status transitions
- [ ] Test logout and re-login
- [ ] Test server URL validation
- [ ] Test invalid credentials
- [ ] Test network error handling

## 🚀 Deployment Checklist

### Before Building Release APK
- [ ] Update version in `android/app/build.gradle`
- [ ] Generate release keystore
- [ ] Configure signing in gradle
- [ ] Test release build on device
- [ ] Verify ProGuard rules (if enabled)
- [ ] Test FCM in release mode
- [ ] Verify Firebase configuration
- [ ] Update app icon if needed
- [ ] Test deep linking
- [ ] Document server URL format for users

## 📚 Developer Notes

### Dependencies to Watch
- `react-native`: Major updates may require native code changes
- `@react-native-firebase/*`: Keep in sync with Firebase SDK
- `@notifee/react-native`: Check for Android compatibility
- `react-navigation`: Breaking changes in v7+

### File Structure Conventions
- Screens in `src/screens/` - one screen per file
- Services in `src/services/` - API, storage, notifications
- Context providers in `src/context/`
- No inline styles - use StyleSheet.create()

### State Management
- Using Context API for auth state
- Local component state for UI state
- AsyncStorage for persistence
- Consider Redux/Zustand if state grows complex

## 📞 Support

If you encounter issues:
1. Check this TODO file
2. Review `app/README.md`
3. Check `app/SETUP.md` for setup steps
4. Review backend logs in `server/`
5. Check Android logcat: `npx react-native log-android`
