import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import { api } from "../../../services/api";
import { COLORS } from "../../../theme/colors";
import EmptyEmployees from "./EmptyEmployees";
import EmployeeCard from "./EmployeeCard";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";


type EmployeeStatus = "PENDING" | "ACTIVE" | "DISABLED";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  status: EmployeeStatus;
};

const STATUSES: EmployeeStatus[] = ["PENDING", "ACTIVE", "DISABLED"];

export default function EmployeesScreen() {
  const navigation = useNavigation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] =
    useState<EmployeeStatus>("PENDING");

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/employees");
      setEmployees(res.data || []);
    } catch (e) {
      console.log("Failed to load employees", e);
    } finally {
      setLoading(false);
    }
  };

useFocusEffect(
  useCallback(() => {
    loadEmployees();
  }, [])
);


  const filteredEmployees = useMemo(() => {
    return employees.filter(e => e.status === activeStatus);
  }, [employees, activeStatus]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (employees.length === 0) {
    return <EmptyEmployees />;
  }


  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Employees</Text>
      </View>

      <View style={styles.segmentWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.segmentContainer}>
            {STATUSES.map(status => {
              const active = activeStatus === status;
              return (
                <Pressable
                  key={status}
                  onPress={() => setActiveStatus(status)}
                  style={[
                    styles.segmentBtn,
                    active && styles.segmentBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active && styles.segmentTextActive,
                    ]}
                  >
                    {status}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {filteredEmployees.length === 0 ? (
        <Text style={styles.emptyText}>
          No {activeStatus.toLowerCase()} employees
        </Text>
      ) : (
        <FlatList
          data={filteredEmployees}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <EmployeeCard
              employee={item}
              onRefresh={loadEmployees}
            />
          )}
        />
      )}
    <Pressable
      style={styles.fab}
      onPress={() => navigation.navigate("AddEmployee" as never)}
    >
      <MaterialCommunityIcons name="plus" size={28} color="#fff" />
    </Pressable>
    </View>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  header: {
    padding: 18,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
fab: {
  position: "absolute",
  right: 20,
  bottom: 24,
  width: 58,
  height: 58,
  borderRadius: 29,
  backgroundColor: COLORS.primary,
  justifyContent: "center",
  alignItems: "center",

  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 4 },

  elevation: 6,
},

  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2937",
  },

  segmentWrapper: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },

  segmentContainer: {
    flexDirection: "row",
  },

  segmentBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 6,
  },

  segmentBtnActive: {
    backgroundColor: COLORS.primary,
  },

  segmentText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },

  segmentTextActive: {
    color: "#FFFFFF",
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 60,
    color: "#9CA3AF",
    fontSize: 13,
  },
});
