import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { View, Text, StyleSheet } from "react-native";

import OwnerHome from "../screens/Admin/OwnerHome";
import JobsScreen from "../screens/Admin/JobsScreen";
import CalendarScreen from "../screens/calender/Calendar";
import Messages from "../screens/messages/Messages";
import Profile from "../screens/profile/Profile";
import { COLORS } from "../../theme/colors";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ focused, color }) => {
          let icon = "home-variant";

          if (route.name === "Home") icon = "home-variant";
          if (route.name === "Jobs") icon = "account-group-outline";
          if (route.name === "Calendar") icon = "calendar-month-outline";
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
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#9E9E9E",
      })}
    >
      <Tab.Screen name="Home" component={OwnerHome} />
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    elevation: 10,
  },
  label: {
    fontSize: 11,
    marginTop: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  activeIcon: {
    backgroundColor: "#E2B17E",
  },
});
