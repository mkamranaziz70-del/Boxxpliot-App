import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/auth/LoginScreen";
import SignupStep1 from "../screens/auth/SignupStep1";
import SignupStep2 from "../screens/auth/SignupStep2";
import SignupStep3 from "../screens/auth/SignupStep3";
import SignupStep4 from "../screens/auth/SignupStep4";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="SignupStep1"
        component={SignupStep1}
      />
      <Stack.Screen
        name="SignupStep2"
        component={SignupStep2}
      />
      <Stack.Screen
        name="SignupStep3"
        component={SignupStep3}
      />
      <Stack.Screen
        name="SignupStep4"
        component={SignupStep4}
      />
    </Stack.Navigator>
  );
}
