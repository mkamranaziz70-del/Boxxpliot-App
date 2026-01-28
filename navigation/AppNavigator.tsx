import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomTabs from "./BottomTabs";
import Customers from "../screens/Admin/Customers";
import CreateCustomer from "../screens/Admin/CreateCustomer";
import JobDetailScreen from "../screens/Admin/JobDetailsScreen";
import AssignTeamScreen from "../screens/Admin/AssignTeamScreen";

import EmployeesScreen from "../screens/Employees/index";
import AddEmployeeScreen from "../screens/Admin/AddEmployee";

import QuotationsList from "../screens/quotations/QuotationsList";
import CreateQuoteFlow from "../screens/quotations/CreateQuotationFlow";
import QuotationDetails from "../screens/quotations/QuotationDetails";

import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Root" component={BottomTabs} />

      <Stack.Screen name="Customers" component={Customers} />
      <Stack.Screen name="CreateCustomer" component={CreateCustomer} />
<Stack.Screen
  name="JobDetail"
  component={JobDetailScreen}
/>

      <Stack.Screen name="Employees" component={EmployeesScreen} />
      <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} />
<Stack.Screen
  name="AssignTeam"
  component={AssignTeamScreen}
  options={{ title: "Assign Team" }}
/>
      <Stack.Screen name="QuotationsList" component={QuotationsList} />
      <Stack.Screen name="CreateQuote" component={CreateQuoteFlow} />
      <Stack.Screen
        name="QuotationDetails"
        component={QuotationDetails}
      />
    </Stack.Navigator>
  );
}
