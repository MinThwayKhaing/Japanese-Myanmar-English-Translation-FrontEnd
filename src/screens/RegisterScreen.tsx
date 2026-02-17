import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { AuthService } from '../services/authService';
import { GoogleAuthService } from '../services/googleAuthService';
import { Colors, Fonts } from '../constants/colors';
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
} from '../config';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    console.log('[RegisterScreen] Google auth response:', response?.type);
    if (response?.type === 'success') {
      const idToken =
        response.authentication?.idToken ?? response.params?.id_token;
      console.log('[RegisterScreen] Got ID token:', !!idToken);
      if (idToken) {
        handleGoogleRegisterWithToken(idToken);
      } else {
        console.error('[RegisterScreen] No ID token in response');
        Alert.alert('Error', 'Failed to get ID token from Google');
      }
    } else if (response?.type === 'error') {
      console.error('[RegisterScreen] Google auth error:', response.error);
    }
  }, [response]);

  const handleGoogleRegisterWithToken = async (idToken: string) => {
    if (!idToken) {
      Alert.alert('Error', 'Invalid Google token');
      return;
    }
    console.log('[RegisterScreen] Sending Google ID token to backend for register');
    setGoogleLoading(true);
    try {
      const result = await GoogleAuthService.register(idToken);
      if (!result || !result.token) {
        Alert.alert('Error', 'Registration failed: invalid server response');
        return;
      }
      console.log('[RegisterScreen] Google register success');
      Alert.alert('Success', 'Account created successfully with Google');
      navigation.navigate('Login');
    } catch (err: any) {
      console.error('[RegisterScreen] Google register failed:', err?.message);
      Alert.alert('Google Registration Failed', err?.message || 'Something went wrong');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('[RegisterScreen] Google sign-up button pressed');
    promptAsync();
  };

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

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (text) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordFocus = () => {
    if (!password) {
      setPasswordError("Password can't be null");
    }
  };

  const handleRegister = async () => {
    if (!email?.trim()) {
      setEmailError("Email can't be null");
      return;
    }
    setEmailError('');
    let hasError = false;
    if (!password) {
      setPasswordError("Password can't be null");
      hasError = true;
    } else {
      setPasswordError('');
    }
    if (!confirmPassword) {
      setConfirmPasswordError("Confirm Password can't be null");
      hasError = true;
    } else {
      setConfirmPasswordError('');
    }
    if (hasError) return;

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    const trimmedEmail = email.trim();
    console.log('[RegisterScreen] Email register attempt for:', trimmedEmail);
    setLoading(true);
    try {
      const result = await AuthService.register(trimmedEmail, password);
      if (!result) {
        Alert.alert('Error', 'Registration failed: no response from server');
        return;
      }
      console.log('[RegisterScreen] Email register success');
      Alert.alert('Success', 'Account created successfully');
      navigation.navigate('Login');
    } catch (err: any) {
      console.error('[RegisterScreen] Email register failed:', err?.message);
      Alert.alert('Error', err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />

      <Text style={styles.title}>Create an Account</Text>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, emailError ? { borderColor: 'red', marginBottom: 4 } : {}]}
        placeholder="Email"
        placeholderTextColor={Colors.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={handleEmailChange}
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

      {/* Confirm Password */}
      <Text style={styles.label}>Confirm Password</Text>
      <View style={[styles.passwordContainer, confirmPasswordError ? { borderColor: 'red', marginBottom: 4 } : {}]}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Confirm Password"
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          onFocus={handleConfirmPasswordFocus}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons
            name={showConfirmPassword ? 'eye-off' : 'eye'}
            size={22}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

      {/* Register Button */}
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={Fonts.button}>
          {loading ? 'Registering...' : 'Register'}
        </Text>
      </TouchableOpacity>

      {/* Google Signup */}
      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={handleGoogleLogin}
        disabled={!request || googleLoading}
      >
        <View style={styles.googleContent}>
          <AntDesign name="google" size={20} color={Colors.primary} />
          <Text style={styles.googleText}>
            {googleLoading ? ' Signing up...' : ' Sign up with Google'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Login Link */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }}>
        <Text style={{ color: Colors.primary }}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  title: {
    ...Fonts.heading2,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 5,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: Colors.grayBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: Colors.white,
    color: Colors.primary,
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: Colors.grayBorder,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: Colors.white,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  inputPassword: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
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
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    alignSelf: 'flex-start',
    marginLeft: 5,
    marginBottom: 10,
  },
});
