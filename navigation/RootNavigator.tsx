import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import EmployeeNavigator from "./EmployeeNavigator";
import OwnerNavigator from "./OwnerNavigator";

export default function RootNavigator() {
  const { userToken, role, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userToken) {
    return <AuthNavigator />; 
  }

  if (role === "EMPLOYEE") {
    return <EmployeeNavigator />;
  }

  return <OwnerNavigator />;
}
