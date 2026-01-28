import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../../../services/api";
import { COLORS } from "../../../../theme/colors";


type Props = {
  quoteId: string | null;
  data: any;
  onNext: (data?: any, newQuoteId?: string) => void;
  onBack?: () => void;
};


export default function Step1Customer({ data, quoteId, onNext, onBack }: Props) {
  const navigation = useNavigation<any>();

  const [customers, setCustomers] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(
    data.customer || null
  );

  const [movingDate, setMovingDate] = useState<Date | null>(
    data.movingDate ? new Date(data.movingDate) : null
  );
  const [startTime, setStartTime] = useState<string>(data.startTime || "");

  const [serviceType, setServiceType] = useState(
    data.serviceType || "FULL_SERVICES"
  );

  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);


  useEffect(() => {
    api.get("/customers").then((res) => setCustomers(res.data));
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(query.toLowerCase()) ||
      c.email?.toLowerCase().includes(query.toLowerCase())
  );


  const handleNext = async () => {
    if (!selectedCustomer || !movingDate || !startTime) return;

 const payload = {
  customerId: selectedCustomer.id,
  movingDate: movingDate.toISOString().split("T")[0],
  startTime: `${startTime}:00`, 
  serviceType,
  status: "DRAFT",
};


    let res;
    if (!quoteId) {
      res = await api.post("/quotations", payload);
    } else {
      res = await api.patch(`/quotations/${quoteId}`, payload);
    }

    onNext(payload, res?.data?.id || quoteId);
  };


  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>New Quotation</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.stepsContainer}>
        {Array.from({ length: 8 }).map((_, i) => {
          const step = i + 1;
          const active = step === 1;
          return (
            <View key={step} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  active && styles.stepCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    active && styles.stepNumberActive,
                  ]}
                >
                  {step}
                </Text>
              </View>
              {step < 8 && <View style={styles.stepDivider} />}
            </View>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Details</Text>

          {!selectedCustomer && (
            <>
              <View style={styles.searchBox}>
                <MaterialCommunityIcons name="magnify" size={20} color="#999" />
                <TextInput
                  placeholder="Search customer name or email..."
                  value={query}
                  onChangeText={setQuery}
                  style={{ flex: 1 }}
                />
              </View>

              {query.length > 0 &&
                filteredCustomers.map((c) => (
                  <Pressable
                    key={c.id}
                    style={styles.customerRow}
                    onPress={() => {
                      setSelectedCustomer(c);
                      setQuery("");
                    }}
                  >
                    <Text style={styles.customerName}>{c.fullName}</Text>
                    <Text style={styles.muted}>{c.phone}</Text>
                  </Pressable>
                ))}

              <Pressable
                style={styles.createBtn}
                onPress={() => navigation.navigate("CreateCustomer")}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.createText}>Create New Customer</Text>
              </Pressable>
            </>
          )}

          {selectedCustomer && (
            <Pressable onPress={() => setSelectedCustomer(null)}>
              <Text style={styles.selectedName}>
                {selectedCustomer.fullName}
              </Text>
              <Text style={styles.muted}>
                {selectedCustomer.pickupAddress}
              </Text>
              <Text style={styles.muted}>
                {selectedCustomer.dropoffAddress}
              </Text>
              <Text style={styles.changeHint}>Tap to change customer</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Schedule</Text>

          <View style={styles.scheduleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Move Date</Text>
              <Pressable
                style={styles.inputBox}
                onPress={() => setShowDate(true)}
              >
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={18}
                  color="#666"
                />
                <Text>
                  {movingDate
                    ? movingDate.toLocaleDateString()
                    : "Select date"}
                </Text>
              </Pressable>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Start Time</Text>
              <Pressable
                style={styles.inputBox}
                onPress={() => setShowTime(true)}
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={18}
                  color="#666"
                />
                <Text>{startTime || "Select time"}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Service Type</Text>

          <View style={styles.serviceGrid}>
            {[
              ["FULL_SERVICES", "Full Service", "truck"],
              ["MOVING", "Loading Only", "arrow-expand"],
              ["STORAGE", "Unloading Only", "arrow-collapse"],
              ["LABOR", "Labor Only", "account-hard-hat"],
            ].map(([val, label, icon]: any) => (
              <Pressable
                key={val}
                style={[
                  styles.serviceCard,
                  serviceType === val && styles.serviceActive,
                ]}
                onPress={() => setServiceType(val)}
              >
                <MaterialCommunityIcons
                  name={icon}
                  size={24}
                  color={
                    serviceType === val ? COLORS.primary : "#9AA0A6"
                  }
                />
                <Text
                  style={[
                    styles.serviceText,
                    serviceType === val && { color: COLORS.primary },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <Pressable style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextText}>Next</Text>
      </Pressable>

      {showDate && (
        <DateTimePicker
          value={movingDate || new Date()}
          mode="date"
          onChange={(e, d) => {
            setShowDate(false);
            if (d) setMovingDate(d);
          }}
        />
      )}

 {showTime && (
  <DateTimePicker
    value={new Date()}
    mode="time"
    onChange={(e, d) => {
      setShowTime(false);
      if (d) {
        const hh = d.getHours().toString().padStart(2, "0");
        const mm = d.getMinutes().toString().padStart(2, "0");
        setStartTime(`${hh}:${mm}`);
      }
    }}
  />
)}

    </View>
  );
}


const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F8FA" },

  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },

  stepsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  stepItem: { flexDirection: "row", alignItems: "center" },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepNumber: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  stepNumberActive: { color: "#fff" },
  stepDivider: { width: 18, height: 2, backgroundColor: "#E5E7EB" },

  card: {
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 18,
  },

  sectionTitle: { fontWeight: "800", marginBottom: 12 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
  },

  customerRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },

  customerName: { fontWeight: "700" },

  createBtn: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F6EFE7",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  createText: { color: COLORS.primary, fontWeight: "700" },

  selectedName: { fontWeight: "800", fontSize: 15 },
  muted: { color: "#6B7280", fontSize: 12 },
  changeHint: {
    marginTop: 6,
    fontSize: 11,
    color: COLORS.primary,
  },

  label: { fontSize: 12, color: "#6B7280", marginBottom: 6 },

  scheduleRow: { flexDirection: "row", gap: 12 },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
  },

  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  serviceCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 12,
  },

  serviceActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#F9F5F0",
  },

  serviceText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },

  nextBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    margin: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  nextText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
