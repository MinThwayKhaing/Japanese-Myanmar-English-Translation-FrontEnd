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
import * as Speech from 'expo-speech';

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
        console.error('Failed to fetch word:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id]);

  // 🔊 Japanese Text-to-Speech
  const speakJapanese = (text?: string) => {
    if (!text) return;

    Speech.stop();
    Speech.speak(text, {
      language: 'ja-JP',
      rate: 0.9,
      pitch: 1.0,
    });
  };

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
      console.error('Favorite error:', error);
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
            <Image source={{ uri: word.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.noImageBox}>
              <Ionicons name="image-outline" size={60} color={Colors.grayLight} />
              <Text style={{ color: Colors.grayLight }}>No Image</Text>
            </View>
          )}

          {/* Japanese title + speaker */}
          <View style={styles.titleRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.title}>{word.japanese || '-'}</Text>

              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => speakJapanese(word.japanese)}
              >
                <Ionicons
                  name="volume-high-outline"
                  size={26}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={toggleFavorite}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={28}
                color={isFavorite ? 'red' : Colors.primary}
              />
            </TouchableOpacity>
          </View>

          {word.subTerm && (
            <Text style={styles.subTerm}>({word.subTerm})</Text>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>English:</Text>
            <Text style={styles.value}>{word.english}</Text>
          </View>

          {word.myanmar && (
            <View style={styles.row}>
              <Text style={styles.label}>Myanmar:</Text>
              <Text style={styles.value}>{word.myanmar}</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 20,
  },
  noImageBox: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subTerm: {
    fontSize: 16,
    color: Colors.grayLight,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    width: 100,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  value: {
    flex: 1,
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.grayLight,
  },
});
