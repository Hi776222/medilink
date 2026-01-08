// // import React, { useState } from 'react';
// // import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
// // import { auth } from '../firebaseConfig';
// // import { signInWithEmailAndPassword } from 'firebase/auth';

// // export default function Login() {
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');

// //   const handleLogin = () => {
// //     signInWithEmailAndPassword(auth, email, password)
// //       .then((userCredential) => {
// //         Alert.alert("Bienvenue", "Connexion réussie !");
// //       })
// //       .catch((error) => {
// //         Alert.alert("Erreur", error.message);
// //       });
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.title}>Connexion</Text>

// //       <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} value={email}/>
// //       <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry onChangeText={setPassword} value={password}/>

// //       <TouchableOpacity style={styles.button} onPress={handleLogin}>
// //         <Text style={styles.buttonText}>Se connecter</Text>
// //       </TouchableOpacity>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container:{flex:1,justifyContent:'center',alignItems:'center',padding:20},
// //   title:{fontSize:24,fontWeight:'bold',marginBottom:20},
// //   input:{width:'100%',height:50,borderColor:'#ccc',borderWidth:1,borderRadius:8,paddingHorizontal:15,marginBottom:15},
// //   button:{backgroundColor:'#0275d8',width:'100%',height:50,borderRadius:8,justifyContent:'center',alignItems:'center'},
// //   buttonText:{color:'#fff',fontSize:18,fontWeight:'bold'}
// // });
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert("🎉 Connexion réussie", "Bienvenue sur MediLink!");
        // ✅ REDIRECT TO HOME INSTEAD OF MEDICALFORM
        navigation.replace("Home");
      })
      .catch((error) => {
        setIsLoading(false);
        if (error.code === "auth/user-not-found") {
          Alert.alert("Compte inexistant", "Voulez-vous créer un compte?", [
            { text: "Annuler", style: "cancel" },
            { text: "Créer", onPress: () => navigation.navigate("Register") },
          ]);
        } else if (error.code === "auth/wrong-password") {
          Alert.alert("Mot de passe incorrect", "Veuillez réessayer");
        } else if (error.code === "auth/invalid-email") {
          Alert.alert("Email invalide", "Veuillez entrer un email valide");
        } else {
          Alert.alert("Erreur de connexion", error.message);
        }
      });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Header */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Icon name="medical-services" size={60} color="#2F80ED" />
            </View>
            <Text style={styles.appName}>MediLink</Text>
            <Text style={styles.appTagline}>Votre assistant médical d'urgence</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeTitle}>Bienvenue</Text>
            <Text style={styles.welcomeSubtitle}>
              Connectez-vous pour accéder à votre compte
            </Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Icon name="email" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                placeholder="Adresse email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                placeholder="Mot de passe"
                style={[styles.input, { paddingRight: 50 }]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon 
                  name={showPassword ? "visibility-off" : "visibility"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => Alert.alert("Mot de passe oublié", "Fonctionnalité à venir")}
            >
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Icon name="hourglass-empty" size={20} color="#fff" />
                  <Text style={styles.loginButtonText}>Connexion en cours...</Text>
                </View>
              ) : (
                <View style={styles.loginButtonContent}>
                  <Icon name="login" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.loginButtonText}>Se connecter</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Ou continuer avec</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#4285F4' }]}
                onPress={() => Alert.alert("Google", "Connexion Google à venir")}
              >
                <Icon name="google" size={20} color="#fff" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#4267B2' }]}
                onPress={() => Alert.alert("Facebook", "Connexion Facebook à venir")}
              >
                <Icon name="facebook" size={20} color="#fff" />
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerLink}>S'inscrire</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              En vous connectant, vous acceptez nos{" "}
              <Text style={styles.footerLink}>Conditions d'utilisation</Text> et{" "}
              <Text style={styles.footerLink}>Politique de confidentialité</Text>
            </Text>
            <Text style={styles.copyright}>© 2024 MediLink. Tous droits réservés.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2F80ED",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  formContainer: {
    paddingHorizontal: 30,
    marginTop: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    height: 56,
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
    paddingRight: 16,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    padding: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: "#2F80ED",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#2F80ED",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#2F80ED",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginBottom: 25,
  },
  loginButtonDisabled: {
    backgroundColor: "#90CAF9",
    elevation: 0,
  },
  loginButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    color: "#666",
    fontSize: 14,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  socialButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  registerText: {
    fontSize: 16,
    color: "#666",
  },
  registerLink: {
    fontSize: 16,
    color: "#2F80ED",
    fontWeight: "bold",
  },
  footer: {
    paddingHorizontal: 30,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 10,
  },
  footerLink: {
    color: "#2F80ED",
    textDecorationLine: "underline",
  },
  copyright: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});


// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { auth } from "../firebaseConfig";
// import { signInWithEmailAndPassword } from "firebase/auth";

// export default function Login({ navigation }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLogin = () => {
//     signInWithEmailAndPassword(auth, email, password)
//       .then(() => {
//         Alert.alert("Connexion réussie");
//         navigation.navigate("Profile"); // ✅ هنا الحل
//       })
//       .catch((error) => {
//         if (error.code === "auth/user-not-found") {
//           Alert.alert("Compte inexistant", "Veuillez créer un compte.");
//           navigation.navigate("Register");
//         } else {
//           Alert.alert("Erreur", error.message);
//         }
//       });
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Connexion</Text>

//       <TextInput
//         placeholder="Email"
//         style={styles.input}
//         onChangeText={setEmail}
//         value={email}
//       />

//       <TextInput
//         placeholder="Mot de passe"
//         style={styles.input}
//         secureTextEntry
//         onChangeText={setPassword}
//         value={password}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <Text style={styles.buttonText}>Se connecter</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         onPress={() => navigation.navigate("Register")}
//         style={{ marginTop: 15 }}
//       >
//         <Text style={{ color: "#0275d8" }}>
//           Pas de compte ? S'inscrire
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   input: {
//     width: "100%",
//     height: 50,
//     borderColor: "#ccc",
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//   },
//   button: {
//     backgroundColor: "#0275d8",
//     width: "100%",
//     height: 50,
//     borderRadius: 8,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
// });
