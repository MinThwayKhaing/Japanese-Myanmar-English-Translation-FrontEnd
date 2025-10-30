// src/services/AuthService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
export const AuthService = {
    login: async (email, password) => {
        const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
        const { token, role, subscription } = res.data;
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('role', role);
        return { token, role, subscription };
    },
    register: async (email, password) => {
        const res = await axios.post(`${API_BASE_URL}/auth/register`, { email, password });
        return res.data;
    },
    logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('role');
    }
};
//# sourceMappingURL=authService.js.map