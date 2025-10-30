import React from 'react';
import {  View, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

const SubscribeScreen = () => {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Subscribe</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.bodyText}>Subscribe feature is under development.</Text>
      </View>
    </SafeAreaView>
  );
};

export default SubscribeScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor:  Colors.background,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 0 : 0,
  },
  header: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A374D',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  bodyText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
});
