import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { api } from "../api/client";

interface WorkoutGeneratorScreenProps {
  onStartWorkout: (workout: any) => void;
}

export const WorkoutGeneratorScreen: React.FC<WorkoutGeneratorScreenProps> = ({
  onStartWorkout
}) => {
  const { theme } = useTheme();
  const { profile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<any>(null);
  const [selectedSplit, setSelectedSplit] = useState("Full Body");

  const generateWorkout = async () => {
    setLoading(true);
    try {
      const res = await api.post("/ai/generate-workout", {});
      if (res.success && res.data) {
        setWorkout(res.data);
      }
    } catch (e) {
      console.warn("Failed to generate workout:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateWorkout();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header title="Workout Generator" subtitle="AI-Generated Routines" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Alignment Card */}
        <Card variant="card" style={styles.configCard}>
          <View style={styles.configRow}>
            <View style={styles.configItem}>
              <Text style={[styles.configLabel, { color: theme.textMuted }]}>GOAL</Text>
              <Text style={[styles.configValue, { color: theme.textPrimary }]}>
                {profile?.fitness_goal || "General Fitness"}
              </Text>
            </View>
            <View style={styles.configDivider} />
            <View style={styles.configItem}>
              <Text style={[styles.configLabel, { color: theme.textMuted }]}>LEVEL</Text>
              <Text style={[styles.configValue, { color: theme.textPrimary }]}>
                {profile?.fitness_level || "Beginner"}
              </Text>
            </View>
            <View style={styles.configDivider} />
            <View style={styles.configItem}>
              <Text style={[styles.configLabel, { color: theme.textMuted }]}>LOCATION</Text>
              <Text style={[styles.configValue, { color: theme.textPrimary }]}>
                {profile?.workout_preference?.location || "Home"}
              </Text>
            </View>
          </View>
        </Card>

        {/* Focus Selector */}
        <View style={styles.splitRow}>
          {["Full Body", "Upper Body", "Lower Body", "Core & HIIT"].map((split) => (
            <TouchableOpacity
              key={split}
              onPress={() => setSelectedSplit(split)}
              style={[
                styles.splitChip,
                {
                  backgroundColor: selectedSplit === split ? theme.primary : theme.card,
                  borderColor: selectedSplit === split ? theme.primary : theme.cardBorder
                }
              ]}
            >
              <Text
                style={[
                  styles.splitText,
                  { color: selectedSplit === split ? "#FFFFFF" : theme.textPrimary }
                ]}
              >
                {split}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              FitAI is synthesizing your optimal routine...
            </Text>
          </View>
        ) : workout ? (
          <View>
            {/* Workout Header Info */}
            <Card variant="card" style={styles.workoutHeaderCard}>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[styles.badgeText, { color: theme.primary }]}>
                    {workout.difficulty}
                  </Text>
                </View>
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={16} color={theme.textMuted} />
                  <Text style={[styles.timeText, { color: theme.textMuted }]}>
                    ~{workout.estimated_duration_minutes} Mins
                  </Text>
                </View>
              </View>

              <Text style={[styles.workoutTitle, { color: theme.textPrimary }]}>
                {workout.workout_name}
              </Text>

              <Text style={[styles.equipmentText, { color: theme.textMuted }]}>
                Equipment: {workout.equipment?.join(", ") || "Bodyweight"}
              </Text>

              {workout.coach_tip && (
                <View style={[styles.tipBox, { backgroundColor: theme.cardBorder + "25" }]}>
                  <Ionicons name="information-circle-outline" size={18} color={theme.primary} />
                  <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                    {workout.coach_tip}
                  </Text>
                </View>
              )}

              <Button
                title="Start Workout"
                onPress={() => onStartWorkout(workout)}
                icon={<Ionicons name="play-circle" size={20} color="#FFFFFF" />}
                style={{ marginTop: 14 }}
              />
            </Card>

            {/* Exercise List */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 18, marginBottom: 10 }]}>
              Exercises ({workout.exercises?.length || 0})
            </Text>

            {workout.exercises?.map((ex: any, idx: number) => (
              <Card key={idx} variant="card" style={styles.exerciseCard}>
                <View style={styles.exLeft}>
                  <View style={[styles.exNumber, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.exNumText, { color: theme.primary }]}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.exName, { color: theme.textPrimary }]}>
                      {ex.exercise_name}
                    </Text>
                    <Text style={[styles.exDetails, { color: theme.textSecondary }]}>
                      {ex.sets} sets × {ex.reps} reps
                      {ex.weight > 0 ? ` • ${ex.weight} kg` : ""}
                      {` • Rest: ${ex.rest_time_seconds || 60}s`}
                    </Text>
                    {ex.instructions && (
                      <Text style={[styles.exInstructions, { color: theme.textMuted }]}>
                        {ex.instructions}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            ))}

            <Button
              title="Regenerate Routine with FitAI"
              variant="outline"
              onPress={generateWorkout}
              icon={<Ionicons name="refresh" size={18} color={theme.primary} />}
              style={{ marginTop: 14, marginBottom: 30 }}
            />
          </View>
        ) : null}
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
  configCard: {
    padding: 12,
    marginBottom: 10
  },
  configRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  configItem: {
    flex: 1,
    alignItems: "center"
  },
  configDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#D9E2EC"
  },
  configLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  configValue: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2
  },
  splitRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 10
  },
  splitChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1
  },
  splitText: {
    fontSize: 12,
    fontWeight: "700"
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600"
  },
  workoutHeaderCard: {
    padding: 18,
    marginTop: 6
  },
  badgeRow: {
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
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  timeText: {
    fontSize: 13,
    fontWeight: "600"
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4
  },
  equipmentText: {
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
    marginBottom: 6
  },
  tipText: {
    fontSize: 12,
    fontWeight: "500",
    flex: 1
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800"
  },
  exerciseCard: {
    padding: 14,
    marginVertical: 5
  },
  exLeft: {
    flexDirection: "row",
    gap: 12
  },
  exNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  exNumText: {
    fontSize: 14,
    fontWeight: "800"
  },
  exName: {
    fontSize: 16,
    fontWeight: "700"
  },
  exDetails: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2
  },
  exInstructions: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16
  }
});
