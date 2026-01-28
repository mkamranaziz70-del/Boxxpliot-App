import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api } from "../../../services/api";
import { RootStackParamList } from "../../navigation/types";


type TabType = "ALL" | "Recent" | "Pending" | "Completed";

interface Customer {
  id: string;
  fullName: string;
  phone: string;
  jobNumber?: string;
  status?: "PENDING" | "BOOKED" | "STORAGE" | "COMPLETED";
  createdAt: string;
  fromAddress?: string;
  toAddress?: string;
  primaryAction?: "MESSAGE" | "INVENTORY";
}


export default function Customers() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, "Customers">
    >();

  const isFocused = useIsFocused();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("ALL");


  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get<Customer[]>("/customers");
      setCustomers(res.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchCustomers();
  }, [isFocused]);


  const filteredCustomers = customers.filter(c => {
    const match = c.fullName.toLowerCase().includes(search.toLowerCase());

    if (!match) return false;
    if (activeTab === "Pending") return c.status === "PENDING";
    if (activeTab === "Completed") return c.status === "COMPLETED";
    return true;
  });


  const statusStyle = (status?: Customer["status"]) => {
    switch (status) {
      case "PENDING":
        return { bg: "#F5D6B3", text: "#B56A1A", label: "Pending" };
      case "BOOKED":
        return { bg: "#D6E6F5", text: "#1F5FA0", label: "Booked" };
      case "STORAGE":
        return { bg: "#D7F0FA", text: "#137A9C", label: "Storage" };
      case "COMPLETED":
        return { bg: "#E0E0E0", text: "#555", label: "Completed" };
      default:
        return { bg: "#EEE", text: "#777", label: "Lead" };
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Customers</Text>

      <View style={styles.searchBox}>
        <TextInput
          placeholder="search name, address and ID..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.tabs}>
        {(["ALL", "Recent", "Pending", "Completed"] as TabType[]).map(t => (
          <Pressable
            key={t}
            onPress={() => setActiveTab(t)}
            style={[
              styles.tab,
              activeTab === t && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === t && styles.activeTabText,
              ]}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          renderItem={({ item }) => {
            const status = statusStyle(item.status);

            return (
              <View style={styles.card}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.name}>{item.fullName}</Text>
                    <Text style={styles.job}>Job #{item.jobNumber}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusChip,
                      { backgroundColor: status.bg },
                    ]}
                  >
                    <Text style={{ color: status.text, fontWeight: "600" }}>
                      {status.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.meta}>
                  📅 {new Date(item.createdAt).toDateString()} • Estimate sent
                </Text>

                {item.fromAddress && item.toAddress && (
                  <Text style={styles.address}>
                    📍 {item.fromAddress} → {item.toAddress}
                  </Text>
                )}

                <View style={styles.actionsRow}>
                  <Pressable style={styles.primaryBtn}>
                    <Text style={styles.primaryText}>
                      {item.primaryAction === "INVENTORY"
                        ? "View Inventory"
                        : "Message"}
                    </Text>
                  </Pressable>

                  <Pressable style={styles.callBtn}>
                    <Text style={{ fontSize: 18 }}>📞</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}

<Pressable
  style={styles.fab}
  onPress={() => navigation.navigate("CreateCustomer", {})}
>
  <Text style={styles.fabIcon}>＋</Text>
</Pressable>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 10,
  },

  searchBox: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F2F2F2",
    marginRight: 8,
  },

  activeTab: { backgroundColor: "#D6A36C" },

  tabText: { color: "#999", fontWeight: "600" },

  activeTabText: { color: "#fff" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    marginBottom: 12,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: { fontSize: 16, fontWeight: "700" },

  job: { color: "#999", marginTop: 2 },

  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  meta: { color: "#888", marginTop: 6 },

  address: { color: "#555", marginTop: 4 },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: "#D6A36C",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
  },

  primaryText: { color: "#fff", fontWeight: "700" },

  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D6A36C",
    justifyContent: "center",
    alignItems: "center",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#D6A36C",
    justifyContent: "center",
    alignItems: "center",
     elevation: 10,   
  zIndex: 100,     
  },

  fabIcon: { color: "#fff", fontSize: 32 },
});
