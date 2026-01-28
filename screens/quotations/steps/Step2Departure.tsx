import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { api } from "../../../../services/api";
import { COLORS } from "../../../../theme/colors";


type Props = {
  quoteId: string | null;
  data: any;
  onNext: (data?: any, newQuoteId?: string) => void;
  onBack?: () => void;
};


export default function Step2Departure({
  quoteId,
  data,
  onNext,
  onBack,
}: Props) {
  const CURRENT_STEP = 2;
const floorLabelToNumber = (label: string): number | null => {
  if (label === "Ground") return 0;
  if (label.startsWith("Floor ")) return Number(label.replace("Floor ", ""));
  if (label.startsWith("Basement "))
    return -Number(label.replace("Basement ", ""));
  return null;
};

  const [address, setAddress] = useState(data.pickupAddress || "");
  const [unit, setUnit] = useState(data.pickupUnit || "");
  const [floor, setFloor] = useState(data.pickupFloorLabel || "Ground");
  const [customFloor, setCustomFloor] = useState(
    data.pickupCustomFloor || ""
  );
  const [showFloorModal, setShowFloorModal] = useState(false);

  const [elevator, setElevator] = useState(data.pickupElevator ?? false);
  const [loadingDock, setLoadingDock] = useState(
    data.pickupLoadingDock ?? false
  );

  const [parkingDifficulty, setParkingDifficulty] = useState(
    data.parkingDifficulty || "EASY"
  );
  const [walkingDistance, setWalkingDistance] = useState(
    String(data.walkingDistance ?? "")
  );
  const [stairsWidth, setStairsWidth] = useState(
    data.stairsWidth || "NORMAL"
  );
  const [notes, setNotes] = useState(data.pickupAccessNotes || "");

  const FLOORS = [
    "Basement 3",
    "Basement 2",
    "Basement 1",
    "Ground",
    "Floor 1",
    "Floor 2",
    "Floor 3",
    "Custom",
  ];


 const handleNext = async () => {
  const resolvedFloor =
    floor === "Custom" ? null : floorLabelToNumber(floor);

  const payload = {
    pickupAddress: address,
    pickupUnit: unit,

    pickupFloor: resolvedFloor,

    pickupElevator: elevator,
    pickupLoadingDock: loadingDock,

    parkingDifficulty,
    walkingDistance: Number(walkingDistance || 0),
    stairsWidth,

    pickupAccessNotes:
      floor === "Custom" ? `Custom floor: ${customFloor}` : notes,
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
          <Text style={styles.sectionTitle}>Departure Address</Text>

          <Text style={styles.subLabel}>FULL ADDRESS</Text>
          <View style={styles.addressInput}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={20}
              color="#9CA3AF"
            />
            <TextInput
              placeholder="Start typing address..."
              placeholderTextColor="#9CA3AF"
              value={address}
              onChangeText={setAddress}
              style={styles.addressText}
            />
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>APT / UNIT #</Text>
              <TextInput
                placeholder="e.g. 4B"
                placeholderTextColor="#9CA3AF"
                value={unit}
                onChangeText={setUnit}
                style={styles.smallInput}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>FLOOR</Text>
              <Pressable
                style={styles.smallInput}
                onPress={() => setShowFloorModal(true)}
              >
                <Text>{floor}</Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={18}
                  color="#9CA3AF"
                />
              </Pressable>
            </View>
          </View>

          {floor === "Custom" && (
            <TextInput
              placeholder="Enter custom floor"
              value={customFloor}
              onChangeText={setCustomFloor}
              style={[styles.input, { marginTop: 10 }]}
            />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Access Details</Text>

          <View style={styles.accessRow}>
            <Text>Elevator Available</Text>
            <Pressable onPress={() => setElevator(!elevator)}>
              <MaterialCommunityIcons
                name={elevator ? "toggle-switch" : "toggle-switch-off-outline"}
                size={36}
                color={elevator ? COLORS.primary : "#D1D5DB"}
              />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.accessRow}>
            <Text>Loading Dock</Text>
            <Pressable onPress={() => setLoadingDock(!loadingDock)}>
              <MaterialCommunityIcons
                name={
                  loadingDock
                    ? "toggle-switch"
                    : "toggle-switch-off-outline"
                }
                size={36}
                color={loadingDock ? COLORS.primary : "#D1D5DB"}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Parking Difficulty</Text>

          <View style={styles.choiceRow}>
            {["EASY", "MEDIUM", "DIFFICULT"].map((v) => (
              <Pressable
                key={v}
                onPress={() => setParkingDifficulty(v)}
                style={[
                  styles.choice,
                  parkingDifficulty === v && styles.choiceActive,
                ]}
              >
                <Text>{v}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.subLabel}>
            WALKING DISTANCE TO TRUCK (METERS)
          </Text>
          <TextInput
            value={walkingDistance}
            onChangeText={setWalkingDistance}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Stairs Width</Text>

          <View style={styles.choiceRow}>
            {["NARROW", "NORMAL", "SPIRAL"].map((v) => (
              <Pressable
                key={v}
                onPress={() => setStairsWidth(v)}
                style={[
                  styles.choice,
                  stairsWidth === v && styles.choiceActive,
                ]}
              >
                <Text>{v}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.subLabel}>SPECIAL ACCESS NOTES</Text>
         <TextInput
  value={notes}
  onChangeText={setNotes}
  placeholder="Any gate codes, low bridges, or specific instructions for the driver..."
  placeholderTextColor="#9CA3AF"
  style={styles.textArea}
  multiline
/>

        </View>
      </ScrollView>

      <Pressable style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextText}>Next</Text>
      </Pressable>

      <Modal visible={showFloorModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFloorModal(false)}
        >
          <View style={styles.modal}>
            {FLOORS.map((f) => (
              <Pressable
                key={f}
                style={styles.modalItem}
                onPress={() => {
                  setFloor(f);
                  setShowFloorModal(false);
                }}
              >
                <Text>{f}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
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
  headerTitle: { fontWeight: "700" },

  stepsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
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
  stepNumber: { fontSize: 12, color: "#6B7280" },
  stepNumberActive: { color: "#fff" },
  stepDivider: { width: 18, height: 2, backgroundColor: "#E5E7EB" },
  stepDividerActive: { backgroundColor: COLORS.primary },

  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 18,
  },

  sectionTitle: { fontWeight: "800", marginBottom: 12 },
  subLabel: { fontSize: 11, color: "#6B7280", marginBottom: 6 },

  addressInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },

  addressText: { flex: 1 },
  row: { flexDirection: "row", gap: 12 },

  smallInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },

  accessRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },

  divider: { height: 1, backgroundColor: "#E5E7EB" },

  choiceRow: { flexDirection: "row", gap: 10, marginBottom: 10 },

  choice: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  choiceActive: {
    backgroundColor: "#F9F5F0",
    borderColor: COLORS.primary,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    height: 90,
  },

  nextBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    margin: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  nextText: { color: "#fff", fontWeight: "800" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
  },
  modalItem: {
    padding: 12,
  },
});
