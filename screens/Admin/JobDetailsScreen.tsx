import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Alert,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { api } from "../../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useRef } from "react";
import { useJobTimer } from "../../context/JobTimerContext";

const EmployeeAvatar = ({
  firstName,
  lastName,
  image,
}: {
  firstName: string;
  lastName: string;
  image?: string | null;
}) => {
  if (image) return <View style={avatarStyles.wrapper} />;

  const initials = (firstName?.[0] || "").toUpperCase() + (lastName?.[0] || "").toUpperCase();
  return (
    <View style={avatarStyles.placeholder}>
      <Text style={avatarStyles.initials}>{initials}</Text>
    </View>
  );
};

const avatarStyles = StyleSheet.create({
  wrapper: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E5E7EB" },
  placeholder: { 
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#E5E7EB",
    justifyContent: "center", alignItems: "center" 
  },
  initials: { fontWeight: "800", color: "#374151", fontSize: 14 },
});

export default function JobDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { jobId } = route.params;
  const { role, loading: authLoading } = useAuth();
  const isEmployee = role === "EMPLOYEE";
  const isOwner = role === "OWNER";
const [endDateTime, setEndDateTime] = useState<Date | null>(null);
const { startJobTimer, stopJobTimer, getJobTimer } = useJobTimer();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [ending, setEnding] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [actualStartDateTime, setActualStartDateTime] = useState<Date | null>(null);
  const [earlyStartDateTime, setEarlyStartDateTime] = useState<Date | null>(null);
const isEndingRef = useRef(false);

  const handleBackPress = () => navigation.goBack();
const startedAtRef = useRef<number | null>(null);
const isFinalStatus = ["COMPLETED", "AUTO_ENDED", "MISSED"].includes(job?.status);

  const buildActualStartDateTime = (movingDate?: string, time?: string): Date | null => {
    if (!movingDate || !time || time === "--") {
      console.log(" MISSING DATA:", { movingDate, time });
      return null;
    }

    try {
      console.log("PARSING DATE:", movingDate, "TIME:", time);
      
      const dateParts = movingDate.split('-');
      if (dateParts.length !== 3) return null;

      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);

      if (isNaN(year) || year < 2000 || year > 2100) return null;
      if (isNaN(month) || month < 0 || month > 11) return null;
      if (isNaN(day) || day < 1 || day > 31) return null;

      let hours: number, minutes: number;
      if (time.includes('AM') || time.includes('PM')) {
        const [timePart, meridian] = time.split(' ');
        const timeNums = timePart.split(':').map(Number);
        hours = timeNums[0];
        minutes = timeNums[1] || 0;
        
        if (meridian === 'PM' && hours !== 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;
      } else {
        const timeNums = time.split(':').map(Number);
        hours = timeNums[0];
        minutes = timeNums[1] || 0;
      }

      if (isNaN(hours) || hours < 0 || hours > 23) return null;
      if (isNaN(minutes) || minutes < 0 || minutes > 59) return null;

      const dateTime = new Date(year, month, day, hours, minutes);
      
      if (isNaN(dateTime.getTime())) return null;

      console.log("ACTUAL PARSED START TIME:", dateTime.toISOString());
      return dateTime;
    } catch (error) {
      console.error(" ERROR:", error);
      return null;
    }
  };

  const buildEndDateTime = (movingDate?: string, endTime?: string): Date | null => {
    if (!movingDate || !endTime || endTime === "--") return null;

    try {
      const dateParts = movingDate.split('-');
      if (dateParts.length !== 3) return null;

      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);

      if (isNaN(year) || year < 2000 || year > 2100) return null;
      if (isNaN(month) || month < 0 || month > 11) return null;
      if (isNaN(day) || day < 1 || day > 31) return null;

      let hours: number, minutes: number;
      if (endTime.includes('AM') || endTime.includes('PM')) {
        const [timePart, meridian] = endTime.split(' ');
        const timeNums = timePart.split(':').map(Number);
        hours = timeNums[0];
        minutes = timeNums[1] || 0;
        
        if (meridian === 'PM' && hours !== 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;
      } else {
        const timeNums = endTime.split(':').map(Number);
        hours = timeNums[0];
        minutes = timeNums[1] || 0;
      }

      if (isNaN(hours) || hours < 0 || hours > 23) return null;
      if (isNaN(minutes) || minutes < 0 || minutes > 59) return null;

      const dateTime = new Date(year, month, day, hours, minutes);
      if (isNaN(dateTime.getTime())) return null;

      console.log(" END TIME PARSED:", dateTime.toISOString());
      return dateTime;
    } catch (error) {
      console.error(" END TIME PARSE ERROR:", error);
      return null;
    }
  };

  const formatCountdown = (totalSeconds: number): string => {
    const absSeconds = Math.abs(totalSeconds);
    const h = Math.floor(absSeconds / 3600);
    const m = Math.floor((absSeconds % 3600) / 60);
    const s = absSeconds % 60;
    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return totalSeconds < 0 ? `-${timeStr}` : timeStr;
  };
const getJobTotalSeconds = (job: any) => {
  if (job?.totalSeconds && job.totalSeconds > 0) {
    return job.totalSeconds;
  }

  const hours = job?.estimatedHours || job?.quotation?.estimatedHours;
  if (hours && hours > 0) {
    return Math.floor(hours * 3600);
  }

  if (job?.quotation?.movingDate && job?.time && job?.endTime) {
    const start = buildActualStartDateTime(job.quotation.movingDate, job.time);
    const end = buildEndDateTime(job.quotation.movingDate, job.endTime);
    if (start && end) {
      return Math.max(
        0,
        Math.floor((end.getTime() - start.getTime()) / 1000)
      );
    }
  }

  return 0;
};

const loadJobData = async () => {
  setLoading(true);
  try {
    const res = await api.get(`/jobs/${jobId}`);
    console.log(" JOB LOADED:", res.data);
    
    const wasInProgress = job?.status === "IN_PROGRESS";
    const currentStartTime = startedAtRef.current;
    
    setJob(res.data);
    
    if (wasInProgress && res.data.status === "IN_PROGRESS" && currentStartTime) {
      startedAtRef.current = currentStartTime;
    }
    
    if (res.data.status === "CONFIRMED") {
      const q = res.data.quotation;
      const timeSource = res.data.time || q?.time;
      const actualStart = buildActualStartDateTime(q?.movingDate, timeSource);
      
      if (actualStart) {
        setActualStartDateTime(actualStart);
        setEarlyStartDateTime(new Date(actualStart.getTime() - 15 * 60 * 1000));
        startedAtRef.current = null; 
        setElapsed(0);
        setRemainingSeconds(null);
      }
    }
    
  } catch (err) {
    console.error(" Job fetch error:", err);
  } finally {
    setLoading(false);
  }
};


useFocusEffect(
  useCallback(() => {
    if (job?.status !== "IN_PROGRESS") {
      loadJobData();
    }
  }, [job?.status, jobId])
);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobData();
    setRefreshing(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (actualStartDateTime && job && job.status === "CONFIRMED") {
      const updateCountdown = () => {
        const now = new Date();
        const diffSeconds = Math.floor((actualStartDateTime.getTime() - now.getTime()) / 1000);
        setCountdownSeconds(diffSeconds);
      };
      
      updateCountdown();
      interval = setInterval(updateCountdown, 1000);
    } else {
      setCountdownSeconds(null);
    }
    
    return () => { if (interval) clearInterval(interval); };
  }, [actualStartDateTime, job?.status]);
useEffect(() => {
  let interval: NodeJS.Timeout | null = null;

  const timer = getJobTimer(job?.id);

  if (job?.status === "IN_PROGRESS" && timer) {
    const tick = () => {
      const elapsedSec = Math.floor(
        (Date.now() - timer.startedAt) / 1000
      );

      const remainingSec = Math.max(
        0,
        timer.totalSeconds - elapsedSec
      );

      setElapsed(elapsedSec);
      setRemainingSeconds(remainingSec);
    };

    tick();
    interval = setInterval(tick, 1000);
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [job?.status, job?.id]);

if (loading || authLoading || !job) {
  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color="#E2B17E" />
      <Text style={{ marginTop: 12, color: "#6B7280" }}>Loading job details...</Text>
    </View>
  );
}

  if (!job) return null;

  const formatElapsed = (sec: number): string => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatRemaining = (sec: number): string => {
    const absSec = Math.abs(sec);
    const h = Math.floor(absSec / 3600);
    const m = Math.floor((absSec % 3600) / 60);
    const s = absSec % 60;
    
    if (sec < 0) {
      return `-${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const q = job.quotation;
  const canSeeStartButton = !authLoading && isEmployee && job.status === "CONFIRMED";
  const canClickStartButton = actualStartDateTime ? 
    Math.floor((actualStartDateTime.getTime() - Date.now()) / 1000) <= 900 &&
    Math.floor((actualStartDateTime.getTime() - Date.now()) / 1000) >= -3600 
    : false;
  const customer = q?.customer;
  const dateLabel = q?.movingDate ? new Date(q.movingDate).toDateString() : "No schedule";
  const startTimeDisplay = job.time || q?.time || "--";
  const endTimeDisplay = job.endTime || q?.endTime || "--";
  const estimatedHours = q?.estimatedHours || job?.estimatedHours || 0;

  const getButtonText = () => {
    if (canClickStartButton) {
      return "JOB CAN BE STARTED NOW";
    }
    return "CANNOT BE STARTED UNTIL 15 MINS LEFT";
  };

const confirmEndJob = () => {
  Alert.alert(
    "End Job Confirmation",
    "Are you sure you want to end this job? This action cannot be undone.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "End Job",
        style: "destructive",
        onPress: async () => {
          try {
            setEnding(true);
            isEndingRef.current = true;

            const updatedJob = {
              ...job,
              status: "COMPLETED",
              endedAt: new Date().toISOString(),
              endTime: new Date().toLocaleTimeString('en-US', { 
                hour12: true, 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            };
            setJob(updatedJob);

            await api.post(`/jobs/${job.id}/end`);
            
          } catch (e) {
            console.error("End job error:", e);
            loadJobData();
          } finally {
            setEnding(false);
            isEndingRef.current = false;
          }
        }
      }
    ]
  );
};


  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#E2B17E" />
      <View style={styles.appBar}>
        <Pressable onPress={handleBackPress} style={styles.backButton} hitSlop={20}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.appBarTitle} numberOfLines={1}>
          Job #{job.jobNumber || 'Loading'} · {job.serviceType || "Moving"}
        </Text>
      </View>

      {job.status === "IN_PROGRESS" && (
        <View style={styles.progressTopBar}>
          <View style={styles.progressRow}>
            <MaterialCommunityIcons name="progress-clock" size={20} color="#4F46E5" />
            <Text style={styles.progressTitle}>JOB IN PROGRESS</Text>
          </View>
          <View style={styles.timerRow}>
            <View style={styles.timerItem}>
              <Text style={styles.timerLabel}>Elapsed</Text>
              <Text style={styles.timerValue}>{formatElapsed(elapsed)}</Text>
            </View>
            <Text style={styles.timerSeparator}>/</Text>
            <View style={styles.timerItem}>
              <Text style={styles.timerLabel}>Remaining</Text>
              <Text style={[
                styles.timerValue,
                { 
                  color: remainingSeconds !== null && remainingSeconds > 300 ? "#10B981" : 
                         remainingSeconds !== null && remainingSeconds > 60 ? "#F59E0B" : 
                         "#EF4444"
                }
              ]}>
                {remainingSeconds !== null ? formatRemaining(remainingSeconds) : "--:--:--"}
              </Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#E2B17E"]}
            tintColor="#E2B17E"
            title="Pull to refresh..."
            titleColor="#E2B17E"
          />
        }
      >
{isFinalStatus && (
  <View
    style={[
      styles.finalCard,
      job.status === "MISSED" && { backgroundColor: "#FEF2F2" },
      job.status === "AUTO_ENDED" && { backgroundColor: "#FFF7ED" },
      job.status === "COMPLETED" && { backgroundColor: "#F0FDF4" },
    ]}
  >
    <MaterialCommunityIcons
      name={
        job.status === "MISSED"
          ? "close-circle-outline"
          : job.status === "AUTO_ENDED"
          ? "alert-circle-outline"
          : "check-circle-outline"
      }
      size={28}
      color={
        job.status === "MISSED"
          ? "#EF4444"
          : job.status === "AUTO_ENDED"
          ? "#F59E0B"
          : "#10B981"
      }
      style={{ marginBottom: 12 }}
    />

    <Text style={styles.finalTitle}>
      {job.status === "MISSED" && "Job Missed"}
      {job.status === "AUTO_ENDED" && "Job Auto-Ended"}
      {job.status === "COMPLETED" && "Job Completed"}
    </Text>

    <Text style={styles.finalText}>
      {job.status === "MISSED" &&
        "No employee started this job before the scheduled end time."}

      {job.status === "AUTO_ENDED" &&
        "This job was automatically ended because it was not closed on time."}

      {job.status === "COMPLETED" &&
        "This job was completed successfully."}
    </Text>
  </View>
)}

<View
  style={[
    styles.statusRow,
    job.status === "IN_PROGRESS" && { marginTop: 16 },
  ]}
>
  <View style={styles.statusBadge}>
    <Text style={styles.statusText}>{job.status}</Text>
  </View>

  <Text style={styles.metaText} numberOfLines={2}>
    {dateLabel} • {startTimeDisplay}
    {endTimeDisplay !== "--" ? ` – ${endTimeDisplay}` : ""}
    {estimatedHours ? ` (${estimatedHours}h)` : ""}
  </Text>
</View>


        {canSeeStartButton && (
          <View style={styles.countdownSection}>
            <View style={[
              styles.countdownCard,
              actualStartDateTime ? styles.countdownCardSuccess : styles.countdownCardError
            ]}>
              <Text style={styles.countdownIcon}>⏰</Text>
              <Text style={[
                styles.countdownTime,
                actualStartDateTime ? styles.countdownTimeSuccess : styles.countdownTimeError
              ]}>
                {countdownSeconds !== null 
                  ? formatCountdown(countdownSeconds) 
                  : "NO TIME"
                }
              </Text>
              <Text style={styles.countdownSource}>
                {q?.movingDate} {startTimeDisplay} → FULL COUNTDOWN
              </Text>
            </View>

            <Pressable
              style={[
                styles.startBtn,
                !canClickStartButton && styles.startBtnDisabled,
              ]}
              disabled={!canClickStartButton}
onPress={async () => {
  try {
    const totalSeconds = getJobTotalSeconds(job);

    startJobTimer(jobId, totalSeconds);

    setJob((prev: any) => ({
      ...prev,
      status: "IN_PROGRESS",
      totalSeconds,
    }));

    const res = await api.post(`/jobs/${jobId}/start`);

    setJob((prev: any) => ({
      ...prev,
      ...res.data,
    }));

  } catch (error) {
    console.error(" Start error:", error);
    loadJobData();
  }
}}
            >
              <Text style={[
                styles.startBtnText,
                !canClickStartButton && styles.startBtnTextDisabled
              ]}>
                ▶ {getButtonText()}
              </Text>
            </Pressable>

            <Text style={styles.statusTextSmall}>
              {countdownSeconds !== null 
                ? `${Math.floor(Math.abs(countdownSeconds / 60))}m ${Math.abs(countdownSeconds % 60)}s until start`
                : "Job start time"
              }
            </Text>
          </View>
        )}

        <View style={styles.customerCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-group" size={20} color="#E2B17E" />
            <Text style={styles.sectionTitle}>Customer Details</Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{customer?.fullName || "N/A"}</Text>
            {customer?.email && (
              <View style={styles.contactRow}>
                <MaterialCommunityIcons name="email-outline" size={16} color="#6B7280" />
                <Text style={styles.contactText}>{customer.email}</Text>
              </View>
            )}
            {customer?.phone && (
              <View style={styles.contactRow}>
                <MaterialCommunityIcons name="phone-outline" size={16} color="#6B7280" />
                <Text style={styles.contactText}>{customer.phone}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.addressCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="map-marker-multiple" size={20} color="#E2B17E" />
            <Text style={styles.sectionTitle}>Addresses</Text>
          </View>
          <View style={styles.addressSection}>
            <View style={styles.addressItem}>
              <MaterialCommunityIcons name="map-marker-radius-outline" size={18} color="#E2B17E" />
              <View style={styles.addressContent}>
                <Text style={styles.addressLabel}>Departure</Text>
                <Text style={styles.addressValue}>{q?.pickupAddress || "N/A"}</Text>
              </View>
            </View>
            <View style={styles.addressDivider} />
            <View style={styles.addressItem}>
              <MaterialCommunityIcons name="flag-variant-outline" size={18} color="#E2B17E" />
              <View style={styles.addressContent}>
                <Text style={styles.addressLabel}>Arrival</Text>
                <Text style={styles.addressValue}>{q?.dropoffAddress || "N/A"}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.teamCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-group-outline" size={20} color="#E2B17E" />
            <Text style={styles.sectionTitle}>Team Members</Text>
            {isOwner && (
              <Pressable onPress={() => navigation.navigate("AssignTeam", { jobId })}>
                <Text style={styles.editText}>Edit</Text>
              </Pressable>
            )}
          </View>
          {job.employees?.length ? (
            <View style={styles.teamList}>
              {job.employees.map((t: any) => (
                <View key={t.id} style={styles.teamMember}>
                  <EmployeeAvatar
                    firstName={t.employee.firstName || ""}
                    lastName={t.employee.lastName || ""}
                    image={t.employee.profileImage}
                  />
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName} numberOfLines={1}>
                      {t.employee.firstName} {t.employee.lastName}
                    </Text>
                    <Text style={styles.teamRole}>{t.role}</Text>
                  </View>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{t.role}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyTeam}>
              <MaterialCommunityIcons name="account-off-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No team assigned</Text>
            </View>
          )}
        </View>

        {job.status === "IN_PROGRESS" && (
          <View style={styles.endJobCard}>
            <Pressable
              style={[styles.endBtn, ending && styles.endBtnDisabled]}
              disabled={ending}
              onPress={confirmEndJob}
            >
              {ending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.endText}>END JOB</Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  appBar: {
    height: 60,
    backgroundColor: "#E2B17E",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    padding: 8,
  },
  appBarTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginLeft: -24,
  },
finalCard: {
  padding: 24,
  borderRadius: 20,
  marginBottom: 24,
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#E5E7EB",
},
finalTitle: {
  fontSize: 16,
  fontWeight: "900",
  color: "#0F172A",
  marginBottom: 6,
},
finalText: {
  fontSize: 13,
  color: "#475569",
  textAlign: "center",
  lineHeight: 18,
},

  progressTopBar: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E7FF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#4F46E5",
    marginLeft: 8,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timerItem: {
    alignItems: "center",
    flex: 1,
  },
  timerLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 24,
    fontWeight: "900",
    fontVariant: ["tabular-nums"] as any,
    letterSpacing: 1,
  },
  timerSeparator: {
    fontSize: 24,
    fontWeight: "900",
    color: "#94A3B8",
    marginHorizontal: 12,
  },

  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  statusRow: { marginBottom: 24 },
  statusBadge: {
    backgroundColor: "#E2B17E",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusText: { color: "#fff", fontWeight: "900", fontSize: 11 },
  metaText: { marginTop: 12, fontSize: 11, color: "#64748B", fontWeight: "500" },

  countdownSection: { marginBottom: 24 },
  countdownCard: {
    backgroundColor: "#F0FDFA",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  countdownCardSuccess: { 
    backgroundColor: "#F0FDF4", 
    borderColor: "#E2B17E" 
  },
  countdownCardError: { 
    backgroundColor: "#FEF2F2", 
    borderColor: "#EF4444" 
  },
  countdownIcon: { fontSize: 20, marginBottom: 10 },
  countdownTime: {
    fontSize: 24,
    fontWeight: "900",
    fontVariant: ["tabular-nums"] as any,
    letterSpacing: 2,
    marginBottom: 10,
    color: "#E2B17E",
  },
  countdownTimeSuccess: { color: "#E2B17E" },
  countdownTimeError: { color: "#DC2626" },
  countdownSource: { fontSize: 11, color: "#64748B", fontWeight: "700" },

  startBtn: {
    backgroundColor: "#E2B17E",
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#E2B17E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  startBtnDisabled: { backgroundColor: "#F1F5F9" },
  startBtnText: { color: "#fff", fontWeight: "900", fontSize: 11 },
  startBtnTextDisabled: { color: "#94A3B8", fontSize: 11 },
  statusTextSmall: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },

  customerCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  customerInfo: {
    gap: 4,
  },
  addressCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  teamCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  endJobCard: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: "#FEF2F2",
    borderRadius: 24,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: "800", 
    color: "#1E293B",
    flex: 1,
  },
  editText: { 
    color: "#E2B17E", 
    fontWeight: "700", 
    fontSize: 11 
  },

  customerName: { 
    fontSize: 16, 
    fontWeight: "900", 
    color: "#0F172A",
    marginBottom: 12,
    lineHeight: 18,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  contactText: { 
    fontSize: 11, 
    color: "#475569", 
    fontWeight: "500",
    flex: 1,
  },

  addressSection: {},
  addressItem: { 
    flexDirection: "row", 
    alignItems: "flex-start", 
    gap: 16,
    marginBottom: 20,
  },
  addressContent: { flex: 1 },
  addressLabel: { 
    fontSize: 11, 
    fontWeight: "700", 
    color: "#64748B", 
    marginBottom: 4 
  },
  addressValue: { 
    fontSize: 13, 
    fontWeight: "600", 
    color: "#1E293B",
    lineHeight: 16,
  },
  addressDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },

  teamList: {},
  teamMember: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  teamInfo: { 
    flex: 1, 
    marginLeft: 16 
  },
  teamName: { 
    fontSize: 13, 
    fontWeight: "800", 
    color: "#0F172A" 
  },
  teamRole: { 
    fontSize: 11, 
    color: "#64748B", 
    marginTop: 2,
    fontWeight: "600",
  },
  roleBadge: {
    backgroundColor: "#E2B17E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  emptyTeam: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: { 
    fontSize: 11, 
    color: "#94A3B8", 
    marginTop: 12,
    fontWeight: "500",
  },

  endBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  endBtnDisabled: { opacity: 0.7 },
  endText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
