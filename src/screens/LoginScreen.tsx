import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Alert,
} from 'react-native';

import { Ionicons, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { AuthContext } from '../context/AuthContext';
import { AuthService } from '../services/authService';
import { GoogleAuthService } from '../services/googleAuthService';
import { Colors, Fonts } from '../constants/colors';
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
} from '../config';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }: any) {
  const { setAuth } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      if (idToken) {
        handleGoogleLoginWithToken(idToken);
      } else {
        Alert.alert('Error', 'Failed to get ID token from Google');
      }
    }
  }, [response]);

  const handleGoogleLoginWithToken = async (idToken: string) => {
    setGoogleLoading(true);
    try {
      const { token, user } = await GoogleAuthService.login(idToken);
      setAuth(token, user.role);
    } catch (err: any) {
      Alert.alert('Google Login Failed', err.message || 'Something went wrong');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Load saved credentials
  useEffect(() => {
    const loadSaved = async () => {
      const savedEmail = await AsyncStorage.getItem('savedEmail');
      const savedPassword = await AsyncStorage.getItem('savedPassword');
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    };
    loadSaved();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const { token, role } = await AuthService.login(email, password);
      setAuth(token, role);

      if (rememberMe) {
        await AsyncStorage.setItem('savedEmail', email);
        await AsyncStorage.setItem('savedPassword', password);
      } else {
        await AsyncStorage.removeItem('savedEmail');
        await AsyncStorage.removeItem('savedPassword');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      Alert.alert('Login Failed', 'Email or password is incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    promptAsync();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            {/* Logo */}
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
            />

            <Text style={styles.title}>
              JP-MM Engineering Dictionary
            </Text>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Remember Me */}
            <TouchableOpacity
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <Ionicons
                name={rememberMe ? 'checkbox' : 'square-outline'}
                size={22}
                color={Colors.primary}
              />
              <Text style={styles.rememberText}>Remember Me</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={Fonts.button}>
                {loading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>

            {/* Google Sign In */}
            <TouchableOpacity
              style={[styles.button, styles.googleButton]}
              onPress={handleGoogleLogin}
              disabled={!request || googleLoading}
            >
              <View style={styles.googleContent}>
                <AntDesign name="google" size={20} color={Colors.primary} />
                <Text style={styles.googleText}>
                  {googleLoading ? ' Signing in...' : ' Sign in with Google'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Register */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={{ marginTop: 20 }}
            >
              <Text style={{ color: Colors.primary }}>
                Don’t have an account? Register
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    color: Colors.primary,
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: Colors.white,
    color: Colors.primary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: Colors.white,
  },
  inputPassword: {
    flex: 1,
    height: 50,
    color: Colors.primary,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  rememberText: {
    marginLeft: 8,
    color: Colors.primary,
  },
  button: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBDBDB',
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
});
