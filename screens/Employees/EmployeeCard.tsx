import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { COLORS } from "../../../theme/colors";
import { api } from "../../../services/api";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

type Props = {
  employee: any;
  onRefresh: () => void;
};

export default function EmployeeCard({ employee, onRefresh }: Props) {
  const navigation = useNavigation<any>();

  const isPending = employee.status === "PENDING";
  const isActive = employee.status === "ACTIVE";
  const isDisabled = employee.status === "DISABLED";

  const statusColor = isPending
    ? "#F59E0B"
    : isActive
    ? "#10B981"
    : "#9CA3AF";

  const handleDelete = () => {
    Alert.alert(
      "Delete Employee",
      "Are you sure you want to delete this employee?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/employees/${employee.id}`);
              onRefresh();
            } catch {
              Alert.alert("Error", "Failed to delete employee");
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate("EditEmployee", {
      employee, 
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.name}>
            {employee.firstName} {employee.lastName}
          </Text>
          <Text style={styles.role}>{employee.position}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: statusColor + "20" }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {employee.status}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <MaterialCommunityIcons
          name="email-outline"
          size={16}
          color="#6B7280"
        />
        <Text style={styles.infoText}>{employee.email}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialCommunityIcons
          name="phone-outline"
          size={16}
          color="#6B7280"
        />
        <Text style={styles.infoText}>{employee.phone}</Text>
      </View>

      {isPending && (
        <Text style={styles.pendingNote}>
          Waiting for employee confirmation
        </Text>
      )}

      {isDisabled && (
        <Text style={styles.disabledNote}>
          Employee account is disabled
        </Text>
      )}

      <View style={styles.actions}>
        {isActive && (
          <Pressable style={styles.editBtn} onPress={handleEdit}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color={COLORS.primary}
            />
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        )}

        <Pressable style={styles.deleteBtn} onPress={handleDelete}>
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={18}
            color="#DC2626"
          />
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  role: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  infoText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#374151",
  },
fab: {
  position: "absolute",
  right: 20,
  bottom: 24,
  width: 58,
  height: 58,
  borderRadius: 29,
  backgroundColor: COLORS.primary,
  justifyContent: "center",
  alignItems: "center",

  // Shadow (iOS)
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 4 },

  elevation: 6,
},

  pendingNote: {
    marginTop: 10,
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "600",
  },

  disabledNote: {
    marginTop: 10,
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },

  editText: {
    color: COLORS.primary,
    fontWeight: "600",
    marginLeft: 4,
  },

  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
  },

  deleteText: {
    color: "#DC2626",
    fontWeight: "600",
    marginLeft: 4,
  },
});
