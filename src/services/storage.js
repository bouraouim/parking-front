import * as SecureStore from 'expo-secure-store';

const MISSIONS_STORAGE_KEY = 'missions';

export const storageService = {
  // Save missions to local storage
  async saveMissions(missions) {
    try {
      await SecureStore.setItemAsync(MISSIONS_STORAGE_KEY, JSON.stringify(missions));
      return true;
    } catch (error) {
      console.error('Failed to save missions:', error);
      return false;
    }
  },

  // Get missions from local storage
  async getMissions() {
    try {
      const data = await SecureStore.getItemAsync(MISSIONS_STORAGE_KEY);
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

  // Clear all missions
  async clearMissions() {
    try {
      await SecureStore.deleteItemAsync(MISSIONS_STORAGE_KEY);
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
