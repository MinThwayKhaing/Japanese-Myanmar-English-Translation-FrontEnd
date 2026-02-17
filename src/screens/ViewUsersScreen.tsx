import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { UserService } from '../services/UserService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../navigation/types';

type NavProp = NativeStackNavigationProp<AdminStackParamList, 'UpdateCustomerWordsScreen'>;

interface UserResult {
  id: string;
  email: string;
  subscription?: {
    searchesLeft?: number;
  };
}

const UpdateCustomerWordsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { width } = useWindowDimensions();

  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [addWords, setAddWords] = useState('');
  const [updating, setUpdating] = useState(false);
  const [searched, setSearched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live search as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setUsers([]);
      setSearched(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setSelectedUser(null);
      setAddWords('');
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        const result = await UserService.searchUsers(searchQuery.trim(), token);
        setUsers(Array.isArray(result) ? result : []);
        setSearched(true);
      } catch {
        setUsers([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const currentWords = selectedUser?.subscription?.searchesLeft ?? 0;
  const addWordsNum = parseInt(addWords, 10) || 0;
  const totalWords = currentWords + addWordsNum;

  const handleUpdate = async () => {
    if (!selectedUser) return;
    if (!addWords.trim() || addWordsNum === 0) {
      Alert.alert('Error', 'Please enter a number of words to add.');
      return;
    }
    if (totalWords < 0) {
      Alert.alert('Error', 'Total words cannot be negative.');
      return;
    }
    setUpdating(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      await UserService.updateSearchesLeft(selectedUser.id, totalWords, token);
      Alert.alert('Success', `Words updated to ${totalWords} for ${selectedUser.email}`);
      setSelectedUser(null);
      setAddWords('');
      // Re-search to show updated values
      const result = await UserService.searchUsers(searchQuery.trim(), token);
      setUsers(Array.isArray(result) ? result : []);
    } catch {
      Alert.alert('Error', 'Failed to update words count.');
    } finally {
      setUpdating(false);
    }
  };

  const inputWidth = Math.min(width - 32, 600);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { fontSize: Math.min(22, width * 0.055) }]}>
            Update Customer Words
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchRow, { maxWidth: inputWidth }]}>
            <Ionicons name="search" size={18} color={Colors.grayLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by email or user ID..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              keyboardType="default"
              returnKeyType="search"
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color={Colors.grayLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading && <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />}

        {!loading && users.length === 0 && searched && (
          <Text style={styles.noResult}>No users found.</Text>
        )}

        {/* User List */}
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const isSelected = selectedUser?.id === item.id;
            const itemCurrentWords = item.subscription?.searchesLeft ?? 0;
            return (
              <TouchableOpacity
                style={[styles.userCard, isSelected && styles.userCardSelected]}
                onPress={() => {
                  if (isSelected) {
                    setSelectedUser(null);
                    setAddWords('');
                  } else {
                    setSelectedUser(item);
                    setAddWords('');
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.userInfo}>
                  <View style={styles.userIconContainer}>
                    <Ionicons name="person-circle-outline" size={28} color={Colors.primary} />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userEmail} numberOfLines={1}>
                      {item.email}
                    </Text>
                    <Text style={styles.userId} numberOfLines={1}>
                      ID: {item.id}
                    </Text>
                    <Text style={styles.userWords}>
                      Words left: {itemCurrentWords}
                    </Text>
                  </View>
                </View>

                {isSelected && (
                  <View style={styles.updateSection}>
                    <View style={styles.calculationRow}>
                      <View style={styles.calcItem}>
                        <Text style={styles.calcLabel}>Current</Text>
                        <Text style={styles.calcValue}>{currentWords}</Text>
                      </View>
                      <Text style={styles.calcOperator}>+</Text>
                      <View style={styles.calcItem}>
                        <Text style={styles.calcLabel}>Add Words</Text>
                        <TextInput
                          style={styles.addWordsInput}
                          value={addWords}
                          onChangeText={setAddWords}
                          keyboardType="number-pad"
                          placeholder="0"
                          placeholderTextColor="#bbb"
                        />
                      </View>
                      <Text style={styles.calcOperator}>=</Text>
                      <View style={styles.calcItem}>
                        <Text style={styles.calcLabel}>Total</Text>
                        <Text style={[styles.calcValue, styles.totalValue]}>{totalWords}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.updateButton, updating && { opacity: 0.6 }]}
                      onPress={handleUpdate}
                      disabled={updating}
                    >
                      {updating ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : (
                        <Text style={styles.updateButtonText}>Update</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UpdateCustomerWordsScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: '4%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
    paddingHorizontal: '2%',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerText: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  searchContainer: {
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: '2%',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  clearButton: {
    padding: 4,
  },
  noResult: {
    textAlign: 'center',
    color: Colors.grayLight,
    marginTop: 20,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: '2%',
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: '4%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  userCardSelected: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIconContainer: {
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
  },
  userEmail: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  userId: {
    fontSize: 11,
    color: Colors.grayLight,
    marginTop: 1,
  },
  userWords: {
    fontSize: 13,
    color: Colors.grayLight,
    marginTop: 2,
  },
  updateSection: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
    paddingTop: 14,
  },
  calculationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  calcItem: {
    alignItems: 'center',
    flex: 1,
  },
  calcLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  calcValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    minHeight: 40,
    textAlignVertical: 'center',
    lineHeight: 40,
  },
  totalValue: {
    color: Colors.primary,
  },
  calcOperator: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.grayLight,
    marginHorizontal: 4,
    marginTop: 14,
  },
  addWordsInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    minWidth: 60,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    color: Colors.textPrimary,
  },
  updateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  updateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
