import React, { useState } from "react";
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
  onSkip?: () => void;
};


export default function Step6Inventory({
  quoteId,
  data,
  onNext,
  onBack,
  onSkip,
}: Props) {
  const CURRENT_STEP = 6;

  const [volume, setVolume] = useState(
    String(data.estimatedVolumeCft ?? "")
  );
  const [weight, setWeight] = useState(
    String(data.estimatedWeightLbs ?? "")
  );
  const [notes, setNotes] = useState(data.inventoryNotes ?? "");


  const handleNext = async () => {
    const payload = {
      estimatedVolumeCft: Number(volume || 0),
      estimatedWeightLbs: Number(weight || 0),
      inventoryNotes: notes,
   

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
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Inventory Details</Text>
          <Text style={styles.infoText}>
            You can calculate the volume of items to be moved or import
            data from a previous survey. This helps estimate the truck
            size accurately.
          </Text>
        </View>

        <View style={styles.card}>
          <Pressable style={styles.actionRow}>
            <View style={styles.actionLeft}>
              <MaterialCommunityIcons
                name="calculator-variant-outline"
                size={22}
                color={COLORS.primary}
              />
              <View>
                <Text style={styles.actionTitle}>
                  Volume Calculator
                </Text>
                <Text style={styles.muted}>
                  Add items room by room
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#9CA3AF"
            />
          </Pressable>

          <Pressable style={styles.actionRow}>
            <View style={styles.actionLeft}>
              <MaterialCommunityIcons
                name="import"
                size={22}
                color="#7C3AED"
              />
              <View>
                <Text style={styles.actionTitle}>
                  Import Calculation
                </Text>
                <Text style={styles.muted}>
                  Use a previous survey
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#9CA3AF"
            />
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            OR MANUAL ENTRY
          </Text>

          <Text style={styles.cardTitle}>
            Estimated Totals
          </Text>

          <View style={styles.row}>
            <Input
              label="VOLUME (CFT)"
              value={volume}
              onChangeText={setVolume}
            />
            <Input
              label="WEIGHT (LBS)"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inventory Notes</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add notes about fragile items, bulky furniture, or special handling requirements…"
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>

        <Pressable style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}


const Input = ({ label, ...props }: any) => (
  <View style={{ flex: 1 }}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      {...props}
      keyboardType="numeric"
      style={styles.input}
    />
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

  infoBox: { padding: 16 },

  infoTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },

  infoText: { fontSize: 12, color: "#6B7280" },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },

  cardTitle: { fontWeight: "800", marginBottom: 12 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    marginBottom: 6,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },

  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  actionTitle: { fontWeight: "700" },

  muted: { fontSize: 12, color: "#6B7280" },

  row: { flexDirection: "row", gap: 12 },

  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    fontWeight: "700",
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    height: 90,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },

  skipText: {
    fontWeight: "800",
    color: "#9CA3AF",
  },

  nextBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },

  nextText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});
