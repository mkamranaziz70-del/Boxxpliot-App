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
import { useNavigation, useRoute } from "@react-navigation/native";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import Svg, { Path, Line } from "react-native-svg";
import { api } from "../../../services/api";

import { COLORS } from "../../../theme/colors";


const PHONE_MAX_LENGTH: Record<string, number> = {
  US: 10,
  PK: 10,
  IN: 10,
  GB: 10,
  AE: 9,
};

const getMaxPhoneLength = (code: CountryCode) =>
  PHONE_MAX_LENGTH[code] || 12;

const getFlagEmoji = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (c) =>
      String.fromCodePoint(127397 + c.charCodeAt(0))
    );


export default function SignupStep2() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const companyId = route?.params?.companyId;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [countryCode, setCountryCode] =
    useState<CountryCode>("US");
  const [callingCode, setCallingCode] = useState("1");
  const [pickerVisible, setPickerVisible] = useState(false);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= COUNTRY ================= */

  const onSelectCountry = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
    setPhone("");
    setPickerVisible(false);
  };

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, "");
    setPhone(digits.slice(0, getMaxPhoneLength(countryCode)));
  };

  /* ================= NEXT ================= */

  const handleNext = async () => {
    if (loading) return;

    if (!companyId || !fullName || !email || !password) {
      setError("Please fill all required fields");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/signup/step-2", {
        companyId,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? `+${callingCode}${phone}` : null,
        password,
      });

      navigation.navigate("SignupStep3", {
        email: email.trim().toLowerCase(),
        companyId,
      });
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          "Unable to continue. Please try again."
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
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>

          <Text style={styles.stepText}>Step 2 of 4</Text>

          <View style={styles.progressRow}>
            <View style={[styles.progressBar, styles.done]} />
            <View style={[styles.progressBar, styles.active]} />
            <View style={styles.progressBar} />
            <View style={styles.progressBar} />
          </View>
        </View>

        <View style={styles.container}>
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>
            This information will be used to create your primary administrative account.
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="John Doe"
            placeholderTextColor="#C7C7C7"
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Work Email</Text>
          <TextInput
            placeholder="john@movingco.com"
            placeholderTextColor="#C7C7C7"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneWrapper}>
            <Pressable
              style={styles.countryBtn}
              onPress={() => setPickerVisible(true)}
            >
              <Text style={styles.flag}>
                {getFlagEmoji(countryCode)}
              </Text>
              <Text style={styles.callingCode}>
                +{callingCode}
              </Text>
            </Pressable>

            <TextInput
              placeholder="(555) 000 0000"
              placeholderTextColor="#C7C7C7"
              keyboardType="number-pad"
              style={styles.phoneInput}
              value={phone}
              onChangeText={handlePhoneChange}
            />
          </View>

          <CountryPicker
            withCallingCode
            withFilter
            withFlagButton={false}
            countryCode={countryCode}
            visible={pickerVisible}
            onSelect={onSelectCountry}
            onClose={() => setPickerVisible(false)}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="********"
              placeholderTextColor="#C7C7C7"
              secureTextEntry={!showPass}
              style={styles.inputFlex}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPass(!showPass)}>
              <EyeIcon crossed={!showPass} />
            </Pressable>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="********"
              placeholderTextColor="#C7C7C7"
              secureTextEntry={!showConfirm}
              style={styles.inputFlex}
              value={confirm}
              onChangeText={setConfirm}
            />
            <Pressable onPress={() => setShowConfirm(!showConfirm)}>
              <EyeIcon crossed={!showConfirm} />
            </Pressable>
          </View>

          <Pressable
            onPress={handleNext}
            style={styles.nextBtn}
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


function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        fill="#9E9E9E"
        d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7z"
      />
      {crossed && (
        <Line
          x1="3"
          y1="3"
          x2="21"
          y2="21"
          stroke="#9E9E9E"
          strokeWidth={2}
        />
      )}
    </Svg>
  );
}


const styles = StyleSheet.create({
  header: { paddingTop: 20, paddingHorizontal: 24 },
  backArrow: { fontSize: 22 },
  stepText: {
    textAlign: "center",
    color: "#9E9E9E",
    marginBottom: 10,
    fontWeight: "500",
  },

  progressRow: { flexDirection: "row", marginBottom: 18 },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
    borderRadius: 2,
  },
  active: { backgroundColor: COLORS.primary },
  done: { backgroundColor: COLORS.primary, opacity: 0.4 },

  container: { padding: 24 },

  title: { fontSize: 26, fontWeight: "800", marginBottom: 6 },
  subtitle: {
    color: "#9E9E9E",
    fontSize: 14,
    marginBottom: 22,
    lineHeight: 20,
  },

  label: { fontWeight: "600", marginBottom: 6 },

  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 14,
    marginBottom: 18,
    fontSize: 15,
  },

  phoneWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    height: 52,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  countryBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
    paddingRight: 10,
  },
  flag: { fontSize: 18, marginRight: 6 },
  callingCode: { fontWeight: "600" },
  phoneInput: {
    flex: 1,
    paddingLeft: 10,
    fontSize: 15,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  inputFlex: { flex: 1 },

  nextBtn: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  error: {
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },
});
