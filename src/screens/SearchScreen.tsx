import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WordService } from '../services/wordService';
import { UserService } from '../services/UserService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import KanjiDrawer from '../components/KanjiDrawer';
import { Colors } from '../constants/colors';

export default function SearchScreen() {
  const navigation = useNavigation<any>();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);

  const isMounted = useRef(true);
  const inputRef = useRef<TextInput>(null);

  /* ---------------- FAVORITES ---------------- */
  useFocusEffect(
    React.useCallback(() => {
      let active = true;

      const fetchFavorites = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        try {
          const favs = await UserService.getFavorites(token);
          if (active && Array.isArray(favs)) {
            setFavorites(favs.map((f: any) => f.id));
          }
        } catch (err) {
          console.error(err);
        }
      };

      fetchFavorites();
      return () => {
        active = false;
      };
    }, [])
  );

  /* ---------------- SEARCH ---------------- */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      if (!isMounted.current) return;
      setLoading(true);
      try {
        const data = await WordService.searchWords(query);
        if (isMounted.current) {
          setResults(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
        if (isMounted.current) setResults([]);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [query]);

  /* ---------------- FAVORITE ---------------- */
  const toggleFavorite = async (wordId: string) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    if (favorites.includes(wordId)) {
      await UserService.removeFavorite(wordId, token);
      setFavorites((p) => p.filter((id) => id !== wordId));
    } else {
      await UserService.addFavorite(wordId, token);
      setFavorites((p) => [...p, wordId]);
    }
  };

  /* ---------------- KANJI HANDLER ---------------- */
  const handleKanjiRecognized = (kanji: string) => {
    setQuery((prev) => prev + kanji);
    setShowDrawer(false);
    inputRef.current?.focus();
  };

  const toggleDrawer = () => {
    if (!showDrawer) {
      Keyboard.dismiss();
    }
    setShowDrawer((p) => !p);
  };

  /* ---------------- CLEANUP ---------------- */
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Image source={require('../../assets/logo.png')} style={styles.logo} />

      {/* 🔍 Search Input with Kanji Icon */}
      <View style={styles.inputWrapper}>
        <TextInput
          ref={inputRef}
          placeholder="Search Japanese, English, or Myanmar..."
          placeholderTextColor="#888"
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setShowDrawer(false)}
        />

        <TouchableOpacity onPress={toggleDrawer} style={styles.kanjiIcon}>
          <Icon name="draw" size={22} color="#1A374D" />
        </TouchableOpacity>
      </View>

      {/* ✍️ Kanji Drawer */}
      {showDrawer && <KanjiDrawer onRecognized={handleKanjiRecognized} />}

      {loading && <ActivityIndicator size="large" color="#1A374D" style={{ marginTop: 20 }} />}

      {!loading && results.length === 0 && query !== '' && (
        <Text style={styles.noResult}>No results found for "{query}"</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isFav = favorites.includes(item.id);
          return (
            <View style={styles.card}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => navigation.navigate('UserWordDetail', { id: item.id })}
              >
                <Text style={styles.japaneseText}>{item.japanese}</Text>
                {item.myanmar && <Text style={styles.myanmarText}>{item.myanmar}</Text>}
                {item.english && <Text style={styles.englishText}>{item.english}</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                <Icon
                  name={isFav ? 'heart' : 'heart-outline'}
                  size={26}
                  color={isFav ? '#E63946' : '#999'}
                />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,     backgroundColor:  Colors.background  ,  paddingHorizontal: 16,
    padding: 20,},
  logo: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginVertical: 30 },

  inputWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingRight: 45,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  kanjiIcon: {
    position: 'absolute',
    right: 12,
    top: 10,
  },

  noResult: { textAlign: 'center', color: '#999', marginTop: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  japaneseText: { fontSize: 24, fontWeight: 'bold', color: '#1A374D' },
  myanmarText: { fontSize: 18, marginTop: 6 },
  englishText: { fontSize: 17, marginTop: 4 },
});
