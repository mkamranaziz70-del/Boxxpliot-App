import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { logout } = useAuth(); 

  const confirmLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: logout, 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar} />
      <Text style={styles.name}>Company Owner</Text>
      <Text style={styles.email}>owner@company.com</Text>

      <View style={styles.card}>
        <ProfileItem label="Company Settings" />
        <ProfileItem label="Billing" />
        <ProfileItem label="Help & Support" />
      </View>

      <Pressable style={styles.logout} onPress={confirmLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}


const ProfileItem = ({ label }: { label: string }) => (
  <View style={styles.item}>
    <Text style={styles.itemText}>{label}</Text>
  </View>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#DDD",
    marginTop: 30,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },

  email: {
    color: "#777",
    marginBottom: 30,
  },

  card: {
    width: "100%",
    backgroundColor: "#F8F8F8",
    borderRadius: 14,
    padding: 10,
  },

  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },

  itemText: {
    fontSize: 14,
  },

  logout: {
    marginTop: 30,
    backgroundColor: "#D9534F",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
  },
});
