import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../../theme/colors";

export default function EmptyEmployees() {
  const navigation = useNavigation<any>();

  const handleAddEmployee = () => {
    navigation.navigate("AddEmployee"); 
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../src/assets/images/employee.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Build Your Crew</Text>

      <Text style={styles.subtitle}>
        It looks like you haven't added any staff yet.
        {"\n"}Start adding your drivers and movers to begin scheduling jobs.
      </Text>

      <Pressable
        onPress={handleAddEmployee}   
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={styles.buttonText}>+ Add Employee</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
});
