import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../../theme/colors";


export default function EmployeeProfile() {
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
          onPress: async () => {
            await logout(); 
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.logoutIcon} onPress={confirmLogout}>
          <MaterialCommunityIcons name="logout" size={22} color="#fff" />
        </Pressable>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>E</Text>
        </View>

        <Text style={styles.name}>Employee</Text>
        <Text style={styles.role}>Field Staff</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Account</Text>

        <ProfileItem
          icon="account-outline"
          label="Personal Information"
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Profile editing will be available soon."
            )
          }
        />

        <ProfileItem
          icon="lock-outline"
          label="Change Password"
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Password change feature will be available soon."
            )
          }
        />

        <Text style={styles.sectionTitle}>Work</Text>

        <ProfileItem
          icon="calendar-check-outline"
          label="My Attendance"
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Attendance history will be available soon."
            )
          }
        />

        <ProfileItem
          icon="briefcase-outline"
          label="My Jobs"
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Assigned jobs will appear here."
            )
          }
        />

        <Text style={styles.sectionTitle}>App</Text>

        <ProfileItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() =>
            Alert.alert(
              "Support",
              "Please contact your company administrator."
            )
          }
        />

        <ProfileItem
          icon="information-outline"
          label="About BoxxPilot"
          onPress={() =>
            Alert.alert("BoxxPilot", "Version 1.0.0\nEmployee App")
          }
        />

        <Pressable style={styles.logoutBtn} onPress={confirmLogout}>
          <MaterialCommunityIcons
            name="logout"
            size={20}
            color="#DC2626"
          />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}


const ProfileItem = ({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) => {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={COLORS.primary}
        />
        <Text style={styles.itemText}>{label}</Text>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color="#9CA3AF"
      />
    </Pressable>
  );
};


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 40,
    alignItems: "center",
  },

  logoutIcon: {
    position: "absolute",
    right: 20,
    top: 40,
  },

  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#ffffff33",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },

  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  role: {
    color: "#E5E7EB",
    fontSize: 13,
    marginTop: 4,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    marginTop: 18,
    marginBottom: 8,
  },

  item: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  itemText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  logoutBtn: {
    marginTop: 30,
    backgroundColor: "#FEE2E2",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    color: "#DC2626",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 15,
  },
});
