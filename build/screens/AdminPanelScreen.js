import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, Platform, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
const AdminPanelScreen = () => {
    const { setAuth } = useContext(AuthContext);
    const navigation = useNavigation();
    const handleLogout = async () => {
        try {
            await setAuth(null, null);
            Alert.alert('Logged out', 'You have been logged out successfully.');
        }
        catch (err) {
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
                },
            ],
        },
        {
            title: 'User Management',
            items: [
                {
                    title: 'View Subscribed Users',
                    desc: 'See a list of all premium members.',
                    screen: 'ViewUsersScreen',
                },
            ],
        },
        {
            title: 'Subscription Management',
            items: [
                {
                    title: 'Manage Subscription Prices',
                    desc: 'Set the monthly and yearly subscription costs.',
                    screen: 'ManageSubscriptionScreen',
                },
            ],
        },
    ];
    return (<SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList data={sections} keyExtractor={(item, index) => index.toString()} renderItem={({ item }) => (<View style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            {item.items.map((card, idx) => (<TouchableOpacity key={idx} style={styles.card} onPress={() => navigation.navigate(card.screen)}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDesc}>{card.desc}</Text>
              </TouchableOpacity>))}
          </View>)} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}/>
    </SafeAreaView>);
};
export default AdminPanelScreen;
const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: Platform.OS === 'android' ? 0 : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    logout: {
        color: Colors.error,
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.primary,
    },
    cardDesc: {
        fontSize: 14,
        color: '#777',
        marginTop: 6,
    },
});
//# sourceMappingURL=AdminPanelScreen.js.map