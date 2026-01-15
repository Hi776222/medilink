import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";//useroute Permet de savoir sur quel écran on se trouve actuellement.
import Icon from "react-native-vector-icons/MaterialIcons";

export default function Navbar() {
  const navigation = useNavigation();
  const route = useRoute();
//elle vérifie si l’écran actuel est celui donné en paramètre.
  const isActive = (name) => route.name === name;

  return (
    <View style={styles.navbar}>
      <NavItem
        icon="home"
        label="Home"
        active={isActive("Home")}
        onPress={() => navigation.navigate("Home")}
      />

      <NavItem
        icon="medical-services"
        label="Medical"
        active={isActive("MedicalForm")}
        onPress={() => navigation.navigate("MedicalForm")}
      />

      <NavItem
        icon="notifications"
        label="Alerts"
        active={isActive("Alerts")}
        onPress={() => navigation.navigate("Alerts")}
      />

      <NavItem
        icon="record-voice-over"
        label="Voice"
        active={isActive("VoiceAssistant")}
        onPress={() => navigation.navigate("VoiceAssistant")}
      />

      <NavItem
        icon="map"
        label="Map"
        active={isActive("Map")}
        onPress={() => navigation.navigate("Map")}
      />

      <NavItem
        icon="person"
        label="Profile"
        active={isActive("Profile")}
        onPress={() => navigation.navigate("Profile")}
      />
    </View>
  );
}

function NavItem({ icon, label, onPress, active }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.item}>
      {/* Icon */}
      <Icon
        name={icon}
        size={24}
        color={active ? "#fff" : "rgba(255,255,255,0.7)"}
      />
      {/* Label */}
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: "absolute",
    bottom: 15,
    left: 10,
    right: 10,
    height: 65,
    backgroundColor: "#0A84FF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 25,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  item: {
    alignItems: "center",
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    textAlign: 'center',
  },
  activeLabel: {
    color: "#fff",
    fontWeight: "bold",
  },
});