import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
export const handle401 = async (logout) => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
    Alert.alert('Session expired', 'Please login again');
    await logout();
};
//# sourceMappingURL=AuthHelper.js.map