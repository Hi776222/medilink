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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Navbar from '../components/Navbar';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AlertsScreen = () => {
  const insets = useSafeAreaInsets();
  
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
  
  // State for contacts management
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Mom', phone: '+212 612-345678', isEmergency: true },
    { id: 2, name: 'Dad', phone: '+212 698-765432', isEmergency: true },
    { id: 3, name: 'Brother', phone: '+212 600-112233', isEmergency: false },
  ]);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactIsEmergency, setNewContactIsEmergency] = useState(true);
  
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

  // Function to send test alert
  const sendTestAlert = () => {
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
          onPress: () => {
            // Get emergency contacts
            const emergencyContacts = contacts.filter(c => c.isEmergency);
            
            // Show success message
            Alert.alert(
              "Test Alert Sent",
              `Test alert has been sent to ${emergencyContacts.length} emergency contacts.`,
              [{ text: "OK" }]
            );
            
            console.log("Test alert sent to:", emergencyContacts);
          }
        }
      ]
    );
  };

  // Function to manage contacts
  const manageContacts = () => {
    setShowContactsModal(true);
  };

  // Function to add new contact
  const addNewContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      Alert.alert("Error", "Please enter both name and phone number");
      return;
    }

    // Validate phone number (simple validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(newContactPhone)) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    const newContact = {
      id: contacts.length + 1,
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      isEmergency: newContactIsEmergency,
    };

    setContacts([...contacts, newContact]);
    
    // Reset form
    setNewContactName('');
    setNewContactPhone('');
    setNewContactIsEmergency(true);
    
    // Close add modal
    setShowAddContactModal(false);
    
    Alert.alert("Success", `${newContact.name} added as ${newContactIsEmergency ? 'emergency' : 'regular'} contact`);
  };

  // Function to remove contact
  const removeContact = (contactId, contactName) => {
    Alert.alert(
      "Remove Contact",
      `Are you sure you want to remove ${contactName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => {
            const updatedContacts = contacts.filter(c => c.id !== contactId);
            setContacts(updatedContacts);
            Alert.alert("Success", `${contactName} removed from contacts`);
          }
        }
      ]
    );
  };

  // Function to toggle emergency status
  const toggleEmergencyStatus = (contactId, contactName) => {
    const updatedContacts = contacts.map(contact => {
      if (contact.id === contactId) {
        const newStatus = !contact.isEmergency;
        Alert.alert(
          "Status Updated",
          `${contactName} is now ${newStatus ? 'emergency' : 'regular'} contact`
        );
        return { ...contact, isEmergency: newStatus };
      }
      return contact;
    });
    setContacts(updatedContacts);
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
  const handleAlertAction = (alertTitle, actionType) => {
    Alert.alert(
      alertTitle,
      actionType === 'view' 
        ? "Viewing alert details..." 
        : "Showing alert details...",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: actionType === 'view' ? "View Details" : "Show Details", 
          onPress: () => {
            Alert.alert(
              "Alert Details",
              `Alert: ${alertTitle}\n\nStatus: Delivered\nTime: Recent\nAction Taken: Emergency services notified`,
              [{ text: "OK" }]
            );
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
            // In a real app, you would use Linking to make the call
            console.log(`Calling ${contactName}: ${phoneNumber}`);
            Alert.alert("Calling", `Connecting to ${contactName}...`);
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
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            
            {/* Alert Items */}
            <AlertItem
              title="Test SOS sent"
              details="Today • 2:14 PM • Delivered to 3 contacts"
              onPress={() => handleAlertAction("Test SOS sent", "view")}
              buttonText="View"
            />
            
            <AlertItem
              title="Location shared"
              details="Yesterday • 6:40 PM • Mom, Partner"
              onPress={() => handleAlertAction("Location shared", "details")}
              buttonText="Details"
            />
            
            <AlertItem
              title="Low battery warning"
              details="Yesterday • 12:05 PM • Sent as SMS fallback"
              onPress={() => handleAlertAction("Low battery warning", "view")}
              buttonText="View"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.testAlertButton}
              onPress={sendTestAlert}
              activeOpacity={0.8}
            >
              <Text style={styles.testAlertButtonText}>Send Test Alert</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.manageContactsButton}
              onPress={manageContacts}
              activeOpacity={0.8}
            >
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
                        {contact.isEmergency && (
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
                        onPress={() => toggleEmergencyStatus(contact.id, contact.name)}
                      >
                        <Icon 
                          name={contact.isEmergency ? "star" : "star-border"} 
                          size={20} 
                          color={contact.isEmergency ? "#FFA000" : "#666"} 
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
                  Emergency contacts will receive all SOS alerts
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
const AlertItem = ({ title, details, onPress, buttonText }) => (
  <View style={styles.alertItem}>
    <View style={styles.alertContent}>
      <Text style={styles.alertTitle}>{title}</Text>
      <Text style={styles.alertDetails}>{details}</Text>
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
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#000',
    marginBottom: 20,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
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
  },
  testAlertButtonText: {
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
  },
  manageContactsButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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