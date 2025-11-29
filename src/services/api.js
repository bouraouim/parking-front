import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  SERVER_URL: 'server_url',
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
};

class ApiService {
  constructor() {
    this.client = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      async config => {
        const token = await this.getAuthToken();
        const serverUrl = await this.getServerUrl();

        if (serverUrl) {
          config.baseURL = serverUrl;
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      error => Promise.reject(error),
    );
  }

  // Server URL management
  async setServerUrl(url) {
    const cleanUrl = url.trim().replace(/\/$/, ''); // Remove trailing slash
    await SecureStore.setItemAsync(STORAGE_KEYS.SERVER_URL, cleanUrl);
  }

  async getServerUrl() {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.SERVER_URL);
    } catch (error) {
      console.error('Error reading server URL:', error);
      // Clear corrupted URL
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.SERVER_URL);
      } catch (e) {
        console.error('Error clearing server URL:', e);
      }
      return null;
    }
  }

  async validateServerUrl(url) {
    try {
      const cleanUrl = url.trim().replace(/\/$/, '');
      const response = await axios.get(`${cleanUrl}/health`, {timeout: 5000});
      return response.data.status === 'ok';
    } catch (error) {
      return false;
    }
  }

  // Authentication
  async login(username, password) {
    try {
      const response = await this.client.post('/auth/login', {
        username,
        password,
      });

      const {token, user} = response.data;

      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return {success: true, data: {token, user}};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  }

  async getAuthToken() {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error reading auth token:', error);
      // Clear corrupted token
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      } catch (e) {
        console.error('Error clearing auth token:', e);
      }
      return null;
    }
  }

  async getUserData() {
    try {
      const data = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading user data:', error);
      // Clear corrupted data
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
      } catch (e) {
        console.error('Error clearing user data:', e);
      }
      return null;
    }
  }

  async logout() {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  }

  // Push Token management
  async registerPushToken(pushToken) {
    try {
      const user = await this.getUserData();
      if (!user || !user.id) {
        return {success: false, error: 'User not found'};
      }

      await this.client.post(`/api/users/${user.id}/push-token`, {
        token: pushToken,
      });

      return {success: true};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to register push token',
      };
    }
  }

  async removePushToken(pushToken) {
    try {
      const user = await this.getUserData();
      if (!user || !user.id) {
        return {success: false, error: 'User not found'};
      }

      await this.client.delete(`/api/users/${user.id}/push-token`, {
        data: {token: pushToken},
      });

      return {success: true};
    } catch (error) {
      return {success: false, error: 'Failed to remove push token'};
    }
  }

  // Missions
  async getAllMissions() {
    try {
      const user = await this.getUserData();
      if (!user || !user.username) {
        return {success: false, error: 'User not found'};
      }

      const response = await this.client.get('/api/missions', {
        params: {
          username: user.username,
        },
      });
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch missions',
      };
    }
  }

  async getMissionById(missionId) {
    try {
      const response = await this.client.get(`/api/missions/${missionId}`);
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch mission',
      };
    }
  }

  async openMission(missionId) {
    try {
      const response = await this.client.post(`/api/missions/${missionId}/open`);
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to open mission',
      };
    }
  }

  async updateMission(missionId, updateData) {
    try {
      const response = await this.client.post(
        `/api/missions/${missionId}/update`,
        updateData,
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update mission',
      };
    }
  }
}

export default new ApiService();
export {STORAGE_KEYS};
