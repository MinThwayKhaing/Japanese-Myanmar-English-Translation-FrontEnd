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
  Modal,
  Dimensions,
  Linking,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
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
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

        if (wordData) setWord(wordData);

        const favList = Array.isArray(favoritesData) ? favoritesData : [];
        setIsFavorite(favList.some((fav: any) => fav?.id === id));
      } catch (err: any) {
        if (err?.message === 'SEARCH_LIMIT_REACHED') {
          setLimitReached(true);
        } else {
          console.error('Failed to fetch word:', err);
        }
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

  if (limitReached) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Word Detail</Text>
        </View>
        <View style={styles.limitBanner}>
          <Ionicons name="alert-circle-outline" size={28} color="#E63946" />
          <Text style={styles.limitText}>
            You have reached your daily usage limit. For continued access, please contact our support team.
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Linking.openURL('https://www.facebook.com/share/17dbopheid/?mibextid=wwXIfr')}
          >
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
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
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setImageModalVisible(true)}
            >
              <Image source={{ uri: word.imageUrl }} style={styles.image} />
            </TouchableOpacity>
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

      {/* Fullscreen Zoomable Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          {/* @ts-ignore: children prop works at runtime */}
          <ImageZoom
            cropWidth={screenWidth}
            cropHeight={screenHeight}
            imageWidth={screenWidth}
            imageHeight={screenHeight * 0.6}
            minScale={1}
            maxScale={5}
            enableSwipeDown
            onSwipeDown={() => setImageModalVisible(false)}
          >
            <Image
              source={{ uri: word.imageUrl }}
              style={{
                width: screenWidth,
                height: screenHeight * 0.6,
              }}
              resizeMode="contain"
            />
          </ImageZoom>
        </View>
      </Modal>
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
  limitBanner: {
    backgroundColor: '#FFF3F3',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  limitText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 14,
    lineHeight: 22,
  },
  contactButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 6,
  },
});
