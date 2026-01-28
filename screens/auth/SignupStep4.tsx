import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useNavigation, useRoute } from "@react-navigation/native";

import { COLORS } from "../../../theme/colors";
import { api } from "../../../services/api";


const DAYS = [
  { key: "MON", label: "M" },
  { key: "TUE", label: "T" },
  { key: "WED", label: "W" },
  { key: "THU", label: "T" },
  { key: "FRI", label: "F" },
  { key: "SAT", label: "S" },
  { key: "SUN", label: "S" },
];

export default function SignupStep4() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const companyId: string | undefined = route?.params?.companyId;

  const [days, setDays] = useState<string[]>([
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
  ]);

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("19:00");

  const [picker, setPicker] = useState<"START" | "END" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const toggleDay = (day: string) => {
    setDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const onConfirmTime = (date: Date) => {
    const formatted = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (picker === "START") setStartTime(formatted);
    if (picker === "END") setEndTime(formatted);

    setPicker(null);
  };

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const handleFinish = async () => {
    if (loading) return;

    if (!companyId) {
      setError("Signup session expired. Please restart.");
      return;
    }

    if (days.length === 0) {
      setError("Please select at least one operating day.");
      return;
    }

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      setError("End time must be after start time.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/signup/step-4", {
        companyId,
        operatingDays: days,
        operatingStartTime: startTime,
        operatingEndTime: endTime,
        payoutMethod: null,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          "Unable to complete signup. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Pressable
          onPress={() => !loading && navigation.goBack()}
          disabled={loading}
        >
          <Text style={[styles.back, loading && { opacity: 0.4 }]}>←</Text>
        </Pressable>

        <Text style={styles.step}>Step 4 of 4</Text>

        <View style={styles.progressRow}>
          {[1, 2, 3, 4].map(i => (
            <View
              key={i}
              style={[
                styles.bar,
                { backgroundColor: COLORS.primary },
                i < 4 && { opacity: 0.35 },
              ]}
            />
          ))}
        </View>

        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          These details are required to activate your account.
        </Text>

        <Text style={styles.label}>Operating days</Text>
        <View style={styles.daysRow}>
          {DAYS.map(d => (
            <Pressable
              key={d.key}
              onPress={() => toggleDay(d.key)}
              style={[
                styles.day,
                days.includes(d.key) && styles.dayActive,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  days.includes(d.key) && { color: "#fff" },
                ]}
              >
                {d.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.timeRow}>
          <Pressable
            style={styles.timeBox}
            onPress={() => setPicker("START")}
          >
            <Text style={styles.timeLabel}>Start Time</Text>
            <Text style={styles.time}>{startTime}</Text>
          </Pressable>

          <Text style={styles.arrow}>→</Text>

          <Pressable
            style={styles.timeBox}
            onPress={() => setPicker("END")}
          >
            <Text style={styles.timeLabel}>End Time</Text>
            <Text style={styles.time}>{endTime}</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Payout Settings</Text>
        <View style={styles.payoutBox}>
          <Text style={styles.payoutTitle}>Add Payment Method</Text>
          <Text style={styles.payoutSub}>
            Payment setup can be completed later.
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={handleFinish}
          disabled={loading}
          style={[styles.finishBtn, loading && { opacity: 0.7 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.finishText}>
              Finish & Activate Account
            </Text>
          )}
        </Pressable>

        <DateTimePickerModal
          isVisible={!!picker}
          mode="time"
          onConfirm={onConfirmTime}
          onCancel={() => setPicker(null)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 24 },
  back: { fontSize: 22, marginBottom: 6 },
  step: { textAlign: "center", color: "#9E9E9E", marginBottom: 10 },

  progressRow: { flexDirection: "row", marginBottom: 24 },
  bar: { flex: 1, height: 4, marginHorizontal: 4, borderRadius: 2 },

  title: { fontSize: 26, fontWeight: "800", marginBottom: 8 },
  subtitle: { color: "#9E9E9E", marginBottom: 24 },

  label: { fontWeight: "700", marginBottom: 8 },

  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  day: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  dayActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: { fontWeight: "700" },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  timeBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
  },
  timeLabel: { fontSize: 12, color: "#9E9E9E" },
  time: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  arrow: { marginHorizontal: 10, fontSize: 18 },

  payoutBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#FFF8F1",
    marginBottom: 30,
  },
  payoutTitle: { fontWeight: "700", marginBottom: 4 },
  payoutSub: { fontSize: 13, color: "#777" },

  finishBtn: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  finishText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  error: {
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },
});
