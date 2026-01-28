
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../../theme/colors";
import { api } from "../../../services/api";

type ServiceType = "MOVING" | "STORAGE" | "FULL_SERVICES";


export default function SignupStep1() {
  
  const navigation = useNavigation<any>();

  const [businessName, setBusinessName] = useState("");

  const [serviceType, setServiceType] =
  useState<ServiceType>("MOVING");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async () => {
    if (loading) return;

    if (!businessName.trim() || !address.trim()) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log(" STEP 1 REQUEST");

      const res = await api.post("/auth/signup/step-1", {
        legalBusinessName: businessName.trim(),
        primaryServiceType: serviceType,
        headquartersAddress: address.trim(),
      });

      console.log(" STEP 1 RESPONSE:", res.data);

      if (!res?.data?.companyId) {
        throw new Error("Company ID missing from response");
      }

      
      navigation.navigate("SignupStep2", {
        companyId: res.data.companyId,
      });

    } catch (e: any) {
      console.log(" STEP 1 ERROR:", e?.response?.data || e?.message);

      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

 
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.header}>

          <Pressable
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>

          <Text style={styles.stepText}>Step 1 of 4</Text>

          <View style={styles.progressRow}>
            <View style={[styles.progressBar, styles.active]} />
            <View style={styles.progressBar} />
            <View style={styles.progressBar} />
            <View style={styles.progressBar} />
          </View>
        </View>

        <View style={styles.container}>

          <Text style={styles.title}>
            Tell us about your Business
          </Text>

          <Text style={styles.subtitle}>
            We need a few details to customize your BoxxPilot experience.
          </Text>

          <Text style={styles.label}>Legal Business Name</Text>
          <TextInput
            placeholder="e.g Apex moving and storage"
            placeholderTextColor="#C7C7C7"
            style={styles.input}
            value={businessName}
            onChangeText={setBusinessName}
          />

          <Text style={styles.label}>Primary Service Type</Text>
          <View style={styles.serviceRow}>
            <ServiceChip
              label="Moving"
              active={serviceType === "MOVING"}
              onPress={() => setServiceType("MOVING")}
            />
            <ServiceChip
              label="Storage"
              active={serviceType === "STORAGE"}
              onPress={() => setServiceType("STORAGE")}
            />
            <ServiceChip
              label="Full Services"
              active={serviceType === "FULL_SERVICES"}
              onPress={() => setServiceType("FULL_SERVICES")}
            />
          </View>

          <Text style={styles.label}>Headquarters Address</Text>
          <TextInput
            placeholder="Enter your Headquarters address"
            placeholderTextColor="#C7C7C7"
            style={styles.input}
            value={address}
            onChangeText={setAddress}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={handleNext}
            disabled={loading}
            style={[
              styles.nextBtn,
              { opacity: loading ? 0.85 : 1 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextText}>Next Step</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


function ServiceChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && styles.chipActive,
      ]}
    >
      <Text
        style={
          active ? styles.chipTextActive : styles.chipText
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  backBtn: {
    marginBottom: 6,
  },
  backArrow: {
    fontSize: 22,
    color: "#000",
  },
  stepText: {
    textAlign: "center",
    color: "#9E9E9E",
    marginBottom: 10,
    fontWeight: "500",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  progressBar: {
    height: 4,
    flex: 1,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginHorizontal: 4,
  },
  active: {
    backgroundColor: COLORS.primary,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    color: "#9E9E9E",
    fontSize: 14,
    marginBottom: 22,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 15,
    color: "#222",
    marginBottom: 18,
  },
  serviceRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: "#9E9E9E",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  nextText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  error: {
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "500",
  },
});
