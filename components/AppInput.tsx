import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { COLORS } from "../../theme/colors";

export default function AppInput(props: any) {
  return (
    <View style={styles.box}>
      <TextInput
        {...props}
        placeholderTextColor={COLORS.textLight}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  input: {
    padding: 14,
    fontSize: 15,
    color: COLORS.textDark,
  },
});
