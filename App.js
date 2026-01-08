// import React, { useEffect, useState } from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "./firebaseConfig";

// import Login from "./screens/Login";
// import Home from "./screens/Home";
// import Profile from "./screens/Profile";

// const Stack = createNativeStackNavigator();

// export default function App() {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setUser(user);
//     });
//     return unsubscribe;
//   }, []);

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {user ? (
//           <>
//             <Stack.Screen name="Home" component={Home} />
//             <Stack.Screen name="Profile" component={Profile} />
//           </>
//         ) : (
//           <Stack.Screen name="Login" component={Login} />
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
// import React, { useState, useEffect } from "react";
// import { useState, useEffect } from "react"; // <-- AJOUTE CET IMPORT
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "./firebaseConfig";

// import Login from "./screens/Login";
// import Register from "./screens/Register";
// import Profile from "./screens/Profile";
// import MedicalForm from "./screens/MedicalForm";

// const Stack = createNativeStackNavigator();

// // Stack pour utilisateurs non connectés
// function AuthStack() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="Login" component={Login} />
//       <Stack.Screen name="Register" component={Register} />
//     </Stack.Navigator>
//   );
// }

// // Stack pour utilisateurs connectés
// function AppStack() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="Profile" component={Profile} />
//       <Stack.Screen name="MedicalForm" component={MedicalForm} />
//     </Stack.Navigator>
//   );
// }

// export default function App() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (usr) => {
//       setUser(usr);
//       setLoading(false);
//     });
//     return unsubscribe;
//   }, []);

//   if (loading) return null; // attendre que Firebase charge l'utilisateur

//   return (
//     <NavigationContainer>
//       {user ? <AppStack /> : <AuthStack />}
//     </NavigationContainer>
//   );
// }
// import { useEffect, useState } from "react";
// import { View, ActivityIndicator } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "./firebaseConfig";
// import MedicalForm from "./screens/MedicalForm";

// import Login from "./screens/Login";
// import Register from "./screens/Register";
// import BottomTabs from "./navigation/BottomTabs";

// const Stack = createNativeStackNavigator();

// export default function App() {
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (u) => {
//       setUser(u);
//       setLoading(false);
//     });
//     return unsubscribe;
//   }, []);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {!user ? (
//           <>
//             <Stack.Screen name="Login" component={Login} />
//             <Stack.Screen name="Register" component={Register} />
//           </>
//         ) : (
//           // ✅ Bottom navbar works on ALL these pages
//           <Stack.Screen name="Main" component={BottomTabs} />
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// App.js
// import { useState } from "react";
// import { View, ActivityIndicator } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";

// import Login from "./screens/Login";
// import Register from "./screens/Register";
// import MedicalForm from "./screens/MedicalForm";
// import Profile from "./screens/Profile";

// const Stack = createNativeStackNavigator();

// export default function App() {
//   const [loading, setLoading] = useState(false);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator
//         initialRouteName="Login"  // THIS MAKES LOGIN FIRST PAGE
//         screenOptions={{ 
//           headerShown: false
//         }}
//       >
//         <Stack.Screen name="Login" component={Login} />
//         <Stack.Screen name="Register" component={Register} />
//         <Stack.Screen name="MedicalForm" component={MedicalForm} />
//         <Stack.Screen name="Profile" component={Profile} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
import { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Navbar from "./components/Navbar"; // Import Navbar

// Screens
import Login from "./screens/Login";
import Register from "./screens/Register";
import MedicalForm from "./screens/MedicalForm";
import Profile from "./screens/Profile";
import AlertsScreen from "./screens/AlertsScreen";
import MapScreen from "./screens/MapScreen";
import VoiceAssistantScreen from "./screens/VoiceAssistantScreen";
import Home from "./screens/Home";

const Stack = createNativeStackNavigator();

// Main Layout Component with Navbar
function MainLayout({ children }) {
  return (
    <View style={{ flex: 1 }}>
      {children}
      <Navbar />
    </View>
  );
}

export default function App() {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2F80ED" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* 🔐 AUTH (No Navbar) */}
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }}
        />

        {/* 🩺 FIRST TIME USER (No Navbar) */}
        <Stack.Screen
          name="MedicalForm"
          component={MedicalForm}
          options={{ headerShown: false }}
        />

        {/* 🚀 MAIN APP (With Navbar) */}
        <Stack.Screen
          name="Home"
          component={() => (
            <MainLayout>
              <Home />
            </MainLayout>
          )}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={() => (
            <MainLayout>
              <Profile />
            </MainLayout>
          )}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Alerts"
          component={() => (
            <MainLayout>
              <AlertsScreen />
            </MainLayout>
          )}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VoiceAssistant"
          component={() => (
            <MainLayout>
              <VoiceAssistantScreen />
            </MainLayout>
          )}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Map"
          component={() => (
            <MainLayout>
              <MapScreen />
            </MainLayout>
          )}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}