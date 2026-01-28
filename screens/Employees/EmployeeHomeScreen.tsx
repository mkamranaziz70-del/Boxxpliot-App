import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { api } from "../../../services/api";
import { COLORS } from "../../../theme/colors";

interface Job {
  id: string;
  jobNumber: string;
  status: "CONFIRMED" | "IN_PROGRESS" | "SCHEDULED" | "CANCELLED" | string;
  serviceType: string;
  movingDate?: string;
  time?: string;
  endTime?: string;
  estimatedHours?: number;
  pickupAddress: string;
  dropoffAddress: string;
}

const formatDateLabel = (date?: string): string => {
  if (!date) return "No schedule";
  try {
    return new Date(date).toDateString();
  } catch {
    return "Invalid date";
  }
};

const formatTimeRange = (start?: string, end?: string, hours?: number): string => {
  if (!start) return "--";
  let text = start;
  if (end) text += ` – ${end}`;
  if (hours) text += ` (${hours}h)`;
  return text;
};

const formatHeaderDate = (): string =>
  new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const buildStartDateTime = (movingDate?: string, time?: string): Date | null => {
  if (!movingDate || !time || time === "--") return null;
  const [timePart, meridian] = time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);
  if (meridian === "PM" && hours < 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;
  const [y, m, d] = movingDate.split("-").map(Number);
  return new Date(y, m - 1, d, hours, minutes);
};

const minutesDiff = (start: Date): number => {
  const now = new Date();
  return Math.floor((start.getTime() - now.getTime()) / 60000);
};

const getStartButtonText = (startDateTime: Date | null): string => {
  if (!startDateTime) return "JOB CAN BE STARTED";
  const minsLeft = minutesDiff(startDateTime);
  if (minsLeft <= 0) return "JOB CAN BE STARTED";
  return `Starts in ${Math.abs(minsLeft)} min`;
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    CONFIRMED: "#10B981",
    IN_PROGRESS: "#3B82F6",
    SCHEDULED: "#F59E0B",
  };
  return colors[status as keyof typeof colors] || "#9CA3AF";
};

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    CONFIRMED: "Confirmed",
    IN_PROGRESS: "In Progress",
    SCHEDULED: "Scheduled",
  };
  return texts[status as keyof typeof texts] || status;
};

export default function EmployeeHomeScreen() {
  const navigation = useNavigation<any>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
const [employee, setEmployee] = useState<{ firstName: string; lastName?: string } | null>(null);
  const [nextJob, setNextJob] = useState<Job | null>(null);
  const [upcoming, setUpcoming] = useState<Job[]>([]);
const [unreadCount, setUnreadCount] = useState(0);


const fetchUnreadCount = async () => {
  try {
  const res = await api.get("/notifications/unread-count");
setUnreadCount(res.data.count);
  } catch (e) {
    console.log("Unread count error", e);
  }
};

const fetchData = useCallback(async (showLoader = true) => {
  try {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    const res = await api.get("/employees/home");

    setEmployee(res.data.employee);
    setNextJob(res.data.nextJob);
    setUpcoming(res.data.upcoming);

  } catch (err) {
    console.log("Employee home error", err);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
  await fetchUnreadCount();

}, []);



  useFocusEffect(
    useCallback(() => {
      fetchData(false);
    }, [fetchData])
  );

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

const totalJobs = (nextJob ? 1 : 0) + upcoming.length;
  const startDateTime = nextJob ? buildStartDateTime(nextJob.movingDate, nextJob.time) : null;

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          title="Pull to refresh..."
        />
      }
    >
<View style={styles.header}>
  <View>
   <Text style={styles.greeting}>
  Hello{employee ? 
    `, ${employee.firstName}${employee.lastName ? ` ${employee.lastName}` : ""}` 
    : ", Employee"}
</Text>

    <Text style={styles.subText}>{formatHeaderDate()}</Text>
  </View>
  
<Pressable
  style={styles.notificationContainer}
  onPress={() => navigation.navigate("EmployeeNotifications")}
>
  <MaterialCommunityIcons name="bell-outline" size={28} color="#1F2937" />
  {totalJobs > 0 && (
    <View style={styles.notificationBadge}>
      <Text style={styles.badgeText}>
        {totalJobs > 99 ? "99+" : totalJobs}
      </Text>
    </View>
  )}
</Pressable>

</View>

      {nextJob && (
        <Pressable
          style={styles.jobCard}
          onPress={() => navigation.navigate("EmployeeJobDetail", { jobId: nextJob.id })}
        >
          <Image 
            source={require("../../assets/images/truck.png")} 
            style={styles.jobImage} 
            resizeMode="cover"
          />
          
          <View style={styles.jobContent}>
            <View style={styles.jobHeader}>
              <Text style={styles.jobLabel}>Job #{nextJob.jobNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(nextJob.status) }]}>
                <Text style={styles.statusBadgeText}>{getStatusText(nextJob.status)}</Text>
              </View>
            </View>

            <Text style={styles.serviceType}>{nextJob.serviceType}</Text>

            <Text style={styles.metaText}>
              {formatDateLabel(nextJob.movingDate)} • {formatTimeRange(nextJob.time, nextJob.endTime, nextJob.estimatedHours)}
            </Text>

            <View style={styles.addressBlock}>
              <View style={styles.addressRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={14} color="#6B7280" />
                <Text style={styles.addressText} numberOfLines={1}>
                  {nextJob.pickupAddress}
                </Text>
              </View>
              <View style={styles.addressRow}>
                <MaterialCommunityIcons name="map-marker-check-outline" size={14} color="#6B7280" />
                <Text style={styles.addressText} numberOfLines={1}>
                  {nextJob.dropoffAddress}
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.startBtn}
              onPress={() => navigation.navigate("EmployeeJobDetail", { jobId: nextJob.id })}
            >
              <MaterialCommunityIcons name="play-circle-outline" size={18} color="#fff" />
              <Text style={styles.startText}>{getStartButtonText(startDateTime)}</Text>
            </Pressable>
          </View>
        </Pressable>
      )}

      <View style={styles.shiftCard}>
        <View style={styles.shiftLeft}>
          <Text style={styles.shiftTitle}>Start Shift</Text>
          <Text style={styles.shiftDesc}>Punch in to track working hours</Text>
        </View>
        <Pressable style={styles.punchBtn}>
          <MaterialCommunityIcons name="clock-outline" size={18} color="#fff" />
          <Text style={styles.punchText}>PUNCH IN</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.grid}>
        <QuickCard
          title="JOBS"
          badge={totalJobs > 0 ? String(totalJobs) : "0"}
          image={require("../../assets/images/tasks.png")}
          onPress={() => navigation.navigate("EmployeeTasks")}
        />
        <QuickCard title="History" image={require("../../assets/images/history.png")} />
        <QuickCard title="Pay Slips" image={require("../../assets/images/payslips.png")} />
        <QuickCard title="Support" image={require("../../assets/images/support.png")} />
      </View>

      {upcoming.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Upcoming Jobs ({upcoming.length})</Text>
          {upcoming.map((job) => (
            <Pressable
              key={job.id}
              style={styles.upcomingCard}
              onPress={() => navigation.navigate("EmployeeJobDetail", { jobId: job.id })}
            >
              <View style={styles.upcomingLeft}>
                <MaterialCommunityIcons name="truck-outline" size={24} color={COLORS.primary} />
                <View style={styles.upcomingContent}>
                  <View style={styles.upcomingHeader}>
                    <Text style={styles.upTitle}>Job #{job.jobNumber}</Text>
                    <View style={[styles.statusBadgeSmall, { backgroundColor: getStatusColor(job.status) }]}>
                      <Text style={styles.statusBadgeTextSmall}>{getStatusText(job.status)}</Text>
                    </View>
                  </View>
                  <Text style={styles.upService}>{job.serviceType}</Text>
                  <Text style={styles.metaText}>
                    {formatDateLabel(job.movingDate)} • {formatTimeRange(job.time, job.endTime, job.estimatedHours)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.upcomingRight}>
                <Text style={styles.upAddress} numberOfLines={1}>
                  {job.pickupAddress} → {job.dropoffAddress}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
              </View>
            </Pressable>
          ))}
        </View>
      )}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const QuickCard = ({ title, image, badge, onPress }: any) => (
  <Pressable style={styles.quickCard} onPress={onPress}>
    {badge && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
    <Image source={image} style={styles.quickImage} />
    <Text style={styles.quickText}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, 
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 12,
  },
  greeting: { fontSize: 24, fontWeight: "800", color: "#1F2937" },
  subText: { fontSize: 14, color: "#6B7280", marginTop: 2 },

  notificationContainer: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    right: 2,
    top: 2,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  jobCard: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  jobImage: { width: "100%", height: 160 },
  jobContent: { padding: 20 },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  jobLabel: { fontSize: 14, fontWeight: "800", color: COLORS.primary },
  serviceType: { fontSize: 18, fontWeight: "800", color: "#1F2937", marginTop: 4 },
  metaText: { marginTop: 8, fontSize: 13, color: "#6B7280", fontWeight: "500" },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 70,
    alignItems: "center",
  },
  statusBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  statusBadgeSmall: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 50,
    alignItems: "center",
  },
  statusBadgeTextSmall: { color: "#fff", fontSize: 10, fontWeight: "700" },

  addressBlock: { marginTop: 16 },
  addressRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 8 },
  addressText: { fontSize: 14, fontWeight: "600", color: "#1F2937", marginLeft: 10, flex: 1 },

  startBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startText: { color: "#fff", fontWeight: "800", marginLeft: 8, fontSize: 15 },

  shiftCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shiftLeft: { flex: 1 },
  shiftTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  shiftDesc: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  punchBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  punchText: { color: "#fff", fontWeight: "700", marginLeft: 8, fontSize: 13 },

  sectionTitle: {
    marginTop: 28,
    marginBottom: 16,
    fontSize: 17,
    fontWeight: "800",
    color: "#1F2937",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  quickCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "center",
  },
  quickImage: { width: 64, height: 64, borderRadius: 16 },
  quickText: { marginTop: 16, fontWeight: "700", fontSize: 14, color: "#1F2937", textAlign: "center" },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    borderWidth: 2,
    borderColor: "#fff",
  },

  upcomingCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  upcomingLeft: { flexDirection: "row", flex: 1 },
  upcomingContent: { marginLeft: 12, flex: 1 },
  upcomingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  upTitle: { fontSize: 15, fontWeight: "800", color: "#1F2937" },
  upService: { fontSize: 13, color: COLORS.primary, fontWeight: "700", marginTop: 2 },
  upcomingRight: { alignItems: "center", minWidth: 80 },
  upAddress: { fontSize: 13, color: "#6B7280", fontWeight: "500", marginBottom: 8 },

  bottomSpacer: { height: 100 },
});
