import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export const GoogleAuthService = {
  login: async (idToken: string) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/google/login`, {
        idToken,
      });

      const { token, user } = res.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', user.role);

      return { token, user };
    } catch (error: any) {
      if (error.response) {
        throw {
          status: error.response.status,
          message: error.response.data?.message || error.response.data || 'Google login failed',
        };
      }

      throw {
        status: 500,
        message: 'Server error',
      };
    }
  },

  register: async (idToken: string) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/google/register`, {
        idToken,
      });

      const { token, user } = res.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', user.role);

      return { token, user };
    } catch (error: any) {
      if (error.response) {
        throw {
          status: error.response.status,
          message: error.response.data?.message || error.response.data || 'Google registration failed',
        };
      }

      throw {
        status: 500,
        message: 'Server error',
      };
    }
  },
};
