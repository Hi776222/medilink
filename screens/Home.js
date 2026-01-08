import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const Home = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [emergencyStatus, setEmergencyStatus] = useState('All systems ready');
  const [locationStatus, setLocationStatus] = useState('Location enabled');

  // Set current time and greeting
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      
      setCurrentTime(`${hours}:${minutes}`);
      
      if (hours < 12) setGreeting('Good morning');
      else if (hours < 18) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const emergencyContacts = [
    { name: 'Mom', phone: '0650801456', type: 'family', emergency: true },
    { name: 'Dad', phone: '0661234567', type: 'family', emergency: true },
    { name: 'Brother', phone: '0678901234', type: 'family', emergency: false },
  ];

  const quickActions = [
    {
      id: 1,
      title: 'Voice Assistant',
      description: 'Use voice commands',
      icon: 'mic',
      color: '#667eea',
      screen: 'VoiceAssistant',
    },
    {
      id: 2,
      title: 'Emergency Alerts',
      description: 'Manage contacts & alerts',
      icon: 'notifications',
      color: '#dc2626',
      screen: 'Alerts',
    },
    {
      id: 3,
      title: 'Medical Profile',
      description: 'View health information',
      icon: 'medical-services',
      color: '#10b981',
      screen: 'MedicalForm',
    },
    {
      id: 4,
      title: 'Location Map',
      description: 'Share location & view map',
      icon: 'map',
      color: '#3b82f6',
      screen: 'Map',
    },
  ];

  const emergencyNumbers = [
    { name: 'Police', number: '112', icon: 'local-police', color: '#3b82f6' },
    { name: 'Ambulance', number: '150', icon: 'local-hospital', color: '#dc2626' },
    { name: 'Fire Department', number: '151', icon: 'fire-truck', color: '#f59e0b' },
    { name: 'Civil Protection', number: '160', icon: 'security', color: '#10b981' },
  ];

  const handleQuickAction = (screen) => {
    navigation.navigate(screen);
  };

  const handleEmergencyCall = (number, service) => {
    Alert.alert(
      `Call ${service}`,
      `Call ${service} at ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call Now', 
          onPress: () => {
            Alert.alert('Calling', `Connecting to ${service}...`);
            // In real app: Linking.openURL(`tel:${number}`)
          }
        }
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>{greeting}</Text>
                <Text style={styles.userName}>Welcome to MediLink</Text>
              </View>
              <View style={styles.timeContainer}>
                <Icon name="access-time" size={16} color="#666" />
                <Text style={styles.timeText}>{currentTime}</Text>
              </View>
            </View>
            
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.statusText}>{emergencyStatus}</Text>
              </View>
              <View style={styles.statusItem}>
                <Icon name="location-on" size={16} color="#3b82f6" />
                <Text style={styles.statusText}>{locationStatus}</Text>
              </View>
            </View>
          </View>

          {/* Emergency Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 Emergency Quick Access</Text>
            <View style={styles.emergencyGrid}>
              <TouchableOpacity 
                style={[styles.emergencyCard, { backgroundColor: '#fef2f2' }]}
                onPress={() => navigation.navigate('VoiceAssistant')}
              >
                <LinearGradient
                  colors={['#dc2626', '#991b1b']}
                  style={styles.emergencyGradient}
                >
                  <Icon name="emergency" size={32} color="#fff" />
                  <Text style={styles.emergencyCardTitle}>VOICE SOS</Text>
                  <Text style={styles.emergencyCardDesc}>
                    Say "SOS" or tap for emergency
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.emergencyCard, { backgroundColor: '#eff6ff' }]}
                onPress={() => {
                  Alert.alert(
                    'Share Location',
                    'Share your location with emergency contacts?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Share Now', onPress: () => Alert.alert('Location Shared', 'Your location has been shared') }
                    ]
                  );
                }}
              >
                <LinearGradient
                  colors={['#3b82f6', '#1d4ed8']}
                  style={styles.emergencyGradient}
                >
                  <Icon name="location-on" size={32} color="#fff" />
                  <Text style={styles.emergencyCardTitle}>SHARE LOCATION</Text>
                  <Text style={styles.emergencyCardDesc}>
                    Send GPS to contacts
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionCard}
                  onPress={() => handleQuickAction(action.screen)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                    <Icon name={action.icon} size={28} color={action.color} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Emergency Contacts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📞 Emergency Contacts</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
                <Text style={styles.seeAllText}>Manage</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.contactsScroll}
            >
              {emergencyContacts.map((contact, index) => (
                <View key={index} style={styles.contactCard}>
                  <View style={[
                    styles.contactAvatar,
                    { backgroundColor: contact.emergency ? '#fef2f2' : '#f8fafc' }
                  ]}>
                    <Icon 
                      name="person" 
                      size={28} 
                      color={contact.emergency ? '#dc2626' : '#666'} 
                    />
                    {contact.emergency && (
                      <View style={styles.emergencyBadge}>
                        <Text style={styles.emergencyBadgeText}>SOS</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                  <TouchableOpacity 
                    style={[
                      styles.callButton,
                      { backgroundColor: contact.emergency ? '#dc2626' : '#3b82f6' }
                    ]}
                    onPress={() => handleEmergencyCall(contact.phone, contact.name)}
                  >
                    <Icon name="call" size={16} color="#fff" />
                    <Text style={styles.callButtonText}>Call</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Emergency Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🆘 Emergency Services</Text>
            <View style={styles.servicesGrid}>
              {emergencyNumbers.map((service, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.serviceCard}
                  onPress={() => handleEmergencyCall(service.number, service.name)}
                >
                  <View style={[styles.serviceIcon, { backgroundColor: service.color + '20' }]}>
                    <Icon name={service.icon} size={24} color={service.color} />
                  </View>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceNumber}>{service.number}</Text>
                  <View style={[styles.callServiceButton, { backgroundColor: service.color }]}>
                    <Text style={styles.callServiceText}>CALL</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📋 Recent Activity</Text>
              <TouchableOpacity onPress={() => Alert.alert('Activity', 'Showing all activity')}>
                <Text style={styles.seeAllText}>View all</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: '#f0fdf4' }]}>
                  <Icon name="check-circle" size={20} color="#10b981" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>System check completed</Text>
                  <Text style={styles.activityTime}>Today • 9:30 AM</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: '#eff6ff' }]}>
                  <Icon name="location-on" size={20} color="#3b82f6" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Location services enabled</Text>
                  <Text style={styles.activityTime}>Yesterday • 4:15 PM</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: '#fef2f2' }]}>
                  <Icon name="emergency" size={20} color="#dc2626" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Test SOS sent to Mom</Text>
                  <Text style={styles.activityTime}>Yesterday • 2:00 PM</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  container: { 
    flex: 1 
  },
  scrollView: { 
    flex: 1 
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  emergencyGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  emergencyCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  emergencyGradient: {
    padding: 20,
    alignItems: 'center',
  },
  emergencyCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  emergencyCardDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  contactsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  contactCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  contactAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  emergencyBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#dc2626',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  emergencyBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  serviceNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  callServiceButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  callServiceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
  },
});

export default Home;