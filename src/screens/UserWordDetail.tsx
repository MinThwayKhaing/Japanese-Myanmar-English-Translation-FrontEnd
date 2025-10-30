import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WordService, Word } from '../services/wordService';
import { UserService } from '../services/UserService';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function UserWordDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;

  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const savedToken = await AsyncStorage.getItem('token');
      if (!savedToken) return;
      setToken(savedToken);

      try {
        const [wordData, favoritesData] = await Promise.all([
          WordService.getWordByID(id, savedToken),
          UserService.getFavorites(savedToken),
        ]);

        setWord(wordData);

        const favList = Array.isArray(favoritesData) ? favoritesData : [];
        setIsFavorite(favList.some((fav: any) => fav.id === id));
      } catch (err) {
        console.error('Failed to fetch word or favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id]);

  const toggleFavorite = async () => {
    if (!token) return;

    try {
      if (isFavorite) {
        await UserService.removeFavorite(id, token);
        setIsFavorite(false);
      } else {
        await UserService.addFavorite(id, token);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!word) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.notFoundText}>Word not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <Text style={styles.title}>{word.japanese || '-'}</Text>
          <TouchableOpacity onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={28}
              color={isFavorite ? 'red' : Colors.primary}
            />
          </TouchableOpacity>
        </View>

        {word.subTerm && <Text style={styles.subTerm}>({word.subTerm})</Text>}

        <View style={styles.row}>
          <Text style={styles.label}>English:</Text>
          <Text style={styles.value}>{word.english || '-'}</Text>
        </View>

        {word.myanmar && (
          <View style={styles.row}>
            <Text style={styles.label}>Myanmar:</Text>
            <Text style={styles.value}>{word.myanmar || '-'}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? 0 : 0,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  notFoundText: { fontSize: 18, color: Colors.grayLight },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { fontSize: 16, color: Colors.primary, marginLeft: 6 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.primary },
  subTerm: { fontSize: 18, color: Colors.grayLight, marginBottom: 20 },
  row: { flexDirection: 'row', marginBottom: 14 },
  label: { fontWeight: 'bold', fontSize: 16, width: 100, color: Colors.primary },
  value: { fontSize: 16, flex: 1, color: '#333' },
});
