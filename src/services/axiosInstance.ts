// axiosInstance.ts
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let logoutCallback: (() => Promise<void>) | null = null;

export const setLogoutHandler = (callback: () => Promise<void>) => {
  logoutCallback = callback;
};

const instance = axios.create({
  baseURL: API_BASE_URL,
});

instance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('role');

      Alert.alert('Session expired', 'Please log in again.');

      // Call the logout callback if provided
      if (logoutCallback) {
        await logoutCallback();
      }
            return new Promise(() => {}); 
    }
    return Promise.reject(error);
  }
);

export default instance;
