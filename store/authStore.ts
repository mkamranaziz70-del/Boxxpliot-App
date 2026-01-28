import { create } from "zustand";
import { api } from "../../services/api";

interface AuthState {
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  loading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const res = await api.post("/auth/login", { email, password });


      set({ loading: false });
      return true;
    } catch (e: any) {
      set({
        loading: false,
        error: e?.response?.data?.message || "Invalid email or password",
      });
      return false;
    }
  },
}));
