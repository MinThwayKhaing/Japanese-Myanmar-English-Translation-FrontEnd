// src/screens/EditWordScreen.tsx
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
} from 'react-native';
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
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const t = await AsyncStorage.getItem('token');
      setToken(t);
    };
    init();
  }, []);

  const handleUpdate = async () => {
    if (!token) return;
    if (!english.trim() || !japanese.trim()) {
      Alert.alert('Validation', 'English and Japanese fields are required.');
      return;
    }
    setLoading(true);
    try {
      await WordService.updateWord(word._id, { english, japanese, myanmar, subTerm }, token);
      Alert.alert('Success', 'Word updated successfully.');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update word.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Word</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.label}>English</Text>
          <TextInput style={styles.input} value={english} onChangeText={setEnglish} />

          <Text style={styles.label}>Japanese</Text>
          <TextInput style={styles.input} value={japanese} onChangeText={setJapanese} />

          <Text style={styles.label}>Myanmar</Text>
          <TextInput style={styles.input} value={myanmar} onChangeText={setMyanmar} />

          <Text style={styles.label}>Sub Term</Text>
          <TextInput style={styles.input} value={subTerm} onChangeText={setSubTerm} />

          <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditWordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 12,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    backgroundColor: '#F9F9F9',
  },
  button: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
