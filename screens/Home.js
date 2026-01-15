import React, { useState, useEffect } from 'react';//useeffect auto execution 
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';//comme localstorage sert a garder les activites,contacts d urgence...même après avoir fermé l’application


const { width } = Dimensions.get('window');

const Home = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [emergencyStatus, setEmergencyStatus] = useState('All systems ready');
  const [locationStatus, setLocationStatus] = useState('Location enabled');
  const [recentActivities, setRecentActivities] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  // Load activities and contacts from storage au démarage
  useEffect(() => {
    loadActivities();
    loadContacts();
  }, []);

  // Reload when screen is focused quand le user revient sur home les donnees sont rafraîchies
  useFocusEffect(
    React.useCallback(() => {
      loadActivities();
      loadContacts();
    }, [])
  );
//recupère activities from AsyncStorage/lire activities sauvegardés
  const loadActivities = async () => {
    try {
      const activitiesJson = await AsyncStorage.getItem('recentActivities');
      if (activitiesJson) {
        const activities = JSON.parse(activitiesJson);
        setRecentActivities(activities);
      } else {
        // Default activities
        const defaultActivities = [
          {
            id: 1,
            title: 'System check completed',
            type: 'system',
            time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            icon: 'check-circle',
            color: '#10b981'
          },
          {
            id: 2,
            title: 'Location services enabled',
            type: 'location',
            time: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            icon: 'location-on',
            color: '#3b82f6'
          },
          {
            id: 3,
            title: 'Test SMS sent to emergency contacts',
            type: 'sms',
            time: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            icon: 'sms',
            color: '#dc2626'
          }
        ];
        setRecentActivities(defaultActivities);
        await AsyncStorage.setItem('recentActivities', JSON.stringify(defaultActivities));
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const contactsJson = await AsyncStorage.getItem('emergencyContacts');
      if (contactsJson) {
        const contacts = JSON.parse(contactsJson);
        setEmergencyContacts(contacts);
      } else {
        // Default contacts
        const defaultContacts = [
          { name: 'Mom', phone: '0650801456', type: 'family', emergency: true },
          { name: 'Dad', phone: '0661234567', type: 'family', emergency: true },
          { name: 'Brother', phone: '0678901234', type: 'family', emergency: false },
        ];
        setEmergencyContacts(defaultContacts);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  // Set current time and greeting chaque min
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

  // Function to add new activity
  const addActivity = async (title, type, icon = 'info') => {
    try {
      const newActivity = {
        id: Date.now(),
        title,
        type,
        time: new Date().toISOString(),
        icon,
        color: getActivityColor(type)
      };
//new activityjoutée en haut

      const updatedActivities = [newActivity, ...recentActivities.slice(0, 9)]; // Keep only last 10
      setRecentActivities(updatedActivities);
      
      await AsyncStorage.setItem('recentActivities', JSON.stringify(updatedActivities));
      return true;
    } catch (error) {
      console.error('Error adding activity:', error);
      return false;
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'sms': return '#dc2626';
      case 'location': return '#3b82f6';
      case 'system': return '#10b981';
      case 'voice': return '#667eea';
      case 'medical': return '#10b981';
      case 'emergency': return '#f59e0b';
      default: return '#666';
    }
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'sms': return 'sms';
      case 'location': return 'location-on';
      case 'system': return 'check-circle';
      case 'voice': return 'mic';
      case 'medical': return 'medical-services';
      case 'emergency': return 'emergency';
      default: return 'info';
    }
  };

  const handleQuickAction = (screen) => {
    // Add activity for quick action on clique->Ajoute une activité/ Navigue vers l’écran correspondant


    let activityTitle = '';
    let activityType = '';
    
    switch(screen) {
      case 'VoiceAssistant':
        activityTitle = 'Voice assistant accessed';
        activityType = 'voice';
        break;
      case 'Alerts':
        activityTitle = 'Emergency alerts accessed';
        activityType = 'system';
        break;
      case 'MedicalForm':
        activityTitle = 'Medical profile accessed';
        activityType = 'medical';
        break;
      case 'Map':
        activityTitle = 'Location map accessed';
        activityType = 'location';
        break;
    }
    
    addActivity(activityTitle, activityType);
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
          onPress: async () => {
            await addActivity(`Called ${service}`, 'emergency');
            Alert.alert('Calling', `Connecting to ${service}...`);
            // In real app: Linking.openURL(`tel:${number}`)
          }
        }
      ]
    );
  };

  const handleShareLocation = () => {
    Alert.alert(
      'Share Location',
      'Share your location with emergency contacts?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share Now', 
          onPress: async () => {
            await addActivity('Location shared with contacts', 'location');
            Alert.alert('Location Shared', 'Your location has been shared with emergency contacts');
          }
        }
      ]
    );
  };

  const handleVoiceSOS = () => {
    Alert.alert(
      'Voice SOS',
      'This will trigger an emergency alert. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Activate SOS', 
          onPress: async () => {
            await addActivity('Voice SOS activated', 'emergency');
            Alert.alert(
              'SOS Activated',
              'Emergency alert sent to all contacts. Help is on the way.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };
// Historique des activités rediriger vers ActivityLogScreen
  const handleViewAllActivities = () => {
    navigation.navigate('ActivityLog', { activities: recentActivities });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return minutes === 0 ? 'Just now' : `${minutes} min ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const formatDetailedTime = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };
//Supprimer toutes les activités
  const clearAllActivities = () => {
    Alert.alert(
      'Clear All Activities',
      'Are you sure you want to clear all recent activities?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            setRecentActivities([]);
            await AsyncStorage.removeItem('recentActivities');
            Alert.alert('Cleared', 'All activities cleared');
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
              <View style={styles.statusItem}>
                <Icon name="history" size={16} color="#8b5cf6" />
                <Text style={styles.statusText}>{recentActivities.length} activities</Text>
              </View>
            </View>
          </View>

          {/* Emergency Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 Emergency Quick Access</Text>
            <View style={styles.emergencyGrid}>
              <TouchableOpacity 
                style={[styles.emergencyCard, { backgroundColor: '#fef2f2' }]}
                onPress={handleVoiceSOS}
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
                onPress={handleShareLocation}
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
              <View style={styles.activityHeaderActions}>
                <TouchableOpacity onPress={clearAllActivities} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleViewAllActivities}>
                  <Text style={styles.seeAllText}>View all</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.activityList}>
              {recentActivities.length === 0 ? (
                <View style={styles.noActivities}>
                  <Icon name="history" size={48} color="#ccc" />
                  <Text style={styles.noActivitiesText}>No recent activities</Text>
                  <Text style={styles.noActivitiesSubtext}>Your activities will appear here</Text>
                </View>
              ) : (
                recentActivities.slice(0, 5).map((activity) => (
                  <TouchableOpacity 
                    key={activity.id} 
                    style={styles.activityItem}
                    onPress={() => Alert.alert(
                      activity.title,
                      `Time: ${formatDetailedTime(activity.time)}\nType: ${activity.type}`,
                      [{ text: 'OK' }]
                    )}
                  >
                    <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
                      <Icon 
                        name={getActivityIcon(activity.type)} 
                        size={20} 
                        color={getActivityColor(activity.type)} 
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityTime}>{formatTime(activity.time)}</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#ccc" />
                  </TouchableOpacity>
                ))
              )}
              
              {recentActivities.length > 5 && (
                <TouchableOpacity 
                  style={styles.viewMoreButton}
                  onPress={handleViewAllActivities}
                >
                  <Text style={styles.viewMoreText}>View {recentActivities.length - 5} more activities</Text>
                  <Icon name="arrow-forward" size={16} color="#3b82f6" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// Activity Log Screen Component (Add this to your navigation stack)
const ActivityLogScreen = ({ route }) => {
  const { activities } = route.params || {};
  const [filter, setFilter] = useState('all');
  
  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });
  
  const formatFullTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })}`;
  };
  
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView>
        <View style={styles.activityLogContainer}>
          <Text style={styles.activityLogTitle}>Activity Log</Text>
          <Text style={styles.activityLogSubtitle}>{activities.length} activities</Text>
          
          {filteredActivities.map((activity) => (
            <View key={activity.id} style={styles.activityLogItem}>
              <View style={[styles.activityLogIcon, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
                <Icon name={getActivityIcon(activity.type)} size={24} color={getActivityColor(activity.type)} />
              </View>
              <View style={styles.activityLogContent}>
                <Text style={styles.activityLogText}>{activity.title}</Text>
                <Text style={styles.activityLogTime}>{formatFullTime(activity.time)}</Text>
                <Text style={styles.activityLogType}>{activity.type}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  activityHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#dc2626',
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
  noActivities: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noActivitiesText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  noActivitiesSubtext: {
    fontSize: 14,
    color: '#999',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginRight: 8,
  },
  // Activity Log Screen Styles
  activityLogContainer: {
    padding: 20,
  },
  activityLogTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  activityLogSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  activityLogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  activityLogIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityLogContent: {
    flex: 1,
  },
  activityLogText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  activityLogTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  activityLogType: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
  },
});

// Add this to your navigation stack
// In your navigation file (App.js or similar):
/*
import ActivityLogScreen from './screens/ActivityLogScreen';

<Stack.Screen name="ActivityLog" component={ActivityLogScreen} />
*/

export { ActivityLogScreen };
export default Home;