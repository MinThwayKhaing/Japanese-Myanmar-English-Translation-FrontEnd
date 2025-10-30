import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
// Screens
import LoginScreen from '../screens/LoginScreen';
import BottomTabs from './BottomTabs';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import ManageWordsScreen from '../screens/ManageWordsScreen';
import ViewUsersScreen from '../screens/ViewUsersScreen';
import ManageSubscriptionScreen from '../screens/ManageSubscriptionScreen';
import EditWordScreen from '../screens/EditWordScreen';
import UserWordDetail from '../screens/UserWordDetail';
import CreateWordScreen from '../screens/CreateWordScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
const Stack = createNativeStackNavigator();
export default function AppNavigator() {
    const { token, role } = useContext(AuthContext);
    return (<Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (<><Stack.Screen name="Login" component={LoginScreen}/><Stack.Screen name="Register" component={RegisterScreen}/></>) : role === 'admin' ? (<>
          <Stack.Screen name="AdminPanel" component={AdminPanelScreen}/>
          <Stack.Screen name="ManageWordsScreen" component={ManageWordsScreen}/>
          <Stack.Screen name="ViewUsersScreen" component={ViewUsersScreen}/>
            <Stack.Screen name="CreateWordScreen" component={CreateWordScreen}/>
          <Stack.Screen name="ManageSubscriptionScreen" component={ManageSubscriptionScreen}/>
          
        <Stack.Screen name="EditWordScreen" component={EditWordScreen}/>
        </>) : (<><Stack.Screen name="MainTabs" component={BottomTabs}/><Stack.Screen name="UserWordDetail" component={UserWordDetail}/>
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen}/> 
        </>)}
    </Stack.Navigator>);
}
//# sourceMappingURL=AppNavigator.js.map