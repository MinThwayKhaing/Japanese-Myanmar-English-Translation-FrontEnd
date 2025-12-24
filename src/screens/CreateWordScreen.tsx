import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WordService } from '../services/wordService';
import { Colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const CreateWordScreen = () => {
  const navigation = useNavigation();
  const [token, setToken] = useState<string | null>(null);
  const [english, setEnglish] = useState('');
  const [japanese, setJapanese] = useState('');
  const [subTerm, setSubTerm] = useState('');
  const [myanmar, setMyanmar] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
    };
    init();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    if (!english.trim()) {
      Alert.alert('Validation', 'English word is required');
      return;
    }

    const formData = new FormData();
    formData.append('english', english.trim());
    formData.append('japanese', japanese.trim());
    formData.append('subTerm', subTerm.trim());
    formData.append('myanmar', myanmar.trim());

    if (image) {
      const filename = image.split('/').pop()!;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      formData.append('image', { uri: image, name: filename, type } as any);
    }

    try {
      setLoading(true);
      await WordService.createWord(formData, token);
      Alert.alert('Success', 'Word created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Create word failed:', err);
      Alert.alert('Error', 'Failed to create word');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerText}>Create New Word</Text>

        <Text style={styles.label}>English *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter English word"
          value={english}
          onChangeText={setEnglish}
        />

        <Text style={styles.label}>Japanese</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Japanese"
          value={japanese}
          onChangeText={setJapanese}
        />

        <Text style={styles.label}>Hiragana / SubTerm</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Hiragana or subterm"
          value={subTerm}
          onChangeText={setSubTerm}
        />

        <Text style={styles.label}>Myanmar</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Myanmar translation"
          value={myanmar}
          onChangeText={setMyanmar}
        />

        <Text style={styles.label}>Image (optional)</Text>
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <Text style={styles.imageText}>Select Image</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.createButton, loading && { opacity: 0.7 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.createText}>Create Word</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateWordScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? 0 : 0,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { fontSize: 16, color: Colors.primary, marginLeft: 6 },
  headerText: { fontSize: 22, fontWeight: 'bold', color: Colors.primary, marginBottom: 20 },
  label: { fontSize: 16, color: '#555', marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  imageText: { color: '#888' },
  previewImage: { width: '100%', height: '100%', borderRadius: 10 },
  createButton: {
    backgroundColor: Colors.primary,
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  createText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
