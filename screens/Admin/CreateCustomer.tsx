import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../../services/api";

export default function CreateCustomer() {
  const navigation = useNavigation<any>();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [floor, setFloor] = useState(2);
  const [elevator, setElevator] = useState(false);
  const [parking, setParking] = useState(false);

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const saveCustomer = async () => {
    if (!fullName || !phone || !pickupAddress || !dropoffAddress) {
      Alert.alert("Validation", "Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await api.post("/customers", {
        fullName,
        email,
        phone,
        pickupAddress,
        dropoffAddress,
        floor,
        elevator,
        parking,
        notes,
      });

      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "Failed to save customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Create Customers</Text>

      <View style={styles.card}>
        <Text style={styles.section}>Contact Information</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter customer name"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="john@movingco.com"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="(999) 999 9090"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Move Details</Text>

        <Text style={styles.label}>Pick Address</Text>
        <View style={styles.addressField}>
          <TextInput
            placeholder="Enter pickup address"
            value={pickupAddress}
            onChangeText={setPickupAddress}
            style={styles.addressInput}
          />
          <Text style={styles.icon}>📍</Text>
        </View>

        <Text style={styles.label}>Drop-off Address</Text>
        <View style={styles.addressField}>
          <TextInput
            placeholder="Enter drop-off address"
            value={dropoffAddress}
            onChangeText={setDropoffAddress}
            style={styles.addressInput}
          />
          <Text style={styles.icon}>📍</Text>
        </View>

        <Text style={styles.label}>Floor</Text>
        <View style={styles.counterRow}>
          <Pressable onPress={() => setFloor(Math.max(1, floor - 1))}>
            <Text style={styles.counterBtn}>−</Text>
          </Pressable>
          <Text style={styles.floor}>{floor}</Text>
          <Pressable onPress={() => setFloor(floor + 1)}>
            <Text style={styles.counterBtn}>+</Text>
          </Pressable>
        </View>

        <View style={styles.switchRow}>
          <Text>Elevator available</Text>
          <Switch value={elevator} onValueChange={setElevator} />
        </View>

        <View style={styles.switchRow}>
          <Text>Parking Secured</Text>
          <Switch value={parking} onValueChange={setParking} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Additional Notes</Text>
        <TextInput
          style={[styles.input, { height: 90 }]}
          multiline
          placeholder="Gate codes, special instructions, item details..."
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <Pressable
        style={[styles.saveBtn, loading && { opacity: 0.6 }]}
        onPress={saveCustomer}
      >
        <Text style={styles.saveText}>
          {loading ? "Saving..." : "Save Customer"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 40 },

  header: { fontSize: 20, fontWeight: "700", marginBottom: 16 },

  card: {
    borderWidth: 1,
    borderColor: "#EDEDED",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },

  section: { fontSize: 14, fontWeight: "700", marginBottom: 12 },
  label: { fontSize: 12, color: "#666", marginBottom: 4 },

  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  addressField: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  addressInput: {
    flex: 1,
    paddingVertical: 12,
  },

  icon: { fontSize: 18, marginLeft: 6 },

  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  counterBtn: { fontSize: 22, fontWeight: "700", paddingHorizontal: 12 },
  floor: { fontWeight: "700", fontSize: 16 },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  saveBtn: {
    backgroundColor: "#D6A36C",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },

  saveText: { color: "#fff", fontWeight: "700" },
});
