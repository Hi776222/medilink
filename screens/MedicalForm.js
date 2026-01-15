// // src/Screens/MedicalForm.js
// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert } from 'react-native';
// import { auth } from '../firebaseConfig';
// import { getFirestore, doc, setDoc } from 'firebase/firestore';

// export default function MedicalForm({ navigation }) {
//   const [name, setName] = useState('');
//   const [dob, setDob] = useState('');
//   const [weight, setWeight] = useState('');
//   const [height, setHeight] = useState('');
//   const [bloodType, setBloodType] = useState('');
//   const [allergies, setAllergies] = useState('');
//   const [conditions, setConditions] = useState('');

//   const handleSave = async () => {
//     if (!name || !dob || !weight || !height || !bloodType) {
//       Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
//       return;
//     }

//     const user = auth.currentUser;
//     if (!user) return;

//     const db = getFirestore();
//     const userRef = doc(db, 'users', user.uid);

//     await setDoc(userRef, {
//       name,
//       dob,
//       weight,
//       height,
//       bloodType,
//       allergies,
//       conditions,
//       medications: [],
//       emergencyContacts: [],
//       preferences: { voiceActivation: true, notifications: true },
//       email: user.email
//     });

//     Alert.alert('Succès', 'Profil médical sauvegardé !');
//     navigation.navigate('Profile');
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Medical Profile</Text>
//       <TextInput placeholder="Full Name" style={styles.input} value={name} onChangeText={setName} />
//       <TextInput placeholder="Date of Birth (YYYY-MM-DD)" style={styles.input} value={dob} onChangeText={setDob} />
//       <TextInput placeholder="Weight (kg)" style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />
//       <TextInput placeholder="Height (cm)" style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" />
//       <TextInput placeholder="Blood Type" style={styles.input} value={bloodType} onChangeText={setBloodType} />
//       <TextInput placeholder="Allergies" style={styles.input} value={allergies} onChangeText={setAllergies} />
//       <TextInput placeholder="Conditions" style={styles.input} value={conditions} onChangeText={setConditions} />
//       <Button title="Save Profile" onPress={handleSave} />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: '#fff' },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 }
// });
// src/Screens/MedicalForm.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";

import { auth } from "../firebaseConfig";// savoir quel utilisateur est connecté.
import { getFirestore, doc, setDoc } from "firebase/firestore";//ACECDER/CREER DOC/enregistrer donne dans firebase
import Navbar from "../components/Navbar";

export default function MedicalForm({ navigation }) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");

  const handleSave = async () => {
    if (!name || !dob || !weight || !height || !bloodType) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    const user = auth.currentUser;//Récupère l’utilisateur connecté.
    if (!user) return;//Si aucun utilisateur n’est connecté → arrête la fonction.

    const db = getFirestore();//On accède à la base de données Firestore.
    const userRef = doc(db, "users", user.uid);//On crée un document spécifique pour cet utilisateur dans la collection users.
//On enregistre toutes les informations dans Firestore 
    await setDoc(userRef, {
      name,
      dob,
      weight,
      height,
      bloodType,
      allergies,
      conditions,
      medications: [],
      emergencyContacts: [],
      preferences: { voiceActivation: true, notifications: true },
      email: user.email,
    });

    Alert.alert("Succès", "Profil médical sauvegardé !");
    navigation.navigate("Profile");
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Medical Profile</Text>

        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Date of Birth (YYYY-MM-DD)"
          style={styles.input}
          value={dob}
          onChangeText={setDob}
        />

        <TextInput
          placeholder="Weight (kg)"
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />

        <TextInput
          placeholder="Height (cm)"
          style={styles.input}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />

        <TextInput
          placeholder="Blood Type"
          style={styles.input}
          value={bloodType}
          onChangeText={setBloodType}
        />

        <TextInput
          placeholder="Allergies"
          style={styles.input}
          value={allergies}
          onChangeText={setAllergies}
        />

        <TextInput
          placeholder="Conditions"
          style={styles.input}
          value={conditions}
          onChangeText={setConditions}
        />

        <Button title="Save Profile" onPress={handleSave} />
      </ScrollView>

      {/* NAVBAR FIXE */}
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 20,
    paddingBottom: 130, 
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});
