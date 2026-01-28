import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import Svg, { Path, Line } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../context/AuthContext";

import { COLORS } from "../../../theme/colors";
import { api } from "../../../services/api";

export default function LoginScreen() {
const navigation = useNavigation<any>();
const { login } = useAuth(); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (loading) return;

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });
await AsyncStorage.setItem("token", res.data.token); 
await AsyncStorage.setItem("role", res.data.user.role); 
await login(res.data.token, res.data.user.role); 

const t = await AsyncStorage.getItem("token");
console.log("TOKEN AFTER LOGIN:", t);

const { token, user } = res.data;

await login(token, user.role);


    } catch (e: any) {
      const code = e?.response?.data?.error;
      const step = e?.response?.data?.signupStep;
      const companyId = e?.response?.data?.companyId;

      if (code === "SIGNUP_INCOMPLETE") {
        Alert.alert(
          "Signup Incomplete",
          "Please complete your signup to continue.",
          [
            {
              text: "Continue Signup",
              onPress: () => {
                if (step === "STEP_1") {
                  navigation.navigate("SignupStep1");
                } else if (step === "STEP_2") {
                  navigation.navigate("SignupStep2", { companyId });
                } else if (step === "STEP_3") {
                  navigation.navigate("SignupStep3", { email });
                } else if (step === "STEP_4") {
                  navigation.navigate("SignupStep4", { companyId });
                }
              },
            },
          ]
        );
        return;
      }

      setError(
        e?.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFaceId = () => {
    Alert.alert(
      "Coming soon",
      "Biometric login will be enabled in a future update."
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <View style={styles.logoPill}>
          <Text style={styles.logoText}>BOXXPILOT</Text>
        </View>
        <Text style={styles.title}>Log in to manage your moves</Text>
        <Text style={styles.subtitle}>
          Secure access to your logistics dashboard
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputBox}>
          <TextInput
            placeholder="name@company.com"
            placeholderTextColor="#C7C7C7"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              fill="#9E9E9E"
              d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16
                 c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
            />
          </Svg>
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputBox}>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#C7C7C7"
            style={styles.input}
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable onPress={() => setPasswordVisible(!passwordVisible)}>
            <Svg width={22} height={22} viewBox="0 0 24 24">
              <Path
                fill="#9E9E9E"
                d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 11
                   a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
              />
              {!passwordVisible && (
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
          </Pressable>
        </View>

        <Pressable>
          <Text style={styles.forgot}>Forgot password?</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={[styles.loginBtn, loading && { opacity: 0.7 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </Pressable>

        <Pressable onPress={handleFaceId} style={styles.faceBtn}>
          <Text style={styles.faceText}>Login with Face ID</Text>
        </Pressable>

        <Text style={styles.signup}>
          New to BoxxPilot?{" "}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("SignupStep1")}
          >
            Sign up
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 35,
    paddingHorizontal: 28,
  },
  logoPill: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: 22,
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  logoText: { color: "#fff", fontWeight: "600", letterSpacing: 1 },

  title: { color: "#fff", fontSize: 26, fontWeight: "700" },
  subtitle: { color: "#fff", marginTop: 6, fontSize: 15 },

  form: { padding: 24 },

  label: { fontWeight: "600", marginBottom: 6, color: "#222" },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 18,
  },

  input: { flex: 1, fontSize: 15, color: "#222" },

  forgot: {
    color: COLORS.primary,
    textAlign: "right",
    marginBottom: 20,
    fontWeight: "500",
  },

  loginBtn: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  faceBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  faceText: { color: COLORS.primary, fontWeight: "600" },

  signup: {
    textAlign: "center",
    marginTop: 22,
    color: "#999",
  },
  link: { color: COLORS.primary, fontWeight: "700" },

  error: {
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "500",
  },
});
