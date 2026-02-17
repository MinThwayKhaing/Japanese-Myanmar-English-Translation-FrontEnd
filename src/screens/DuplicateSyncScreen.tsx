import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { WordService } from '../services/wordService';
import { useNavigation } from '@react-navigation/native';

interface DupWord {
  _id: string;
  english: string;
  japanese: string;
  myanmar: string;
  subTerm: string;
  ignore: boolean;
  createdAt: string;
}

interface DupGroup {
  _id: { english: string; japanese: string; subTerm: string };
  count: number;
  words: DupWord[];
}

const DuplicateSyncScreen = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const [groups, setGroups] = useState<DupGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalGroups, setTotalGroups] = useState(0);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({ japanese: '', english: '', myanmar: '', subTerm: '' });
  const [saving, setSaving] = useState(false);
  const [ignoring, setIgnoring] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getWordId = (id: any): string => {
    if (typeof id === 'string') return id;
    if (id?.$oid) return id.$oid;
    if (id?.toString) return id.toString();
    return String(id);
  };

  const copyId = (id: any) => {
    const idStr = getWordId(id);
    Alert.alert('Object ID', idStr);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setExpandedGroup(null);
      setEditingWordId(null);
      fetchDuplicates(1, false, text);
    }, 400);
  };

  const handleIgnore = async (wordId: string, groupKey: string) => {
    setIgnoring(wordId);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      await WordService.setWordIgnore(wordId, true, token);
      // Remove word from local state (it's now ignored, won't appear in duplicates)
      setGroups(prev =>
        prev
          .map(g => {
            const gKey = `${g._id.english || ''}_${g._id.japanese || ''}_${g._id.subTerm || ''}`;
            if (gKey === groupKey) {
              const filtered = g.words.filter(w => w._id !== wordId);
              return { ...g, words: filtered, count: filtered.length };
            }
            return g;
          })
          .filter(g => g.count > 1)
      );
    } catch {
      Alert.alert('Error', 'Failed to mark word as ignored.');
    } finally {
      setIgnoring(null);
    }
  };

  const startEditing = (word: DupWord) => {
    setEditingWordId(word._id);
    setEditFields({
      japanese: word.japanese || '',
      english: word.english || '',
      myanmar: word.myanmar || '',
      subTerm: word.subTerm || '',
    });
  };

  const cancelEditing = () => {
    setEditingWordId(null);
    setEditFields({ japanese: '', english: '', myanmar: '', subTerm: '' });
  };

  const handleSaveEdit = async (wordId: string, groupKey: string) => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const formData = new FormData();
      formData.append('japanese', editFields.japanese);
      formData.append('english', editFields.english);
      formData.append('myanmar', editFields.myanmar);
      formData.append('subTerm', editFields.subTerm);
      await WordService.updateWord(wordId, formData, token);
      // Update local state
      setGroups(prev =>
        prev.map(g => {
          const gKey = `${g._id.english || ''}_${g._id.japanese || ''}_${g._id.subTerm || ''}`;
          if (gKey === groupKey) {
            return {
              ...g,
              words: g.words.map(w =>
                w._id === wordId
                  ? { ...w, ...editFields }
                  : w
              ),
            };
          }
          return g;
        })
      );
      setEditingWordId(null);
      Alert.alert('Success', 'Word updated successfully.');
    } catch {
      Alert.alert('Error', 'Failed to update word.');
    } finally {
      setSaving(false);
    }
  };

  const fetchDuplicates = useCallback(async (pageNum: number, append = false, query = '') => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const data = await WordService.getDuplicateWords(pageNum, 10, token, query);
      const newGroups = Array.isArray(data.groups) ? data.groups : [];
      setGroups(prev => append ? [...prev, ...newGroups] : newGroups);
      setHasMore(data.hasMore);
      setTotalGroups(data.totalGroups);
      setPage(pageNum);
    } catch {
      Alert.alert('Error', 'Failed to fetch duplicates.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchDuplicates(1);
  }, [fetchDuplicates]);

  const handleDelete = async (wordId: string, groupKey: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this duplicate?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(wordId);
          try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;
            await WordService.deleteWord(wordId, token);
            // Remove from local state
            setGroups(prev =>
              prev
                .map(g => {
                  const gKey = `${g._id.english || ''}_${g._id.japanese || ''}_${g._id.subTerm || ''}`;
                  if (gKey === groupKey) {
                    const filtered = g.words.filter(w => w._id !== wordId);
                    return { ...g, words: filtered, count: filtered.length };
                  }
                  return g;
                })
                .filter(g => g.count > 1)
            );
          } catch {
            Alert.alert('Error', 'Failed to delete word.');
          } finally {
            setDeleting(null);
          }
        },
      },
    ]);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchDuplicates(page + 1, true, searchQuery);
    }
  };

  const getGroupKey = (g: DupGroup, index?: number) =>
    `${g._id.english || ''}_${g._id.japanese || ''}_${g._id.subTerm || ''}${index !== undefined ? `_${index}` : ''}`;

  const renderGroup = ({ item }: { item: DupGroup }) => {
    const key = getGroupKey(item);
    const isExpanded = expandedGroup === key;

    return (
      <View style={styles.groupCard}>
        <TouchableOpacity
          style={styles.groupHeader}
          onPress={() => setExpandedGroup(isExpanded ? null : key)}
          activeOpacity={0.7}
        >
          <View style={styles.groupInfo}>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{item.count}</Text>
            </View>
            <View style={styles.groupDetails}>
              {!!item._id.japanese && (
                <Text style={styles.japaneseText} numberOfLines={1}>{item._id.japanese}</Text>
              )}
              {!!item._id.english && (
                <Text style={styles.englishText} numberOfLines={1}>{item._id.english}</Text>
              )}
              {!!item._id.subTerm && (
                <Text style={styles.subTermText} numberOfLines={1}>{item._id.subTerm}</Text>
              )}
            </View>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Colors.grayLight}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.wordsList}>
            {item.words.map((word, idx) => {
              const isEditing = editingWordId === word._id;
              return (
                <View key={word._id} style={styles.wordRow}>
                  {isEditing ? (
                    <View style={styles.editContainer}>
                      <Text style={styles.wordIndex}>#{idx + 1}</Text>
                      <View style={styles.editFields}>
                        <View style={styles.editFieldRow}>
                          <Text style={styles.editLabel}>JP</Text>
                          <TextInput
                            style={styles.editInput}
                            value={editFields.japanese}
                            onChangeText={(t) => setEditFields(f => ({ ...f, japanese: t }))}
                            placeholder="Japanese"
                          />
                        </View>
                        <View style={styles.editFieldRow}>
                          <Text style={styles.editLabel}>EN</Text>
                          <TextInput
                            style={styles.editInput}
                            value={editFields.english}
                            onChangeText={(t) => setEditFields(f => ({ ...f, english: t }))}
                            placeholder="English"
                          />
                        </View>
                        <View style={styles.editFieldRow}>
                          <Text style={styles.editLabel}>MM</Text>
                          <TextInput
                            style={styles.editInput}
                            value={editFields.myanmar}
                            onChangeText={(t) => setEditFields(f => ({ ...f, myanmar: t }))}
                            placeholder="Myanmar"
                          />
                        </View>
                        <View style={styles.editFieldRow}>
                          <Text style={styles.editLabel}>Sub</Text>
                          <TextInput
                            style={styles.editInput}
                            value={editFields.subTerm}
                            onChangeText={(t) => setEditFields(f => ({ ...f, subTerm: t }))}
                            placeholder="SubTerm"
                          />
                        </View>
                        <View style={styles.editActions}>
                          <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={cancelEditing}
                            disabled={saving}
                          >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={() => handleSaveEdit(word._id, key)}
                            disabled={saving}
                          >
                            {saving ? (
                              <ActivityIndicator size="small" color={Colors.white} />
                            ) : (
                              <Text style={styles.saveBtnText}>Save</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={styles.wordInfo}>
                        <Text style={styles.wordIndex}>#{idx + 1}</Text>
                        <View style={styles.wordDetails}>
                          <Text style={styles.wordJp}>{word.japanese}</Text>
                          <Text style={styles.wordEn}>{word.english}</Text>
                          {!!word.myanmar && <Text style={styles.wordMm}>{word.myanmar}</Text>}
                          {!!word.subTerm && <Text style={styles.wordSub}>Sub: {word.subTerm}</Text>}
                          <TouchableOpacity onPress={() => copyId(word._id)} style={styles.idRow}>
                            <Text style={styles.wordId} selectable>ID: {getWordId(word._id)}</Text>
                            <Ionicons name="copy-outline" size={12} color={Colors.grayLight} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.actionBtns}>
                        <TouchableOpacity
                          style={styles.editBtn}
                          onPress={() => startEditing(word)}
                        >
                          <Ionicons name="create-outline" size={20} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.ignoreBtn}
                          onPress={() => handleIgnore(word._id, key)}
                          disabled={ignoring === word._id}
                        >
                          {ignoring === word._id ? (
                            <ActivityIndicator size="small" color="#f59e0b" />
                          ) : (
                            <Ionicons name="eye-off-outline" size={20} color="#f59e0b" />
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleDelete(word._id, key)}
                          disabled={deleting === word._id}
                        >
                          {deleting === word._id ? (
                            <ActivityIndicator size="small" color={Colors.error} />
                          ) : (
                            <Ionicons name="trash-outline" size={20} color={Colors.error} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { fontSize: Math.min(22, width * 0.055) }]}>
          Duplicate Sync
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.grayLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search duplicates..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={Colors.grayLight}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.grayLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      {!loading && (
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Ionicons name="copy-outline" size={16} color={Colors.primary} />
            <Text style={styles.statText}>{totalGroups} duplicate groups</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => {
              setExpandedGroup(null);
              fetchDuplicates(1, false, searchQuery);
            }}
          >
            <Ionicons name="refresh" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={48} color={Colors.success} />
          <Text style={styles.emptyText}>No duplicates found!</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item, index) => getGroupKey(item, index)}
          renderItem={renderGroup}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 16 }} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

export default DuplicateSyncScreen;

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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: '2%',
    marginBottom: 10,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '3%',
    marginBottom: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  refreshBtn: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  listContent: {
    paddingHorizontal: '2%',
    paddingBottom: 40,
  },
  groupCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  countText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  groupDetails: {
    flex: 1,
  },
  japaneseText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  englishText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  subTermText: {
    fontSize: 12,
    color: Colors.grayLight,
    marginTop: 1,
  },
  wordsList: {
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  wordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  wordIndex: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.grayLight,
    width: 28,
  },
  wordDetails: {
    flex: 1,
  },
  wordJp: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  wordEn: {
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 1,
  },
  wordMm: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  wordId: {
    fontSize: 10,
    color: Colors.grayLight,
    marginRight: 4,
  },
  deleteBtn: {
    padding: 8,
  },
  actionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  editBtn: {
    padding: 8,
  },
  ignoreBtn: {
    padding: 8,
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  editFields: {
    flex: 1,
  },
  editFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  editLabel: {
    width: 32,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.grayLight,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    marginRight: 8,
  },
  cancelBtnText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  saveBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  saveBtnText: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: '600',
  },
  wordSub: {
    fontSize: 12,
    color: Colors.grayLight,
    marginTop: 1,
  },
});
