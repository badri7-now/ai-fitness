import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useSync } from "../context/SyncContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { RestTimer } from "../components/RestTimer";
import { api } from "../api/client";

interface ActiveWorkoutScreenProps {
  workoutData: any;
  onFinishWorkout: () => void;
  onCancel: () => void;
}

export const ActiveWorkoutScreen: React.FC<ActiveWorkoutScreenProps> = ({
  workoutData,
  onFinishWorkout,
  onCancel
}) => {
  const { theme } = useTheme();
  const { queueOfflineWorkout } = useSync();

  const exercises = workoutData?.exercises || [
    { exercise_name: "Bodyweight Squats", sets: 3, reps: 12, weight: 0, rest_time_seconds: 60 },
    { exercise_name: "Push-ups", sets: 3, reps: 10, weight: 0, rest_time_seconds: 60 },
    { exercise_name: "Plank Hold", sets: 3, reps: 1, weight: 0, rest_time_seconds: 45 }
  ];

  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [repsInput, setRepsInput] = useState("");
  const [weightInput, setWeightInput] = useState("");

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);

  // Completed logs
  const [completedSetsCount, setCompletedSetsCount] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentExercise = exercises[currentExIndex];

  useEffect(() => {
    setRepsInput(String(currentExercise?.reps || 10));
    setWeightInput(String(currentExercise?.weight || 0));
  }, [currentExIndex]);

  // Elapsed workout timer
  useEffect(() => {
    let timer: any = null;
    if (!isPaused && !showCompleteModal) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPaused, showCompleteModal]);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleCompleteSet = () => {
    setCompletedSetsCount((prev) => prev + 1);
    setShowRestTimer(true);

    if (currentSet < (currentExercise.sets || 3)) {
      setCurrentSet((prev) => prev + 1);
    } else {
      // Finished all sets for this exercise
      if (currentExIndex < exercises.length - 1) {
        // Auto-advance to next exercise after set
      }
    }
  };

  const handleNextExercise = () => {
    setShowRestTimer(false);
    if (currentExIndex < exercises.length - 1) {
      setCurrentExIndex((prev) => prev + 1);
      setCurrentSet(1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setIsPaused(true);
    setShowCompleteModal(true);
  };

  const saveWorkoutRecord = async () => {
    setSaving(true);
    const estimatedCalories = Math.max(80, Math.round((elapsedSeconds / 60) * 8.2));
    const payload = {
      id: "workout-" + Date.now(),
      workout_name: workoutData?.workout_name || "Custom Fitness Session",
      date: new Date().toISOString().split("T")[0],
      duration: elapsedSeconds,
      completed: true,
      exercises: exercises.map((e: any, idx: number) => ({
        exercise_name: e.exercise_name,
        sets: idx <= currentExIndex ? e.sets : 0,
        reps: e.reps,
        weight: Number(weightInput) || e.weight || 0,
        completed: idx <= currentExIndex
      }))
    };

    try {
      const res = await api.post("/workouts", payload);
      if (!res.success) {
        // Queue offline
        await queueOfflineWorkout(payload as any);
      }
    } catch {
      await queueOfflineWorkout(payload as any);
    } finally {
      setSaving(false);
      setShowCompleteModal(false);
      onFinishWorkout();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Top Session Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.timerDisplay}>
          <Ionicons name="stopwatch-outline" size={18} color={theme.primary} />
          <Text style={[styles.timerText, { color: theme.textPrimary }]}>
            {formatElapsed(elapsedSeconds)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsPaused(!isPaused)}
          style={[styles.pauseBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons
            name={isPaused ? "play" : "pause"}
            size={18}
            color={theme.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Exercise Progress Header */}
        <View style={styles.exerciseCounter}>
          <Text style={[styles.counterText, { color: theme.primary }]}>
            EXERCISE {currentExIndex + 1} OF {exercises.length}
          </Text>
          <Text style={[styles.setsIndicator, { color: theme.textMuted }]}>
            Set {currentSet} of {currentExercise.sets || 3}
          </Text>
        </View>

        {/* Main Exercise Card */}
        <Card variant="card" style={styles.currentCard}>
          <Text style={[styles.exerciseTitle, { color: theme.textPrimary }]}>
            {currentExercise.exercise_name}
          </Text>

          {currentExercise.instructions && (
            <Text style={[styles.instructions, { color: theme.textMuted }]}>
              {currentExercise.instructions}
            </Text>
          )}

          {/* Set Logger Inputs */}
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>REPS</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                <TextInput
                  style={[styles.numberInput, { color: theme.textPrimary }]}
                  keyboardType="number-pad"
                  value={repsInput}
                  onChangeText={setRepsInput}
                />
              </View>
            </View>

            <View style={styles.inputCol}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>WEIGHT (KG)</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                <TextInput
                  style={[styles.numberInput, { color: theme.textPrimary }]}
                  keyboardType="numeric"
                  value={weightInput}
                  onChangeText={setWeightInput}
                />
              </View>
            </View>
          </View>

          {/* Quick Adjustment buttons */}
          <View style={styles.adjustRow}>
            <TouchableOpacity
              style={[styles.adjBtn, { backgroundColor: theme.ringBg }]}
              onPress={() => setRepsInput(String(Math.max(1, (Number(repsInput) || 0) - 1)))}
            >
              <Text style={[styles.adjText, { color: theme.textPrimary }]}>-1 Rep</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adjBtn, { backgroundColor: theme.ringBg }]}
              onPress={() => setRepsInput(String((Number(repsInput) || 0) + 1))}
            >
              <Text style={[styles.adjText, { color: theme.textPrimary }]}>+1 Rep</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adjBtn, { backgroundColor: theme.ringBg }]}
              onPress={() => setWeightInput(String(Math.max(0, (Number(weightInput) || 0) + 2.5)))}
            >
              <Text style={[styles.adjText, { color: theme.textPrimary }]}>+2.5 kg</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Rest Timer */}
        {showRestTimer && (
          <RestTimer
            initialSeconds={currentExercise.rest_time_seconds || 60}
            onFinish={() => setShowRestTimer(false)}
            onSkip={() => setShowRestTimer(false)}
          />
        )}

        {/* Actions */}
        <Button
          title="Complete Set"
          onPress={handleCompleteSet}
          icon={<Ionicons name="checkmark-done" size={20} color="#FFFFFF" />}
          style={{ marginTop: 10 }}
        />

        <View style={styles.actionRow}>
          <Button
            title="Next Exercise"
            variant="secondary"
            onPress={handleNextExercise}
            icon={<Ionicons name="arrow-forward" size={18} color={theme.primary} />}
            style={{ flex: 1, marginRight: 6 }}
          />
          <Button
            title="Finish Workout"
            variant="danger"
            onPress={handleFinish}
            style={{ flex: 1, marginLeft: 6 }}
          />
        </View>
      </ScrollView>

      {/* WORKOUT COMPLETE MODAL (Requirement 8) */}
      <Modal visible={showCompleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
            <View style={[styles.trophyCircle, { backgroundColor: theme.success + "20" }]}>
              <Ionicons name="trophy" size={48} color={theme.success} />
            </View>

            <Text style={[styles.congratsTitle, { color: theme.textPrimary }]}>Workout Complete!</Text>
            <Text style={[styles.congratsSub, { color: theme.textMuted }]}>
              Outstanding effort. Your progress has been updated.
            </Text>

            <View style={styles.statsSummaryGrid}>
              <View style={[styles.statBox, { backgroundColor: theme.card }]}>
                <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                  {formatElapsed(elapsedSeconds)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Duration</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: theme.card }]}>
                <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                  {currentExIndex + 1}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Exercises</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: theme.card }]}>
                <Text style={[styles.statValue, { color: theme.calorieOrange }]}>
                  {Math.max(80, Math.round((elapsedSeconds / 60) * 8.2))} kcal
                </Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Est. Calories</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: theme.card }]}>
                <Text style={[styles.statValue, { color: theme.primary }]}>
                  {completedSetsCount}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Sets Done</Text>
              </View>
            </View>

            <Button
              title="Save & Return to Dashboard"
              onPress={saveWorkoutRecord}
              loading={saving}
              style={{ width: "100%", marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1
  },
  closeBtn: {
    padding: 6
  },
  timerDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  timerText: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  pauseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40
  },
  exerciseCounter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  counterText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8
  },
  setsIndicator: {
    fontSize: 13,
    fontWeight: "700"
  },
  currentCard: {
    padding: 20,
    marginBottom: 10
  },
  exerciseTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3
  },
  instructions: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 18
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 10
  },
  inputCol: {
    flex: 1
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 6
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center"
  },
  numberInput: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    width: "100%"
  },
  adjustRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  },
  adjBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  adjText: {
    fontSize: 12,
    fontWeight: "700"
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  modalContent: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: "center"
  },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  congratsTitle: {
    fontSize: 24,
    fontWeight: "900"
  },
  congratsSub: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 18
  },
  statsSummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    width: "100%",
    marginBottom: 10
  },
  statBox: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 14,
    padding: 12,
    alignItems: "center"
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800"
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "600"
  }
});
