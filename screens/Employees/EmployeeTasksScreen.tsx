import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../../services/api";
import { COLORS } from "../../../theme/colors";
import { useFocusEffect } from '@react-navigation/native'; 

interface Job {
  id: string;
  jobNumber: string;
  status: "CONFIRMED" | "IN_PROGRESS" | "SCHEDULED" | "CANCELLED";
  serviceType: string;
  movingDate?: string;
  time?: string;
  endTime?: string;
  estimatedHours?: number;
  pickupAddress: string;
  dropoffAddress: string;
}

interface ApiResponse {
  nextJob?: Job;
  upcoming?: Job[];
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

const statusColor = (status: string): string => {
  const colors: Record<string, string> = {
    CONFIRMED: "#10B981",
    IN_PROGRESS: "#3B82F6",
    SCHEDULED: "#F59E0B",
    CANCELLED: "#EF4444",
  };
  return colors[status] || "#9CA3AF";
};

const statusTranslation = (status: string): string => {
  const translations: Record<string, string> = {
    CONFIRMED: "Confirmed",
    IN_PROGRESS: "In Progress",
    SCHEDULED: "Scheduled",
    CANCELLED: "Cancelled",
  };
  return translations[status] || status.replace("_", " ");
};

const CustomAppBar = ({ 
  taskCount, 
  onFilterPress, 
  onRefresh 
}: { 
  taskCount: number; 
  onFilterPress: () => void; 
  onRefresh: () => void; 
}) => {
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.appbar, { opacity: fadeAnim }]}>
      <View style={styles.appbarLeft}>
        <MaterialCommunityIcons 
          name="clipboard-list-outline" 
          size={28} 
          color="#fff" 
        />
        <View style={styles.appbarTitleContainer}>
          <Text style={styles.appbarTitle}>My Tasks</Text>
          <Text style={styles.appbarSubtitle}>
            {taskCount ? `${taskCount} job${taskCount !== 1 ? 's' : ''}` : "No tasks"}
          </Text>
        </View>
      </View>
      
      <Pressable style={styles.filterButton} onPress={onFilterPress}>
        <MaterialCommunityIcons name="filter-variant" size={24} color="#fff" />
      </Pressable>
    </Animated.View>
  );
};

export default function EmployeeTasksScreen() {
  const navigation = useNavigation<any>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const res = await api.get<ApiResponse>("/employees/home");
      const allTasks: Job[] = [];
      
      if (res.data.nextJob) allTasks.push(res.data.nextJob);
      if (res.data.upcoming?.length) allTasks.push(...res.data.upcoming);

      setTasks(allTasks);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load tasks";
      setError(errorMsg);
      Alert.alert("Error", errorMsg, [{ text: "Retry", onPress: () => fetchTasks() }]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

 useFocusEffect(
    useCallback(() => {
      fetchTasks(false); 
    }, [fetchTasks])
  );

  const onRefresh = useCallback(() => {
    fetchTasks(false);
  }, [fetchTasks]);

  const handleFilterPress = () => {
    Alert.alert("Filter", "Filter by status coming soon!");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomAppBar taskCount={0} onFilterPress={handleFilterPress} onRefresh={onRefresh} />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  if (error && !tasks.length) {
    return (
      <View style={styles.container}>
        <CustomAppBar taskCount={0} onFilterPress={handleFilterPress} onRefresh={onRefresh} />
        <View style={styles.errorContent}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Failed to load tasks</Text>
          <Text style={styles.errorText}>Please check your connection and try again</Text>
          <Pressable style={styles.retryButton} onPress={() => fetchTasks(true)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!tasks.length) {
    return (
      <View style={styles.container}>
        <CustomAppBar taskCount={0} onFilterPress={handleFilterPress} onRefresh={onRefresh} />
        <ScrollView
          contentContainerStyle={styles.empty}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Tasks Assigned</Text>
          <Text style={styles.emptyText}>Pull down to refresh</Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomAppBar 
        taskCount={tasks.length} 
        onFilterPress={handleFilterPress} 
        onRefresh={onRefresh} 
      />
      
      <ScrollView
        style={styles.screen}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tasks.map((job) => (
          <Pressable
            key={job.id}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate("EmployeeJobDetail", { jobId: job.id })}
            android_ripple={{ color: "rgba(0,0,0,0.05)" }}
          >
            <View style={styles.rowBetween}>
              <Text style={styles.jobNumber} numberOfLines={1}>
                Job #{job.jobNumber}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor(job.status) }]}>
                <Text style={styles.statusText}>{statusTranslation(job.status)}</Text>
              </View>
            </View>

            <Text style={styles.serviceType} numberOfLines={2}>{job.serviceType}</Text>
            <Text style={styles.metaText} numberOfLines={1}>
              {formatDateLabel(job.movingDate)} • {formatTimeRange(job.time, job.endTime, job.estimatedHours)}
            </Text>

            <View style={styles.addressBlock}>
              <View style={styles.addressRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={16} color="#6B7280" />
                <Text style={styles.addressText} numberOfLines={1}>{job.pickupAddress}</Text>
              </View>
              <View style={styles.addressRow}>
                <MaterialCommunityIcons name="map-marker-check-outline" size={16} color="#6B7280" />
                <Text style={styles.addressText} numberOfLines={1}>{job.dropoffAddress}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.viewText}>View Job Details</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
            </View>
          </Pressable>
        ))}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  
  appbar: {
    height: 80,
    backgroundColor: COLORS.primary || "#1F2937",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  appbarLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  appbarTitleContainer: {
    marginLeft: 16,
  },
  appbarTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 24,
  },
  appbarSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
    marginTop: 2,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  screen: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  empty: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 60,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: { backgroundColor: "#F9FAFB" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  jobNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 80,
    alignItems: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  serviceType: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    lineHeight: 22,
  },
  metaText: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  addressBlock: { marginTop: 16 },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },
  addressText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  viewText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  bottomSpacer: { height: 100 },
});
