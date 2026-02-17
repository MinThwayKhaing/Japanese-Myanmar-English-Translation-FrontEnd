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
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    console.log('[LoginScreen] Google auth response:', response?.type);
    if (response?.type === 'success') {
      const idToken =
        response.authentication?.idToken ?? response.params?.id_token;
      console.log('[LoginScreen] Got ID token:', !!idToken);
      if (idToken) {
        handleGoogleLoginWithToken(idToken);
      } else {
        console.error('[LoginScreen] No ID token in response');
        Alert.alert('Error', 'Failed to get ID token from Google');
      }
    } else if (response?.type === 'error') {
      console.error('[LoginScreen] Google auth error:', response.error);
    }
  }, [response]);

  const handleGoogleLoginWithToken = async (idToken: string) => {
    console.log('[LoginScreen] Sending Google ID token to backend for login');
    setGoogleLoading(true);
    try {
      const { token, user } = await GoogleAuthService.login(idToken);
      if (!token || !user) {
        Alert.alert('Error', 'Invalid response from server');
        return;
      }
      console.log('[LoginScreen] Google login success, setting auth');
      setAuth(token, user.role);
    } catch (err: any) {
      console.error('[LoginScreen] Google login failed:', err.message);
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

  const handlePasswordFocus = () => {
    if (!email?.trim()) {
      setEmailError("Email can't be null");
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text.trim()) {
      setEmailError('');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (text) {
      setPasswordError('');
    }
  };

  const handleLogin = async () => {
    if (!email?.trim()) {
      setEmailError("Email can't be null");
      return;
    }
    setEmailError('');
    if (!password) {
      setPasswordError("Password can't be null");
      return;
    }
    setPasswordError('');

    const trimmedEmail = email.trim();
    console.log('[LoginScreen] Email login attempt for:', trimmedEmail);
    setLoading(true);
    try {
      const { token, role } = await AuthService.login(trimmedEmail, password);
      console.log('[LoginScreen] Email login success, setting auth');
      setAuth(token, role);

      if (rememberMe) {
        await AsyncStorage.setItem('savedEmail', email);
        await AsyncStorage.setItem('savedPassword', password);
      } else {
        await AsyncStorage.removeItem('savedEmail');
        await AsyncStorage.removeItem('savedPassword');
      }
    } catch (err: any) {
      console.error('[LoginScreen] Email login failed:', err.message);
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
              style={[styles.input, emailError ? { borderColor: 'red', marginBottom: 4 } : {}]}
              placeholder="Email"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordContainer, passwordError ? { borderColor: 'red', marginBottom: 4 } : {}]}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={handlePasswordChange}
                onFocus={handlePasswordFocus}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            {/* Remember Me + Forgot Password */}
            <View style={styles.rememberForgotRow}>
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
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

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
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    marginLeft: 8,
    color: Colors.primary,
  },
  forgotText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
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
  errorText: {
    color: 'red',
    fontSize: 13,
    alignSelf: 'flex-start',
    marginLeft: 5,
    marginBottom: 10,
  },
});
