import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { SyncProvider } from "./src/context/SyncContext";
import { HealthProvider } from "./src/context/HealthContext";

import { SplashScreen } from "./src/screens/SplashScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { ProfileSetupScreen } from "./src/screens/ProfileSetupScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { AICoachScreen } from "./src/screens/AICoachScreen";
import { WorkoutGeneratorScreen } from "./src/screens/WorkoutGeneratorScreen";
import { ActiveWorkoutScreen } from "./src/screens/ActiveWorkoutScreen";
import { WorkoutHistoryScreen } from "./src/screens/WorkoutHistoryScreen";
import { NutritionScreen } from "./src/screens/NutritionScreen";
import { ProgressScreen } from "./src/screens/ProgressScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";

type AuthRoute = "login" | "register" | "forgot_password";
type TabRoute = "home" | "workout" | "nutrition" | "progress" | "profile";

const MainAppContent: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { isAuthenticated, isLoading, profile } = useAuth();

  const [showSplash, setShowSplash] = useState(true);
  const [authRoute, setAuthRoute] = useState<AuthRoute>("login");
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<TabRoute>("home");

  // Sub-screens & modals
  const [activeWorkoutData, setActiveWorkoutData] = useState<any | null>(null);
  const [showAICoachModal, setShowAICoachModal] = useState(false);
  const [workoutTabSubView, setWorkoutTabSubView] = useState<"generator" | "history">("generator");

  if (showSplash || isLoading) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 1. Auth Flow
  if (!isAuthenticated) {
    if (authRoute === "register") {
      return (
        <RegisterScreen
          onNavigateToLogin={() => setAuthRoute("login")}
          onRegistered={() => {
            setShowProfileSetup(true);
          }}
        />
      );
    }
    if (authRoute === "forgot_password") {
      return (
        <ForgotPasswordScreen
          onNavigateToLogin={() => setAuthRoute("login")}
        />
      );
    }
    return (
      <LoginScreen
        onNavigateToRegister={() => setAuthRoute("register")}
        onNavigateToForgotPassword={() => setAuthRoute("forgot_password")}
      />
    );
  }

  // 2. Profile Setup (First run onboarding or triggered from settings)
  if (showProfileSetup) {
    return (
      <ProfileSetupScreen
        onCompleted={() => setShowProfileSetup(false)}
      />
    );
  }

  // 3. Active Workout Full-Screen Session
  if (activeWorkoutData) {
    return (
      <ActiveWorkoutScreen
        workoutData={activeWorkoutData}
        onFinishWorkout={() => {
          setActiveWorkoutData(null);
          setActiveTab("workout");
          setWorkoutTabSubView("history");
        }}
        onCancel={() => setActiveWorkoutData(null)}
      />
    );
  }

  // 4. Main App Bottom Navigation
  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <DashboardScreen
            onStartWorkout={(workout) => setActiveWorkoutData(workout)}
            onOpenAICoach={() => setShowAICoachModal(true)}
            onOpenWorkoutTab={() => {
              setActiveTab("workout");
              setWorkoutTabSubView("generator");
            }}
          />
        );

      case "workout":
        return (
          <View style={{ flex: 1 }}>
            {/* Workout Sub-nav bar */}
            <View style={[styles.subNavBar, { backgroundColor: theme.background, borderBottomColor: theme.cardBorder }]}>
              <TouchableOpacity
                onPress={() => setWorkoutTabSubView("generator")}
                style={[
                  styles.subTabItem,
                  workoutTabSubView === "generator" && { borderBottomColor: theme.primary, borderBottomWidth: 2.5 }
                ]}
              >
                <Text
                  style={[
                    styles.subTabText,
                    { color: workoutTabSubView === "generator" ? theme.primary : theme.textMuted }
                  ]}
                >
                  AI Generator
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setWorkoutTabSubView("history")}
                style={[
                  styles.subTabItem,
                  workoutTabSubView === "history" && { borderBottomColor: theme.primary, borderBottomWidth: 2.5 }
                ]}
              >
                <Text
                  style={[
                    styles.subTabText,
                    { color: workoutTabSubView === "history" ? theme.primary : theme.textMuted }
                  ]}
                >
                  History Log
                </Text>
              </TouchableOpacity>
            </View>

            {workoutTabSubView === "generator" ? (
              <WorkoutGeneratorScreen
                onStartWorkout={(workout) => setActiveWorkoutData(workout)}
              />
            ) : (
              <WorkoutHistoryScreen
                onNewWorkout={() => setWorkoutTabSubView("generator")}
              />
            )}
          </View>
        );

      case "nutrition":
        return <NutritionScreen />;

      case "progress":
        return <ProgressScreen />;

      case "profile":
        return (
          <ProfileScreen
            onEditProfileSetup={() => setShowProfileSetup(true)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      {/* Screen Body */}
      <View style={{ flex: 1 }}>{renderTabContent()}</View>

      {/* Floating FitAI Coach Button (Section 19: prominent action) */}
      <TouchableOpacity
        style={[styles.floatingCoachBtn, { backgroundColor: theme.primary }]}
        onPress={() => setShowAICoachModal(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="sparkles" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: theme.navBg,
            borderTopColor: theme.cardBorder
          }
        ]}
      >
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab("home")}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === "home" ? "home" : "home-outline"}
            size={22}
            color={activeTab === "home" ? theme.navActive : theme.navInactive}
          />
          <Text
            style={[
              styles.navText,
              { color: activeTab === "home" ? theme.navActive : theme.navInactive }
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab("workout")}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === "workout" ? "barbell" : "barbell-outline"}
            size={22}
            color={activeTab === "workout" ? theme.navActive : theme.navInactive}
          />
          <Text
            style={[
              styles.navText,
              { color: activeTab === "workout" ? theme.navActive : theme.navInactive }
            ]}
          >
            Workout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab("nutrition")}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === "nutrition" ? "restaurant" : "restaurant-outline"}
            size={22}
            color={activeTab === "nutrition" ? theme.navActive : theme.navInactive}
          />
          <Text
            style={[
              styles.navText,
              { color: activeTab === "nutrition" ? theme.navActive : theme.navInactive }
            ]}
          >
            Nutrition
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab("progress")}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === "progress" ? "stats-chart" : "stats-chart-outline"}
            size={22}
            color={activeTab === "progress" ? theme.navActive : theme.navInactive}
          />
          <Text
            style={[
              styles.navText,
              { color: activeTab === "progress" ? theme.navActive : theme.navInactive }
            ]}
          >
            Progress
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab("profile")}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === "profile" ? "person" : "person-outline"}
            size={22}
            color={activeTab === "profile" ? theme.navActive : theme.navInactive}
          />
          <Text
            style={[
              styles.navText,
              { color: activeTab === "profile" ? theme.navActive : theme.navInactive }
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* FITAI COACH MODAL */}
      <Modal visible={showAICoachModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
          <View style={[styles.coachModalHeader, { borderBottomColor: theme.cardBorder }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={[styles.coachIconMini, { backgroundColor: theme.primary }]}>
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
              </View>
              <Text style={[styles.coachHeaderTitle, { color: theme.textPrimary }]}>FitAI Coach</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowAICoachModal(false)}
              style={styles.closeCoachBtn}
            >
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
          <AICoachScreen />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SyncProvider>
          <HealthProvider>
            <MainAppContent />
          </HealthProvider>
        </SyncProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  subNavBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 20
  },
  subTabItem: {
    paddingVertical: 12,
    marginRight: 24
  },
  subTabText: {
    fontSize: 14,
    fontWeight: "700"
  },
  bottomNav: {
    flexDirection: "row",
    height: 62,
    borderTopWidth: 1,
    alignItems: "center",
    justifyContent: "space-around"
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4
  },
  navText: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3
  },
  floatingCoachBtn: {
    position: "absolute",
    right: 20,
    bottom: 78,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0077FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 99
  },
  coachModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  coachIconMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  coachHeaderTitle: {
    fontSize: 18,
    fontWeight: "800"
  },
  closeCoachBtn: {
    padding: 4
  }
});
