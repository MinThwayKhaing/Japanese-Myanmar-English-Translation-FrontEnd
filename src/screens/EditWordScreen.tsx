import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/colors';
import { WordService } from '../services/wordService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const EditWordScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { word } = route.params;

  const [english, setEnglish] = useState(word.english);
  const [japanese, setJapanese] = useState(word.japanese || '');
  const [myanmar, setMyanmar] = useState(word.myanmar || '');
  const [subTerm, setSubTerm] = useState(word.subTerm || '');
  const [image, setImage] = useState<string | null>(word.imageURL || null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const t = await AsyncStorage.getItem('token');
      setToken(t);
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

  const handleUpdate = async () => {
    if (!token) return;
    if (!english.trim() || !japanese.trim()) {
      Alert.alert('Validation', 'English and Japanese fields are required.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('english', english.trim());
      formData.append('japanese', japanese.trim());
      formData.append('myanmar', myanmar.trim());
      formData.append('subTerm', subTerm.trim());

      if (image && !image.startsWith('http')) {
        const filename = image.split('/').pop()!;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('image', { uri: image, name: filename, type } as any);
      }

      await WordService.updateWord(word._id, formData, token);
      Alert.alert('Success', 'Word updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update word.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Word</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.label}>English *</Text>
        <TextInput style={styles.input} value={english} onChangeText={setEnglish} />

        <Text style={styles.label}>Japanese</Text>
        <TextInput style={styles.input} value={japanese} onChangeText={setJapanese} />

        <Text style={styles.label}>Hiragana / SubTerm</Text>
        <TextInput style={styles.input} value={subTerm} onChangeText={setSubTerm} />

        <Text style={styles.label}>Myanmar</Text>
        <TextInput style={styles.input} value={myanmar} onChangeText={setMyanmar} />

        <Text style={styles.label}>Image</Text>
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <Text style={styles.imageText}>Select Image</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.createButton, loading && { opacity: 0.7 }]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.createText}>Update Word</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditWordScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? 0 : 0,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 16 },
  headerText: { fontSize: 22, fontWeight: 'bold', color: Colors.primary, marginLeft: 12 },
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
    height: 180,
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
