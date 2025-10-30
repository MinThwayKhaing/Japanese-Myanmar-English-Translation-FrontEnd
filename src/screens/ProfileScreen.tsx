import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserService } from '../services/UserService';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { setAuth } = useContext(AuthContext);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      setToken(storedToken);
      // Fetch user info here if API available
      // For demo, we assume a simple getFavorites as placeholder for user info
      try {
const data = await UserService.getProfile(storedToken);
setUser(data); // <-- directly use the API response

      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const onLogout = async () => {
    await AsyncStorage.removeItem('token');
    setAuth(null, null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A374D" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>My Profile</Text>
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.body}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email:</Text>
            <Text style={styles.rowValue}>{user?.email}</Text>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Status:</Text>
            <Text style={styles.rowValue}>{user?.subscribed ? 'Active' : 'Inactive'}</Text>
          </View>
          {!user?.subscribed && (
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
<TouchableOpacity
  style={styles.upgradeButton}
  onPress={() => navigation.navigate('ChangePassword')}
>
  <Text style={styles.upgradeText}>Change Password</Text>
</TouchableOpacity>

        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor:  Colors.background,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 0 : 0,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
    // backgroundColor removed
  },
  headerText: { fontSize: 22, fontWeight: 'bold', color: '#1A374D' },
  body: { paddingHorizontal: 16, paddingBottom: 40 },
  section: { 
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc', 
    paddingVertical: 12,
    backgroundColor: 'transparent', // remove white card
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1A374D', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  rowLabel: { fontSize: 16, color: '#333' },
  rowValue: { fontSize: 16, fontWeight: '500', color: '#555' },
  upgradeButton: { marginTop: 6 },
  upgradeText: { color: '#E6A4B4', fontWeight: '600', fontSize: 14 },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A374D', // changed to dark blue
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
