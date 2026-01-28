import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { api } from "../../../services/api";
import { COLORS } from "../../../theme/colors";
import { useRoute } from "@react-navigation/native";

export default function SetEmployeePassword() {
  const route = useRoute<any>();
  const token = route.params?.token;

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&]).{8,}$/;

    if (!strongPassword.test(password)) {
      Alert.alert(
        "Weak Password",
        "Min 8 chars, uppercase, lowercase, number & special character required"
      );
      return;
    }

    try {
      setLoading(true);
      await api.post("/employee/set-password", {
        token,
        password,
      });

      Alert.alert(
        "Success",
        "Password set successfully. You can now log in."
      );
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Your Password</Text>

      <TextInput
        secureTextEntry
        placeholder="Enter strong password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <Pressable style={styles.btn} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.btnText}>
          {loading ? "Saving..." : "Save Password"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    marginBottom: 20,
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
