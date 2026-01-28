import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { COLORS } from "../../../theme/colors";
import { api } from "../../../services/api";


const DEV_BYPASS_OTP = true;

const OTP_LENGTH = 4;
const RESEND_TIME = 30;
const MAX_ATTEMPTS = 5;

export default function SignupStep3() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { email, companyId } = route?.params || {};

  const [code, setCode] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );

  const inputs = useRef<Array<TextInput | null>>([]);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(RESEND_TIME);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!email || !companyId) {
      setError("Signup session expired. Please restart.");
    }
  }, [email, companyId]);

  useEffect(() => {
    if (timer === 0) return;
    const i = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(i);
  }, [timer]);

  useEffect(() => {
    const otp = code.join("");
    if (otp.length === OTP_LENGTH && !loading) {
      handleVerify(otp);
    }
  }, [code]);

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;

    setError("");

    const next = [...code];
    next[index] = text.slice(-1);
    setCode(next);

    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (!code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpValue?: string) => {
    if (!email || !companyId || loading) return;

    const otp = otpValue || code.join("");
    if (otp.length !== OTP_LENGTH) return;

    if (DEV_BYPASS_OTP) {
      try {
        setLoading(true);
        console.log("🧪 OTP BYPASSED (DEV MODE)");

        await api.post("/auth/signup/verify-otp", {
          email,
          otp: "0000", 
        });

        navigation.replace("SignupStep4", { companyId });
      } catch (e: any) {
        setError(
          e?.response?.data?.message ||
            "Unable to verify code"
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    if (attempts >= MAX_ATTEMPTS) {
      setError(
        "Too many failed attempts. Please resend a new code."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/signup/verify-otp", {
        email,
        otp,
      });

      navigation.replace("SignupStep4", { companyId });
    } catch (e: any) {
      setAttempts(a => a + 1);
      setError(
        e?.response?.data?.message ||
          "Invalid or expired code"
      );
      setCode(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || timer > 0 || resending) return;

    try {
      setResending(true);
      setError("");
      setAttempts(0);

      await api.post("/auth/signup/resend-otp", { email });
      setTimer(RESEND_TIME);
    } catch {
      setError("Unable to resend code. Try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        <Text style={styles.stepText}>Step 3 of 4</Text>

        <View style={styles.progressRow}>
          <View style={[styles.progressBar, styles.done]} />
          <View style={[styles.progressBar, styles.done]} />
          <View style={[styles.progressBar, styles.active]} />
          <View style={styles.progressBar} />
        </View>

        <Text style={styles.title}>Verify your Email</Text>

        <Text style={styles.subtitle}>
          Enter the 4-digit code sent to{" "}
          <Text style={{ fontWeight: "700" }}>{email}</Text>
        </Text>

        <View style={styles.otpRow}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputs.current[index] = ref;
              }}
              style={[
                styles.otpBox,
                digit ? styles.otpFilled : undefined,
              ]}
              value={digit}
              onChangeText={t => handleChange(t, index)}
              onKeyPress={({ nativeEvent }) =>
                nativeEvent.key === "Backspace" &&
                handleBackspace(index)
              }
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              autoFocus={index === 0}
            />
          ))}
        </View>

        <Pressable onPress={handleResend} disabled={timer > 0}>
          <Text style={styles.resendText}>
            Didn’t receive the code?{" "}
            <Text style={styles.resendLink}>
              {timer > 0
                ? `Resend in ${timer}s`
                : resending
                ? "Sending..."
                : "Resend"}
            </Text>
          </Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={() => handleVerify()}
          style={styles.nextBtn}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextText}>
              Verify & Continue
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  backArrow: { fontSize: 22, marginBottom: 8 },
  stepText: {
    textAlign: "center",
    color: "#9E9E9E",
    marginBottom: 10,
    fontWeight: "500",
  },
  progressRow: { flexDirection: "row", marginBottom: 30 },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
    borderRadius: 2,
  },
  active: { backgroundColor: COLORS.primary },
  done: { backgroundColor: COLORS.primary, opacity: 0.4 },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 10 },
  subtitle: { color: "#9E9E9E", marginBottom: 28 },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  otpBox: {
    width: 58,
    height: 58,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    fontSize: 20,
    fontWeight: "700",
  },
  otpFilled: {
    borderColor: COLORS.primary,
    backgroundColor: "#F9EFE4",
  },

  resendText: {
    textAlign: "center",
    color: "#9E9E9E",
    marginBottom: 18,
  },
  resendLink: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  nextBtn: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  nextText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  error: {
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },
});
