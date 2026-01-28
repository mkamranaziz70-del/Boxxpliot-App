import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { api } from "../../../services/api";
import { COLORS } from "../../../theme/colors";
import { useCallback } from "react";

export default function OwnerNotificationsScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifications = async () => {
    try {
     const res = await api.get("/notifications");
setNotifications(res.data);
    } catch (e) {
      console.log("Notifications error", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (e) {
      console.log("Mark read error", e);
    }
  };

  const renderItem = ({ item }: any) => {
    const icon =
      item.type === "JOB_ASSIGNED"
        ? "briefcase-outline"
        : item.type === "JOB_STARTED"
        ? "play-circle-outline"
        : item.type === "JOB_COMPLETED"
        ? "check-circle-outline"
        : item.type === "JOB_AUTO_ENDED"
        ? "alert-circle-outline"
        : "bell-outline";

    return (
      <Pressable
        style={[
          styles.card,
          !item.isRead && styles.unreadCard,
        ]}
        onPress={() => markAsRead(item.id)}
      >
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={item.isRead ? "#6B7280" : COLORS.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.title,
              !item.isRead && styles.unreadTitle,
            ]}
          >
            {item.title}
          </Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>

        {!item.isRead && <View style={styles.dot} />}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color="#111"
          />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons
            name="bell-off-outline"
            size={48}
            color="#9CA3AF"
          />
          <Text style={styles.emptyText}>
            No notifications yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F9FAFB" },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 12,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  unreadCard: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FCD34D",
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },

  unreadTitle: {
    color: "#111827",
  },

  message: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  time: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 6,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    marginLeft: 8,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
});
