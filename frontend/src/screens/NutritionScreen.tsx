import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { WaterTracker } from "../components/WaterTracker";
import { api } from "../api/client";
import { NutritionItem, CaloriePlan } from "../types";

export const NutritionScreen: React.FC = () => {
  const { theme } = useTheme();
  const { profile, caloriePlan: savedPlan } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [meals, setMeals] = useState<NutritionItem[]>([]);
  const [plan, setPlan] = useState<CaloriePlan | null>(savedPlan);
  const [showCalculator, setShowCalculator] = useState(false);

  // Calorie Calculator state
  const [calcAge, setCalcAge] = useState(String(profile?.age || 26));
  const [calcGender, setCalcGender] = useState(profile?.gender || "Male");
  const [calcHeight, setCalcHeight] = useState(String(profile?.height || 175));
  const [calcWeight, setCalcWeight] = useState(String(profile?.weight || 70));
  const [calcActivity, setCalcActivity] = useState(profile?.activity_level || "Moderate");
  const [calcGoal, setCalcGoal] = useState(profile?.fitness_goal || "General Fitness");

  const [calcResults, setCalcResults] = useState<{
    bmr: number;
    tdee: number;
    targetCalories: number;
    protein: number;
    carbs: number;
    fats: number;
  } | null>(null);

  const fetchNutrition = async () => {
    try {
      const res = await api.get("/nutrition");
      if (res.success) {
        if (res.meals) setMeals(res.meals);
        if (res.targets) setPlan(res.targets);
      }
    } catch (e) {
      console.warn("Failed to fetch nutrition:", e);
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNutrition();
    setRefreshing(false);
  };

  const toggleMeal = async (mealId: string) => {
    // Optimistic toggle
    setMeals((prev) =>
      prev.map((m) => (m.id === mealId ? { ...m, completed: !m.completed } : m))
    );
    try {
      await api.put(`/nutrition/${mealId}/toggle`);
    } catch (e) {
      console.warn("Error toggling meal:", e);
    }
  };

  // Run Mifflin-St Jeor equation inside calculator
  const calculateEstimates = () => {
    const age = Number(calcAge) || 26;
    const height = Number(calcHeight) || 175;
    const weight = Number(calcWeight) || 70;
    const isFemale = calcGender.toLowerCase().includes("fem");
    const s = isFemale ? -161 : 5;

    let bmr = Math.round(10 * weight + 6.25 * height - 5 * age + s);
    if (bmr < 1000) bmr = 1200;

    let mult = 1.4;
    const act = calcActivity.toLowerCase();
    if (act.includes("sedentary") || act.includes("low")) mult = 1.2;
    if (act.includes("active") || act.includes("high")) mult = 1.65;
    if (act.includes("athlete")) mult = 1.85;

    const tdee = Math.round(bmr * mult);

    let target = tdee;
    const g = calcGoal.toLowerCase();
    if (g.includes("loss")) target = Math.max(1200, Math.round(tdee * 0.8));
    if (g.includes("gain") || g.includes("muscle") || g.includes("strength")) target = Math.round(tdee * 1.15);

    const protein = Math.round(weight * 2.0);
    const fats = Math.round((target * 0.25) / 9);
    const carbs = Math.round((target - (protein * 4 + fats * 9)) / 4);

    setCalcResults({
      bmr,
      tdee,
      targetCalories: target,
      protein,
      carbs,
      fats
    });
  };

  const targetCals = plan?.targetCalories || 2200;
  const targetProtein = plan?.proteinGrams || 140;
  const targetCarbs = plan?.carbsGrams || 240;
  const targetFats = plan?.fatsGrams || 65;

  const consumed = meals
    .filter((m) => m.completed)
    .reduce(
      (acc, m) => ({
        cals: acc.cals + m.calories,
        p: acc.p + m.protein,
        c: acc.c + m.carbohydrates,
        f: acc.f + m.fats
      }),
      { cals: 0, p: 0, c: 0, f: 0 }
    );

  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header title="Nutrition & Fuel" subtitle="Personalized Macro Targets" />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Wellness Disclaimer (Requirement 11) */}
        <View style={[styles.disclaimerBox, { backgroundColor: theme.primaryLight, borderColor: theme.primary + "40" }]}>
          <Ionicons name="information-circle-outline" size={16} color={theme.primary} />
          <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
            Nutrition recommendations are general wellness guidance and are not medical advice.
          </Text>
        </View>

        {/* Daily Caloric & Macro Targets Card */}
        <Card variant="card" style={styles.macroCard}>
          <View style={styles.macroHeader}>
            <View>
              <Text style={[styles.macroTitle, { color: theme.textPrimary }]}>Daily Calorie Target</Text>
              <Text style={[styles.macroSub, { color: theme.textMuted }]}>
                Goal: {profile?.fitness_goal || "General Fitness"}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.calcButton, { backgroundColor: theme.primaryLight }]}
              onPress={() => {
                calculateEstimates();
                setShowCalculator(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="calculator-outline" size={16} color={theme.primary} />
              <Text style={[styles.calcButtonText, { color: theme.primary }]}>Calorie Calc</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calRow}>
            <Text style={[styles.calsNumber, { color: theme.textPrimary }]}>
              {consumed.cals}
            </Text>
            <Text style={[styles.calsTarget, { color: theme.textMuted }]}>
              {" "}/ {targetCals} kcal
            </Text>
          </View>

          {/* Calorie Progress Bar */}
          <View style={[styles.calsTrack, { backgroundColor: theme.ringBg }]}>
            <View
              style={[
                styles.calsFill,
                {
                  backgroundColor: theme.primary,
                  width: `${Math.min(100, Math.round((consumed.cals / targetCals) * 100))}%`
                }
              ]}
            />
          </View>

          {/* Macro Breakdown */}
          <View style={styles.macrosGrid}>
            <View style={[styles.macroCol, { backgroundColor: theme.background }]}>
              <Text style={[styles.macroLabel, { color: theme.textMuted }]}>PROTEIN</Text>
              <Text style={[styles.macroValue, { color: theme.primary }]}>
                {consumed.p}g <Text style={{ fontSize: 11, color: theme.textMuted }}>/ {targetProtein}g</Text>
              </Text>
            </View>

            <View style={[styles.macroCol, { backgroundColor: theme.background }]}>
              <Text style={[styles.macroLabel, { color: theme.textMuted }]}>CARBS</Text>
              <Text style={[styles.macroValue, { color: theme.calorieOrange }]}>
                {consumed.c}g <Text style={{ fontSize: 11, color: theme.textMuted }}>/ {targetCarbs}g</Text>
              </Text>
            </View>

            <View style={[styles.macroCol, { backgroundColor: theme.background }]}>
              <Text style={[styles.macroLabel, { color: theme.textMuted }]}>FATS</Text>
              <Text style={[styles.macroValue, { color: theme.waterBlue }]}>
                {consumed.f}g <Text style={{ fontSize: 11, color: theme.textMuted }}>/ {targetFats}g</Text>
              </Text>
            </View>
          </View>
        </Card>

        {/* Water Hydration Section */}
        <WaterTracker targetGlasses={plan?.waterGoalGlasses || 10} />

        {/* Meal Sections: Breakfast, Lunch, Dinner, Snacks */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 14, marginBottom: 8 }]}>
          Today's Meals ({profile?.food_preference || "Non-Vegetarian"})
        </Text>

        {mealTypes.map((type) => {
          const typeMeals = meals.filter((m) => m.meal_type === type);
          return (
            <View key={type} style={styles.mealSection}>
              <Text style={[styles.mealTypeTitle, { color: theme.textSecondary }]}>{type}</Text>
              {typeMeals.map((meal) => (
                <Card key={meal.id} variant="card" style={styles.mealCard}>
                  <TouchableOpacity
                    style={styles.mealRow}
                    onPress={() => toggleMeal(meal.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: meal.completed ? theme.success : "transparent",
                          borderColor: meal.completed ? theme.success : theme.cardBorder
                        }
                      ]}
                    >
                      {meal.completed && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text
                        style={[
                          styles.mealName,
                          {
                            color: theme.textPrimary,
                            textDecorationLine: meal.completed ? "line-through" : "none"
                          }
                        ]}
                      >
                        {meal.meal_name}
                      </Text>
                      <Text style={[styles.mealMacros, { color: theme.textMuted }]}>
                        {meal.calories} kcal • P: {meal.protein}g • C: {meal.carbohydrates}g • F: {meal.fats}g
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* CALORIE CALCULATOR MODAL (Requirement 12) */}
      <Modal visible={showCalculator} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Scientific Calorie Calculator</Text>
              <TouchableOpacity onPress={() => setShowCalculator(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <Text style={[styles.calcNotice, { color: theme.textMuted }]}>
                Estimates derived from the validated Mifflin-St Jeor equation. Clearly labeled as estimates for guidance.
              </Text>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Age</Text>
                  <View style={[styles.calcInputBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <TextInput
                      style={[styles.calcInput, { color: theme.textPrimary }]}
                      keyboardType="number-pad"
                      value={calcAge}
                      onChangeText={setCalcAge}
                    />
                  </View>
                </View>

                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Gender</Text>
                  <View style={styles.miniChipRow}>
                    {["Male", "Female"].map((g) => (
                      <TouchableOpacity
                        key={g}
                        onPress={() => setCalcGender(g)}
                        style={[
                          styles.miniChip,
                          {
                            backgroundColor: calcGender === g ? theme.primary : theme.card,
                            borderColor: calcGender === g ? theme.primary : theme.cardBorder
                          }
                        ]}
                      >
                        <Text style={{ color: calcGender === g ? "#FFF" : theme.textPrimary, fontSize: 12, fontWeight: "700" }}>
                          {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Height (cm)</Text>
                  <View style={[styles.calcInputBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <TextInput
                      style={[styles.calcInput, { color: theme.textPrimary }]}
                      keyboardType="numeric"
                      value={calcHeight}
                      onChangeText={setCalcHeight}
                    />
                  </View>
                </View>

                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Weight (kg)</Text>
                  <View style={[styles.calcInputBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <TextInput
                      style={[styles.calcInput, { color: theme.textPrimary }]}
                      keyboardType="numeric"
                      value={calcWeight}
                      onChangeText={setCalcWeight}
                    />
                  </View>
                </View>
              </View>

              <Button
                title="Calculate Energy Metrics"
                onPress={calculateEstimates}
                icon={<Ionicons name="calculator" size={18} color="#FFFFFF" />}
                style={{ marginVertical: 12 }}
              />

              {calcResults && (
                <View style={[styles.resultsBox, { backgroundColor: theme.card, borderColor: theme.primary }]}>
                  <Text style={[styles.resHeading, { color: theme.primary }]}>
                    ESTIMATED METRIC BREAKDOWN
                  </Text>

                  <View style={styles.resRow}>
                    <Text style={[styles.resLabel, { color: theme.textSecondary }]}>Basal Metabolic Rate (BMR):</Text>
                    <Text style={[styles.resVal, { color: theme.textPrimary }]}>
                      {calcResults.bmr} kcal/day (Est.)
                    </Text>
                  </View>

                  <View style={styles.resRow}>
                    <Text style={[styles.resLabel, { color: theme.textSecondary }]}>Daily Calorie Needs (TDEE):</Text>
                    <Text style={[styles.resVal, { color: theme.textPrimary }]}>
                      {calcResults.tdee} kcal/day (Est.)
                    </Text>
                  </View>

                  <View style={[styles.resRow, { borderTopWidth: 1, borderTopColor: theme.cardBorder, paddingTop: 8 }]}>
                    <Text style={[styles.resLabel, { color: theme.primary, fontWeight: "800" }]}>Goal-Based Target:</Text>
                    <Text style={[styles.resVal, { color: theme.primary, fontSize: 16, fontWeight: "800" }]}>
                      {calcResults.targetCalories} kcal/day (Est.)
                    </Text>
                  </View>

                  <Text style={[styles.macroNotice, { color: theme.textMuted }]}>
                    Macros: Protein ~{calcResults.protein}g • Carbs ~{calcResults.carbs}g • Fats ~{calcResults.fats}g
                  </Text>
                </View>
              )}
            </ScrollView>

            <Button
              title="Close"
              variant="secondary"
              onPress={() => setShowCalculator(false)}
              style={{ width: "100%", marginTop: 10 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40
  },
  disclaimerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10
  },
  disclaimerText: {
    fontSize: 11,
    fontWeight: "500",
    flex: 1
  },
  macroCard: {
    padding: 18,
    marginBottom: 10
  },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  macroTitle: {
    fontSize: 16,
    fontWeight: "800"
  },
  macroSub: {
    fontSize: 12,
    marginTop: 2
  },
  calcButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12
  },
  calcButtonText: {
    fontSize: 12,
    fontWeight: "700"
  },
  calRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginVertical: 10
  },
  calsNumber: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.5
  },
  calsTarget: {
    fontSize: 16,
    fontWeight: "600"
  },
  calsTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16
  },
  calsFill: {
    height: "100%",
    borderRadius: 4
  },
  macrosGrid: {
    flexDirection: "row",
    gap: 8
  },
  macroCol: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: "center"
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  macroValue: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800"
  },
  mealSection: {
    marginBottom: 12
  },
  mealTypeTitle: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 6
  },
  mealCard: {
    padding: 14,
    marginVertical: 4
  },
  mealRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center"
  },
  mealName: {
    fontSize: 15,
    fontWeight: "700"
  },
  mealMacros: {
    fontSize: 12,
    marginTop: 2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end"
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 24
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800"
  },
  calcNotice: {
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 16
  },
  row: {
    flexDirection: "row",
    marginBottom: 8
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase"
  },
  calcInputBox: {
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  calcInput: {
    fontSize: 15,
    fontWeight: "700"
  },
  miniChipRow: {
    flexDirection: "row",
    gap: 6
  },
  miniChip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  resultsBox: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginTop: 8
  },
  resHeading: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 10
  },
  resRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4
  },
  resLabel: {
    fontSize: 13,
    fontWeight: "600"
  },
  resVal: {
    fontSize: 13,
    fontWeight: "700"
  },
  macroNotice: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic"
  }
});
