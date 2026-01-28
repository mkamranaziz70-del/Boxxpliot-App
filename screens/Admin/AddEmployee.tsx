import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../../services/api";
import { COLORS } from "../../../theme/colors";


const POSITIONS = [
  { label: "Worker", value: "WORKER" },
  { label: "Driver", value: "DRIVER" },
  { label: "Team Leader", value: "TEAM_LEADER" },
  { label: "Manager", value: "MANAGER" },
];

const EMPLOYMENT_TYPES = [
  { label: "Full-time", value: "FULL_TIME" },
  { label: "Part-time", value: "PART_TIME" },
  { label: "Occasional", value: "OCCASIONAL" },
];


export default function AddEmployeeScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    sin: "",
    email: "",
    phone: "",
    address: "",
    hireDate: "",
    position: "WORKER",
    employmentType: "FULL_TIME",
    hourlyRate: "",
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm({ ...form, [key]: value });


  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      Alert.alert("Missing Information", "Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      await api.post("/employees", {
        ...form,
        hourlyRate: Number(form.hourlyRate),
      });

      Alert.alert(
        "Employee Invited",
        "A confirmation link has been sent to the employee’s email. The employee will appear as Pending until confirmed."
      );

      navigation.goBack();
    } catch (e: any) {
      console.log(e?.response?.data || e);
      Alert.alert("Error", "Unable to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <Header title="Add Employee" />

      <Section title="Personal Information">
        <Input label="First Name" value={form.firstName} onChange={(v: string) => update("firstName", v)} />
        <Input label="Last Name" value={form.lastName} onChange={(v: string) => update("lastName", v)} />
        <Input label="Date of Birth" placeholder="YYYY-MM-DD" value={form.dateOfBirth} onChange={(v: string) => update("dateOfBirth", v)} />
        <Input label="Social Insurance Number (NAS)" secure value={form.sin} onChange={(v: string) => update("sin", v)} />
      </Section>

      <Section title="Contact Details">
        <Input label="Email" value={form.email} onChange={(v: string) => update("email", v)} />
        <Input label="Mobile Phone" value={form.phone} onChange={(v: string) => update("phone", v)} />
        <Input label="Full Address" value={form.address} onChange={(v: string) => update("address", v)} />
      </Section>

      <Section title="Employment Information">
        <Input label="Hire Date" placeholder="YYYY-MM-DD" value={form.hireDate} onChange={(v: string) => update("hireDate", v)} />

        <Dropdown label="Position" options={POSITIONS} value={form.position} onChange={(v: string) => update("position", v)} />
        <Dropdown label="Employment Type" options={EMPLOYMENT_TYPES} value={form.employmentType} onChange={(v: string) => update("employmentType", v)} />

        <Input label="Hourly Rate ($)" keyboard="numeric" value={form.hourlyRate} onChange={(v: string) => update("hourlyRate", v)} />
      </Section>

      <Pressable style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Invite Employee</Text>}
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}


const Header = ({ title }: { title: string }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>{children}</View>
  </View>
);

const Input = ({ label, value, onChange, placeholder, keyboard, secure }: any) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      placeholder={placeholder}
      keyboardType={keyboard || "default"}
      secureTextEntry={secure}
      onChangeText={onChange}
    />
  </View>
);

const Dropdown = ({ label, options, value, onChange }: any) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.dropdown}>
      {options.map((opt: any) => (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={[
            styles.option,
            value === opt.value && styles.optionActive,
          ]}
        >
          <Text
            style={[
              styles.optionText,
              value === opt.value && styles.optionTextActive,
            ]}
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  </View>
);


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { padding: 20, backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#E5E7EB" },
  headerTitle: { fontSize: 20, fontWeight: "800" },

  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E5E7EB" },

  label: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 14 },

  dropdown: { flexDirection: "row", flexWrap: "wrap" },
  option: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", marginRight: 8, marginBottom: 8 },
  optionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { fontSize: 13 },
  optionTextActive: { color: "#fff", fontWeight: "700" },

  saveBtn: { backgroundColor: COLORS.primary, margin: 20, paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  saveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
