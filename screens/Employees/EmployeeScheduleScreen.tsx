import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EmployeeBottomTabs from "./EmployeeBottomTabs";

export type EmployeeStackParamList = {
  EmployeeRoot: undefined;
};

const Stack =
  createNativeStackNavigator<EmployeeStackParamList>();

export default function EmployeeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="EmployeeRoot"
        component={EmployeeBottomTabs}
      />
    </Stack.Navigator>
  );
}
