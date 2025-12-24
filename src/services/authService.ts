// src/services/AuthService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export const AuthService = {
 login: async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token, role, subscription } = res.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', role);

      return { token, role, subscription };
    } catch (error: any) {
      // 👇 Forward backend error clearly
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
    const res = await axios.post(`${API_BASE_URL}/auth/register`, { email, password });
    return res.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
  }
};
