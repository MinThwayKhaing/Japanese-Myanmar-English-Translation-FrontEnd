// src/screens/FavouriteScreen.tsx
import React, { useEffect, useState,useCallback  } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { UserService } from '../services/UserService';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/colors';
const PAGE_LIMIT = 10;

const FavouriteScreen = () => {
  const navigation = useNavigation<any>();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [token, setToken] = useState<string | null>(null);
    const loadFavorites = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const data = await UserService.getFavorites(token);
      setFavorites(data || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );
  useEffect(() => {
    const init = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) return;
      setToken(storedToken);
      fetchFavorites(storedToken, 1);
    };
    init();
  }, []);

  const fetchFavorites = async (token: string, pageNumber: number) => {
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      const data = await UserService.getFavoritesPaginated(pageNumber, PAGE_LIMIT, token);
      const newFavs = Array.isArray(data.favorites) ? data.favorites : [];

      setFavorites(pageNumber === 1 ? newFavs : [...favorites, ...newFavs]);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!hasMore || loadingMore || !token) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFavorites(token, nextPage);
  };

  const removeFavorite = async (wordId: string) => {
    if (!token) return;
    try {
      await UserService.removeFavorite(wordId, token);
      setFavorites((prev) => prev.filter((item) => item.id !== wordId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.wordRow}>
      <TouchableOpacity
        style={styles.wordContainer}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('UserWordDetail', { id: item.id })}
      >
        <Text style={styles.japaneseText}>
          {item.japanese}
          {item.subTerm ? <Text style={styles.subTermText}>（{item.subTerm}）</Text> : null}
        </Text>
        {item.myanmar && <Text style={styles.myanmarText}>{item.myanmar}</Text>}
        {item.english && <Text style={styles.englishText}>{item.english}</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => removeFavorite(item.id)}>
        <Ionicons name="heart" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Favourite Words</Text>
      </View>

      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#1A374D" style={{ marginTop: 30 }} />
      ) : favorites.length === 0 ? (
        <Text style={styles.emptyText}>You haven’t added any favorites yet.</Text>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#1A374D" /> : null}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
};

export default FavouriteScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor:  Colors.background,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 0 : 0,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A374D',
  },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  wordContainer: { flex: 1 },
  japaneseText: { fontSize: 22, fontWeight: 'bold', color: '#1A374D' },
  subTermText: { fontSize: 16, color: '#666', fontWeight: '400' },
  myanmarText: { fontSize: 18, color: '#333', marginTop: 4 },
  englishText: { fontSize: 16, color: '#555', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#DDD', marginHorizontal: 8 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
});
