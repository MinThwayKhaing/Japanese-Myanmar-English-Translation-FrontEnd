import React, {  useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { WordService, Word } from '../services/wordService';
import { Colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../navigation/types';
import { useFocusEffect } from '@react-navigation/native';

const PAGE_LIMIT = 10;

type ManageWordsNavProp = NativeStackNavigationProp<
  AdminStackParamList,
  'ManageWordsScreen'
>;

// Simple debounce
const debounce = (func: Function, delay: number) => {
  let timer: any;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const ManageWordsScreen = () => {
  const navigation = useNavigation<ManageWordsNavProp>();
  const [words, setWords] = useState<Word[]>([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
const [totalCount, setTotalCount] = useState(0);

useFocusEffect(
  useCallback(() => {
    let isActive = true;

    const fetchData = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (isActive) {
        setToken(storedToken);
        if (storedToken) {
          fetchWords(1, query, storedToken);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false; // cleanup
    };
  }, [query])
);


  const fetchWords = async (
    pageNumber: number,
    search = '',
    authToken = token || ''
  ) => {
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      const data = await WordService.getAllWords(
        pageNumber,
        PAGE_LIMIT,
        search,
        authToken
      );

      if (data && Array.isArray(data.words)) {

        setWords(pageNumber === 1 ? data.words : [...words, ...data.words]);
        setHasMore(data.hasMore);
          setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch words:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((text: string, authToken: string) => {
      setPage(1);
      fetchWords(1, text, authToken);
    }, 500),
    []
  );

  const handleSearchChange = (text: string) => {
    setQuery(text);
    if (token) debouncedSearch(text, token);
  };

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchWords(nextPage, query);
  };

  const handleEdit = (item: Word) => {
    navigation.navigate('EditWordScreen', { word: item });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this word?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (token) {
            try {
              await WordService.deleteWord(id, token);
              setWords(words.filter((w) => w._id !== id));
            } catch (err) {
              console.error('Delete failed:', err);
              Alert.alert('Error', 'Failed to delete word.');
            }
          }
        },
      },
    ]);
  };
const handleUploadExcel = async () => {
  if (!token) {
    Alert.alert('Error', 'Authentication required');
    return;
  }

  try {
    const res = await DocumentPicker.getDocumentAsync({
      type: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        '.xlsx',
        '.xls',
      ],
      copyToCacheDirectory: true,
    });

    if (res.canceled) {
      console.log('User cancelled document picker');
      return;
    }

    if (res.assets && res.assets.length > 0) {
      const file = res.assets[0];
      const uploadFile = {
        uri: file.uri,
        name: file.name || 'words.xlsx',
        type: file.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };

      Alert.alert('Uploading', 'Please wait while we process your Excel file...', [], { cancelable: false });

      const response = await WordService.uploadExcelWords(uploadFile, token);
      Alert.alert('Success', response.message);
      fetchWords(1, query, token);
    }
  } catch (err: any) {
    console.error('Excel upload failed:', err);
    
    let errorMessage = 'Failed to upload Excel file. Please try again.';
    
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.code === 'ECONNABORTED') {
      errorMessage = 'Upload timeout. Please try again.';
    }
    
    Alert.alert('Upload Failed', errorMessage);
  }
};
  const renderItem = ({ item }: { item: Word }) => (
    <View style={styles.wordRow}>
<View style={{ flex: 1 }}>
  <Text style={styles.wordTerm}>Kanji: {item.japanese || '-'}</Text>
  <Text style={styles.description}>Hiragana: {item.subTerm || '-'}</Text>
  <Text style={styles.translation}>English: {item.english || '-'}</Text>
  <Text style={styles.translation}>Myanmar: {item.myanmar || '-'}</Text>
</View>


      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
          <Ionicons name="create-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id!)} style={styles.iconBtn}>
          <Ionicons name="trash-outline" size={22} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Manage Words</Text>
      </View>
    {totalCount > 0 && (
  <Text style={{ marginHorizontal: 16, marginVertical: 10, fontSize: 16, fontWeight: '600', color: Colors.primary }}>
    Total Words: {totalCount}
  </Text>
)}

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" style={{ marginRight: 6 }} />
        <TextInput
          placeholder="Search words..."
          style={styles.searchInput}
          value={query}
          onChangeText={handleSearchChange}
        />
      </View>

      <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 10 }}>
          <TouchableOpacity
    style={[styles.uploadButton, { marginRight: 10, backgroundColor: '#1A374D' }]}
    onPress={() => navigation.navigate('CreateWordScreen' as never)}
  >
    <Text style={styles.uploadText}>Create Word</Text>
  </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadExcel}>
          <Text style={styles.uploadText}>Upload Excel</Text>
        </TouchableOpacity>
      </View>

      {loading && page === 1 ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 30 }} />
      ) : words.length === 0 ? (
        <Text style={styles.emptyText}>No words found.</Text>
      ) : (
        <FlatList
          data={words}
          renderItem={renderItem}
          keyExtractor={(item) => item._id || Math.random().toString()}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={Colors.primary} /> : null}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
};

export default ManageWordsScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor:  Colors.background,
    paddingHorizontal: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
    marginHorizontal: 16,
  },
  headerText: { fontSize: 22, fontWeight: 'bold', color: Colors.primary },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.5,
  },
  wordTerm: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  translation: { fontSize: 16, color: '#333', marginTop: 2 },
  description: { fontSize: 14, color: '#666', marginTop: 2 },
  iconContainer: { flexDirection: 'row', marginLeft: 10 },
  iconBtn: { marginLeft: 12 },
  separator: { height: 1, backgroundColor: '#EAEAEA', marginHorizontal: 16 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
  uploadButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  uploadText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
