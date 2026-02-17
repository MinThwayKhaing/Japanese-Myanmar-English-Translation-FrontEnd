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
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { UserService } from '../services/UserService';
import { GoogleAuthService } from '../services/googleAuthService';
import { AuthContext } from '../context/AuthContext';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
} from '../config';

WebBrowser.maybeCompleteAuthSession();
const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { setAuth } = useContext(AuthContext);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  const isGoogleUser = user?.authProvider === 'GOOGLE';

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success' && token) {
      const idToken =
        response.authentication?.idToken ?? response.params?.id_token;
      if (idToken) {
        handleLinkGoogle(idToken);
      } else {
        Alert.alert('Error', 'Failed to get ID token from Google');
      }
    }
  }, [response]);

  const handleLinkGoogle = async (idToken: string) => {
    if (!token) return;
    setLinkingGoogle(true);
    try {
      const res = await GoogleAuthService.linkGoogle(idToken, token);
      Alert.alert('Success', 'Account linked with Google successfully');
      // Refresh user profile
      const data = await UserService.getProfile(token);
      if (data) setUser(data);
    } catch (err: any) {
      Alert.alert('Link Failed', err.message || 'Failed to link Google account');
    } finally {
      setLinkingGoogle(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      setToken(storedToken);
      try {
        const data = await UserService.getProfile(storedToken);
        if (data) setUser(data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const onDeleteAccount = () => {
    if (!token) return;

    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, delete',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              'Final Confirmation',
              'All your data will be permanently deleted. Type is not recoverable. Proceed?',
              [
                { text: 'Go Back', style: 'cancel' },
                {
                  text: 'Delete Permanently',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await UserService.deleteMe(token);
                      await AsyncStorage.removeItem('token');
                      setAuth(null, null);
                    } catch (err) {
                      Alert.alert('Error', 'Failed to delete account. Please try again.');
                      console.error(err);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

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
          {user?.id && (
            <TouchableOpacity
              style={styles.row}
              onPress={() => {
                Alert.alert('User ID', user.id, [
                  { text: 'OK' },
                ]);
              }}
            >
              <Text style={styles.rowLabel}>User ID:</Text>
              <View style={styles.copyRow}>
                <Text style={styles.rowValueSmall} selectable numberOfLines={1}>{user.id}</Text>
                <Ionicons name="copy-outline" size={16} color={Colors.grayLight} style={{ marginLeft: 6 }} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          {!isGoogleUser && (
            <>
              <TouchableOpacity
                style={styles.securityButton}
                onPress={() => navigation.navigate('ChangePassword')}
              >
                <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} style={{ marginRight: 10 }} />
                <Text style={styles.securityButtonText}>Change Password</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.grayLight} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.securityButton}
                onPress={() => navigation.navigate('ForgotPassword', { email: user?.email })}
              >
                <Ionicons name="key-outline" size={20} color={Colors.primary} style={{ marginRight: 10 }} />
                <Text style={styles.securityButtonText}>Forgot Password</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.grayLight} />
              </TouchableOpacity>
            </>
          )}
          {isGoogleUser && (
            <View style={styles.googleLinkedBadge}>
              <AntDesign name="google" size={18} color="#4285F4" style={{ marginRight: 8 }} />
              <Text style={styles.googleLinkedText}>Signed in with Google</Text>
            </View>
          )}
          {!isGoogleUser && (
            <TouchableOpacity
              style={styles.googleLinkButton}
              onPress={() => promptAsync()}
              disabled={!request || linkingGoogle}
            >
              <AntDesign name="google" size={20} color="#4285F4" style={{ marginRight: 10 }} />
              <Text style={styles.googleLinkText}>
                {linkingGoogle ? 'Connecting...' : 'Connect with Google'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Delete Account — pushed to bottom */}
        <View style={styles.dangerZone}>
          <TouchableOpacity style={styles.deleteButton} onPress={onDeleteAccount}>
            <Ionicons name="trash-outline" size={18} color={Colors.error} style={{ marginRight: 8 }} />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
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
  rowValueSmall: { fontSize: 13, fontWeight: '500', color: '#555', flexShrink: 1 },
  copyRow: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, maxWidth: '65%' },
  securityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  securityButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 28,
  },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  dangerZone: {
    marginTop: 40,
    paddingBottom: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  deleteButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  googleLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  googleLinkText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  googleLinkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  googleLinkedText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4285F4',
  },
});
