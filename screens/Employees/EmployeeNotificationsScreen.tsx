import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { api } from "../../../services/api";
import { COLORS } from "../../../theme/colors";

export default function EmployeeNotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
    const res = await api.get("/notifications");
setNotifications(res.data);
    } catch (e) {
      console.log("Notification load error", e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  useEffect(() => {
    load();
  }, []);

  const renderItem = ({ item }: any) => (
    <Pressable
      style={[
        styles.card,
        !item.isRead && styles.unread,
      ]}
      onPress={() => markRead(item.id)}
    >
      <MaterialCommunityIcons
        name={
          item.type === "JOB_ASSIGNED"
            ? "briefcase-outline"
            : item.type === "JOB_STARTED"
            ? "play-circle-outline"
            : item.type === "JOB_COMPLETED"
            ? "check-circle-outline"
            : "bell-outline"
        }
        size={22}
        color={COLORS.primary}
      />

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.msg}>{item.message}</Text>
        <Text style={styles.time}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Notifications</Text>

      <FlatList
        data={notifications}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    fontSize: 20,
    fontWeight: "800",
    padding: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: "center",
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  title: { fontWeight: "800", fontSize: 14 },
  msg: { color: "#4B5563", marginTop: 2 },
  time: { fontSize: 11, color: "#9CA3AF", marginTop: 4 },
});
