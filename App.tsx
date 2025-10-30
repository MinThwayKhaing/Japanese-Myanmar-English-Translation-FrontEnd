// App.tsx
import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/RootNavigation';
import { setLogoutHandler } from './src/services/axiosInstance';

const AppWrapper = () => {
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    // Provide logout function to axiosInstance for 401 handling
    setLogoutHandler(logout);
  }, [logout]);

  return <AppNavigator />;
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
        <AppWrapper />
      </NavigationContainer>
    </AuthProvider>
  );
}
