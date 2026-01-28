import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { api } from "../../../../services/api";
import { COLORS } from "../../../../theme/colors";


type Props = {
  quoteId: string | null;
  data: any;
  onNext: (data?: any) => void;
  onBack?: () => void;
};


export default function Step5Pricing({
  quoteId,
  data,
  onNext,
  onBack,
}: Props) {
  const CURRENT_STEP = 5;

  const [crewSize, setCrewSize] = useState(
    String(data.workers ?? 3)
  );

  const [pricingMethod, setPricingMethod] = useState<
    "HOURLY" | "FIXED"
  >(data.pricingMethod || "HOURLY");

  const [hourlyRate, setHourlyRate] = useState(
    String(data.hourlyRate ?? "65")
  );
  const [hours, setHours] = useState(
    String(data.estimatedHours ?? "5")
  );
  const [fixedPrice, setFixedPrice] = useState(
    String(data.fixedPrice ?? "")
  );

  const [travelFee, setTravelFee] = useState(
    String(data.travelCost ?? "120")
  );
  const [materialsFee, setMaterialsFee] = useState(
    String(data.materialsCost ?? "85")
  );
  const [otherFees, setOtherFees] = useState(
    String(data.otherFees ?? "0")
  );
  const [discount, setDiscount] = useState(
    String(data.discount ?? "0")
  );


  const baseLabor = useMemo(() => {
    if (pricingMethod === "HOURLY") {
      return (
        Number(hourlyRate || 0) *
        Number(hours || 0) *
        Number(crewSize || 1)
      );
    }
    return Number(fixedPrice || 0);
  }, [pricingMethod, hourlyRate, hours, fixedPrice, crewSize]);

  const feesTotal =
    Number(travelFee || 0) +
    Number(materialsFee || 0) +
    Number(otherFees || 0);

  const total = Math.max(
    0,
    baseLabor + feesTotal - Number(discount || 0)
  );



  const handleNext = async () => {
    const payload: any = {
      pricingMethod,
      workers: Number(crewSize),
      hourlyRate:
        pricingMethod === "HOURLY"
          ? Number(hourlyRate)
          : null,
     estimatedHours:
  pricingMethod === "HOURLY" && Number(hours) > 0
    ? Number(hours)
    : null,

      fixedPrice:
        pricingMethod === "FIXED"
          ? Number(fixedPrice)
          : null,
      travelCost: Number(travelFee),
      materialsCost: Number(materialsFee),
      otherFees: Number(otherFees),
      discount: Number(discount),
      total,
     

    };

    await api.patch(`/quotations/${quoteId}`, payload);
    onNext(payload);
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
          const filled = step <= CURRENT_STEP;
          return (
            <View key={step} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  filled && styles.stepCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    filled && styles.stepNumberActive,
                  ]}
                >
                  {step}
                </Text>
              </View>
              {step < 8 && (
                <View
                  style={[
                    styles.stepDivider,
                    filled && styles.stepDividerActive,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.toggleWrap}>
          <Toggle
            text="Hourly Rate"
            active={pricingMethod === "HOURLY"}
            onPress={() => setPricingMethod("HOURLY")}
          />
          <Toggle
            text="Fixed Price"
            active={pricingMethod === "FIXED"}
            onPress={() => setPricingMethod("FIXED")}
          />
        </View>

        {pricingMethod === "HOURLY" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Hourly Configuration
            </Text>

            <View style={styles.row}>
              <Input
                label="RATE / MOVER"
                prefix="$"
                suffix="/hr"
                value={hourlyRate}
                onChangeText={setHourlyRate}
              />
              <Input
                label="CREW SIZE"
                value={crewSize}
                onChangeText={setCrewSize}
              />
            </View>

            <Input
              label="ESTIMATED HOURS"
              suffix="hrs"
              value={hours}
              onChangeText={setHours}
            />

            <View style={styles.baseBox}>
              <Text style={styles.muted}>
                Base labor cost
              </Text>
              <Text style={styles.baseAmount}>
                ${baseLabor.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {pricingMethod === "FIXED" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Fixed Price</Text>
            <Input
              label="TOTAL FIXED PRICE"
              prefix="$"
              value={fixedPrice}
              onChangeText={setFixedPrice}
            />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Additional Fees</Text>

          <Fee
            icon="truck-outline"
            label="Travel Fee"
            value={travelFee}
            onChangeText={setTravelFee}
          />
          <Fee
            icon="package-variant"
            label="Materials"
            value={materialsFee}
            onChangeText={setMaterialsFee}
          />
          <Fee
            icon="plus-circle-outline"
            label="Other Fees"
            value={otherFees}
            onChangeText={setOtherFees}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Discount</Text>
          <Input
            prefix="$"
            value={discount}
            onChangeText={setDiscount}
          />
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>
            Estimated Total
          </Text>
          <Text style={styles.totalAmount}>
            ${total.toFixed(2)}
          </Text>
        </View>
      </ScrollView>

      <Pressable style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextText}>Next</Text>
      </Pressable>
    </View>
  );
}


const Toggle = ({ text, active, onPress }: any) => (
  <Pressable
    onPress={onPress}
    style={[styles.toggleBtn, active && styles.toggleActive]}
  >
    <Text
      style={[
        styles.toggleText,
        active && { color: "#fff" },
      ]}
    >
      {text}
    </Text>
  </Pressable>
);

const Input = ({
  label,
  prefix,
  suffix,
  ...props
}: any) => (
  <View style={{ flex: 1 }}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={styles.inputRow}>
      {prefix && <Text style={styles.affix}>{prefix}</Text>}
      <TextInput
        {...props}
        keyboardType="numeric"
        style={styles.input}
      />
      {suffix && <Text style={styles.affix}>{suffix}</Text>}
    </View>
  </View>
);

const Fee = ({ icon, label, ...props }: any) => (
  <View style={styles.feeRow}>
    <View style={styles.feeLeft}>
      <MaterialCommunityIcons name={icon} size={20} />
      <Text>{label}</Text>
    </View>
    <Input prefix="$" {...props} />
  </View>
);


const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F8FA" },

  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
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
  stepDividerActive: { backgroundColor: COLORS.primary },

  toggleWrap: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: "#F1F3F5",
    borderRadius: 14,
    padding: 4,
  },

  toggleBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleActive: { backgroundColor: COLORS.primary },
  toggleText: { fontWeight: "800", color: "#777" },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },

  cardTitle: { fontWeight: "800", marginBottom: 12 },

  row: { flexDirection: "row", gap: 12 },

  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#777",
    marginBottom: 6,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  input: {
    flex: 1,
    paddingVertical: 10,
    fontWeight: "700",
  },

  affix: { color: "#777", fontWeight: "700" },

  baseBox: {
    marginTop: 6,
    backgroundColor: "#FFF4E6",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  muted: { color: "#777" },
  baseAmount: { fontWeight: "800", color: "#F76707" },

  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  feeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },

  totalBox: {
    margin: 16,
    backgroundColor: "#FFF4E6",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },

  totalLabel: { color: "#777", fontWeight: "700" },
  totalAmount: {
    fontSize: 22,
    fontWeight: "900",
    color: "#F76707",
    marginTop: 4,
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
function alert(arg0: string) {
  throw new Error("Function not implemented.");
}

