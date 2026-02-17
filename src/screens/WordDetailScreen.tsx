// src/screens/WordDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { WordService } from '../services/wordService';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export default function WordDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const [word, setWord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchWord = async () => {
      try {
        const data = await WordService.getWordByID(id);
        if (data) setWord(data);
      } catch (err) {
        console.error('Error loading word:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWord();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!word) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Word not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Word Detail</Text>
      </View>

      {/* Word Card */}
      <View style={styles.card}>
        <Text style={styles.term}>{word.japanese || '-'}</Text>
        <Text style={styles.subTerm}>{word.subTerm || '-'}</Text>
        <Text style={styles.translation}>English: {word.english || '-'}</Text>
        <Text style={styles.translation}>Myanmar: {word.myanmar || '-'}</Text>

        <TouchableOpacity
          style={[styles.favoriteButton, isFavorite && styles.favoriteActive]}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={28} color="white" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 16,
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
  term: { fontSize: 26, fontWeight: 'bold', color: Colors.primary },
  subTerm: { fontSize: 20, color: '#555', marginTop: 4 },
  translation: { fontSize: 16, color: '#333', marginTop: 8 },
  favoriteButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  favoriteActive: {
    backgroundColor: '#E63946',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
