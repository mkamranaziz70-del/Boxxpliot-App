import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { api } from "../../../services/api";
import { COLORS } from "../../../theme/colors";


const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};


export default function OwnerHome() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
const [unreadCount, setUnreadCount] = useState(0);


const fetchUnread = async () => {
const res = await api.get("/notifications/unread-count");
setUnreadCount(res.data.count);
};

 useFocusEffect(
  useCallback(() => {
    loadDashboard();
  }, [])
);

  const loadDashboard = async () => {
    try {
      const res = await api.get("/dashboard/owner");
      setData(res.data);
    } catch (e) {
      console.log("Dashboard error", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const userName =
    data?.owner?.fullName ||
    data?.user?.fullName ||
    data?.profile?.fullName ||
    data?.fullName ||
    "";

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={styles.avatar}
          />
          <Text style={styles.headerTitle}>BoxxPilot</Text>
        </View>

      <Pressable onPress={() => navigation.navigate("OwnerNotifications")}>
  <MaterialCommunityIcons name="bell-outline" size={26} color="#fff" />
  {unreadCount > 0 && <View style={styles.dot} />}
</Pressable>

      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </Text>

        <Text style={styles.greeting}>
          {getGreeting()}
          {userName ? <Text style={styles.name}>, {userName}</Text> : null}
        </Text>

        <View style={styles.statsRow}>
          <StatCard
            icon="truck-fast"
            color="#F4A261"
            label="Moves"
            value={data?.stats?.moves ?? 0}
          />
          <StatCard
            icon="progress-clock"
            color="#E9C46A"
            label="Pending"
            value={data?.stats?.pending ?? 0}
          />
          <StatCard
            icon="close-circle"
            color="#E76F51"
            label="Cancelled"
            value={data?.stats?.cancelled ?? 0}
          />
        </View>

        <Section title="Quick Actions">
          <View style={styles.actionsRow}>
            <QuickAction
              icon="plus-circle-outline"
              label="New Quote"
              onPress={() => navigation.navigate("CreateQuote")}
            />
            <QuickAction
              icon="account-plus-outline"
              label="Add Customer"
              onPress={() => navigation.navigate("Customers")}
            />
            <QuickAction
              icon="calendar-month-outline"
              label="Schedule"
              onPress={() => navigation.navigate("Calendar")}
            />
            <QuickAction
              icon="alert-circle-outline"
              label="Log Incident"
              onPress={() => {}}
            />
          </View>
        </Section>

        <Section title="Modules">
          <View style={styles.modulesGrid}>
            <ModuleCard
              icon="account-group-outline"
              label="Customers"
              sub="Manage Database"
              color="#4CC9F0"
              onPress={() => navigation.navigate("Customers")}
            />

            <ModuleCard
              icon="calendar-outline"
              label="Calendar"
              sub="Dispatch View"
              color="#7209B7"
              onPress={() => navigation.navigate("Calendar")}
            />

            <ModuleCard
  icon="file-document-outline"
  label="Quotations"
  sub={`${data?.draftCount ?? 0} drafts`}
  color="#F72585"
  onPress={() => navigation.navigate("QuotationsList")}
/>


            <ModuleCard
              icon="cube-outline"
              label="Volume Calc"
              sub="Cubic Feet Tool"
              color="#4CAF50"
              onPress={() => {}}
            />

            <ModuleCard
              icon="file-document-outline"
              label="Billing"
              sub="Invoices"
              color="#FB8500"
              onPress={() => {}}
            />

        <ModuleCard
  icon="account-wrench-outline"
  label="Employee"
  sub="Crew Mgmt"
  color="#6C757D"
  onPress={() => navigation.navigate("Employees")}
/>

          </View>
        </Section>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}


const StatCard = ({ icon, label, value, color }: any) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const QuickAction = ({ icon, label, onPress }: any) => (
  <Pressable style={styles.actionBtn} onPress={onPress}>
    <View style={styles.actionIcon}>
      <MaterialCommunityIcons name={icon} size={22} color={COLORS.primary} />
    </View>
    <Text style={styles.actionText}>{label}</Text>
  </Pressable>
);

const ModuleCard = ({ icon, label, sub, color, onPress }: any) => (
  <Pressable style={styles.moduleCard} onPress={onPress}>
    <View style={[styles.moduleIcon, { backgroundColor: `${color}20` }]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.moduleTitle}>{label}</Text>
    <Text style={styles.moduleSub}>{sub}</Text>
  </Pressable>
);

const Section = ({ title, children }: any) => (
  <View style={{ marginBottom: 28 }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },

  dateText: { color: "#777", marginBottom: 4 },
  greeting: { fontSize: 22, fontWeight: "600" },
  name: { fontWeight: "800" },

  statsRow: { flexDirection: "row", marginTop: 18 },
  statCard: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 14,
    marginRight: 10,
  },
  statValue: { fontSize: 22, fontWeight: "800", marginTop: 6 },
  statLabel: { color: "#777", fontSize: 12 },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 14 },

  actionsRow: { flexDirection: "row", justifyContent: "space-between" },
  actionBtn: { width: "23%", alignItems: "center" },
  actionIcon: { backgroundColor: "#FFF1E6", padding: 12, borderRadius: 14 },
  actionText: { fontSize: 11, marginTop: 6, textAlign: "center" },

  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dot: {
  position: "absolute",
  top: 4,
  right: 4,
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: "#EF4444", 
},

  moduleCard: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  moduleTitle: { fontWeight: "700", fontSize: 14 },
  moduleSub: { fontSize: 11, color: "#777", marginTop: 2 },
});
