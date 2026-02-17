import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';

const AdminPanelScreen = () => {
  const { setAuth } = useContext(AuthContext);
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const handleLogout = async () => {
    try {
      await setAuth(null, null);
      Alert.alert('Logged out', 'You have been logged out successfully.');
    } catch (err) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const sections = [
    {
      title: 'Dictionary Management',
      items: [
        {
          title: 'Manage Words',
          desc: 'View, add, edit, or delete dictionary entries.',
          screen: 'ManageWordsScreen',
          icon: 'book-outline' as const,
        },
        {
          title: 'Duplicate Sync',
          desc: 'Find and remove duplicate word entries.',
          screen: 'DuplicateSyncScreen',
          icon: 'copy-outline' as const,
        },
      ],
    },
    {
      title: 'Customer Management',
      items: [
        {
          title: 'Update Customer Words',
          desc: 'Search users and update their available word count.',
          screen: 'UpdateCustomerWordsScreen',
          icon: 'people-outline' as const,
        },
      ],
    },
  ];

  const headerFontSize = Math.min(28, width * 0.07);
  const sectionFontSize = Math.min(20, width * 0.05);
  const cardTitleSize = Math.min(18, width * 0.045);
  const cardDescSize = Math.min(14, width * 0.035);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: headerFontSize }]}>Admin Panel</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: sectionFontSize }]}>
              {item.title}
            </Text>
            {item.items.map((card, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(card.screen as never)}
              >
                <View style={styles.cardRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={card.icon} size={24} color={Colors.primary} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { fontSize: cardTitleSize }]}>
                      {card.title}
                    </Text>
                    <Text style={[styles.cardDesc, { fontSize: cardDescSize }]}>
                      {card.desc}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grayLight} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

export default AdminPanelScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: '4%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '4%',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logout: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: '4%',
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: '4%',
    minHeight: 72,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '600',
    color: Colors.primary,
  },
  cardDesc: {
    color: '#777',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: '4%',
    paddingBottom: 40,
  },
});
