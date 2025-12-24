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
import { AuthContext } from '../context/AuthContext';
import { AuthService } from '../services/authService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../constants/colors';

export default function LoginScreen({ navigation }: any) {
  const { setAuth } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('savedEmail');
        const savedPassword = await AsyncStorage.getItem('savedPassword');
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (err) {
        console.error('Failed to load saved credentials', err);
      }
    };
    loadSavedCredentials();
  }, []);

const handleLogin = async () => {
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
    // 🔍 Log backend error to console
    console.error('Login error:', err);

    if (err.status === 401) {
      Alert.alert('Login Failed', 'Email or password is incorrect');
    } else {
      Alert.alert('Server Error', 'Something went wrong. Please try again later.');
    }
  } finally {
    setLoading(false);
  }
};



  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
            />
            <Text
              style={{
       fontSize: 28, // increase size
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center', // center horizontally
    marginBottom: 30,
              }}
            >
              JP-MM Engineering Dictionary
            </Text>

            {/* Email Label */}
            <Text style={styles.label}>Email </Text>
            <TextInput
              placeholder="Email"
              placeholderTextColor={Colors.textSecondary}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password Label */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                style={styles.inputPassword}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Remember Me left-aligned */}
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

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={Fonts.button}>
                {loading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>


            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={{ marginTop: 20 }}
            >
              <Text style={{ color: Colors.primary }}>
                Don't have an account? Register
              </Text>
            </TouchableOpacity>
{/* 
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={{ marginTop: 10 }}
            >
              <Text style={{ color: Colors.primary }}>Forgot Password?</Text>
            </TouchableOpacity> */}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
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
    marginBottom: 15,
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
    marginBottom: 10,
  },
  inputPassword: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    color: Colors.primary,
  },
  eyeIcon: {
    paddingHorizontal: 10,
  },
  button: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start', // left align
    marginBottom: 20,
  },
  rememberText: {
    marginLeft: 8,
    color: Colors.primary,
    fontSize: 16,
  },
});
