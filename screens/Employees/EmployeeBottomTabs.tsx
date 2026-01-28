import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import EmployeeHomeScreen from "../Employees/EmployeeHomeScreen";
import EmployeeScheduleScreen from "../Employees/EmployeeScheduleScreen";
import EmployeeMessagesScreen from "../Employees/EmployeeMessagesScreen";
import EmployeeProfileScreen from "../Employees/Profile";

import { COLORS } from "../../../theme/colors";

const Tab = createBottomTabNavigator();

export default function EmployeeBottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ focused }) => {
          let icon = "home-variant";

          if (route.name === "Home") icon = "home-variant";
          if (route.name === "Schedule") icon = "calendar-month-outline";
          if (route.name === "Messages") icon = "message-text-outline";
          if (route.name === "Profile") icon = "account-outline";

          return (
            <View style={[styles.iconWrap, focused && styles.activeIcon]}>
              <MaterialCommunityIcons
                name={icon}
                size={22}
                color={focused ? "#fff" : "#9E9E9E"}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={EmployeeHomeScreen} />
      <Tab.Screen
        name="Schedule"
        component={EmployeeScheduleScreen}
      />
      <Tab.Screen
        name="Messages"
        component={EmployeeMessagesScreen}
      />
      <Tab.Screen
        name="Profile"
        component={EmployeeProfileScreen}
      />
    </Tab.Navigator>
  );
}


const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
    height: 70,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    paddingBottom: 10,
    paddingTop: 10,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },

    elevation: 10,
  },

  label: {
    fontSize: 11,
    marginTop: 4,
    color: "#9E9E9E",
  },

  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },

  activeIcon: {
    backgroundColor: COLORS.primary,
  },
});
