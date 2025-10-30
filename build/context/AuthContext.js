import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const AuthContext = createContext({
    token: null,
    role: null,
    setAuth: () => { },
    logout: async () => { },
});
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    useEffect(() => {
        const loadAuth = async () => {
            const storedToken = await AsyncStorage.getItem('token');
            const storedRole = await AsyncStorage.getItem('role');
            setToken(storedToken);
            setRole(storedRole);
        };
        loadAuth();
    }, []);
    const setAuth = async (newToken, newRole) => {
        if (newToken) {
            await AsyncStorage.setItem('token', newToken);
            await AsyncStorage.setItem('role', newRole || '');
        }
        else {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('role');
        }
        setToken(newToken);
        setRole(newRole);
    };
    const logout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('role');
        setToken(null);
        setRole(null);
    };
    return (<AuthContext.Provider value={{ token, role, setAuth, logout }}>
      {children}
    </AuthContext.Provider>);
};
//# sourceMappingURL=AuthContext.js.map