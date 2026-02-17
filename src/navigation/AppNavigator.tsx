import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import BottomTabs from './BottomTabs';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import ManageWordsScreen from '../screens/ManageWordsScreen';
import UpdateCustomerWordsScreen from '../screens/ViewUsersScreen';
import EditWordScreen from '../screens/EditWordScreen';
import UserWordDetail from '../screens/UserWordDetail';
import CreateWordScreen from '../screens/CreateWordScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DuplicateSyncScreen from '../screens/DuplicateSyncScreen';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { token, role } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <><Stack.Screen name="Login" component={LoginScreen} /><Stack.Screen name="Register" component={RegisterScreen} /><Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /></>
      ) : role === 'admin' ? (
        <>
          <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
          <Stack.Screen name="ManageWordsScreen" component={ManageWordsScreen} />
          <Stack.Screen name="UpdateCustomerWordsScreen" component={UpdateCustomerWordsScreen} />
            <Stack.Screen name="CreateWordScreen" component={CreateWordScreen} />
          
<Stack.Screen name="EditWordScreen" component={EditWordScreen} />
          <Stack.Screen name="DuplicateSyncScreen" component={DuplicateSyncScreen} />
        </>
      ) : (
        <><Stack.Screen name="MainTabs" component={BottomTabs} /><Stack.Screen name="UserWordDetail" component={UserWordDetail} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>

      )}
    </Stack.Navigator>
  );
}
