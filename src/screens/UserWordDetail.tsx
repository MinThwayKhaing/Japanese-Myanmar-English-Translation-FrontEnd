import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
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
      alert('Failed to update favorite status.');
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Word Detail</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}>
          {word.imageUrl ? (
            <Image source={{ uri: word.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.noImageBox}>
              <Ionicons name="image-outline" size={60} color={Colors.grayLight} />
              <Text style={{ color: Colors.grayLight }}>No Image</Text>
            </View>
          )}

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
        </View>
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
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 16 },
  headerText: { fontSize: 22, fontWeight: 'bold', color: Colors.primary, marginLeft: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: { width: '100%', height: 220, borderRadius: 10, marginBottom: 20 },
  noImageBox: {
    width: '100%',
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 26, fontWeight: 'bold', color: Colors.primary },
  subTerm: { fontSize: 16, color: Colors.grayLight, marginBottom: 16 },
  row: { flexDirection: 'row', marginBottom: 10 },
  label: { fontWeight: 'bold', fontSize: 16, width: 100, color: Colors.primary },
  value: { fontSize: 16, flex: 1, color: '#333' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  notFoundText: { fontSize: 18, color: Colors.grayLight },
});
