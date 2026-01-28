import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function EmployeeMessagesScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Messages</Text>

      <FlatList
        data={MESSAGES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageCard message={item} />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No messages yet
          </Text>
        }
      />
    </View>
  );
}


const MessageCard = ({ message }: any) => (
  <Pressable style={styles.card}>
    <View style={styles.avatar}>
      <MaterialCommunityIcons
        name="account"
        size={20}
        color="#6B7280"
      />
    </View>

    <View style={{ flex: 1 }}>
      <View style={styles.row}>
        <Text style={styles.sender}>
          {message.sender}
        </Text>
        <Text style={styles.time}>
          {message.time}
        </Text>
      </View>

      <Text
        numberOfLines={1}
        style={styles.preview}
      >
        {message.text}
      </Text>
    </View>
  </Pressable>
);


const MESSAGES = [
  {
    id: "1",
    sender: "Dispatcher",
    text: "Please arrive 15 minutes early.",
    time: "09:10 AM",
  },
  {
    id: "2",
    sender: "Manager",
    text: "Tomorrow’s job location updated.",
    time: "Yesterday",
  },
];


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 16,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: "center",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sender: {
    fontSize: 14,
    fontWeight: "700",
  },

  time: {
    fontSize: 11,
    color: "#9CA3AF",
  },

  preview: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },

  empty: {
    textAlign: "center",
    marginTop: 80,
    color: "#9CA3AF",
  },
});
