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
import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { WeeklyCalendar } from "../components/WeeklyCalendar";
import { api } from "../api/client";
import { WeeklyCalendarDay, ProgressRecord, ProgressSummary } from "../types";

export const ProgressScreen: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useAuth();

  const [timeframe, setTimeframe] = useState<"week" | "month">("week");
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<ProgressSummary>({
    totalWorkouts: 4,
    totalMinutes: 140,
    totalCaloriesBurned: 1850,
    avgSteps: 8450,
    currentWeight: profile?.weight || 70
  });

  const [weeklyCalendar, setWeeklyCalendar] = useState<WeeklyCalendarDay[]>([
    { day: "Mon", date: "2026-09-01", completed: true, isToday: false },
    { day: "Tue", date: "2026-09-02", completed: true, isToday: false },
    { day: "Wed", date: "2026-09-03", completed: false, isToday: false },
    { day: "Thu", date: "2026-09-04", completed: true, isToday: false },
    { day: "Fri", date: "2026-09-05", completed: true, isToday: false },
    { day: "Sat", date: "2026-09-06", completed: false, isToday: false },
    { day: "Sun", date: "2026-09-07", completed: true, isToday: true }
  ]);

  const [history, setHistory] = useState<ProgressRecord[]>([]);

  const fetchProgress = async () => {
    try {
      const res = await api.get(`/progress?timeframe=${timeframe}`);
      if (res.success) {
        if (res.summary) setSummary(res.summary);
        if (res.weeklyCalendar) setWeeklyCalendar(res.weeklyCalendar);
        if (res.history) setHistory(res.history);
      }
    } catch (e) {
      console.warn("Failed to fetch progress:", e);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [timeframe]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProgress();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header title="Progress Tracking" subtitle="Consistency & Performance Analytics" />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Timeframe Filter (Weekly / Monthly) */}
        <View style={[styles.filterRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <TouchableOpacity
            onPress={() => setTimeframe("week")}
            style={[
              styles.filterBtn,
              timeframe === "week" && { backgroundColor: theme.primary }
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: timeframe === "week" ? "#FFFFFF" : theme.textSecondary }
              ]}
            >
              Weekly View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTimeframe("month")}
            style={[
              styles.filterBtn,
              timeframe === "month" && { backgroundColor: theme.primary }
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: timeframe === "month" ? "#FFFFFF" : theme.textSecondary }
              ]}
            >
              Monthly View
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Calendar Strip (Requirement 10) */}
        <WeeklyCalendar days={weeklyCalendar} />

        {/* Analytics Highlights Grid */}
        <View style={styles.grid}>
          <Card variant="card" style={styles.gridCard}>
            <View style={[styles.cardIconCircle, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="barbell-outline" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {summary.totalWorkouts}
            </Text>
            <Text style={[styles.statTitle, { color: theme.textMuted }]}>Workouts Finished</Text>
          </Card>

          <Card variant="card" style={styles.gridCard}>
            <View style={[styles.cardIconCircle, { backgroundColor: theme.waterBlue + "20" }]}>
              <Ionicons name="time-outline" size={20} color={theme.waterBlue} />
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {summary.totalMinutes}m
            </Text>
            <Text style={[styles.statTitle, { color: theme.textMuted }]}>Training Time</Text>
          </Card>

          <Card variant="card" style={styles.gridCard}>
            <View style={[styles.cardIconCircle, { backgroundColor: theme.calorieOrange + "20" }]}>
              <Ionicons name="flame-outline" size={20} color={theme.calorieOrange} />
            </View>
            <Text style={[styles.statValue, { color: theme.calorieOrange }]}>
              {summary.totalCaloriesBurned}
            </Text>
            <Text style={[styles.statTitle, { color: theme.textMuted }]}>Calories Burned</Text>
          </Card>

          <Card variant="card" style={styles.gridCard}>
            <View style={[styles.cardIconCircle, { backgroundColor: theme.stepGreen + "20" }]}>
              <Ionicons name="footsteps-outline" size={20} color={theme.stepGreen} />
            </View>
            <Text style={[styles.statValue, { color: theme.stepGreen }]}>
              {summary.avgSteps.toLocaleString()}
            </Text>
            <Text style={[styles.statTitle, { color: theme.textMuted }]}>Avg Daily Steps</Text>
          </Card>
        </View>

        {/* Weight Progression Chart / Trend */}
        <Card variant="card" style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>Weight Progress</Text>
              <Text style={[styles.chartSubtitle, { color: theme.textMuted }]}>
                Current: {summary.currentWeight} kg • Target: {profile?.fitness_goal || "Maintain Weight"}
              </Text>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: theme.success + "20" }]}>
              <Ionicons name="trending-down" size={16} color={theme.success} />
              <Text style={[styles.trendText, { color: theme.success }]}>-0.8 kg</Text>
            </View>
          </View>

          {/* Clean Visual Trend Bar Chart */}
          <View style={styles.chartBarsContainer}>
            {history.slice(-7).map((item, idx) => {
              const maxW = 90;
              const minW = 60;
              const normHeight = Math.max(25, Math.min(90, ((item.weight - minW) / (maxW - minW)) * 90));
              return (
                <View key={idx} style={styles.barColumn}>
                  <Text style={[styles.barValueText, { color: theme.textSecondary }]}>
                    {item.weight}
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: theme.ringBg }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          backgroundColor: idx === history.slice(-7).length - 1 ? theme.primary : theme.waterBlue,
                          height: normHeight
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.barDateLabel, { color: theme.textMuted }]}>
                    {item.date ? item.date.slice(5) : `D${idx + 1}`}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Daily Calorie Burn Progression */}
        <Card variant="card" style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>
                Active Calorie Burn
              </Text>
              <Text style={[styles.chartSubtitle, { color: theme.textMuted }]}>
                Burned during daily workouts & walking
              </Text>
            </View>
            <Ionicons name="flame" size={24} color={theme.calorieOrange} />
          </View>

          <View style={styles.chartBarsContainer}>
            {history.slice(-7).map((item, idx) => {
              const barHeight = Math.max(15, Math.min(90, ((item.calories || 200) / 700) * 90));
              return (
                <View key={idx} style={styles.barColumn}>
                  <Text style={[styles.barValueText, { color: theme.calorieOrange }]}>
                    {item.calories || 150}
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: theme.ringBg }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          backgroundColor: theme.calorieOrange,
                          height: barHeight
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.barDateLabel, { color: theme.textMuted }]}>
                    {item.date ? item.date.slice(5) : `D${idx + 1}`}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40
  },
  filterRow: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 8
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 10
  },
  filterText: {
    fontSize: 13,
    fontWeight: "700"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 6
  },
  gridCard: {
    flex: 1,
    minWidth: "47%",
    padding: 14,
    alignItems: "center"
  },
  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800"
  },
  statTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2
  },
  chartCard: {
    padding: 18,
    marginVertical: 8
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "800"
  },
  chartSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12
  },
  trendText: {
    fontSize: 12,
    fontWeight: "800"
  },
  chartBarsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    paddingTop: 10
  },
  barColumn: {
    alignItems: "center",
    flex: 1
  },
  barValueText: {
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4
  },
  barTrack: {
    width: 14,
    height: 90,
    borderRadius: 7,
    justifyContent: "flex-end",
    overflow: "hidden"
  },
  barFill: {
    width: "100%",
    borderRadius: 7
  },
  barDateLabel: {
    fontSize: 10,
    marginTop: 6,
    fontWeight: "600"
  }
});
