import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const DATA = [
  {
    id: "1",
    name: "Dispatch HQ",
    message: "New job assigned #4492 in Austin",
    time: "12:30 PM",
    tag: "INTERNAL",
    unread: true,
  },
  {
    id: "2",
    name: "John Doe",
    message: "Is the truck still arriving at 9AM?",
    time: "10:14 AM",
    tag: "ACTIVE JOB",
  },
  {
    id: "3",
    name: "Sarah Smith",
    message: "Thanks for the quote, I have a q...",
    time: "Yesterday",
    tag: "LEAD",
  },
];

export default function Messages() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inbox</Text>

      <View style={styles.searchBox}>
        <MaterialCommunityIcons name="magnify" size={18} color="#999" />
        <TextInput
          placeholder="Search name or message..."
          style={styles.input}
        />
      </View>

      <View style={styles.filters}>
        {["All", "Unread", "Leads", "Dispatch"].map((f) => (
          <Text key={f} style={styles.filter}>
            {f}
          </Text>
        ))}
      </View>

      <FlatList
        data={DATA}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={styles.rowTop}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.tag}>{item.tag}</Text>
            </View>
          </View>
        )}
      />

      <Pressable style={styles.fab}>
        <MaterialCommunityIcons name="pencil" size={22} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 18, fontWeight: "700", textAlign: "center" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 16,
  },
  input: { flex: 1, padding: 8 },

  filters: { flexDirection: "row", marginVertical: 12 },
  filter: {
    backgroundColor: "#EEE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    fontSize: 12,
  },

  row: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DDD",
    marginRight: 10,
  },
  rowTop: { flexDirection: "row", justifyContent: "space-between" },
  name: { fontWeight: "700" },
  time: { fontSize: 11, color: "#999" },
  message: { color: "#555", marginTop: 2 },
  tag: { fontSize: 10, color: "#D6A36C", marginTop: 4 },

  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "#D6A36C",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});
