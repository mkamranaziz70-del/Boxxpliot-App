import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
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


export default function Step4TeamEquipment({
  quoteId,
  data,
  onNext,
  onBack,
}: Props) {
  const CURRENT_STEP = 4;

  const [workers, setWorkers] = useState<number>(data.workers || 3);
  const [trucks, setTrucks] = useState<number>(data.trucks || 1);
  const [truckSize, setTruckSize] = useState<string>(
    data.truckSize || "26FT"
  );


  const handleNext = async () => {
    const payload = { workers, trucks, truckSize, 
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
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Team Composition</Text>

          <Text style={styles.subLabel}>NUMBER OF MOVERS</Text>
          <View style={styles.fullRow}>
            {[2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                style={[
                  styles.fullChoice,
                  workers === n && styles.fullChoiceActive,
                ]}
                onPress={() => setWorkers(n)}
              >
                <Text style={styles.choiceText}>
                  {n === 5 ? "5+" : n}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.subLabel, { marginTop: 16 }]}>
            NUMBER OF TRUCKS
          </Text>
          <View style={styles.fullRow}>
            {[1, 2, 3].map((n) => (
              <Pressable
                key={n}
                style={[
                  styles.fullChoice,
                  trucks === n && styles.fullChoiceActive,
                ]}
                onPress={() => setTrucks(n)}
              >
                <Text style={styles.choiceText}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Equipment</Text>
          <Text style={styles.subLabel}>TRUCK SIZE</Text>

          <View style={styles.grid}>
            {[
              ["10FT", "10 ft", "Studio"],
              ["16FT", "16 ft", "1–2 Bed"],
              ["20FT", "20 ft", "2–3 Bed"],
              ["26FT", "26 ft", "4+ Bed"],
            ].map(([val, size, desc]) => (
              <Pressable
                key={val}
                style={[
                  styles.truckCard,
                  truckSize === val && styles.truckActive,
                ]}
                onPress={() => setTruckSize(val)}
              >
                <MaterialCommunityIcons
                  name="truck-outline"
                  size={28}
                  color={
                    truckSize === val ? COLORS.primary : "#9CA3AF"
                  }
                />
                <Text style={styles.truckSize}>{size}</Text>
                <Text style={styles.truckDesc}>{desc}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <Pressable style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextText}>Next</Text>
      </Pressable>
    </View>
  );
}


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

  card: {
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 18,
  },

  sectionTitle: { fontWeight: "800", marginBottom: 12 },
  subLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
  },

  fullRow: {
    flexDirection: "row",
    gap: 10,
  },

  fullChoice: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },

  fullChoiceActive: {
    backgroundColor: "#F9F5F0",
    borderColor: COLORS.primary,
  },

  choiceText: { fontWeight: "800" },

 grid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  marginTop: 10,
},

truckCard: {
  flexBasis: "48%",   
  marginBottom: 12,  
  borderWidth: 1,
  borderColor: "#E5E7EB",
  borderRadius: 16,
  paddingVertical: 18,
  alignItems: "center",
},


  truckActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#F9F5F0",
  },

  truckSize: {
    marginTop: 6,
    fontWeight: "800",
    fontSize: 14,
  },

  truckDesc: {
    fontSize: 11,
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
