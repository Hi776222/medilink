// import { initializeApp, getApp, getApps } from "firebase/app";
// import { initializeAuth, getReactNativePersistence } from "firebase/auth";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const firebaseConfig = {
//   apiKey: "AIzaSyAOHcAAsxkAuqyUSEhI_b6RMLyPXR0zTPU",
//   authDomain: "medilink-f3731.firebaseapp.com",
//   projectId: "medilink-f3731",
//   storageBucket: "medilink-f3731.appspot.com",
//   messagingSenderId: "306555989686",
//   appId: "1:306555989686:web:aa8741695dd8c050dc0017",
//   measurementId: "G-NDCL19CEJ7"
// };

// // 🔧 initializeApp une seule fois
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// // 🔐 Auth pour React Native + persistance
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage)
// });

// export { app, auth };
// import { initializeApp, getApp, getApps } from "firebase/app";
// import { initializeAuth, getReactNativePersistence } from "firebase/auth";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const firebaseConfig = {
//   apiKey: "AIzaSyAOHcAAsxkAuqyUSEhI_b6RMLyPXR0zTPU",
//   authDomain: "medilink-f3731.firebaseapp.com",
//   projectId: "medilink-f3731",
//   storageBucket: "medilink-f3731.appspot.com",
//   messagingSenderId: "306555989686",
//   appId: "1:306555989686:web:aa8741695dd8c050dc0017",
// };

// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });

// export { app, auth };
import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- ajouter Firestore
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAOHcAAsxkAuqyUSEhI_b6RMLyPXR0zTPU",
  authDomain: "medilink-f3731.firebaseapp.com",
  projectId: "medilink-f3731",
  storageBucket: "medilink-f3731.appspot.com",
  messagingSenderId: "306555989686",
  appId: "1:306555989686:web:aa8741695dd8c050dc0017",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// **Ajouter Firestore**
const db = getFirestore(app);

export { app, auth, db };
