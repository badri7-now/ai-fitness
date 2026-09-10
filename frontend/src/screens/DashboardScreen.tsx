import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useHealth } from "../context/HealthContext";
import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { ProgressCard } from "../components/ProgressRing";
import { WaterTracker } from "../components/WaterTracker";
import { api } from "../api/client";

interface DashboardScreenProps {
  onStartWorkout: (workoutData?: any) => void;
  onOpenAICoach: () => void;
  onOpenWorkoutTab: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onStartWorkout,
  onOpenAICoach,
  onOpenWorkoutTab
}) => {
  const { theme } = useTheme();
  const { profile, caloriePlan } = useAuth();
  const { stats, syncHealthData, isConnected, providerName } = useHealth();

  const [refreshing, setRefreshing] = useState(false);
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [upcomingWorkout, setUpcomingWorkout] = useState<any>(null);
  const [workoutCompletedToday, setWorkoutCompletedToday] = useState(false);

  const loadDashboardData = async () => {
    try {
      // Fetch generated or planned workout
      const res = await api.post("/ai/generate-workout", {});
      if (res.success && res.data) {
        setTodayWorkout(res.data);
      }

      // Check user workouts completed today
      const workoutsRes = await api.get("/workouts");
      if (workoutsRes.success && Array.isArray(workoutsRes.data)) {
        const todayStr = new Date().toISOString().split("T")[0];
        const doneToday = workoutsRes.data.some((w: any) => w.date === todayStr && w.completed);
        setWorkoutCompletedToday(doneToday);
      }

      setUpcomingWorkout({
        title: "Upper Body Hypertrophy & Arms",
        date: "Tomorrow, 7:30 AM",
        duration: "35 mins",
        exercisesCount: 5
      });
    } catch (e) {
      console.warn("Error loading dashboard data:", e);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await syncHealthData();
    await loadDashboardData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const userName = profile?.name ? profile.name.split(" ")[0] : "Athlete";
  const targetCalories = caloriePlan?.targetCalories || 2200;
  const targetWaterGlasses = caloriePlan?.waterGoalGlasses || 10;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header
        title={`${getGreeting()}, ${userName}`}
        subtitle={`Goal: ${profile?.fitness_goal || "General Fitness"}`}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Health Integration Notification Banner if connected */}
        {isConnected && (
          <View style={[styles.healthBanner, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="pulse" size={18} color={theme.success} />
            <Text style={[styles.healthText, { color: theme.textSecondary }]}>
              Synced with {providerName} • {stats.lastSynced}
            </Text>
          </View>
        )}

        {/* 1. TODAY'S SUMMARY STATS */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Today's Summary</Text>
          <Text style={[styles.dateText, { color: theme.textMuted }]}>
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </Text>
        </View>

        <View style={styles.metricsGrid}>
          <ProgressCard
            label="Steps"
            current={stats.steps}
            target={10000}
            unit="steps"
            icon="footsteps"
            color={theme.stepGreen}
          />
          <ProgressCard
            label="Calories"
            current={workoutCompletedToday ? 480 : stats.activeCalories}
            target={600}
            unit="kcal"
            icon="flame"
            color={theme.calorieOrange}
          />
        </View>

        <View style={styles.metricsGrid}>
          <ProgressCard
            label="Workout"
            current={workoutCompletedToday ? 1 : 0}
            target={1}
            unit="session"
            icon="barbell"
            color={theme.primary}
          />
          <ProgressCard
            label="Current Weight"
            current={profile?.weight || 70}
            target={profile?.weight || 70}
            unit="kg"
            icon="scale-outline"
            color="#8B5CF6"
          />
        </View>

        {/* Hydration Tracker */}
        <WaterTracker targetGlasses={targetWaterGlasses} />

        {/* 2. TODAY'S WORKOUT CARD */}
        <View style={[styles.sectionHeader, { marginTop: 16 }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Today's Workout</Text>
          <TouchableOpacity onPress={onOpenWorkoutTab} activeOpacity={0.7}>
            <Text style={[styles.seeAllText, { color: theme.primary }]}>View Library</Text>
          </TouchableOpacity>
        </View>

        <Card variant="card" style={styles.workoutCard}>
          <View style={styles.workoutHeaderRow}>
            <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>
                {todayWorkout?.difficulty || profile?.fitness_level || "Beginner"}
              </Text>
            </View>
            <View style={styles.durationRow}>
              <Ionicons name="time-outline" size={16} color={theme.textMuted} />
              <Text style={[styles.durationText, { color: theme.textMuted }]}>
                {todayWorkout?.estimated_duration_minutes || 30} mins
              </Text>
            </View>
          </View>

          <Text style={[styles.workoutName, { color: theme.textPrimary }]}>
            {todayWorkout?.workout_name || "AI Full Body Conditioning"}
          </Text>

          <Text style={[styles.workoutMeta, { color: theme.textMuted }]}>
            {todayWorkout?.exercises?.length || 5} exercises • Target:{" "}
            {todayWorkout?.target_muscle_groups?.join(", ") || "Full Body"}
          </Text>

          {todayWorkout?.coach_tip && (
            <View style={[styles.tipBox, { backgroundColor: theme.cardBorder + "30" }]}>
              <Ionicons name="bulb-outline" size={16} color={theme.warning} />
              <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                {todayWorkout.coach_tip}
              </Text>
            </View>
          )}

          <Button
            title={workoutCompletedToday ? "Do Another Workout" : "Start Workout"}
            onPress={() => onStartWorkout(todayWorkout)}
            icon={<Ionicons name="play" size={18} color="#FFFFFF" />}
            style={{ marginTop: 12 }}
          />
        </Card>

        {/* 3. UPCOMING WORKOUT */}
        {upcomingWorkout && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 16, marginBottom: 8 }]}>
              Upcoming Workout
            </Text>
            <Card variant="card" style={styles.upcomingCard}>
              <View style={styles.upcomingLeft}>
                <View style={[styles.calIcon, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                </View>
                <View>
                  <Text style={[styles.upcomingTitle, { color: theme.textPrimary }]}>
                    {upcomingWorkout.title}
                  </Text>
                  <Text style={[styles.upcomingDate, { color: theme.textMuted }]}>
                    {upcomingWorkout.date} • {upcomingWorkout.duration}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </Card>
          </>
        )}

        {/* 4. FITAI PROMPT BANNER */}
        <TouchableOpacity
          style={[styles.aiBanner, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
          onPress={onOpenAICoach}
          activeOpacity={0.85}
        >
          <View style={[styles.aiIconCircle, { backgroundColor: theme.primary }]}>
            <Ionicons name="sparkles" size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.aiBannerTitle, { color: theme.primary }]}>Ask FitAI Coach</Text>
            <Text style={[styles.aiBannerSub, { color: theme.textSecondary }]}>
              Need workout tweaks or nutrition advice? FitAI is ready.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={theme.primary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40
  },
  healthBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14
  },
  healthText: {
    fontSize: 12,
    fontWeight: "600"
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2
  },
  dateText: {
    fontSize: 13,
    fontWeight: "600"
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "700"
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },
  workoutCard: {
    padding: 18
  },
  workoutHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  durationText: {
    fontSize: 13,
    fontWeight: "600"
  },
  workoutName: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4
  },
  workoutMeta: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 10
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 8
  },
  tipText: {
    fontSize: 12,
    fontWeight: "500",
    flex: 1
  },
  upcomingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14
  },
  upcomingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  calIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: "700"
  },
  upcomingDate: {
    fontSize: 12,
    marginTop: 2
  },
  aiBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    marginTop: 18
  },
  aiIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center"
  },
  aiBannerTitle: {
    fontSize: 15,
    fontWeight: "800"
  },
  aiBannerSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500"
  }
});
