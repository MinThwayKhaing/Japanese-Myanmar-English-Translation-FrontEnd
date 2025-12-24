import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../navigation/types';

type ManageSubscriptionNavProp = NativeStackNavigationProp<
  AdminStackParamList,
  'ManageSubscriptionScreen'
>;

const ManageSubscriptionScreen = () => {
  const navigation = useNavigation<ManageSubscriptionNavProp>();

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Manage Subscription Prices</Text>
      </View>

      {/* Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>This feature is under development.</Text>
      </View>
    </SafeAreaView>
  );
};

export default ManageSubscriptionScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
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
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 18,
    color: Colors.primary,
    textAlign: 'center',
  },
});
