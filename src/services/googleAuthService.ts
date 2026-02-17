import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export const GoogleAuthService = {
  login: async (idToken: string) => {
    console.log('[GoogleAuthService] Google login attempt, token length:', idToken.length);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/google/login`, {
        idToken,
      });

      if (!res.data) {
        throw { status: 500, message: 'Empty response from server' };
      }
      const { token, user } = res.data;
      if (!user) {
        throw { status: 500, message: 'User data missing from response' };
      }
      console.log('[GoogleAuthService] Google login successful, email:', user.email, 'role:', user.role);

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', user.role || '');

      return { token, user };
    } catch (error: any) {
      console.error('[GoogleAuthService] Google login failed, status:', error.response?.status, 'error:', error.response?.data);
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

  linkGoogle: async (idToken: string, token: string) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/users/link-google`, { idToken }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error: any) {
      if (error.response) {
        throw {
          status: error.response.status,
          message: error.response.data?.message || error.response.data || 'Failed to link Google account',
        };
      }
      throw { status: 500, message: 'Server error' };
    }
  },

  register: async (idToken: string) => {
    console.log('[GoogleAuthService] Google register attempt, token length:', idToken.length);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/google/register`, {
        idToken,
      });

      if (!res.data) {
        throw { status: 500, message: 'Empty response from server' };
      }
      const { token, user } = res.data;
      if (!user) {
        throw { status: 500, message: 'User data missing from response' };
      }
      console.log('[GoogleAuthService] Google register successful, email:', user.email, 'role:', user.role);

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', user.role || '');

      return { token, user };
    } catch (error: any) {
      console.error('[GoogleAuthService] Google register failed, status:', error.response?.status, 'error:', error.response?.data);
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
