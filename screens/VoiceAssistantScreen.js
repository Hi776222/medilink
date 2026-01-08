import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  Dimensions,
  Animated,
  Vibration,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import Navbar from '../components/Navbar';

const { width } = Dimensions.get('window');

const VoiceAssistantScreen = () => {
  const insets = useSafeAreaInsets();
  const [isListening, setIsListening] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [recentActions, setRecentActions] = useState([
    { id: 1, command: 'Call Mom', time: 'Today • 2:18 PM', details: 'Connected for 3:45', type: 'call' },
    { id: 2, command: 'Send SOS to Dad', time: 'Today • 1:02 PM', details: 'Delivered', type: 'sos' },
  ]);
  const [showVoiceCommands, setShowVoiceCommands] = useState(false);
  const [showHowMicWorks, setShowHowMicWorks] = useState(false); // New state for mic info
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // HARDCODED CONTACTS - CHANGE THESE NUMBERS TO YOUR REAL CONTACTS
  const EMERGENCY_CONTACTS = {
    mom: {
      name: 'Mom',
      phone: '0650801456', // CHANGE TO YOUR MOM'S REAL NUMBER
      type: 'family',
      emergency: true
    },
    dad: {
      name: 'Dad', 
      phone: '0661234567', // CHANGE TO YOUR DAD'S REAL NUMBER
      type: 'family',
      emergency: true
    },
    brother: {
      name: 'Brother',
      phone: '0678901234', // ADD MORE CONTACTS AS NEEDED
      type: 'family',
      emergency: false
    },
    emergency: {
      name: 'Emergency Services',
      phone: '112',
      type: 'emergency',
      emergency: true
    },
    ambulance: {
      name: 'Ambulance',
      phone: '150',
      type: 'emergency',
      emergency: true
    }
  };

  // Voice recording timer
  useEffect(() => {
    let interval;
    if (isListening) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Auto-stop after 5 seconds and show voice commands
      const timeout = setTimeout(() => {
        if (isListening) {
          stopListening();
          setShowVoiceCommands(true); // Show command selection
        }
      }, 5000);
      
      return () => {
        clearTimeout(timeout);
      };
    } else {
      setRecordingTime(0);
      pulseAnim.setValue(1);
    }
    
    return () => {
      if (interval) clearInterval(interval);
      Animated.timing(pulseAnim).stop();
    };
  }, [isListening]);

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    Vibration.vibrate(50);
  };

  const stopListening = () => {
    setIsListening(false);
    Vibration.vibrate(50);
  };

  // Process voice command manually (when user selects from list)
  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    console.log('Processing command:', command);
    setTranscript(command);
    
    // Vibration feedback
    Vibration.vibrate(100);
    
    // Close the command selection modal
    setShowVoiceCommands(false);
    
    // Check for specific contact calls
    if (lowerCommand.includes('mom') || lowerCommand.includes('mother') || lowerCommand.includes('mama')) {
      callContact(EMERGENCY_CONTACTS.mom);
    } 
    else if (lowerCommand.includes('dad') || lowerCommand.includes('father') || lowerCommand.includes('papa')) {
      callContact(EMERGENCY_CONTACTS.dad);
    }
    else if (lowerCommand.includes('brother') || lowerCommand.includes('sibling')) {
      callContact(EMERGENCY_CONTACTS.brother);
    }
    else if (lowerCommand.includes('emergency') || lowerCommand.includes('112') || lowerCommand.includes('police')) {
      callContact(EMERGENCY_CONTACTS.emergency);
    }
    else if (lowerCommand.includes('ambulance') || lowerCommand.includes('150') || lowerCommand.includes('hospital')) {
      callContact(EMERGENCY_CONTACTS.ambulance);
    }
    else if (lowerCommand.includes('sos') || lowerCommand.includes('help') || lowerCommand.includes('emergency sos')) {
      sendSOSAlert();
    }
    else if (lowerCommand.includes('location') || lowerCommand.includes('where am i') || lowerCommand.includes('share location')) {
      shareLocation();
    }
    else if (lowerCommand.includes('call') && lowerCommand.includes('and')) {
      // Handle "call mom and dad" type commands
      const contactsToCall = [];
      if (lowerCommand.includes('mom')) contactsToCall.push(EMERGENCY_CONTACTS.mom);
      if (lowerCommand.includes('dad')) contactsToCall.push(EMERGENCY_CONTACTS.dad);
      if (lowerCommand.includes('brother')) contactsToCall.push(EMERGENCY_CONTACTS.brother);
      
      if (contactsToCall.length > 0) {
        callMultipleContacts(contactsToCall);
      }
    }
    else {
      // Add to recent actions for any command
      const newAction = {
        id: recentActions.length + 1,
        command: command,
        time: 'Just now',
        details: 'Voice command processed',
        type: 'voice'
      };
      setRecentActions([newAction, ...recentActions.slice(0, 4)]);
    }
  };

  // Function to make phone call
  const makePhoneCall = (phoneNumber, contactName = 'contact') => {
    const phoneUrl = Platform.OS === 'android' 
      ? `tel:${phoneNumber}` 
      : `telprompt:${phoneNumber}`;
    
    Linking.openURL(phoneUrl).catch(err => {
      console.error('Error making call:', err);
      Alert.alert('Call Failed', `Unable to call ${contactName}. Please dial ${phoneNumber} manually.`);
    });
  };

  // Call a specific contact
  const callContact = (contact) => {
    Alert.alert(
      `📞 Call ${contact.name}`,
      `Call ${contact.name} at ${contact.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'CALL NOW', 
          onPress: () => {
            makePhoneCall(contact.phone, contact.name);
            
            // Add to recent actions
            const newAction = {
              id: recentActions.length + 1,
              command: `Call ${contact.name}`,
              time: 'Just now',
              details: `Dialing ${contact.phone}`,
              type: 'call'
            };
            setRecentActions([newAction, ...recentActions.slice(0, 4)]);
          }
        }
      ]
    );
  };

  // Call multiple contacts
  const callMultipleContacts = (contacts) => {
    const contactNames = contacts.map(c => c.name).join(' and ');
    const contactPhones = contacts.map(c => c.phone).join(', ');
    
    Alert.alert(
      `📞 Call Multiple Contacts`,
      `Call ${contactNames}?\n\nNumbers: ${contactPhones}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'CALL FIRST CONTACT', 
          onPress: () => {
            makePhoneCall(contacts[0].phone, contacts[0].name);
          }
        },
        {
          text: 'CALL ALL',
          onPress: () => {
            // Call each contact one by one
            contacts.forEach((contact, index) => {
              setTimeout(() => {
                makePhoneCall(contact.phone, contact.name);
              }, index * 2000); // 2 seconds between calls
            });
            
            // Add to recent actions
            const newAction = {
              id: recentActions.length + 1,
              command: `Call ${contactNames}`,
              time: 'Just now',
              details: `Called ${contacts.length} contacts`,
              type: 'call'
            };
            setRecentActions([newAction, ...recentActions.slice(0, 4)]);
          }
        }
      ]
    );
  };

  // Send SOS alert
  const sendSOSAlert = () => {
    const emergencyContacts = Object.values(EMERGENCY_CONTACTS).filter(c => c.emergency);
    const emergencyNumbers = emergencyContacts.map(c => `${c.name}: ${c.phone}`).join('\n');
    
    Alert.alert(
      '🚨 SOS EMERGENCY ALERT',
      `Send emergency SOS to all emergency contacts?\n\n${emergencyNumbers}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'SEND SOS TO ALL', 
          style: 'destructive',
          onPress: () => {
            // Add to recent actions
            const newAction = {
              id: recentActions.length + 1,
              command: 'Send SOS Alert',
              time: 'Just now',
              details: `Sent to ${emergencyContacts.length} emergency contacts`,
              type: 'sos'
            };
            setRecentActions([newAction, ...recentActions.slice(0, 4)]);
            
            // Send SMS to each emergency contact
            emergencyContacts.forEach(contact => {
              sendEmergencySMS(contact.phone, contact.name);
            });
            
            Alert.alert('✅ SOS SENT', `Emergency alert sent to ${emergencyContacts.length} contacts`);
          }
        },
        {
          text: 'SEND TO MOM & DAD',
          onPress: () => {
            sendEmergencySMS(EMERGENCY_CONTACTS.mom.phone, 'Mom');
            sendEmergencySMS(EMERGENCY_CONTACTS.dad.phone, 'Dad');
            
            const newAction = {
              id: recentActions.length + 1,
              command: 'Send SOS to Mom & Dad',
              time: 'Just now',
              details: 'Emergency SMS sent',
              type: 'sos'
            };
            setRecentActions([newAction, ...recentActions.slice(0, 4)]);
          }
        }
      ]
    );
  };

  // Share location
  const shareLocation = () => {
    const googleMapsLink = `https://www.google.com/maps?q=34.020882,-6.841650`; // Example coordinates (Rabat)
    const locationMessage = `📍 My current location:\nMap: ${googleMapsLink}\nTime: ${new Date().toLocaleTimeString()}`;

    Alert.alert(
      '📍 SHARE LOCATION',
      `Share your location with contacts?\n\n${locationMessage}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'SHARE WITH MOM', 
          onPress: () => {
            sendLocationSMS(EMERGENCY_CONTACTS.mom.phone, locationMessage, 'Mom');
          }
        },
        { 
          text: 'SHARE WITH DAD', 
          onPress: () => {
            sendLocationSMS(EMERGENCY_CONTACTS.dad.phone, locationMessage, 'Dad');
          }
        },
        { 
          text: 'SHARE WITH BOTH', 
          onPress: () => {
            sendLocationSMS(EMERGENCY_CONTACTS.mom.phone, locationMessage, 'Mom');
            sendLocationSMS(EMERGENCY_CONTACTS.dad.phone, locationMessage, 'Dad');
            
            const newAction = {
              id: recentActions.length + 1,
              command: 'Share location with Mom & Dad',
              time: 'Just now',
              details: 'Location SMS sent',
              type: 'location'
            };
            setRecentActions([newAction, ...recentActions.slice(0, 4)]);
          }
        }
      ]
    );
  };

  // Send emergency SMS
  const sendEmergencySMS = (phoneNumber, contactName) => {
    const message = `🚨 EMERGENCY SOS ALERT 🚨\n\nI need immediate assistance!\nTime: ${new Date().toLocaleString()}\nPlease call me back immediately.`;
    
    if (Platform.OS === 'android') {
      const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
      Linking.openURL(smsUrl).catch(err => {
        console.error('SMS Error:', err);
        Alert.alert('SMS Failed', `Please send manually to ${contactName}:\n\n${message}`);
      });
    } else {
      Alert.alert(
        'SMS Ready',
        `Message for ${contactName} (${phoneNumber}):\n\n${message}\n\nPlease send manually.`,
        [{ text: 'OK' }]
      );
    }
  };

  // Send location SMS
  const sendLocationSMS = (phoneNumber, locationMessage, contactName) => {
    if (Platform.OS === 'android') {
      const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(locationMessage)}`;
      Linking.openURL(smsUrl).catch(err => {
        console.error('SMS Error:', err);
        Alert.alert('SMS Failed', `Please send manually to ${contactName}:\n\n${locationMessage}`);
      });
    } else {
      Alert.alert(
        'Location SMS Ready',
        `Location for ${contactName} (${phoneNumber}):\n\n${locationMessage}\n\nPlease send manually.`,
        [{ text: 'OK' }]
      );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Voice commands to show in modal
  const voiceCommands = [
    { id: 1, text: 'Call Mom', icon: 'call', color: '#3b82f6' },
    { id: 2, text: 'Call Dad', icon: 'call', color: '#3b82f6' },
    { id: 3, text: 'Call Mom and Dad', icon: 'call', color: '#3b82f6' },
    { id: 4, text: 'Call Brother', icon: 'call', color: '#3b82f6' },
    { id: 5, text: 'SOS Emergency', icon: 'emergency', color: '#dc2626' },
    { id: 6, text: 'Share Location', icon: 'location-on', color: '#10b981' },
    { id: 7, text: 'Call Emergency (112)', icon: 'local-police', color: '#dc2626' },
    { id: 8, text: 'Call Ambulance (150)', icon: 'local-hospital', color: '#ef4444' },
  ];

  return (
    <View style={styles.screen}>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🎤 Voice Assistant</Text>
            <Text style={styles.headerSubtitle}>Tap microphone, then select a voice command</Text>
          </View>

          {/* Main Card */}
          <View style={styles.mainCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.gradientCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.cardTitle}>Interactive Voice Assistant</Text>
              <Text style={styles.cardDescription}>
                1. Tap microphone{'\n'}
                2. Select command from list{'\n'}
                3. I'll call or send alerts
              </Text>
              
              <View style={styles.contactInfo}>
                <Icon name="contacts" size={16} color="#fff" />
                <Text style={styles.contactText}>Mom: {EMERGENCY_CONTACTS.mom.phone} • Dad: {EMERGENCY_CONTACTS.dad.phone}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Voice Control Section */}
          <View style={styles.dictateSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.dictateTitle}>Voice Control</Text>
              <TouchableOpacity 
                style={styles.infoButton}
                onPress={() => setShowHowMicWorks(true)}
              >
                <Icon name="info" size={20} color="#3b82f6" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.dictateCommand}>Tap microphone to start</Text>
            
            <TouchableOpacity 
              style={[styles.startButton, isListening && styles.listeningButton]}
              onPress={startListening}
              activeOpacity={0.8}
              disabled={isListening}
            >
              <Animated.View style={[
                styles.buttonInner,
                { transform: [{ scale: pulseAnim }] }
              ]}>
                <Icon name="mic" size={28} color="#fff" />
                <Text style={styles.buttonText}>
                  {isListening ? 'Listening...' : 'Tap to Speak'}
                </Text>
              </Animated.View>
            </TouchableOpacity>

            {isListening && (
              <View style={styles.listeningIndicator}>
                <View style={styles.listeningDot} />
                <Text style={styles.listeningText}>
                  Listening • {formatTime(recordingTime)}
                </Text>
                <Text style={styles.listeningHint}>
                  Speak now or wait for command list...
                </Text>
              </View>
            )}

            {transcript ? (
              <View style={styles.transcriptBox}>
                <Icon name="check-circle" size={20} color="#10b981" style={styles.transcriptIcon} />
                <Text style={styles.transcriptText}>Last command: "{transcript}"</Text>
              </View>
            ) : null}

            {/* Quick Action Buttons */}
            <View style={styles.quickActionButtons}>
              <TouchableOpacity 
                style={[styles.quickButton, { backgroundColor: '#3b82f6' }]}
                onPress={() => processVoiceCommand('Call Mom')}
              >
                <Icon name="call" size={20} color="#fff" />
                <Text style={styles.quickButtonText}>Call Mom</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickButton, { backgroundColor: '#dc2626' }]}
                onPress={() => processVoiceCommand('SOS Emergency')}
              >
                <Icon name="emergency" size={20} color="#fff" />
                <Text style={styles.quickButtonText}>SOS</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Contacts */}
          <View style={styles.quickContacts}>
            <Text style={styles.sectionTitle}>📞 Quick Contacts</Text>
            
            <View style={styles.contactGrid}>
              <TouchableOpacity 
                style={styles.contactCard}
                onPress={() => callContact(EMERGENCY_CONTACTS.mom)}
              >
                <View style={[styles.contactIcon, { backgroundColor: '#ec4899' }]}>
                  <Icon name="face" size={24} color="#fff" />
                </View>
                <Text style={styles.contactName}>Mom</Text>
                <Text style={styles.contactPhone}>{EMERGENCY_CONTACTS.mom.phone}</Text>
                <View style={styles.callBadge}>
                  <Text style={styles.callBadgeText}>TAP TO CALL</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactCard}
                onPress={() => callContact(EMERGENCY_CONTACTS.dad)}
              >
                <View style={[styles.contactIcon, { backgroundColor: '#3b82f6' }]}>
                  <Icon name="face" size={24} color="#fff" />
                </View>
                <Text style={styles.contactName}>Dad</Text>
                <Text style={styles.contactPhone}>{EMERGENCY_CONTACTS.dad.phone}</Text>
                <View style={styles.callBadge}>
                  <Text style={styles.callBadgeText}>TAP TO CALL</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Actions */}
          <View style={styles.recentActions}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Actions</Text>
              <TouchableOpacity onPress={() => {
                if (recentActions.length > 0) {
                  Alert.alert('All Actions', 
                    recentActions.map(action => 
                      `${action.command}\n${action.time} • ${action.details}`
                    ).join('\n\n')
                  );
                }
              }}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            
            {recentActions.slice(0, 3).map((action) => (
              <View key={action.id} style={styles.actionItem}>
                <View style={styles.actionContent}>
                  <View style={styles.actionHeader}>
                    <Icon 
                      name={action.type === 'sos' ? 'emergency' : 
                            action.type === 'call' ? 'call' : 
                            action.type === 'location' ? 'location-on' : 'mic'}
                      size={20} 
                      color="#666" 
                      style={styles.actionItemIcon}
                    />
                    <Text style={styles.actionCommand}>"{action.command}"</Text>
                  </View>
                  <Text style={styles.actionDetails}>
                    {action.time} • {action.details}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Fixed Navbar at bottom */}
      <Navbar />

      {/* Voice Commands Selection Modal */}
      <Modal
        visible={showVoiceCommands}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVoiceCommands(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎤 Select Voice Command</Text>
              <Text style={styles.modalSubtitle}>What would you like to do?</Text>
              <TouchableOpacity 
                onPress={() => setShowVoiceCommands(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {voiceCommands.map((command) => (
                <TouchableOpacity
                  key={command.id}
                  style={styles.commandItem}
                  onPress={() => processVoiceCommand(command.text)}
                >
                  <View style={[styles.commandIcon, { backgroundColor: command.color }]}>
                    <Icon name={command.icon} size={22} color="#fff" />
                  </View>
                  <View style={styles.commandTextContainer}>
                    <Text style={styles.commandText}>{command.text}</Text>
                    <Text style={styles.commandHint}>
                      {command.text.includes('Call') ? 'Will make actual phone call' :
                       command.text.includes('SOS') ? 'Sends emergency SMS' :
                       'Shares location via SMS'}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowVoiceCommands(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* How Microphone Works Modal */}
      <Modal
        visible={showHowMicWorks}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHowMicWorks(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.howItWorksModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎤 How the Microphone Works</Text>
              <TouchableOpacity 
                onPress={() => setShowHowMicWorks(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <View style={styles.stepContainer}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Tap the Microphone</Text>
                  <Text style={styles.stepDescription}>
                    Press the big blue microphone button to start "listening" mode.
                  </Text>
                </View>
              </View>
              
              <View style={styles.stepContainer}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Wait 5 Seconds</Text>
                  <Text style={styles.stepDescription}>
                    The microphone will listen for 5 seconds, then show a list of voice commands.
                  </Text>
                </View>
              </View>
              
              <View style={styles.stepContainer}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Select a Command</Text>
                  <Text style={styles.stepDescription}>
                    Choose from the list of available voice commands (Call Mom, SOS, Share Location, etc.)
                  </Text>
                </View>
              </View>
              
              <View style={styles.stepContainer}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Confirm Action</Text>
                  <Text style={styles.stepDescription}>
                    Confirm the action in the pop-up dialog. The app will make actual calls or send SMS.
                  </Text>
                </View>
              </View>
              
              <View style={styles.tipBox}>
                <Icon name="lightbulb" size={24} color="#f59e0b" />
                <Text style={styles.tipText}>
                  <Text style={{fontWeight: 'bold'}}>Tip:</Text> You can also use the quick buttons below the microphone for instant actions.
                </Text>
              </View>
              
              <View style={styles.noteBox}>
                <Icon name="info" size={20} color="#6b7280" />
                <Text style={styles.noteText}>
                  This is an interactive voice assistant. It simulates voice recognition by showing a command selection menu.
                </Text>
              </View>
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.gotItButton, { backgroundColor: '#3b82f6' }]}
              onPress={() => setShowHowMicWorks(false)}
            >
              <Text style={styles.gotItButtonText}>Got it! Let me try</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: '#fff' 
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
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: { 
    fontSize: 16, 
    color: '#666', 
    lineHeight: 22,
  },
  mainCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradientCard: {
    padding: 24,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 24,
    marginBottom: 16,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  contactText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  dictateSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#f8fafc',
    marginHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  dictateTitle: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  dictateCommand: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  startButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  listeningButton: {
    backgroundColor: '#dc2626',
  },
  buttonInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  listeningIndicator: {
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  listeningDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    marginBottom: 8,
  },
  listeningText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  listeningHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  transcriptBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    width: '100%',
    borderWidth: 2,
    borderColor: '#86efac',
  },
  transcriptIcon: {
    marginRight: 10,
  },
  transcriptText: {
    fontSize: 16,
    color: '#166534',
    fontWeight: '500',
    flex: 1,
  },
  quickActionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  quickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 2,
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickContacts: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactCard: {
    width: (width - 50) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
  },
  contactIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  callBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  callBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recentActions: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
    fontWeight: '500',
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  actionContent: {
    flex: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionItemIcon: {
    marginRight: 10,
  },
  actionCommand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  actionDetails: {
    fontSize: 14,
    color: '#666',
    marginLeft: 30,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 0,
    maxHeight: '80%',
    elevation: 10,
  },
  howItWorksModal: {
    maxHeight: '85%',
  },
  modalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    position: 'relative',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  modalScroll: {
    maxHeight: 400,
    padding: 24,
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  commandIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  commandTextContainer: {
    flex: 1,
  },
  commandText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  commandHint: {
    fontSize: 14,
    color: '#666',
  },
  cancelButton: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  // How It Works Modal Styles
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 22,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  tipText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#92400e',
    lineHeight: 22,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6b7280',
  },
  noteText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 22,
  },
  gotItButton: {
    backgroundColor: '#3b82f6',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    margin: 24,
    marginTop: 0,
  },
  gotItButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VoiceAssistantScreen;