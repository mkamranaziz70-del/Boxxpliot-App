import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
} from "react-native";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { api } from "../../../services/api";
import { COLORS } from "../../../theme/colors";
const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return "";

  const [y, m, d] = dateStr.split("-").map(Number);

  const date = new Date(y, m - 1, d); 

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const STATUS_COLORS: Record<string, string> = {
  PENDING: "#E9C46A",     
  CONFIRMED: "#2A9D8F",   
  IN_PROGRESS: "#457B9D", 
  COMPLETED: "#6C757D",   
  CANCELLED: "#E63946",   
};

const formatJobDateTime = (iso: string) => {
  if (!iso) return "";

  const [datePart, timePart] = iso.split("T");

  const [year, month, day] = datePart.split("-").map(Number);

  let hours = 0;
  let minutes = 0;

  if (timePart) {
    const [h, m] = timePart.split(":");
    hours = Number(h);
    minutes = Number(m);
  }

  const d = new Date(year, month - 1, day, hours, minutes);

  const date = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${date} • ${time}`;
};

export default function JobsScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
const updateJobLocally = (id: number, newStatus: string) => {
  setJobs(prev =>
    prev
      .map(job =>
        job.id === id ? { ...job, status: newStatus } : job
      )
      .filter(job =>
        activeStatus === newStatus || job.status === activeStatus
      )
  );
};


  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs?status=${activeStatus}`);
      setJobs(res.data);
    } catch (e) {
      console.log("Jobs error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [activeStatus]);

  const filteredJobs = useMemo(() => {
    const q = search.toLowerCase();
    return jobs.filter(j => {
      const name = j.quotation?.customer?.fullName?.toLowerCase() || "";
      const addr = j.quotation?.pickupAddress?.toLowerCase() || "";
      return name.includes(q) || addr.includes(q);
    });
  }, [jobs, search]);


  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jobs</Text>
      </View>

      <View style={styles.searchBox}>
        <MaterialCommunityIcons name="magnify" size={18} color="#777" />
        <TextInput
          placeholder="Search customer or address..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

<View style={styles.segmentWrapper}>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View style={styles.segmentContainer}>
      {STATUSES.map(status => (
        <Pressable
          key={status}
          onPress={() => setActiveStatus(status)}
          style={[
            styles.segmentBtn,
            activeStatus === status && styles.segmentBtnActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              activeStatus === status && styles.segmentTextActive,
            ]}
          >
            {status.replace("_", " ")}
          </Text>
        </Pressable>
      ))}
    </View>
  </ScrollView>
</View>


      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
      ) : filteredJobs.length === 0 ? (
        <Text style={styles.empty}>No jobs found</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {filteredJobs.map(job => (
<JobCard
  key={job.id}
  job={job}
  onUpdated={updateJobLocally}
/>
          ))}
        </ScrollView>
      )}
    </View>
  );
}


const JobCard = ({ job, onUpdated }: any) => {

  const handleStatusChange = async (status: string) => {
    try {
      await api.patch(`/jobs/${job.id}/status`, { status });
      onUpdated(job.id, status);
    } catch {
      alert("Failed to update job");
    }
  };

  return (
    <View style={styles.card}>

  <View style={styles.cardTopRow}>
  <View>
    <Text style={styles.jobNumber}>JOB #{job.jobNumber}</Text>
    <Text style={styles.customerName}>
      {job.customerName || "Customer"}
    </Text>
  </View>

  <View
    style={[
      styles.statusDot,
      { backgroundColor: STATUS_COLORS[job.status] },
    ]}
  />
</View>


      <Text style={styles.address}>
        {job.pickupAddress || "No pickup address"}
      </Text>

      <View style={styles.meta}>
        <MaterialCommunityIcons
          name="calendar-outline"
          size={14}
          color="#777"
        />
       <Text style={styles.metaText}>
  {formatDisplayDate(job.date)} • {job.time}
</Text>

      </View>

      {job.status === "PENDING" && (
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, styles.cancel]}
            onPress={() => handleStatusChange("CANCELLED")}
          >
            <Text style={[styles.actionText, styles.cancelText]}>
              Deny
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, styles.approve]}
            onPress={() => handleStatusChange("CONFIRMED")}
          >
            <Text style={styles.actionText}>Approve</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};



const StatusBadge = ({ status }: any) => {
  const colors: any = {
    PENDING: "#E9C46A",
    CONFIRMED: "#2A9D8F",
    IN_PROGRESS: "#457B9D",
    COMPLETED: "#6C757D",
    CANCELLED: "#E63946",
  };

  return (
    <View style={[styles.badge, { backgroundColor: colors[status] + "20" }]}>
      <Text style={[styles.badgeText, { color: colors[status] }]}>
        {status.replace("_", " ")}
      </Text>
    </View>
  );
};


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
segmentWrapper: {
  marginHorizontal: 16,
  marginTop: 14,
  backgroundColor: "#FFFFFF",
  borderRadius: 14,
  padding: 6,
  shadowColor: "#000",
    marginBottom: 10,   

  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 2,
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

  header: {
    padding: 18,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2937",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: "#111",
  },
cardTopRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
},

statusDot: {
  width: 12,
  height: 12,
  borderRadius: 6,
},

  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  tabChipActive: {
    backgroundColor: "#D8A66C",
    borderColor: "#D8A66C",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#777",
  },
  tabTextActive: {
    color: "#fff",
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  jobTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },

  address: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  metaText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#6B7280",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  approve: {
    backgroundColor: "#D8A66C",
    marginLeft: 10,
  },

  cancel: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },

  actionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },

  cancelText: {
    color: "#374151",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
jobNumber: {
  fontSize: 11,
  fontWeight: "700",
  color: "#9CA3AF",
  letterSpacing: 0.5,
},

customerName: {
  fontSize: 16,
  fontWeight: "800",
  color: "#1F2937",
  marginTop: 2,
},

  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  empty: {
    textAlign: "center",
    marginTop: 60,
    color: "#9CA3AF",
  },
});

function alert(arg0: string) {
    throw new Error("Function not implemented.");
}

