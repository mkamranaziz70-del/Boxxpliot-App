import { Text, View, StyleSheet, Pressable } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export const StepHeader = ({
  step,
  onBack,
  onSaveDraft,
}: {
  step: number;
  onBack?: () => void;
  onSaveDraft?: () => void;
}) => {
  return (
    <View style={styles.wrapper}>
      
      {/* TOP BAR */}
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} />
        </Pressable>

        <Text style={styles.title}>New Quotation</Text>

        <Pressable onPress={onSaveDraft}>
          <Text style={styles.saveDraft}>Save Draft</Text>
        </Pressable>
      </View>

      <View style={styles.progress}>
        {[1,2,3,4,5,6,7,8].map(s => (
          <View
            key={s}
            style={[
              styles.dot,
              s <= step && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFF6D5",
    paddingBottom: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginLeft: 16,
  },

  saveDraft: {
    fontSize: 14,
    color: "#007AFF",
  },

  progress: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },

  dotActive: {
    backgroundColor: "#007AFF",
  },
});
