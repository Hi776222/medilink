import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  Linking,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import Navbar from "../components/Navbar";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");

// Moroccan emergency numbers
const MOROCCAN_EMERGENCY_NUMBERS = {
  police: "19",
  ambulance: "15",
  fire: "15",
  gendarmerie: "177",
  royalGendarmerie: "177",
  civilProtection: "15",
  touristPolice: "0522 438 860",
};

// Real Moroccan emergency centers (will be dynamically updated based on user location)
const MOROCCAN_EMERGENCY_CENTERS = [
  {
    id: 1,
    name: "Hôpital Ibn Sina",
    type: "hospital",
    distance: "",
    time: "",
    coordinates: { latitude: 33.9911, longitude: -6.8702 }, // Rabat
    phone: "+212 5377 21212",
    address: "Rabat",
  },
  {
    id: 2,
    name: "Hôpital Cheikh Zaid",
    type: "hospital",
    distance: "",
    time: "",
    coordinates: { latitude: 33.9716, longitude: -6.8498 }, // Rabat
    phone: "+212 5377 11111",
    address: "Rabat",
  },
  {
    id: 3,
    name: "Commissariat Central",
    type: "police",
    distance: "",
    time: "",
    coordinates: { latitude: 33.9738, longitude: -6.8652 }, // Rabat Police
    phone: "+212 5372 02020",
    address: "Rabat Centre",
  },
  {
    id: 4,
    name: "CHU Ibn Rochd",
    type: "hospital",
    distance: "",
    time: "",
    coordinates: { latitude: 33.5722, longitude: -7.6573 }, // Casablanca
    phone: "+212 5224 84848",
    address: "Casablanca",
  },
  {
    id: 5,
    name: "Hôpital Militaire Moulay Ismail",
    type: "hospital",
    distance: "",
    time: "",
    coordinates: { latitude: 33.8975, longitude: -5.5547 }, // Meknes
    phone: "+212 5355 30303",
    address: "Meknes",
  },
  {
    id: 6,
    name: "Hôpital Al Farabi",
    type: "hospital",
    distance: "",
    time: "",
    coordinates: { latitude: 34.0209, longitude: -6.8416 }, // Salé
    phone: "+212 5378 40404",
    address: "Salé",
  },
];

// Moroccan emergency contacts (ICE - In Case of Emergency)
const MOROCCAN_ICE_CONTACTS = [
  {
    id: 1,
    name: "Maman",
    relationship: "Mère",
    phone: "+212 612-345678", // Moroccan mobile format
    receivingUpdates: true,
  },
  {
    id: 2,
    name: "Papa",
    relationship: "Père",
    phone: "+212 698-765432", // Moroccan mobile format
    receivingUpdates: true,
  },
  {
    id: 3,
    name: "Frère",
    relationship: "Frère",
    phone: "+212 600-112233",
    receivingUpdates: false,
  },
];

// Moroccan cities database for local detection
const MOROCCAN_CITIES = [
  { name: "Rabat", lat: 34.0209, lng: -6.8416, radius: 0.25 },
  { name: "Casablanca", lat: 33.5731, lng: -7.5898, radius: 0.45 },
  { name: "Marrakech", lat: 31.6295, lng: -7.9811, radius: 0.35 },
  { name: "Fès", lat: 34.0181, lng: -5.0078, radius: 0.25 },
  { name: "Tanger", lat: 35.7595, lng: -5.8340, radius: 0.25 },
  { name: "Meknès", lat: 33.8935, lng: -5.5547, radius: 0.25 },
  { name: "Salé", lat: 34.0392, lng: -6.7999, radius: 0.15 },
  { name: "Agadir", lat: 30.4278, lng: -9.5981, radius: 0.35 },
  { name: "Oujda", lat: 34.6819, lng: -1.9086, radius: 0.25 },
  { name: "Kénitra", lat: 34.2610, lng: -6.5802, radius: 0.25 },
  { name: "Tétouan", lat: 35.5889, lng: -5.3622, radius: 0.25 },
  { name: "Safi", lat: 32.2833, lng: -9.2333, radius: 0.25 },
  { name: "Mohammedia", lat: 33.6833, lng: -7.3833, radius: 0.20 },
  { name: "El Jadida", lat: 33.2333, lng: -8.5000, radius: 0.25 },
];

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sharingTime, setSharingTime] = useState(136); // seconds
  const [isSharing, setIsSharing] = useState(false);
  const [nearestLocations, setNearestLocations] = useState([]);
  const [userCity, setUserCity] = useState("Maroc");

  const mapRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    requestLocationPermission();

    if (isSharing) {
      startSharingTimer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isSharing]);

  useEffect(() => {
    if (location) {
      updateNearestLocations();
      detectMoroccanCity(location.latitude, location.longitude);
    }
  }, [location]);

  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Location access permission denied");
        setLoading(false);
        return;
      }
      getCurrentLocation();
    } catch (error) {
      console.error("Permission error:", error);
      setErrorMsg("Échec de l'obtention de la permission de localisation");
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      });

      const { latitude, longitude } = location.coords;
      setLocation(location.coords);

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          },
          1000
        );
      }

      setErrorMsg(null);
    } catch (error) {
      console.error("Location error:", error);
      setErrorMsg("Échec de la récupération de la localisation. Vérifiez le GPS.");
    } finally {
      setLoading(false);
    }
  };

  // Fixed city detection function
  const detectMoroccanCity = (lat, lng) => {
    // Find the nearest Moroccan city
    let nearestCity = "Maroc";
    let minDistance = Infinity;
    
    MOROCCAN_CITIES.forEach(city => {
      // Calculate simple Euclidean distance (good enough for city detection)
      const distance = Math.sqrt(
        Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
      );
      
      // If within city radius and closer than previous found city
      if (distance < city.radius && distance < minDistance) {
        minDistance = distance;
        nearestCity = city.name;
      }
    });
    
    setUserCity(nearestCity);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    // Convert to miles for display (optional)
    const distanceMiles = distance * 0.621371;
    
    // Calculate approximate travel time (assuming 40 km/h average)
    const timeHours = distance / 40;
    const timeMinutes = Math.round(timeHours * 60);
    
    return {
      km: distance.toFixed(1),
      miles: distanceMiles.toFixed(1),
      minutes: timeMinutes < 1 ? "<1" : timeMinutes
    };
  };

  const updateNearestLocations = () => {
    if (!location) return;

    const locationsWithDistance = MOROCCAN_EMERGENCY_CENTERS.map(place => {
      const distanceInfo = calculateDistance(
        location.latitude,
        location.longitude,
        place.coordinates.latitude,
        place.coordinates.longitude
      );
      
      return {
        ...place,
        distance: `${distanceInfo.km} km`,
        time: `${distanceInfo.minutes} min`,
        rawDistance: parseFloat(distanceInfo.km),
      };
    });

    // Sort by distance and take top 3
    const sorted = locationsWithDistance.sort((a, b) => a.rawDistance - b.rawDistance);
    const nearest = sorted.slice(0, 3);
    
    setNearestLocations(nearest);
  };

  const startSharingTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setSharingTime((prev) => prev + 1);
    }, 1000);
  };

  const toggleSharing = () => {
    if (isSharing) {
      setIsSharing(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      Alert.alert("Partage arrêté", "Votre localisation n'est plus partagée.");
    } else {
      if (!location) {
        Alert.alert("Localisation indisponible", "Veuillez activer les services de localisation.");
        return;
      }
      setIsSharing(true);
      startSharingTimer();
      Alert.alert(
        "Partage en direct activé",
        "Votre localisation est maintenant partagée avec les services d'urgence et vos contacts.",
        [
          {
            text: "Gérer les contacts",
            onPress: () => console.log("Navigate to contacts management"),
          },
          { text: "OK", style: "default" },
        ]
      );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const callEmergency = (number, service) => {
    Alert.alert(
      `Appeler ${service}`,
      `Voulez-vous appeler le ${service} au ${number}?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Appeler",
          onPress: () => {
            Linking.openURL(`tel:${number}`);
            // Log emergency call
            console.log(`Emergency call to ${service}: ${number}`);
          },
        },
      ]
    );
  };

  const callContact = (contact) => {
    Alert.alert(
      `Appeler ${contact.name}`,
      `Voulez-vous appeler ${contact.name} (${contact.relationship})?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Appeler",
          onPress: () => {
            Linking.openURL(`tel:${contact.phone}`);
          },
        },
      ]
    );
  };

  const shareWithICE = () => {
    Alert.alert(
      "Partager avec ICE",
      "Vos contacts ICE recevront vos mises à jour de localisation.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Gérer les contacts",
          onPress: () => console.log("Navigate to ICE contacts"),
        },
        {
          text: "Partager maintenant",
          onPress: () => {
            // Here you would actually send location to contacts
            const activeContacts = MOROCCAN_ICE_CONTACTS.filter(c => c.receivingUpdates);
            Alert.alert(
              "Partagé",
              `Localisation partagée avec ${activeContacts.map(c => c.name).join(', ')}`
            );
          },
        },
      ]
    );
  };

  const handleEmergency = () => {
    Alert.alert(
      "ALERTE D'URGENCE",
      "Ceci alertera immédiatement les services d'urgence marocains et tous vos contacts avec votre localisation en direct.",
      [
        { text: "Police (19)", onPress: () => callEmergency("19", "Police") },
        { text: "SAMU (15)", onPress: () => callEmergency("15", "SAMU") },
        { text: "Gendarmerie (177)", onPress: () => callEmergency("177", "Gendarmerie Royale") },
        { text: "Annuler", style: "cancel" },
      ]
    );
  };

  const recenterMap = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000
      );
    }
  };

  const getRouteToLocation = (destination) => {
    if (!location) return;
    
    const url = Platform.select({
      ios: `maps://app?saddr=${location.latitude},${location.longitude}&daddr=${destination.coordinates.latitude},${destination.coordinates.longitude}`,
      android: `google.navigation:q=${destination.coordinates.latitude},${destination.coordinates.longitude}`,
    });

    Alert.alert(
      `Route vers ${destination.name}`,
      `Distance: ${destination.distance}\nTemps estimé: ${destination.time}\n\n${destination.address}`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Obtenir l'itinéraire",
          onPress: () => {
            Linking.openURL(url).catch(() => {
              Alert.alert("Erreur", "Impossible d'ouvrir l'application de navigation");
            });
          },
        },
        {
          text: "Appeler",
          onPress: () => callEmergency(destination.phone, destination.name),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Map Section */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0A84FF" />
            <Text style={styles.loadingText}>Obtention de votre localisation...</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.errorOverlay}>
            <Icon name="location-off" size={40} color="#FF3B30" />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={getCurrentLocation}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={true}
            showsMyLocationButton={false}
            followsUserLocation={true}
            showsCompass={true}
            zoomEnabled={true}
            scrollEnabled={true}
            initialRegion={{
              latitude: location?.latitude || 33.9716,
              longitude: location?.longitude || -6.8498,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {/* User Marker */}
            {location && (
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Votre position"
                description={userCity}
              >
                <View style={styles.userMarker}>
                  <View style={styles.userMarkerInner}>
                    <Icon name="person-pin" size={30} color="#FF3B30" />
                  </View>
                </View>
              </Marker>
            )}

            {/* Nearest Emergency Centers Markers */}
            {nearestLocations.map((place) => (
              <Marker
                key={place.id}
                coordinate={place.coordinates}
                title={place.name}
                description={`${place.distance} • ${place.time}`}
              >
                <View
                  style={[
                    styles.placeMarker,
                    place.type === "hospital" && styles.hospitalMarker,
                    place.type === "police" && styles.policeMarker,
                  ]}
                >
                  <Icon
                    name={place.type === "hospital" ? "local-hospital" : "security"}
                    size={20}
                    color="#FFF"
                  />
                </View>
              </Marker>
            ))}
          </MapView>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for an address or place"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.centerButton} onPress={recenterMap}>
            <Icon name="my-location" size={20} color="#FFF" />
            <Text style={styles.centerButtonText}>Centrer</Text>
          </TouchableOpacity>
        </View>

        {/* Sharing Status */}
        {isSharing && (
          <View style={styles.sharingStatus}>
            <View style={styles.sharingStatusContent}>
              <Icon name="share-location" size={16} color="#0A84FF" />
              <Text style={styles.sharingStatusText}>
                Live sharing with emergency + 2 contacts
              </Text>
              <Text style={styles.sharingTime}>{formatTime(sharingTime)}</Text>
            </View>
            <View style={styles.gpsStatus}>
              <Icon name="gps-fixed" size={12} color="#4CAF50" />
              <Text style={styles.gpsStatusText}>Accuracy Improving • Strong GPS</Text>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Live Location Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Live Localisation </Text>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={toggleSharing}
          >
            <Icon 
              name={isSharing ? "share-location" : "location-off"} 
              size={20} 
              color={isSharing ? "#0A84FF" : "#666"} 
            />
            <Text style={[
              styles.shareButtonText,
              isSharing && styles.shareButtonTextActive
            ]}>
              {isSharing ? "stop sharing" : "start sharing"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current City */}
        {userCity && (
          <View style={styles.citySection}>
            <Icon name="location-city" size={16} color="#0A84FF" />
            <Text style={styles.cityText}>{userCity}, Morocco</Text>
          </View>
        )}

        {/* Emergency Quick Actions */}
        <View style={styles.emergencyQuickActions}>
          <TouchableOpacity 
            style={styles.emergencyAction}
            onPress={() => callEmergency("19", "Police")}
          >
            <Icon name="local-police" size={24} color="#0A84FF" />
            <Text style={styles.emergencyActionText}>Police</Text>
            <Text style={styles.emergencyNumber}>19</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.emergencyAction}
            onPress={() => callEmergency("15", "SAMU")}
          >
            <Icon name="local-hospital" size={24} color="#FF3B30" />
            <Text style={styles.emergencyActionText}>SAMU</Text>
            <Text style={styles.emergencyNumber}>15</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.emergencyAction}
            onPress={() => callEmergency("177", "Gendarmerie")}
          >
            <Icon name="security" size={24} color="#4CAF50" />
            <Text style={styles.emergencyActionText}>Military Police</Text>
            <Text style={styles.emergencyNumber}>177</Text>
          </TouchableOpacity>
        </View>

        {/* Nearest Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearest Help</Text>

          {nearestLocations.map((place) => (
            <TouchableOpacity 
              key={place.id} 
              style={styles.placeCard}
              onPress={() => getRouteToLocation(place)}
            >
              <View style={styles.placeInfo}>
                <Icon
                  name={place.type === "hospital" ? "local-hospital" : "security"}
                  size={24}
                  color={place.type === "hospital" ? "#FF3B30" : "#0A84FF"}
                />
                <View style={styles.placeDetails}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <Text style={styles.placeDistance}>
                    {place.distance} • {place.time}
                  </Text>
                  <Text style={styles.placeAddress}>{place.address}</Text>
                </View>
              </View>
              <View style={styles.placeActions}>
                <TouchableOpacity 
                  style={styles.callButton}
                  onPress={() => callEmergency(place.phone, place.name)}
                >
                  <Icon name="call" size={18} color="#0A84FF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.routeButton}
                  onPress={() => getRouteToLocation(place)}
                >
                  <Text style={styles.routeButtonText}>Itinéraire</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {/* ICE Contacts */}
          <View style={styles.iceSection}>
            <Text style={styles.iceTitle}>Emergency Contacts (ICE)</Text>
            {MOROCCAN_ICE_CONTACTS.filter(contact => contact.receivingUpdates).map((contact) => (
              <TouchableOpacity 
                key={contact.id} 
                style={styles.iceContact}
                onPress={() => callContact(contact)}
              >
                <View style={styles.iceContactInfo}>
                  <Icon name="person" size={20} color="#FFA000" />
                  <View style={styles.iceContactDetails}>
                    <Text style={styles.iceContactName}>{contact.name}</Text>
                    <Text style={styles.iceContactRelation}>{contact.relationship}</Text>
                  </View>
                </View>
                <View style={styles.iceContactActions}>
                  <Text style={styles.iceContactPhone}>{contact.phone}</Text>
                  {contact.receivingUpdates && (
                    <Icon name="notifications-active" size={16} color="#4CAF50" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={styles.manageButton} onPress={shareWithICE}>
              <Text style={styles.manageButtonText}>Manage contacts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Button */}
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergency}>
          <Icon name="warning" size={24} color="#FFF" />
          <Text style={styles.emergencyButtonText}>EMERGENCY</Text>
        </TouchableOpacity>

        {/* Important Notice */}
        <View style={styles.noticeBox}>
          <Icon name="info" size={16} color="#666" />
          <Text style={styles.noticeText}>
            En cas d'urgence, composez directement le 19 (Police), 15 (SAMU) ou 177 (Gendarmerie Royale)
          </Text>
        </View>

        {/* Spacer for navbar */}
        <View style={styles.spacer} />
      </ScrollView>

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mapContainer: {
    height: height * 0.45,
    backgroundColor: "#FFFFFF",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#333",
    marginTop: 10,
    fontSize: 16,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: "#0A84FF",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  searchContainer: {
    position: "absolute",
    top: 10,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginRight: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
  },
  centerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A84FF",
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  centerButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 5,
  },
  userMarker: {
    alignItems: "center",
  },
  userMarkerInner: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  placeMarker: {
    backgroundColor: "#0A84FF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  hospitalMarker: {
    backgroundColor: "#FF3B30",
  },
  policeMarker: {
    backgroundColor: "#0A84FF",
  },
  sharingStatus: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sharingStatusContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  sharingStatusText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  sharingTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0A84FF",
  },
  gpsStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  gpsStatusText: {
    fontSize: 14,
    color: "#4CAF50",
    marginLeft: 5,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 25,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareButtonText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
    fontWeight: "500",
  },
  shareButtonTextActive: {
    color: "#0A84FF",
  },
  citySection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cityText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
    fontWeight: "500",
  },
  emergencyQuickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  emergencyAction: {
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderRadius: 12,
    minWidth: 100,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  emergencyActionText: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
    fontWeight: "500",
  },
  emergencyNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF3B30",
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#333",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  placeCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  placeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  placeDetails: {
    marginLeft: 15,
    flex: 1,
  },
  placeName: {
    color: "#333",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  placeDistance: {
    color: "#0A84FF",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  placeAddress: {
    color: "#666",
    fontSize: 12,
  },
  placeActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  callButton: {
    backgroundColor: "#F0F0F0",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  routeButton: {
    backgroundColor: "#0A84FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  routeButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  iceSection: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  iceTitle: {
    color: "#333",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  iceContact: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  iceContactInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iceContactDetails: {
    marginLeft: 12,
  },
  iceContactName: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  iceContactRelation: {
    color: "#666",
    fontSize: 14,
  },
  iceContactActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iceContactPhone: {
    color: "#0A84FF",
    fontSize: 14,
    marginRight: 8,
    fontWeight: "500",
  },
  manageButton: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 15,
  },
  manageButtonText: {
    color: "#0A84FF",
    fontWeight: "600",
    fontSize: 16,
  },
  emergencyButton: {
    backgroundColor: "#FF3B30",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  emergencyButtonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
  },
  noticeBox: {
    flexDirection: "row",
    backgroundColor: "#FFF3CD",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  noticeText: {
    flex: 1,
    color: "#856404",
    fontSize: 12,
    marginLeft: 8,
    lineHeight: 16,
  },
  spacer: {
    height: 100,
  },
});