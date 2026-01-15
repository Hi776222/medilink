import React, { useState, useEffect } from 'react';
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
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Navbar from '../components/Navbar';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Firebase imports acceder a une collection/add document/edit/delete/doc acceder a un doc specifique lire les donne en temps reel
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';//base donne

const AlertsScreen = () => {
  const insets = useSafeAreaInsets();//marge de securité
  
  // State for alert tone
  const [alertTone, setAlertTone] = useState('Rescue Beacon');
  const [showToneModal, setShowToneModal] = useState(false);
  
  // State for vibration
  const [vibration, setVibration] = useState('Strong');
  const [showVibrationModal, setShowVibrationModal] = useState(false);
  
  // State for toggle switches
  const [notifyContacts, setNotifyContacts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [generalUpdates, setGeneralUpdates] = useState(true);
  const [smsFallback, setSmsFallback] = useState(true);
  const [sendSMS, setSendSMS] = useState(true);
  
  // State for contacts management with Firebase
  const [contacts, setContacts] = useState([]);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactIsEmergency, setNewContactIsEmergency] = useState(true);
  
  // State for recent alerts
  const [recentAlerts, setRecentAlerts] = useState([
    {
      id: 1,
      title: "Location shared",
      details: "Yesterday • 6:40 PM • Mom, Partner",
      timestamp: new Date(Date.now() - 86400000), // Yesterday
      type: "location"
    },
    {
      id: 2,
      title: "Low battery warning",
      details: "Yesterday • 12:05 PM • Sent as SMS fallback",
      timestamp: new Date(Date.now() - 90000000), // Yesterday afternoon
      type: "warning"
    }
  ]);
  
  // Alert tone options
  const alertToneOptions = [
    'Rescue Beacon',
    'Emergency Siren',
    'Urgent Alert',
    'Critical Warning',
    'Standard Tone',
  ];
  
  // Vibration options
  const vibrationOptions = [
    'Strong',
    'Medium',
    'Light',
    'Pattern 1',
    'Pattern 2',
    'None',
  ];

  // READ CONTACTS FROM FIREBASE Transforme les données Firestore en tableau JavaScript
  //snapshot représente l’état actuel de la base de données en temps réel
  //onsnapshot listener en temps reel de firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "contacts"), snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setContacts(data);
    });

    return () => unsubscribe();//lorsque on quitte la page en arrete l ecoute avec firebase
  }, []);

  // Function to format date for display
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 172800) {
      return 'Yesterday';
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  // Function to format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to send SMS to contacts
  const sendSMSToContacts = async (emergencyContacts) => {
    const message = "🚨 SOS ALERT 🚨\n\nI need immediate help! This is a TEST ALERT from the emergency app.\n\nLocation: Test Location\nTime: " + new Date().toLocaleTimeString() + "\nStatus: TEST - Please ignore if this is a drill\n\nReply if you receive this.";
    
    try {
      // For each emergency contact, create SMS link
      for (const contact of emergencyContacts) {
        const smsUrl = `sms:${contact.phone.replace(/\s/g, '')}?body=${encodeURIComponent(message)}`;
        
        // Check if we can open the SMS app
        const canOpen = await Linking.canOpenURL(smsUrl);
        if (canOpen) {
          // For now, we'll just log it and show an alert
          console.log(`SMS prepared for ${contact.name}: ${contact.phone}`);
          console.log(`Message: ${message}`);
        }
      }
      
      // For demo purposes, we'll simulate sending
      return true;
    } catch (error) {
      console.error("Error preparing SMS:", error);
      return false;
    }
  };

  // Function to send test alert
  const sendTestAlert = async () => {
    Alert.alert(
      "Send Test Alert",
      "This will send a test alert to your emergency contacts and services. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Send Test", 
          onPress: async () => {
            try {
              // Get emergency contacts
              const emergencyContacts = contacts.filter(c => c.emergency);
              
              if (emergencyContacts.length === 0) {
                Alert.alert(
                  "No Emergency Contacts",
                  "Please add emergency contacts first before sending test alerts.",
                  [{ text: "OK" }]
                );
                return;
              }
              
              // Show sending status
              Alert.alert(
                "Sending Test Alert...",
                "Please wait while we send the test alert.",
                [],
                { cancelable: false }
              );
              
              // Add new alert to recent alerts
              const newAlert = {
                id: recentAlerts.length + 1,
                title: "Test SOS Alert Sent",
                details: `Today • ${formatTime(new Date())} • Delivered to ${emergencyContacts.length} contacts`,
                timestamp: new Date(),
                type: "sos",
                contactsCount: emergencyContacts.length
              };
              
              // Update recent alerts with new alert at the top
              setRecentAlerts([newAlert, ...recentAlerts]);
              
              // Send SMS to emergency contacts if enabled
              //SMS activé + succès →  message vert
              //SMS activé + échec →  message warning
              //SMS désactivé → ℹ message info
              //Erreur → message erreur
              if (sendSMS) {
                const smsSent = await sendSMSToContacts(emergencyContacts);
                
                if (smsSent) {
                  Alert.alert(
                    "Test Alert Sent Successfully",
                    `✅ SMS sent to ${emergencyContacts.length} emergency contacts.\n\nNote: In a real app, SMS would be sent via your phone's messaging app or SMS gateway.`,
                    [{ text: "OK" }]
                  );
                } else {
                  Alert.alert(
                    "Test Alert Partially Sent",
                    `⚠️ Alert logged but SMS sending failed. Check your SMS permissions.\n\nEmergency contacts notified: ${emergencyContacts.length}`,
                    [{ text: "OK" }]
                  );
                }
              } else {
                Alert.alert(
                  "Test Alert Logged",
                  `Test alert has been logged and will be sent to ${emergencyContacts.length} emergency contacts when SMS is enabled.`,
                  [{ text: "OK" }]
                );
              }
              
              console.log("Test alert sent to:", emergencyContacts);
            } catch (error) {
              console.error("Error sending test alert:", error);
              Alert.alert(
                "Error",
                "Failed to send test alert. Please try again.",
                [{ text: "OK" }]
              );
            }
          }
        }
      ]
    );
  };

  // Function to manage contacts
  const manageContacts = () => {
    setShowContactsModal(true);//FENETRE OUVERTE
  };

  // ➕ ADD CONTACT TO FIREBASE
  const addNewContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      Alert.alert("Error", "Please enter both name and phone number");
      return;
    }

    // Validate phone number (simple validation)
    //commence éventuellement par +, contient uniquement des chiffres, espaces,
    //  tirets ou parenthèses, et fait au moins 8 caractère
    const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(newContactPhone)) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    try {
      await addDoc(collection(db, "contacts"), {
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        emergency: newContactIsEmergency,
      });
      
      // Reset form
      setNewContactName('');
      setNewContactPhone('');
      setNewContactIsEmergency(true);
      
      // Close add modal
      setShowAddContactModal(false);
      
      Alert.alert("Success", `${newContactName} added as ${newContactIsEmergency ? 'emergency' : 'regular'} contact`);
    } catch (error) {
      Alert.alert("Error", "Failed to add contact. Please try again.");
      console.error("Error adding contact: ", error);
    }
  };

  // ❌ DELETE CONTACT FROM FIREBASE
  const removeContact = async (contactId, contactName) => {
    Alert.alert(
      "Remove Contact",
      `Are you sure you want to remove ${contactName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "contacts", contactId));
              Alert.alert("Success", `${contactName} removed from contacts`);
            } catch (error) {
              Alert.alert("Error", "Failed to remove contact. Please try again.");
              console.error("Error removing contact: ", error);
            }
          }
        }
      ]
    );
  };

  // TOGGLE EMERGENCY STATUS IN FIREBASE
  //va dans la collection contacts sur Firebase et inverse la valeur de emergency pour ce contact.
  const toggleEmergencyStatus = async (contactId, contactName, currentEmergencyStatus) => {
    try {
      await updateDoc(doc(db, "contacts", contactId), {
        emergency: !currentEmergencyStatus,
      });
      
      const newStatus = !currentEmergencyStatus;
      Alert.alert(
        "Status Updated",
        `${contactName} is now ${newStatus ? 'emergency' : 'regular'} contact`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update contact status. Please try again.");
      console.error("Error updating contact: ", error);
    }
  };

  // Function to change alert tone
  const changeAlertTone = (tone) => {
    setAlertTone(tone);
    setShowToneModal(false);
    Alert.alert("Alert Tone Updated", `Changed to: ${tone}`, [{ text: "OK" }]);
  };

  // Function to change vibration
  const changeVibration = (vib) => {
    setVibration(vib);
    setShowVibrationModal(false);
    Alert.alert("Vibration Updated", `Changed to: ${vib}`, [{ text: "OK" }]);
  };

  // Function to handle alert item view/details
  const handleAlertAction = (alert) => {
    Alert.alert(
      alert.title,
      "Viewing alert details...",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "View Details", 
          onPress: () => {
            const timeString = formatTime(alert.timestamp);
            const dateString = alert.timestamp.toLocaleDateString();
            
            let details = `Alert: ${alert.title}\n`;
            details += `Time: ${timeString}\n`;
            details += `Date: ${dateString}\n`;
            details += `Type: ${alert.type === 'sos' ? 'SOS Emergency' : alert.type === 'location' ? 'Location Share' : 'System Warning'}\n\n`;
            
            if (alert.contactsCount) {
              details += `Contacts Notified: ${alert.contactsCount}\n`;
            }
            
            details += `Status: Delivered\n`;
            details += `Action Taken: Emergency services notified\n`;
            details += `Mode: ${sendSMS ? 'SMS Enabled' : 'Notification Only'}`;
            
            Alert.alert(
              "Alert Details",
              details,
              [{ text: "OK" }]
            );
          }
        }
      ]
    );
  };

  // Function to clear all alerts
  const clearAllAlerts = () => {
    Alert.alert(
      "Clear All Alerts",
      "Are you sure you want to clear all recent alerts?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive",
          onPress: () => {
            setRecentAlerts([]);
            Alert.alert("Success", "All alerts cleared");
          }
        }
      ]
    );
  };

  // Function to toggle notification settings with confirmation
  const toggleSetting = (settingName, currentValue, setterFunction) => {
    Alert.alert(
      settingName,
      currentValue 
        ? `Disable ${settingName}?` 
        : `Enable ${settingName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: currentValue ? "Disable" : "Enable", 
          onPress: () => {
            setterFunction(!currentValue);
            Alert.alert(
              "Setting Updated",
              `${settingName} ${!currentValue ? 'enabled' : 'disabled'}`,
              [{ text: "OK" }]
            );
          }
        }
      ]
    );
  };

  // Function to call a contact
  const callContact = (phoneNumber, contactName) => {
    Alert.alert(
      `Call ${contactName}`,
      `Would you like to call ${contactName} at ${phoneNumber}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Call", 
          onPress: () => {
            // Clean phone number for calling
            //"+212 6 12-34-56" → devient "+2126123456"
            const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
            const phoneUrl = `tel:${cleanPhone}`;
            
            Linking.canOpenURL(phoneUrl)
              .then((supported) => {
                if (supported) {
                  return Linking.openURL(phoneUrl);
                } else {
                  Alert.alert("Error", "Phone calling is not supported on this device");
                }
              })
              .catch((err) => {
                console.error("Error opening phone app:", err);
                Alert.alert("Error", "Could not open phone app");
              });
          }
        }
      ]
    );
  };

  // Function to send test SMS immediately
  const sendTestSMSNow = () => {
    const emergencyContacts = contacts.filter(c => c.emergency);
    
    if (emergencyContacts.length === 0) {
      Alert.alert(
        "No Emergency Contacts",
        "Please add emergency contacts first before sending SMS.",
        [{ text: "OK" }]
      );
      return;
    }
    
    Alert.alert(
      "Send Test SMS",
      `Send a test SMS to ${emergencyContacts.length} emergency contacts?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send SMS",
          onPress: async () => {
            try {
              const smsSent = await sendSMSToContacts(emergencyContacts);
              
              if (smsSent) {
                Alert.alert(
                  "SMS Ready",
                  "SMS message has been prepared. In a real app, this would open your messaging app with the message ready to send.\n\nOn a real device with SMS permissions, this would automatically send the SMS to all emergency contacts.",
                  [{ text: "OK" }]
                );
              }
            } catch (error) {
              Alert.alert("Error", "Failed to prepare SMS. Please check permissions.");
            }
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
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Critical alerts enabled</Text>
            <Text style={styles.headerSubtitle}>
              Emergency notifications can bypass Do Not Disturb
            </Text>
          </View>

          {/* Alert Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alert Preferences</Text>
            
            {/* SOS Alerts Subsection */}
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>SOS Alerts</Text>
              
              {/* Notify contacts toggle */}
              <TouchableOpacity 
                style={styles.toggleItem}
                onPress={() => toggleSetting("Notify contacts", notifyContacts, setNotifyContacts)}
              >
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleText}>Notify contacts and services immediately</Text>
                </View>
                <Switch
                  value={notifyContacts}
                  onValueChange={(value) => setNotifyContacts(value)}
                  trackColor={{ false: '#767577', true: '#0066cc' }}
                  thumbColor={notifyContacts ? '#fff' : '#f4f3f4'}
                />
              </TouchableOpacity>
              
              {/* Push Notifications toggle */}
              <TouchableOpacity 
                style={styles.toggleItem}
                onPress={() => toggleSetting("Push notifications", pushNotifications, setPushNotifications)}
              >
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleText}>Push Notifications</Text>
                </View>
                <Switch
                  value={pushNotifications}
                  onValueChange={(value) => setPushNotifications(value)}
                  trackColor={{ false: '#767577', true: '#0066cc' }}
                  thumbColor={pushNotifications ? '#fff' : '#f4f3f4'}
                />
              </TouchableOpacity>
              
              {/* General updates toggle */}
              <TouchableOpacity 
                style={styles.toggleItem}
                onPress={() => toggleSetting("General updates", generalUpdates, setGeneralUpdates)}
              >
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleText}>General updates, reminders</Text>
                </View>
                <Switch
                  value={generalUpdates}
                  onValueChange={(value) => setGeneralUpdates(value)}
                  trackColor={{ false: '#767577', true: '#0066cc' }}
                  thumbColor={generalUpdates ? '#fff' : '#f4f3f4'}
                />
              </TouchableOpacity>
              
              {/* SMS Fallback toggle */}
              <TouchableOpacity 
                style={styles.toggleItem}
                onPress={() => toggleSetting("SMS fallback", smsFallback, setSmsFallback)}
              >
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleText}>SMS Fallback</Text>
                </View>
                <Switch
                  value={smsFallback}
                  onValueChange={(value) => setSmsFallback(value)}
                  trackColor={{ false: '#767577', true: '#0066cc' }}
                  thumbColor={smsFallback ? '#fff' : '#f4f3f4'}
                />
              </TouchableOpacity>
              
              {/* Send SMS toggle */}
              <TouchableOpacity 
                style={styles.toggleItem}
                onPress={() => toggleSetting("Send SMS when data unavailable", sendSMS, setSendSMS)}
              >
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleText}>Send SMS if data is unavailable</Text>
                </View>
                <Switch
                  value={sendSMS}
                  onValueChange={(value) => setSendSMS(value)}
                  trackColor={{ false: '#767577', true: '#0066cc' }}
                  thumbColor={sendSMS ? '#fff' : '#f4f3f4'}
                />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Ringtones & Sounds Section */}
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Ringtones & Sounds</Text>
              
              {/* Alert Tone Row */}
              <TouchableOpacity 
                style={styles.tableRow}
                onPress={() => setShowToneModal(true)}
              >
                <View style={styles.tableCell}>
                  <Text style={styles.tableLabel}>Alert Tone</Text>
                </View>
                <View style={[styles.tableCell, styles.rightAlign]}>
                  <Text style={styles.tableValue}>{alertTone}</Text>
                  <View style={styles.changeButton}>
                    <Text style={styles.changeButtonText}>Change</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Vibration Row */}
              <TouchableOpacity 
                style={styles.tableRow}
                onPress={() => setShowVibrationModal(true)}
              >
                <View style={styles.tableCell}>
                  <Text style={styles.tableLabel}>Vibration</Text>
                </View>
                <View style={[styles.tableCell, styles.rightAlign]}>
                  <Text style={styles.tableValue}>{vibration}</Text>
                  <View style={styles.changeButton}>
                    <Text style={styles.changeButtonText}>Change</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Alerts Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Alerts</Text>
              {recentAlerts.length > 0 && (
                <TouchableOpacity onPress={clearAllAlerts}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Alert Items */}
            {recentAlerts.length === 0 ? (
              <View style={styles.noAlertsContainer}>
                <Text style={styles.noAlertsText}>No recent alerts</Text>
                <Text style={styles.noAlertsSubtext}>Send a test alert to see it here</Text>
              </View>
            ) : (
              recentAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  title={alert.title}
                  details={alert.details}
                  onPress={() => handleAlertAction(alert)}
                  buttonText="View"
                  timestamp={alert.timestamp}
                  type={alert.type}
                />
              ))
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.testAlertButton}
              onPress={sendTestAlert}
              activeOpacity={0.8}
            >
              <Icon name="warning" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.testAlertButtonText}>Send Test Alert</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.testSMSButton}
              onPress={sendTestSMSNow}
              activeOpacity={0.8}
            >
              <Icon name="sms" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.testSMSButtonText}>Test SMS Now</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.manageContactsButton}
              onPress={manageContacts}
              activeOpacity={0.8}
            >
              <Icon name="contacts" size={24} color="#333" style={styles.buttonIcon} />
              <Text style={styles.manageContactsButtonText}>Manage Contacts</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Fixed Navbar */}
      <Navbar />

      {/* Contacts Management Modal */}
      <Modal
        visible={showContactsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowContactsModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Emergency Contacts</Text>
              <TouchableOpacity 
                onPress={() => setShowContactsModal(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.contactsList}>
              {contacts.length === 0 ? (
                <Text style={styles.noContactsText}>No contacts added yet</Text>
              ) : (
                contacts.map((contact) => (
                  <View key={contact.id} style={styles.contactItem}>
                    <View style={styles.contactInfo}>
                      <View style={styles.contactNameRow}>
                        <Text style={styles.contactName}>{contact.name}</Text>
                        {contact.emergency && (
                          <View style={styles.emergencyBadge}>
                            <Text style={styles.emergencyBadgeText}>Emergency</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.contactPhone}>{contact.phone}</Text>
                    </View>
                    <View style={styles.contactActions}>
                      <TouchableOpacity 
                        style={styles.contactActionButton}
                        onPress={() => callContact(contact.phone, contact.name)}
                      >
                        <Icon name="call" size={20} color="#0066cc" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.contactActionButton}
                        onPress={() => toggleEmergencyStatus(contact.id, contact.name, contact.emergency)}
                      >
                        <Icon 
                          name={contact.emergency ? "star" : "star-border"} 
                          size={20} 
                          color={contact.emergency ? "#FFA000" : "#666"} 
                        />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.contactActionButton, styles.deleteButton]}
                        onPress={() => removeContact(contact.id, contact.name)}
                      >
                        <Icon name="delete" size={20} color="#dc2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={() => {
                  setShowContactsModal(false);
                  setTimeout(() => setShowAddContactModal(true), 300);
                }}
              >
                <Icon name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add New Contact</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setShowContactsModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Contact Modal */}
      <Modal
        visible={showAddContactModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddContactModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Contact</Text>
              <TouchableOpacity 
                onPress={() => setShowAddContactModal(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newContactName}
                  onChangeText={setNewContactName}
                  placeholder="Enter contact name"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newContactPhone}
                  onChangeText={setNewContactPhone}
                  placeholder="+212 612-345678"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
                <Text style={styles.inputHint}>Format: +212 6XX-XXXXXX</Text>
              </View>
              
              <View style={styles.toggleGroup}>
                <Text style={styles.toggleLabel}>Emergency Contact</Text>
                <Text style={styles.toggleDescription}>
                  Emergency contacts will receive all SOS alerts and SMS messages
                </Text>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleStatus}>
                    {newContactIsEmergency ? 'Yes' : 'No'}
                  </Text>
                  <Switch
                    value={newContactIsEmergency}
                    onValueChange={setNewContactIsEmergency}
                    trackColor={{ false: '#767577', true: '#0066cc' }}
                    thumbColor={newContactIsEmergency ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addNewContact}
              >
                <Icon name="save" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Contact</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddContactModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Alert Tone Selection Modal */}
      <Modal
        visible={showToneModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowToneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Alert Tone</Text>
            {alertToneOptions.map((tone, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalOption,
                  alertTone === tone && styles.modalOptionSelected
                ]}
                onPress={() => changeAlertTone(tone)}
              >
                <Text style={[
                  styles.modalOptionText,
                  alertTone === tone && styles.modalOptionTextSelected
                ]}>
                  {tone}
                </Text>
                {alertTone === tone && (
                  <Icon name="check" size={20} color="#0066cc" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowToneModal(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Vibration Selection Modal */}
      <Modal
        visible={showVibrationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVibrationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Vibration Pattern</Text>
            {vibrationOptions.map((vib, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalOption,
                  vibration === vib && styles.modalOptionSelected
                ]}
                onPress={() => changeVibration(vib)}
              >
                <Text style={[
                  styles.modalOptionText,
                  vibration === vib && styles.modalOptionTextSelected
                ]}>
                  {vib}
                </Text>
                {vibration === vib && (
                  <Icon name="check" size={20} color="#0066cc" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowVibrationModal(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Alert Item Component
const AlertItem = ({ title, details, onPress, buttonText, timestamp, type }) => {
  const getAlertIcon = () => {
    switch(type) {
      case 'sos': return 'warning';
      case 'location': return 'location-on';
      case 'warning': return 'battery-alert';
      default: return 'notifications';
    }
  };

  const getAlertColor = () => {
    switch(type) {
      case 'sos': return '#dc2626';
      case 'location': return '#0066cc';
      case 'warning': return '#f59e0b';
      default: return '#666';
    }
  };

  return (
    <View style={styles.alertItem}>
      <View style={styles.alertIconContainer}>
        <Icon name={getAlertIcon()} size={24} color={getAlertColor()} />
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertDetails}>{details}</Text>
        {timestamp && (
          <Text style={styles.alertTime}>
            {new Date(timestamp).toLocaleDateString()} • {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
      <TouchableOpacity 
        style={styles.alertActionButton}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.alertActionText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
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
    backgroundColor: '#f0f8ff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: { 
    fontSize: 16, 
    color: '#666', 
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#000',
  },
  clearAllText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '500',
  },
  subsection: {
    marginBottom: 4,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  toggleText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 24,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  tableCell: {
    flex: 1,
  },
  rightAlign: {
    alignItems: 'flex-end',
  },
  tableLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  tableValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginBottom: 4,
  },
  changeButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  changeButtonText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  alertIconContainer: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  alertDetails: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  alertActionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  alertActionText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
  noAlertsContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  noAlertsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  noAlertsSubtext: {
    fontSize: 14,
    color: '#999',
  },
  actionButtons: {
    padding: 20,
  },
  testAlertButton: {
    backgroundColor: '#dc2626',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  testSMSButton: {
    backgroundColor: '#059669',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  testAlertButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  testSMSButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  manageContactsButton: {
    backgroundColor: '#f0f0f0',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  manageContactsButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  buttonIcon: {
    marginRight: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  modalCloseButton: {
    padding: 5,
  },
  // Contacts List Styles
  contactsList: {
    maxHeight: 400,
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactInfo: {
    flex: 1,
    marginRight: 12,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  emergencyBadge: {
    backgroundColor: '#FFA000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emergencyBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 15,
    color: '#666',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactActionButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    marginLeft: 12,
  },
  noContactsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    paddingVertical: 40,
  },
  // Form Styles
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  inputHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  toggleGroup: {
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleStatus: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  // Modal Buttons
  modalButtons: {
    gap: 12,
  },
  modalButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  addButton: {
    backgroundColor: '#0066cc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#0066cc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  // Tone/Vibration Modal Options
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionSelected: {
    backgroundColor: '#f0f8ff',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#0066cc',
    fontWeight: '600',
  },
  modalCancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default AlertsScreen;