import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api';

const MISSIONS_STORAGE_KEY_PREFIX = 'missions_';

export const storageService = {
  // Get storage key for current user
  async getUserStorageKey() {
    const user = await apiService.getUserData();
    const userId = user?.id || user?.username || 'default';
    return `${MISSIONS_STORAGE_KEY_PREFIX}${userId}`;
  },

  // Save missions to local storage
  async saveMissions(missions) {
    try {
      const key = await this.getUserStorageKey();
      await AsyncStorage.setItem(key, JSON.stringify(missions));
      return true;
    } catch (error) {
      console.error('Failed to save missions:', error);
      return false;
    }
  },

  // Get missions from local storage
  async getMissions() {
    try {
      const key = await this.getUserStorageKey();
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get missions:', error);
      return [];
    }
  },

  // Update a single mission
  async updateMission(missionId, updates) {
    try {
      const missions = await this.getMissions();
      const index = missions.findIndex(m => m.missionId === missionId);

      if (index !== -1) {
        missions[index] = {...missions[index], ...updates};
        await this.saveMissions(missions);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update mission:', error);
      return false;
    }
  },

  // Get a single mission by ID
  async getMissionById(missionId) {
    try {
      const missions = await this.getMissions();
      return missions.find(m => m.missionId === missionId) || null;
    } catch (error) {
      console.error('Failed to get mission:', error);
      return null;
    }
  },

  // Clear all missions for current user
  async clearMissions() {
    try {
      const key = await this.getUserStorageKey();
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to clear missions:', error);
      return false;
    }
  },

  // Sort missions: unopened first, then by date
  sortMissions(missions) {
    return [...missions].sort((a, b) => {
      // Status priority: unopened > in_progress > completed
      const statusPriority = {unopened: 0, in_progress: 1, completed: 2};
      const statusDiff = statusPriority[a.status] - statusPriority[b.status];

      if (statusDiff !== 0) {
        return statusDiff;
      }

      // If same status, sort by date (newest first)
      const dateA = new Date(a.payload?.date || 0);
      const dateB = new Date(b.payload?.date || 0);
      return dateB - dateA;
    });
  },
};
