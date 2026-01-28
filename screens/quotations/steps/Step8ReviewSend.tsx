import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../../../services/api";
import { COLORS } from "../../../../theme/colors";


type Props = {
  quote: any;
  onSent: () => void;
  onBack?: () => void;
};


export default function Step8ReviewSend({ quote, onSent }: Props) {
  const navigation = useNavigation<any>();

  const [fullQuote, setFullQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("DRAFT");


useEffect(() => {
  if (!quote?.id) return;

  const load = async () => {
    const res = await api.get(`/quotations/${quote.id}`);
    setFullQuote(res.data);
    setStatus(res.data.status || "DRAFT");
    setLoading(false);
  };

  load();
}, [quote?.id]);



const getFullDateTime = () => {
  if (!fullQuote?.movingDate || !fullQuote?.startTime) return "-";

  const [year, month, day] = fullQuote.movingDate
    .slice(0, 10)
    .split("-")
    .map(Number);

  const [hh, mm] = fullQuote.startTime.split(":").map(Number);

  const localDate = new Date(year, month - 1, day, hh, mm);

  return localDate.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};


const sendToCustomer = async () => {
  try {
    const res = await api.post(`/quotations/${quote.id}/send`);

    console.log("Quotation sent:", res.data);
    onSent();
  } catch (e) {
    console.error(e);
  }
};


  const saveDraft = async () => {
    await api.patch(`/quotations/${quote.id}`, {
      status: "DRAFT",
    });

    const res = await api.get(`/quotations/${quote.id}`);
    navigation.navigate("QuotationsList", {
      updatedQuote: res.data,
    });
  };

  if (loading || !fullQuote) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
const formatFloor = (floor: number | null | undefined) => {
  if (floor === null || floor === undefined) return "-";
  return floor === 0 ? "Ground" : `Floor ${floor}`;
};

const pickupFloor = formatFloor(fullQuote.pickupFloor);
const dropoffFloor = formatFloor(fullQuote.dropoffFloor);


  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} />
        </Pressable>

        <Text style={styles.headerTitle}>New Quotation</Text>

        <View style={{ width: 24 }} />
      </View>

      <View style={styles.stepsContainer}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={styles.stepItem}>
            <View style={styles.stepCircleActive}>
              <Text style={styles.stepNumberActive}>{i + 1}</Text>
            </View>
            {i < 7 && <View style={styles.stepDividerActive} />}
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.refBox}>
          <Text style={styles.refLabel}>QUOTATION REFERENCE</Text>
          <View style={styles.refRow}>
            <Text style={styles.ref}>
              #Q-{fullQuote.quoteNumber}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>
        </View>

        <Card title="Customer">
          <Row
            icon="account-outline"
            label={fullQuote.customer?.fullName || "-"}
            sub={fullQuote.customer?.email}
          />
        </Card>

        <Card title="Scheduled For">
  <Row
    icon="calendar-outline"
    label={getFullDateTime()}
  />
</Card>

        <Card title="Move Route">
          <Route
            title="Origin"
            address={fullQuote.pickupAddress}
            meta={`Floor: ${pickupFloor}`}
          />
          <Route
            title="Destination"
            address={fullQuote.dropoffAddress}
            meta={`Floor: ${dropoffFloor}`}
          />
        </Card>

        <Card title="Inventory Summary">
          <View style={styles.inventoryRow}>
            <InventoryStat
              icon="package-variant"
              label="Items"
              value={fullQuote.inventoryItems ?? 0}
            />
            <InventoryStat
              icon="cube-outline"
              label="Volume"
              value={`${fullQuote.estimatedVolumeCft ?? 0} cft`}
            />
            <InventoryStat
              icon="weight"
              label="Weight"
              value={`${fullQuote.estimatedWeightLbs ?? 0} lbs`}
            />
          </View>
        </Card>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total Estimate</Text>
          <Text style={styles.totalAmount}>
            ${Number(fullQuote.total || 0).toFixed(2)}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.sendBtn} onPress={sendToCustomer}>
          <MaterialCommunityIcons name="send" size={18} color="#fff" />
          <Text style={styles.sendText}>Send to Customer</Text>
        </Pressable>

        <Pressable style={styles.draftBtn} onPress={saveDraft}>
          <MaterialCommunityIcons
            name="content-save-outline"
            size={18}
            color={COLORS.primary}
          />
          <Text style={styles.draftText}>Save as Draft</Text>
        </Pressable>
      </View>
    </View>
  );
}


const Card = ({ title, children }: any) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const Row = ({ icon, label, sub }: any) => (
  <View style={styles.row}>
    <MaterialCommunityIcons name={icon} size={20} />
    <View>
      <Text style={styles.rowLabel}>{label}</Text>
      {sub && <Text style={styles.rowSub}>{sub}</Text>}
    </View>
  </View>
);

const Route = ({ title, address, meta }: any) => (
  <View style={styles.routeRow}>
    <Text style={styles.routeTitle}>{title}</Text>
    <Text style={styles.routeAddr}>{address || "-"}</Text>
    <Text style={styles.routeMeta}>{meta}</Text>
  </View>
);

const InventoryStat = ({ icon, label, value }: any) => (
  <View style={styles.invStat}>
    <MaterialCommunityIcons name={icon} size={22} />
    <Text style={styles.invValue}>{value}</Text>
    <Text style={styles.invLabel}>{label}</Text>
  </View>
);


const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F8FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

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
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  stepItem: { flexDirection: "row", alignItems: "center" },
  stepCircleActive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberActive: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  stepDividerActive: {
    width: 18,
    height: 2,
    backgroundColor: COLORS.primary,
  },

  refBox: { padding: 16 },
  refLabel: { fontSize: 11, color: "#777", fontWeight: "700" },
  refRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  ref: { fontSize: 16, fontWeight: "800" },
  statusBadge: {
    backgroundColor: "#FFF4E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: "700", color: "#F76707" },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  cardTitle: { fontWeight: "800", marginBottom: 10 },

  row: { flexDirection: "row", gap: 10 },
  rowLabel: { fontWeight: "700" },
  rowSub: { fontSize: 12, color: "#777" },

  routeRow: { marginBottom: 10 },
  routeTitle: { fontWeight: "700" },
  routeAddr: { fontSize: 13 },
  routeMeta: { fontSize: 12, color: "#777" },

  inventoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  invStat: { alignItems: "center" },
  invValue: { fontWeight: "800" },
  invLabel: { fontSize: 11, color: "#777" },

  totalBox: {
    backgroundColor: "#FFF4E6",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  totalLabel: { color: "#777", fontWeight: "700" },
  totalAmount: {
    fontSize: 22,
    fontWeight: "900",
    color: "#F76707",
  },

  footer: { padding: 16, gap: 10 },

  sendBtn: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontWeight: "800" },

  draftBtn: {
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  draftText: { color: COLORS.primary, fontWeight: "800" },
});
