// src/utils/axiosHelpers.ts
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const handle401 = async (logout: () => Promise<void>) => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('role');
  Alert.alert('Session expired', 'Please login again');
  await logout();
};
