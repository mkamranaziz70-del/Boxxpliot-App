import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../services/api";


export type UserRole = "OWNER" | "EMPLOYEE";

type AuthContextType = {
  userToken: string | null;
  role: UserRole | null;
  loading: boolean;
  login: (token: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
};


const AuthContext = createContext<AuthContextType>({
  userToken: null,
  role: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});


export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const storedRole = await AsyncStorage.getItem("role");

        if (token && storedRole) {
          setUserToken(token);
          setRole(storedRole as UserRole);

          api.defaults.headers.common.Authorization =
            `Bearer ${token}`;
        } else {
          await AsyncStorage.multiRemove(["token", "role"]);
        }
      } catch (e) {
        console.log("Auth bootstrap error:", e);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (token: string, role: UserRole) => {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("role", role);

    api.defaults.headers.common.Authorization =
      `Bearer ${token}`;

    setUserToken(token);
    setRole(role);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "role"]);

    delete api.defaults.headers.common.Authorization;

    setUserToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        role,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
