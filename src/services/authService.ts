// src/services/AuthService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export const AuthService = {
 login: async (email: string, password: string) => {
    console.log('[AuthService] Login attempt for:', email);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      if (!res.data) {
        throw { status: 500, message: 'Empty response from server' };
      }
      const { token, role, subscription } = res.data;
      console.log('[AuthService] Login successful for:', email, 'role:', role);

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', role);

      return { token, role, subscription };
    } catch (error: any) {
      console.error('[AuthService] Login failed for:', email, 'status:', error.response?.status, 'error:', error.response?.data);
      if (error.response) {
        throw {
          status: error.response.status,
          message: error.response.data?.message || 'Login failed',
        };
      }

      throw {
        status: 500,
        message: 'Server error',
      };
    }
  },
  register: async (email: string, password: string) => {
    console.log('[AuthService] Register attempt for:', email);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, { email, password });
      console.log('[AuthService] Register successful for:', email);
      return res.data;
    } catch (error: any) {
      console.error('[AuthService] Register failed for:', email, 'status:', error.response?.status, 'error:', error.response?.data);
      throw error;
    }
  },

  logout: async () => {
    console.log('[AuthService] Logout');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
  },

  forgotPassword: async (email: string) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      return res.data;
    } catch (error: any) {
      const msg = error.response?.data;
      throw {
        status: error.response?.status || 500,
        message: typeof msg === 'string' ? msg.trim() : 'Failed to send OTP',
      };
    }
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });
      return res.data;
    } catch (error: any) {
      const msg = error.response?.data;
      throw {
        status: error.response?.status || 500,
        message: typeof msg === 'string' ? msg.trim() : 'Failed to reset password',
      };
    }
  },
};
