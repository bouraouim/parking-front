import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import apiService from './api';
import { storageService } from './storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => {
    // Check if user is logged in
    const user = await apiService.getUserData();
    
    if (!user) {
      // Don't show notification if user is not logged in
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldVibrate: false,
      };
    }
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldVibrate: true,
    };
  },
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Request notification permissions
  async requestPermissions() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('missions', {
        name: 'Mission Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#007AFF',
        sound: true,
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    } else {
      console.log('Must use physical device for Push Notifications');
      return false;
    }
  }

  // Check if notifications are enabled
  async checkPermissions() {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  // Get Expo Push Token
  async getExpoPushToken() {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
      
      this.expoPushToken = token.data;
      return token.data;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  // Register push token with backend
  async registerToken() {
    try {
      const token = await this.getExpoPushToken();
      if (token) {
        const result = await apiService.registerPushToken(token);
        return result.success;
      }
      return false;
    } catch (error) {
      console.error('Failed to register push token:', error);
      return false;
    }
  }

  // Setup notification listeners
  setupNotificationListeners(navigation) {
    // Handle notification received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      async notification => {
        console.log('Notification received:', notification);
        const { data } = notification.request.content;
        
        // Save mission to local storage
        if (data.id && data.payload) {
          await this.saveMissionFromNotification(data);
        }
      }
    );

    // Handle notification tapped
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log('Notification tapped:', response);
        const { data } = response.notification.request.content;
        
        if (data.id && navigation) {
          navigation.navigate('MissionDetails', { missionId: data.id });
        }
      }
    );

    // Check for notification that opened the app
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        const { data } = response.notification.request.content;
        if (data.id && navigation) {
          setTimeout(() => {
            navigation.navigate('MissionDetails', { missionId: data.id });
          }, 1000);
        }
      }
    });
  }

  // Save mission from notification data
  async saveMissionFromNotification(data) {
    try {
      const missions = await storageService.getMissions();
      const existingIndex = missions.findIndex(m => m.missionId === data.id);

      if (existingIndex === -1) {
        const payload = typeof data.payload === 'string' 
          ? JSON.parse(data.payload) 
          : data.payload;

        const newMission = {
          missionId: data.id,
          payload: payload,
          status: 'unopened',
          createdAt: new Date().toISOString(),
        };

        missions.push(newMission);
        await storageService.saveMissions(missions);
      }
    } catch (error) {
      console.error('Failed to save mission from notification:', error);
    }
  }

}

export default new NotificationService();
