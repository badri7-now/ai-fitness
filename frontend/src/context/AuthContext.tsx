import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/client";
import { User, Profile, CaloriePlan } from "../types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  caloriePlan: CaloriePlan | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; message?: string }>;
  googleLogin: () => Promise<{ success: boolean; message?: string }>;
  appleLogin: () => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; debugCode?: string }>;
  resetPassword: (email: string, code: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (updatedData: Partial<Profile>) => Promise<{ success: boolean; message?: string }>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [caloriePlan, setCaloriePlan] = useState<CaloriePlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session
  useEffect(() => {
    const restore = async () => {
      try {
        const token = await AsyncStorage.getItem("@auth_token");
        const savedUser = await AsyncStorage.getItem("@auth_user");
        const savedProfile = await AsyncStorage.getItem("@auth_profile");

        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
          if (savedProfile) setProfile(JSON.parse(savedProfile));

          // Fetch fresh profile from API
          const res = await api.get("/profile");
          if (res.success && res.data) {
            setProfile(res.data.profile);
            setCaloriePlan(res.data.caloriePlan);
            await AsyncStorage.setItem("@auth_profile", JSON.stringify(res.data.profile));
          }
        }
      } catch (err) {
        console.warn("Session restore error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { emailOrUsername, password });
      if (res.success && res.data) {
        const { token, user: u, profile: p } = res.data;
        await AsyncStorage.setItem("@auth_token", token);
        await AsyncStorage.setItem("@auth_user", JSON.stringify(u));
        if (p) await AsyncStorage.setItem("@auth_profile", JSON.stringify(p));

        setUser(u);
        setProfile(p);
        await refreshProfile();
        return { success: true };
      }
      return { success: false, message: res.message || "Invalid credentials." };
    } catch (err) {
      return { success: false, message: "Network error during login." };
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      const res = await api.post("/auth/register", data);
      if (res.success && res.data) {
        const { token, user: u, profile: p } = res.data;
        await AsyncStorage.setItem("@auth_token", token);
        await AsyncStorage.setItem("@auth_user", JSON.stringify(u));
        if (p) await AsyncStorage.setItem("@auth_profile", JSON.stringify(p));

        setUser(u);
        setProfile(p);
        await refreshProfile();
        return { success: true };
      }
      return { success: false, message: res.message || "Registration failed." };
    } catch (err) {
      return { success: false, message: "Network error during registration." };
    }
  };

  const googleLogin = async () => {
    const res = await api.post("/auth/google", { email: "alex.google@fitai.app", name: "Alex Google" });
    if (res.success && res.data) {
      const { token, user: u, profile: p } = res.data;
      await AsyncStorage.setItem("@auth_token", token);
      await AsyncStorage.setItem("@auth_user", JSON.stringify(u));
      if (p) await AsyncStorage.setItem("@auth_profile", JSON.stringify(p));
      setUser(u);
      setProfile(p);
      await refreshProfile();
      return { success: true };
    }
    return { success: false, message: res.message || "Google sign-in failed." };
  };

  const appleLogin = async () => {
    const res = await api.post("/auth/apple", { email: "alex.apple@fitai.app", name: "Alex Apple" });
    if (res.success && res.data) {
      const { token, user: u, profile: p } = res.data;
      await AsyncStorage.setItem("@auth_token", token);
      await AsyncStorage.setItem("@auth_user", JSON.stringify(u));
      if (p) await AsyncStorage.setItem("@auth_profile", JSON.stringify(p));
      setUser(u);
      setProfile(p);
      await refreshProfile();
      return { success: true };
    }
    return { success: false, message: res.message || "Apple sign-in failed." };
  };

  const forgotPassword = async (email: string) => {
    const res = await api.post("/auth/forgot-password", { email });
    return {
      success: res.success,
      message: res.message,
      debugCode: res.debugCode
    };
  };

  const resetPassword = async (email: string, code: string, newPass: string) => {
    const res = await api.post("/auth/reset-password", {
      email,
      code,
      newPassword: newPass
    });
    return { success: res.success, message: res.message };
  };

  const updateProfile = async (updatedData: Partial<Profile>) => {
    const res = await api.put("/profile", updatedData);
    if (res.success && res.data) {
      setProfile(res.data.profile);
      setCaloriePlan(res.data.caloriePlan);
      await AsyncStorage.setItem("@auth_profile", JSON.stringify(res.data.profile));
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || "Failed to update profile." };
  };

  const refreshProfile = async () => {
    const res = await api.get("/profile");
    if (res.success && res.data) {
      setProfile(res.data.profile);
      setCaloriePlan(res.data.caloriePlan);
      await AsyncStorage.setItem("@auth_profile", JSON.stringify(res.data.profile));
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("@auth_token");
    await AsyncStorage.removeItem("@auth_user");
    await AsyncStorage.removeItem("@auth_profile");
    setUser(null);
    setProfile(null);
    setCaloriePlan(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        caloriePlan,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        googleLogin,
        appleLogin,
        forgotPassword,
        resetPassword,
        updateProfile,
        refreshProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
