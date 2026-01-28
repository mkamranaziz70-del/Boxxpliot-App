import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { api } from "../../../services/api";
import { COLORS } from "../../../theme/colors";
import { Alert } from "react-native";


const ROLES = [
  { label: "Team Lead", value: "TEAM_LEAD", icon: "account-star-outline" },
  { label: "Driver", value: "DRIVER", icon: "truck-outline" },
  { label: "Mover", value: "MOVER", icon: "account-outline" },
];

const TABS = ["All", "Available", "Unavailable"];


const Avatar = ({ firstName, lastName }: any) => {
  const initials =
    (firstName?.[0] || "").toUpperCase() +
    (lastName?.[0] || "").toUpperCase();

  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
};

export default function AssignTeamScreen({ route, navigation }: any) {
  const { jobId } = route.params;

  const [job, setJob] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [assigned, setAssigned] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    api.get(`/jobs/${jobId}`).then(res => setJob(res.data));
    api
      .get(`/jobs/${jobId}/available-employees`)
      .then(res => setEmployees(res.data));
  }, [jobId]);

  const filteredEmployees = useMemo(() => {
    if (activeTab === "Available")
      return employees.filter(e => !e.conflict);
    if (activeTab === "Unavailable")
      return employees.filter(e => e.conflict);
    return employees;
  }, [employees, activeTab]);


 const add = (emp: any) => {
  if (emp.conflict) return;

  const alreadyAssigned = assigned.some(a => a.id === emp.id);
  if (alreadyAssigned) return;

  setAssigned(prev => [
    ...prev,
    {
      ...emp,
      role: emp.position || "MOVER",
    },
  ]);
};


  const remove = (id: string) => {
    setAssigned(prev => prev.filter(e => e.id !== id));
  };

  const changeRole = (id: string, role: string) => {
    setAssigned(prev =>
      prev.map(e => (e.id === id ? { ...e, role } : e))
    );
  };

  const clearAll = () => setAssigned([]);

const save = async () => {
  try {
    await Promise.all(
      assigned.map(e =>
        api.post(`/jobs/${jobId}/employees`, {
          employeeId: e.id,
          role: e.role,
        })
      )
    );

    navigation.goBack();
  } catch (err: any) {
    console.log("Save team error:", err?.response?.data || err);
Alert.alert(
  "Error",
  "Failed to save team. Please try again."
);
  }
};

  return (
    <View style={styles.screen}>

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Assign Team</Text>
      </View>

      {job && (
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>
            Job #{job.jobNumber} – {job.quotation?.customer?.fullName}
          </Text>
          <Text style={styles.jobSub}>
            {job.date} • {job.time} – {job.endTime}
          </Text>
        </View>
      )}

     <View style={styles.segmentWrapper}>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View style={styles.segmentContainer}>
      {TABS.map(tab => (
        <Pressable
          key={tab}
          onPress={() => setActiveTab(tab)}
          style={[
            styles.segmentBtn,
            activeTab === tab && styles.segmentBtnActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === tab && styles.segmentTextActive,
            ]}
          >
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  </ScrollView>
</View>


      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Assigned Team ({assigned.length})
          </Text>
          {assigned.length > 0 && (
            <Pressable onPress={clearAll}>
              <Text style={styles.clear}>Clear All</Text>
            </Pressable>
          )}
        </View>

        {assigned.map(e => (
          <View key={e.id} style={styles.assignedCard}>
            <Avatar {...e} />

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {e.firstName} {e.lastName}
              </Text>
<View style={styles.roleBadge}>
  <MaterialCommunityIcons
    name={
      e.role === "TEAM_LEAD"
        ? "account-star-outline"
        : e.role === "DRIVER"
        ? "truck-outline"
        : "account-outline"
    }
    size={14}
    color="#fff"
  />
  <Text style={styles.roleBadgeText}>
    {e.role.replace("_", " ")}
  </Text>
</View>

            </View>

            <Pressable onPress={() => remove(e.id)}>
              <MaterialCommunityIcons name="check-circle" size={22} color="#22C55E" />
            </Pressable>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Available Staff</Text>

        <FlatList
          data={filteredEmployees}
          keyExtractor={i => i.id}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const selected = assigned.some(a => a.id === item.id);

            return (
              <Pressable
                style={[
                  styles.staffRow,
                  item.conflict && styles.staffDisabled,
                ]}
                disabled={item.conflict}
                onPress={() => add(item)}
              >
                <Avatar {...item} />

              <View style={{ flex: 1 }}>
  <Text style={styles.name}>
    {item.firstName} {item.lastName}
  </Text>

  <Text style={styles.roleTextSmall}>
    {item.position?.replace("_", " ") || "MOVER"}
  </Text>

  {item.conflict ? (
    <View style={styles.conflictRow}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={14}
        color="#DC2626"
      />
      <Text style={styles.conflict}>
        Assigned to Job #{item.conflictJob}
      </Text>
    </View>
  ) : (
    <Text style={styles.available}>AVAILABLE</Text>
  )}
</View>


                <MaterialCommunityIcons
                  name={
                    selected
                      ? "check-circle"
                      : "circle-outline"
                  }
                  size={22}
                  color={selected ? COLORS.primary : "#9CA3AF"}
                />
              </Pressable>
            );
          }}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.cancel}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>

        <Pressable
          style={styles.save}
          onPress={save}
          disabled={!assigned.length}
        >
          <Text style={styles.saveText}>
            Save Team {assigned.length}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F9FAFB" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },

  headerTitle: { fontSize: 18, fontWeight: "800", marginLeft: 12 },

  jobInfo: {
    padding: 16,
    backgroundColor: "#fff",
  },

  jobTitle: { fontSize: 14, fontWeight: "800" },
  jobSub: { fontSize: 12, color: "#6B7280", marginTop: 4 },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    margin: 16,
    borderRadius: 10,
  },

  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
segmentWrapper: {
  marginHorizontal: 16,
  marginTop: 14,
  backgroundColor: "#FFFFFF",
  borderRadius: 14,
  padding: 6,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 2,
  marginBottom: 10,
},

segmentContainer: {
  flexDirection: "row",
},

segmentBtn: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 10,
  backgroundColor: "transparent",
  marginRight: 6,
},

segmentBtnActive: {
  backgroundColor: "#D8A66C",
},

segmentText: {
  fontSize: 12,
  fontWeight: "600",
  color: "#6B7280",
},

segmentTextActive: {
  color: "#FFFFFF",
},

  tabActive: { backgroundColor: "#fff" },

  tabText: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  tabTextActive: { color: "#111827" },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6B7280",
    marginVertical: 8,
    paddingHorizontal: 16,
  },

  clear: { fontSize: 11, color: COLORS.primary, fontWeight: "700" },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  avatarText: { fontWeight: "800", color: "#374151" },

  assignedCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  staffRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  staffDisabled: { opacity: 0.5 },

  name: { fontSize: 14, fontWeight: "800" },
  sub: { fontSize: 11, color: "#6B7280" },

  roles: { flexDirection: "row", marginTop: 6 },

  roleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginRight: 6,
  },

  roleActive: { backgroundColor: COLORS.primary },

  roleText: { fontSize: 10, fontWeight: "700", marginLeft: 4 },

  available: {
    fontSize: 10,
    fontWeight: "700",
    color: "#16A34A",
    marginTop: 2,
  },

  conflictRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
roleBadge: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: COLORS.primary,
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 999,
  marginTop: 6,
  alignSelf: "flex-start",
},

roleBadgeText: {
  color: "#fff",
  fontSize: 10,
  fontWeight: "800",
  marginLeft: 4,
},

  conflict: {
    fontSize: 11,
    color: "#DC2626",
    marginLeft: 4,
  },

  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },

  cancel: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    marginRight: 8,
  },

  cancelText: { fontWeight: "700", color: "#374151" },
roleTextSmall: {
  fontSize: 11,
  fontWeight: "600",
  color: "#6B7280",
  marginTop: 2,
  textTransform: "capitalize",
},

  save: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    marginLeft: 8,
  },

  saveText: { color: "#fff", fontWeight: "800" },
});
9


