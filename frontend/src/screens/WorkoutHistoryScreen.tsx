import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { api } from "../api/client";
import { Workout } from "../types";

interface WorkoutHistoryScreenProps {
  onNewWorkout: () => void;
}

export const WorkoutHistoryScreen: React.FC<WorkoutHistoryScreenProps> = ({ onNewWorkout }) => {
  const { theme } = useTheme();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/workouts");
      if (res.success && Array.isArray(res.data)) {
        setWorkouts(res.data);
      }
    } catch (e) {
      console.warn("Failed to fetch workouts:", e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const formatDuration = (sec: number) => {
    const mins = Math.round(sec / 60);
    return `${mins} mins`;
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setSelectedWorkout(item)}
    >
      <Card variant="card" style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.iconBg, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="barbell" size={20} color={theme.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.workoutName, { color: theme.textPrimary }]}>
              {item.workout_name}
            </Text>
            <Text style={[styles.dateText, { color: theme.textMuted }]}>
              {item.date} • {formatDuration(item.duration)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </View>

        <View style={[styles.metaRow, { borderTopColor: theme.cardBorder }]}>
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            {item.exercises?.length || 0} Exercises Logged
          </Text>
          <View style={styles.completedPill}>
            <Ionicons name="checkmark-circle" size={14} color={theme.success} />
            <Text style={[styles.completedText, { color: theme.success }]}>Completed</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header title="Workout History" subtitle="Your Completed Training Sessions" />

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkoutItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.card }]}>
              <Ionicons name="fitness-outline" size={48} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Workouts Yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              Start your first workout with FitAI and your completed sessions will appear here.
            </Text>
            <Button
              title="Generate Workout"
              onPress={onNewWorkout}
              style={{ marginTop: 16 }}
            />
          </View>
        }
      />

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <Modal visible={!!selectedWorkout} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  {selectedWorkout.workout_name}
                </Text>
                <TouchableOpacity onPress={() => setSelectedWorkout(null)}>
                  <Ionicons name="close" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalSub, { color: theme.textMuted }]}>
                {selectedWorkout.date} • Duration: {formatDuration(selectedWorkout.duration)}
              </Text>

              <Text style={[styles.exTitle, { color: theme.textPrimary }]}>Exercises Performed:</Text>
              <FlatList
                data={selectedWorkout.exercises || []}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item, index }) => (
                  <View style={[styles.exItem, { borderBottomColor: theme.cardBorder }]}>
                    <Text style={[styles.exItemIndex, { color: theme.primary }]}>#{index + 1}</Text>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[styles.exItemName, { color: theme.textPrimary }]}>
                        {item.exercise_name}
                      </Text>
                      <Text style={[styles.exItemStats, { color: theme.textMuted }]}>
                        {item.sets} sets × {item.reps} reps {item.weight > 0 ? `• ${item.weight} kg` : ""}
                      </Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={18} color={theme.success} />
                  </View>
                )}
                style={{ maxHeight: 280, marginVertical: 10 }}
              />

              <Button
                title="Close"
                variant="secondary"
                onPress={() => setSelectedWorkout(null)}
                style={{ width: "100%", marginTop: 8 }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40
  },
  card: {
    padding: 16,
    marginVertical: 6
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center"
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  workoutName: {
    fontSize: 16,
    fontWeight: "700"
  },
  dateText: {
    fontSize: 13,
    marginTop: 2
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1
  },
  metaText: {
    fontSize: 12,
    fontWeight: "600"
  },
  completedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  completedText: {
    fontSize: 12,
    fontWeight: "700"
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800"
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end"
  },
  modalBox: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 24,
    maxHeight: "80%"
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    flex: 1
  },
  modalSub: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 14
  },
  exTitle: {
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  exItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  exItemIndex: {
    fontSize: 13,
    fontWeight: "800"
  },
  exItemName: {
    fontSize: 14,
    fontWeight: "700"
  },
  exItemStats: {
    fontSize: 12,
    marginTop: 2
  }
});
