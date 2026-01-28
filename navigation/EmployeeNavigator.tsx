import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EmployeeBottomTabs from "../screens/Employees/EmployeeBottomTabs";
import EmployeeTasksScreen from "../screens/Employees/EmployeeTasksScreen";
import EmployeeJobDetailScreen from "../screens/Admin/JobDetailsScreen";
import EmployeeNotificationsScreen from "../screens/Employees/EmployeeNotificationsScreen";

export type EmployeeStackParamList = {
  EmployeeRoot: undefined;

  EmployeeTasks: undefined;

  EmployeeJobDetail: {
    jobId: string;
  };

  EmployeeNotifications: undefined;
};

const Stack = createNativeStackNavigator<EmployeeStackParamList>();

export default function EmployeeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      <Stack.Screen
        name="EmployeeRoot"
        component={EmployeeBottomTabs}
      />

      <Stack.Screen
        name="EmployeeTasks"
        component={EmployeeTasksScreen}
      />

      <Stack.Screen
        name="EmployeeJobDetail"
        component={EmployeeJobDetailScreen}
      />

      <Stack.Screen
        name="EmployeeNotifications"
        component={EmployeeNotificationsScreen}
      />

    </Stack.Navigator>
  );
}
