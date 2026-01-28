import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { api } from "../../../services/api";
import { TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function CalendarScreen() {
  const navigation = useNavigation<any>();
const goToJobDetail = (jobId: string) => {
  navigation.getParent()?.navigate("JobDetail", {
    jobId,
  });
};
  const today = new Date();
const [search, setSearch] = useState("");
const [filterVisible, setFilterVisible] = useState(false);
const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today);
  const [jobs, setJobs] = useState<any[]>([]);
  const [expanded, setExpanded] = useState(false);
const parseLocalDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

useEffect(() => {
  const localDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    12, 0, 0 
  );

  const d = localDate.toISOString().split("T")[0];

api.get(`/calendar?date=${d}`).then(res => {
  const mapped = res.data.map((job: any) => ({
    id: job.id,
    jobNumber: job.jobNumber,
    status: job.status,

 customerName: job.customerName,
fromAddress: job.fromAddress,
toAddress: job.toAddress,crew: job.crew,


  time: job.time || "--",
endTime: job.endTime || "--",

    color:
      job.status === "PENDING"
        ? "#E9C46A"
        : job.status === "CONFIRMED"
        ? "#2A9D8F"
        : job.status === "IN_PROGRESS"
        ? "#457B9D"
        : job.status === "COMPLETED"
        ? "#6C757D"
        : "#E63946",
  }));

  setJobs(mapped);
});
}, [selectedDate]);


const filteredJobs = jobs.filter(job => {
  const q = search.toLowerCase();

  const matchesSearch =
    !q ||
    job.customerName?.toLowerCase().includes(q) ||
    job.address?.toLowerCase().includes(q) ||
    job.jobNumber?.toString().includes(q);

  const matchesStatus = statusFilter
    ? job.status === statusFilter
    : true;

  return matchesSearch && matchesStatus;
});


  const daysStrip = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }).map((_, i) => i + 1),
  ];

 

  return (
    <View style={styles.container}>

<View style={styles.header}>
  <View>
    <Text style={styles.month}>
      {monthNames[currentMonth]} {currentYear}
    </Text>
    <Text style={styles.subtitle}>Daily View</Text>
  </View>

  <View style={styles.headerActions}>
    <Pressable onPress={() => {
      setSelectedDate(today);
      setCurrentMonth(today.getMonth());
      setCurrentYear(today.getFullYear());
    }}>
      <Text style={styles.todayBtn}>Today</Text>
    </Pressable>

    <Pressable onPress={() => setExpanded(!expanded)}>
      <MaterialCommunityIcons
        name={expanded ? "chevron-up" : "chevron-down"}
        size={24}
        color="#555"
      />
    </Pressable>

    <Pressable onPress={() => setFilterVisible(prev => !prev)}>
      <MaterialCommunityIcons name="tune-variant" size={22} />
    </Pressable>
  </View>
</View>

{!filterVisible && (
  <View style={styles.searchBox}>
    <MaterialCommunityIcons name="magnify" size={18} color="#777" />
    <TextInput
      placeholder="Search jobs..."
      value={search}
      onChangeText={setSearch}
      style={styles.searchInput}
    />
  </View>
)}
{filterVisible && (
  <View style={styles.filterBox}>
    {["PENDING", "COMPLETED", "CANCELLED"].map(s => (
      <Pressable
        key={s}
        onPress={() =>
          setStatusFilter(prev => (prev === s ? null : s))
        }
        style={[
          styles.filterChip,
          statusFilter === s && styles.filterActive,
        ]}
      >
        <Text style={statusFilter === s && { color: "#fff" }}>
          {s}
        </Text>
      </Pressable>
    ))}
  </View>
)}

<View style={styles.calendarContainer}>

  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.daysStrip}
  >
    {daysStrip.map((d, i) => {
      const active = d.toDateString() === selectedDate.toDateString();
      return (
        <Pressable
          key={i}
          onPress={() => {
            setSelectedDate(d);
            setCurrentMonth(d.getMonth());
            setCurrentYear(d.getFullYear());
          }}
          style={[styles.dayCircle, active && styles.activeDay]}
        >
          <Text style={styles.dayName}>
            {d.toLocaleDateString("en-US", { weekday: "short" })}
          </Text>
          <Text style={[styles.dayText, active && { color: "#fff" }]}>
            {d.getDate()}
          </Text>
        </Pressable>
      );
    })}
  </ScrollView>

  {expanded && (
    <View style={styles.monthGrid}>
      {monthDays.map((d, i) => {
        if (!d) return <View key={i} style={styles.emptyCell} />;
        const cellDate = new Date(currentYear, currentMonth, d);
        const active = cellDate.toDateString() === selectedDate.toDateString();

        return (
          <Pressable
            key={i}
            onPress={() => setSelectedDate(cellDate)}
            style={[styles.gridCell, active && styles.gridActive]}
          >
            <Text style={[styles.gridText, active && { color: "#fff" }]}>
              {d}
            </Text>
          </Pressable>
        );
      })}
    </View>
  )}

  <Text style={styles.dateLabel}>
    {selectedDate.toDateString()}
  </Text>

</View>

<ScrollView showsVerticalScrollIndicator={false}>
  {filteredJobs.length === 0 ? (
    <Text style={styles.empty}>No jobs found</Text>
  ) : (
filteredJobs.map(job => (
  <JobCard
    key={job.id}
    job={job}
    onPress={() => goToJobDetail(job.id)}
  />
))

  )}
</ScrollView>
    </View>
  );
}


const JobCard = ({ job, onPress }: any) => (
  <Pressable onPress={onPress} style={styles.row}>
    <Text style={styles.time}>{job.time}</Text>

    <View style={[styles.card, { borderLeftColor: job.color }]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text style={styles.jobNumber}>JOB #{job.jobNumber}</Text>
          <Text style={styles.customerName}>
            {job.customerName || "Customer"}
          </Text>
        </View>

        <Text style={styles.status}>{job.status}</Text>
      </View>

<Text style={styles.address}>
  📍 {job.fromAddress}
</Text>

{job.toAddress ? (
  <Text style={styles.address}>
     {job.toAddress}
  </Text>
) : null}

      <View style={styles.meta}>
        <MaterialCommunityIcons
          name="account-group-outline"
          size={14}
          color="#777"
        />
        <Text style={styles.metaText}>{job.crew} Crew</Text>

        <MaterialCommunityIcons
          name="clock-outline"
          size={14}
          color="#777"
          style={{ marginLeft: 12 }}
        />
        <Text style={styles.metaText}>Until {job.endTime}</Text>
      </View>
    </View>
  </Pressable>
);


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 12 },

header: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 8,
},

jobNumber: {
  fontSize: 10,
  fontWeight: "800",
  color: "#9CA3AF",
  letterSpacing: 0.6,
},

customerName: {
  fontSize: 15,
  fontWeight: "800",
  color: "#111827",
  marginTop: 2,
},

headerActions: {
  flexDirection: "row",
  alignItems: "center",
  gap: 16,
},

calendarContainer: {
  marginBottom: 10,
},



searchBox: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F5F5F5",
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
  marginBottom: 10,
  marginTop: 6,
},


filterBox: {
  flexDirection: "row",
  gap: 8,
  marginBottom: 10,
},


month: {
  fontSize: 20,
  fontWeight: "800",
  letterSpacing: 0.3,
},
  subtitle: { fontSize: 12, color: "#888" },

 

  todayBtn: { color: "#E2B17E", fontWeight: "700" },

  daysStrip: { paddingVertical: 12 },

  dayCircle: {
    width: 54,
    height: 64,
    borderRadius: 16,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
  },


searchInput: {
  marginLeft: 8,
  flex: 1,
  fontSize: 14,
},


filterChip: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  backgroundColor: "#F3F3F3",
},

filterActive: {
  backgroundColor: "#E2B17E",
},

  activeDay: { backgroundColor: "#E2B17E" },

  dayName: { fontSize: 11, color: "#777" },
  dayText: { fontSize: 16, fontWeight: "800" },

  expandBtn: {
    alignSelf: "center",
    marginVertical: 6,
  },

  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },

  gridCell: {
    width: "14.28%",
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },

  gridActive: {
    backgroundColor: "#E2B17E",
    borderRadius: 21,
  },

  gridText: { fontWeight: "700" },
  emptyCell: { width: "14.28%", height: 42 },

  dateLabel: {
    marginTop: 4,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "800",
  },

  row: { flexDirection: "row", marginTop: 18 },
  time: { width: 52, fontSize: 12, color: "#777", marginTop: 6 },

  card: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 4,
  },

  status: { fontSize: 10, fontWeight: "800", color: "#999" },
  title: { fontSize: 15, fontWeight: "800", marginVertical: 4 },
  address: { fontSize: 12, color: "#777" },

  meta: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  metaText: { marginLeft: 4, fontSize: 12, color: "#777" },

  empty: { marginTop: 40, textAlign: "center", color: "#CCC" },
});
