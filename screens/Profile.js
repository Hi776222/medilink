// // import React from 'react';
// // import { View, Text, StyleSheet } from 'react-native';
// // import { auth } from '../firebaseConfig';

// // export default function Profile() {
// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.title}>Profil</Text>
// //       <Text>Email: {auth.currentUser?.email}</Text>
// //       <Text>UID: {auth.currentUser?.uid}</Text>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container:{flex:1,justifyContent:'center',alignItems:'center'},
// //   title:{fontSize:24,fontWeight:'bold',marginBottom:20}
// // });
// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { auth } from "../firebaseConfig";
// import { signOut } from "firebase/auth";

// export default function Profile() {
//   const handleLogout = () => {
//     signOut(auth);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Profil</Text>
//       <Text>Email: {auth.currentUser?.email}</Text>
//       <Text>UID: {auth.currentUser?.uid}</Text>

//       <TouchableOpacity style={[styles.button, { backgroundColor: "red", marginTop: 20 }]} onPress={handleLogout}>
//         <Text style={styles.buttonText}>Déconnexion</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container:{flex:1,justifyContent:'center',alignItems:'center',padding:20},
//   title:{fontSize:24,fontWeight:'bold',marginBottom:20},
//   button:{backgroundColor:'#0275d8',padding:15,borderRadius:10,width:"80%",alignItems:'center'},
//   buttonText:{color:'#fff',fontSize:18,fontWeight:'bold'}
// });

// src/Screens/Profile.js
// src/Screens/Profile.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';

import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Navbar from '../components/Navbar'; // 👈 NAVBAR

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserData();
    setUser(auth.currentUser);
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigation.replace('Login');
        return;
      }

      const userDocRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        navigation.replace('MedicalForm');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger votre profil');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await signOut(auth);
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('MedicalForm', {
      existingData: userData,
      isEdit: true
    });
  };

  const formatDate = (date) => {
    if (!date) return 'Non spécifié';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  if (!userData) return null;

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Icon name="person" size={40} color="#FFF" />
          </View>
          <View>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="logout" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Section title="personal informations" icon="person" color="#4A90E2">
          <InfoRow icon="cake" label="Date of birth" value={formatDate(userData.dob)} />
          <InfoRow icon="scale" label="wWeight" value={`${userData.weight} kg`} />
          <InfoRow icon="straighten" label="Height" value={`${userData.height} cm`} />
          <InfoRow icon="bloodtype" label="Bloodtype" value={userData.bloodType} />
        </Section>

        <Section title="Medical Information" icon="medical-services" color="#FF6B6B">
          <InfoRow icon="warning" label="Allergies" value={userData.allergies || 'Aucune'} isMultiline />
          <InfoRow icon="healing" label="Conditions" value={userData.conditions || 'Aucune'} isMultiline />
        </Section>

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Icon name="edit" size={20} color="#4A90E2" />
          <Text style={styles.editButtonText}>Modify profil</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* NAVBAR FIXE */}
      <Navbar />
    </View>
  );
}

/* COMPONENTS */

function Section({ title, icon, color, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon name={icon} size={24} color={color} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function InfoRow({ icon, label, value, isMultiline }) {
  return (
    <View style={styles.infoRow}>
      <Icon name={icon} size={20} color="#666" />
      <View style={{ marginLeft: 15, flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, isMultiline && { lineHeight: 22 }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userName: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
  },
  logoutButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 140, // 👈 مهم للـ navbar
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  infoLabel: {
    color: '#666',
    fontSize: 14,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#4A90E2',
    marginBottom: 30,
  },
  editButtonText: {
    marginLeft: 10,
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
});
