// import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// export default function Emergency({ route, navigation }) {
//   const handleClose = () => {
//     if (route.params?.onClose) {
//       route.params.onClose(); // met showEmergency à false
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Emergency</Text>

//       <View style={styles.card}>
//         <Text style={styles.bigText}>Tap to send immediate SOS</Text>
//         <Text style={styles.smallText}>
//           Shares your live location and medical snapshot
//         </Text>
//       </View>

//       <TouchableOpacity style={styles.sosButton} onPress={handleClose}>
//         <Text style={styles.sosText}>EMERGENCY</Text>
//         <Text style={styles.holdText}>Hold 2s to confirm</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// // Styles identiques à ton code
// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#f8fcff" },
//   title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },

//   card: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 16,
//     marginBottom: 40,
//   },

//   bigText: { fontSize: 18, fontWeight: "600" },
//   smallText: { color: "#666", marginTop: 10 },

//   sosButton: {
//     backgroundColor: "#E53935",
//     width: 220,
//     height: 220,
//     borderRadius: 110,
//     alignSelf: "center",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   sosText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
//   holdText: { color: "#fff", marginTop: 8 },
// });
// screens/EmergencyScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';

const EmergencyScreen = () => {
  const [call911, setCall911] = useState(true);
  const [notifyContacts, setNotifyContacts] = useState(true);
  const [askAI, setAskAI] = useState(false);
  const [sendSOS, setSendSOS] = useState(false);

  const handleEmergencyTrigger = () => {
    Alert.alert(
      'Confirm Emergency',
      'Are you sure you want to send an emergency SOS?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => {
            Alert.alert('SOS Sent', 'Emergency services and your contacts have been notified.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Emergency</Text>
          <Text style={styles.subtitle}>
            Tap to send immediate SOS. Shares your live location and medical snapshot with 911 and ICE contacts.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.emergencyButtonContainer}>
          <Text style={styles.emergencyLabel}>EMERGENCY</Text>
          <Text style={styles.emergencySubLabel}>Hold 2s to confirm</Text>
          
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={handleEmergencyTrigger}
            activeOpacity={0.8}
          >
            <Text style={styles.emergencyButtonText}>SEND SOS</Text>
          </TouchableOpacity>

          <View style={styles.optionsContainer}>
            <View style={styles.optionRow}>
              <Text style={styles.optionText}>Call 911</Text>
              <Switch
                value={call911}
                onValueChange={setCall911}
                trackColor={{ false: '#767577', true: '#FF3B30' }}
                thumbColor={call911 ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.optionRow}>
              <Text style={styles.optionText}>Notify contacts</Text>
              <Switch
                value={notifyContacts}
                onValueChange={setNotifyContacts}
                trackColor={{ false: '#767577', true: '#FF3B30' }}
                thumbColor={notifyContacts ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        <View style={styles.medicalSection}>
          <Text style={styles.medicalTitle}>Medical Snapshot</Text>
          <Text style={styles.medicalSubtitle}>Primary condition</Text>
          
          <View style={styles.conditionBox}>
            <Text style={styles.conditionText}>Asthma</Text>
          </View>

          <View style={styles.medicalOptions}>
            <View style={styles.optionRow}>
              <Text style={styles.optionText}>Ask AI for help</Text>
              <Switch
                value={askAI}
                onValueChange={setAskAI}
                trackColor={{ false: '#767577', true: '#4CD964' }}
                thumbColor={askAI ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.optionRow}>
              <Text style={styles.optionText}>Send SOS</Text>
              <Switch
                value={sendSOS}
                onValueChange={setSendSOS}
                trackColor={{ false: '#767577', true: '#FF3B30' }}
                thumbColor={sendSOS ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Edit profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Copy info</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  divider: {
    height: 2,
    backgroundColor: '#e0e0e0',
    width: '100%',
  },
  emergencyButtonContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 5,
  },
  emergencySubLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emergencyButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  medicalSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  medicalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  conditionBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  conditionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  medicalOptions: {
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default EmergencyScreen;