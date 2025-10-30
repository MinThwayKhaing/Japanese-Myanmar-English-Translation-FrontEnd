import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WordService } from '../services/wordService';
import { UserService } from '../services/UserService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
export default function SearchScreen() {
    const navigation = useNavigation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const isMounted = useRef(true); // for safe cleanup
    // ✅ Fetch favorites when screen is focused
    useFocusEffect(React.useCallback(() => {
        let isActive = true;
        const fetchFavorites = async () => {
            const token = await AsyncStorage.getItem('token');
            if (!token)
                return;
            try {
                const favs = await UserService.getFavorites(token);
                if (isActive && Array.isArray(favs)) {
                    setFavorites(favs.map((f) => f.id));
                }
            }
            catch (err) {
                console.error('Error loading favorites:', err);
            }
        };
        fetchFavorites();
        return () => {
            isActive = false;
        };
    }, [navigation]));
    // ✅ Handle search query
    useEffect(() => {
        if (query.trim() === '') {
            setResults([]);
            return;
        }
        const timeout = setTimeout(async () => {
            if (!isMounted.current)
                return;
            setLoading(true);
            try {
                const data = await WordService.searchWords(query);
                if (isMounted.current) {
                    setResults(Array.isArray(data) ? data : []);
                }
            }
            catch (error) {
                console.error('Search error:', error);
                if (isMounted.current)
                    setResults([]);
            }
            finally {
                if (isMounted.current)
                    setLoading(false);
            }
        }, 400);
        return () => clearTimeout(timeout);
    }, [query]);
    // ✅ Toggle favorite handler
    const toggleFavorite = async (wordId) => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            alert('Please log in to save favorites');
            return;
        }
        try {
            if (favorites.includes(wordId)) {
                await UserService.removeFavorite(wordId, token);
                setFavorites((prev) => prev.filter((id) => id !== wordId));
            }
            else {
                await UserService.addFavorite(wordId, token);
                setFavorites((prev) => [...prev, wordId]);
            }
        }
        catch (err) {
            console.error('Favorite toggle failed:', err);
        }
    };
    // ✅ Cleanup memory when screen unmounts
    useEffect(() => {
        return () => {
            isMounted.current = false;
            setQuery('');
            setResults([]);
            setFavorites([]);
            setLoading(false);
        };
    }, []);
    return (<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Image source={require('../../assets/logo.png')} style={styles.logo}/>

      <TextInput placeholder="Search Japanese, English, or Myanmar..." placeholderTextColor="#888" style={styles.input} value={query} onChangeText={setQuery}/>

      {loading && <ActivityIndicator size="large" color="#1A374D" style={{ marginTop: 20 }}/>}

      {!loading && results.length === 0 && query !== '' && (<Text style={styles.noResult}>No results found for "{query}"</Text>)}

      <FlatList data={results} keyExtractor={(item, index) => item.id || index.toString()} renderItem={({ item }) => {
            const isFav = favorites.includes(item.id);
            return (<View style={styles.card}>
              <TouchableOpacity activeOpacity={0.8} style={{ flex: 1 }} onPress={() => navigation.navigate('UserWordDetail', { id: item.id })}>
                <View style={styles.wordContainer}>
                  <Text style={styles.japaneseText}>
                    {item.japanese}
                    {item.subTerm ? <Text style={styles.subTermText}>（{item.subTerm}）</Text> : null}
                  </Text>
                  {item.myanmar ? <Text style={styles.myanmarText}>{item.myanmar}</Text> : null}
                  {item.english ? <Text style={styles.englishText}>{item.english}</Text> : null}
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                <Icon name={isFav ? 'heart' : 'heart-outline'} size={26} color={isFav ? '#E63946' : '#999'} style={{ marginLeft: 8 }}/>
              </TouchableOpacity>
            </View>);
        }}/>
    </KeyboardAvoidingView>);
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFBF6', padding: 16 },
    logo: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginVertical: 30 },
    input: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 15,
        marginBottom: 10,
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
        justifyContent: 'space-between',
    },
    wordContainer: { alignItems: 'flex-start', flex: 1 },
    japaneseText: { fontSize: 24, fontWeight: 'bold', color: '#1A374D' },
    subTermText: { fontSize: 16, color: '#666', fontWeight: '400' },
    myanmarText: { fontSize: 18, color: '#333', marginTop: 6 },
    englishText: { fontSize: 17, color: '#555', marginTop: 4 },
});
//# sourceMappingURL=SearchScreen.js.map