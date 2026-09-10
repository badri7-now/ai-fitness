import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";

interface ProfileSetupScreenProps {
  onCompleted: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ onCompleted }) => {
  const { theme } = useTheme();
  const { profile, updateProfile } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState(profile?.name || "");
  const [age, setAge] = useState(profile?.age ? String(profile.age) : "26");
  const [gender, setGender] = useState(profile?.gender || "Male");
  const [height, setHeight] = useState(profile?.height ? String(profile.height) : "175");
  const [weight, setWeight] = useState(profile?.weight ? String(profile.weight) : "70");

  const [fitnessLevel, setFitnessLevel] = useState<"Beginner" | "Intermediate" | "Advanced">(
    profile?.fitness_level || "Beginner"
  );
  const [activityLevel, setActivityLevel] = useState(profile?.activity_level || "Moderate");
  const [fitnessGoal, setFitnessGoal] = useState<
    "Weight Loss" | "Muscle Gain" | "Strength" | "Improve Endurance" | "General Fitness" | "Maintain Weight"
  >(profile?.fitness_goal || "General Fitness");

  const [location, setLocation] = useState<"Home" | "Gym">(
    profile?.workout_preference?.location || "Home"
  );
  const [availableTime, setAvailableTime] = useState<number>(
    profile?.workout_preference?.availableTime || 30
  );
  const [daysPerWeek, setDaysPerWeek] = useState<number>(
    profile?.workout_preference?.daysPerWeek || 4
  );
  const [preferredType, setPreferredType] = useState<string>(
    profile?.workout_preference?.preferredType || "Full Body"
  );
  const [equipment, setEquipment] = useState<string[]>(
    profile?.workout_preference?.equipment || ["Dumbbells", "Mat"]
  );

  const [foodPreference, setFoodPreference] = useState<"Vegetarian" | "Non-Vegetarian" | "Vegan" | "Other">(
    profile?.food_preference || "Non-Vegetarian"
  );
  const [allergies, setAllergies] = useState<string[]>(profile?.allergies || []);

  const toggleAllergy = (item: string) => {
    if (allergies.includes(item)) {
      setAllergies(allergies.filter((a) => a !== item));
    } else {
      setAllergies([...allergies, item]);
    }
  };

  const toggleEquipment = (item: string) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter((e) => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    await updateProfile({
      name,
      age: Number(age) || 26,
      gender,
      height: Number(height) || 175,
      weight: Number(weight) || 70,
      fitness_level: fitnessLevel,
      activity_level: activityLevel,
      fitness_goal: fitnessGoal,
      workout_preference: {
        location,
        availableTime,
        daysPerWeek,
        preferredType,
        equipment
      },
      food_preference: foodPreference,
      allergies
    });
    setLoading(false);
    onCompleted();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Step Indicator */}
        <View style={styles.stepHeader}>
          <Text style={[styles.stepTitle, { color: theme.primary }]}>STEP {step} OF 4</Text>
          <View style={styles.progressBar}>
            {[1, 2, 3, 4].map((s) => (
              <View
                key={s}
                style={[
                  styles.progressSegment,
                  {
                    backgroundColor: s <= step ? theme.primary : theme.ringBg
                  }
                ]}
              />
            ))}
          </View>
        </View>

        {/* STEP 1: Personal Details */}
        {step === 1 && (
          <View>
            <Text style={[styles.heading, { color: theme.textPrimary }]}>Personal Details</Text>
            <Text style={[styles.subheading, { color: theme.textMuted }]}>
              Used by FitAI to calibrate baseline energy and physiology
            </Text>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
            <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                value={name}
                onChangeText={setName}
                placeholder="Alex Parker"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Age</Text>
                <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary }]}
                    keyboardType="number-pad"
                    value={age}
                    onChangeText={setAge}
                  />
                </View>
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Gender</Text>
                <View style={styles.chipRow}>
                  {["Male", "Female", "Other"].map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setGender(g)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: gender === g ? theme.primary : theme.card,
                          borderColor: gender === g ? theme.primary : theme.cardBorder
                        }
                      ]}
                    >
                      <Text style={{ color: gender === g ? "#FFF" : theme.textPrimary, fontWeight: "700", fontSize: 12 }}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Height (cm)</Text>
                <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary }]}
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                  />
                </View>
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Weight (kg)</Text>
                <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary }]}
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>
              </View>
            </View>

            <Button title="Continue to Fitness Info" onPress={() => setStep(2)} style={{ marginTop: 28 }} />
          </View>
        )}

        {/* STEP 2: Fitness Information */}
        {step === 2 && (
          <View>
            <Text style={[styles.heading, { color: theme.textPrimary }]}>Fitness Information</Text>
            <Text style={[styles.subheading, { color: theme.textMuted }]}>
              Calibrate workout intensity and load progressions
            </Text>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Current Fitness Level</Text>
            <View style={styles.choiceGrid}>
              {(["Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  onPress={() => setFitnessLevel(lvl)}
                  style={[
                    styles.choiceCard,
                    {
                      backgroundColor: fitnessLevel === lvl ? theme.primaryLight : theme.card,
                      borderColor: fitnessLevel === lvl ? theme.primary : theme.cardBorder
                    }
                  ]}
                >
                  <Ionicons
                    name={lvl === "Beginner" ? "walk" : lvl === "Intermediate" ? "bicycle" : "barbell"}
                    size={22}
                    color={fitnessLevel === lvl ? theme.primary : theme.textMuted}
                  />
                  <Text style={[styles.choiceText, { color: fitnessLevel === lvl ? theme.primary : theme.textPrimary }]}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>Primary Fitness Goal</Text>
            <View style={styles.choiceList}>
              {([
                "Weight Loss",
                "Muscle Gain",
                "Strength",
                "Improve Endurance",
                "General Fitness",
                "Maintain Weight"
              ] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setFitnessGoal(g)}
                  style={[
                    styles.listCard,
                    {
                      backgroundColor: fitnessGoal === g ? theme.primaryLight : theme.card,
                      borderColor: fitnessGoal === g ? theme.primary : theme.cardBorder
                    }
                  ]}
                >
                  <Text style={[styles.listCardText, { color: fitnessGoal === g ? theme.primary : theme.textPrimary }]}>
                    {g}
                  </Text>
                  {fitnessGoal === g && <Ionicons name="checkmark-circle" size={20} color={theme.primary} />}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.navRow}>
              <Button title="Back" variant="outline" onPress={() => setStep(1)} style={{ flex: 1, marginRight: 6 }} />
              <Button title="Next: Workouts" onPress={() => setStep(3)} style={{ flex: 1, marginLeft: 6 }} />
            </View>
          </View>
        )}

        {/* STEP 3: Workout Preferences */}
        {step === 3 && (
          <View>
            <Text style={[styles.heading, { color: theme.textPrimary }]}>Workout Preferences</Text>
            <Text style={[styles.subheading, { color: theme.textMuted }]}>
              Where and how do you like to train?
            </Text>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Workout Location</Text>
            <View style={styles.row}>
              {(["Home", "Gym"] as const).map((loc) => (
                <TouchableOpacity
                  key={loc}
                  onPress={() => setLocation(loc)}
                  style={[
                    styles.locationCard,
                    {
                      backgroundColor: location === loc ? theme.primaryLight : theme.card,
                      borderColor: location === loc ? theme.primary : theme.cardBorder
                    }
                  ]}
                >
                  <Ionicons
                    name={loc === "Home" ? "home-outline" : "fitness-outline"}
                    size={24}
                    color={location === loc ? theme.primary : theme.textPrimary}
                  />
                  <Text style={[styles.locationText, { color: location === loc ? theme.primary : theme.textPrimary }]}>
                    {loc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>
              Available Workout Time (Minutes)
            </Text>
            <View style={styles.chipRow}>
              {[15, 20, 30, 45, 60].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setAvailableTime(t)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: availableTime === t ? theme.primary : theme.card,
                      borderColor: availableTime === t ? theme.primary : theme.cardBorder
                    }
                  ]}
                >
                  <Text style={{ color: availableTime === t ? "#FFF" : theme.textPrimary, fontWeight: "700" }}>
                    {t} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>Workout Days Per Week</Text>
            <View style={styles.chipRow}>
              {[2, 3, 4, 5, 6].map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDaysPerWeek(d)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: daysPerWeek === d ? theme.primary : theme.card,
                      borderColor: daysPerWeek === d ? theme.primary : theme.cardBorder
                    }
                  ]}
                >
                  <Text style={{ color: daysPerWeek === d ? "#FFF" : theme.textPrimary, fontWeight: "700" }}>
                    {d} days
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>Available Equipment</Text>
            <View style={styles.wrapRow}>
              {["Bodyweight", "Dumbbells", "Resistance Bands", "Barbell", "Kettlebell", "Pull-up Bar", "Full Gym"].map(
                (eq) => {
                  const selected = equipment.includes(eq);
                  return (
                    <TouchableOpacity
                      key={eq}
                      onPress={() => toggleEquipment(eq)}
                      style={[
                        styles.eqChip,
                        {
                          backgroundColor: selected ? theme.primaryLight : theme.card,
                          borderColor: selected ? theme.primary : theme.cardBorder
                        }
                      ]}
                    >
                      <Ionicons
                        name={selected ? "checkmark-circle" : "add-circle-outline"}
                        size={16}
                        color={selected ? theme.primary : theme.textMuted}
                      />
                      <Text style={[styles.eqText, { color: selected ? theme.primary : theme.textPrimary }]}>
                        {eq}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>

            <View style={styles.navRow}>
              <Button title="Back" variant="outline" onPress={() => setStep(2)} style={{ flex: 1, marginRight: 6 }} />
              <Button title="Next: Nutrition" onPress={() => setStep(4)} style={{ flex: 1, marginLeft: 6 }} />
            </View>
          </View>
        )}

        {/* STEP 4: Nutrition Information */}
        {step === 4 && (
          <View>
            <Text style={[styles.heading, { color: theme.textPrimary }]}>Nutrition Preferences</Text>
            <Text style={[styles.subheading, { color: theme.textMuted }]}>
              Customize meal plans, macros, and allergen filters
            </Text>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Dietary Preference</Text>
            <View style={styles.choiceGrid}>
              {(["Non-Vegetarian", "Vegetarian", "Vegan", "Other"] as const).map((pref) => (
                <TouchableOpacity
                  key={pref}
                  onPress={() => setFoodPreference(pref)}
                  style={[
                    styles.choiceCard,
                    {
                      backgroundColor: foodPreference === pref ? theme.primaryLight : theme.card,
                      borderColor: foodPreference === pref ? theme.primary : theme.cardBorder
                    }
                  ]}
                >
                  <Ionicons
                    name={pref === "Vegetarian" || pref === "Vegan" ? "leaf" : "restaurant"}
                    size={20}
                    color={foodPreference === pref ? theme.primary : theme.textMuted}
                  />
                  <Text style={[styles.choiceText, { color: foodPreference === pref ? theme.primary : theme.textPrimary }]}>
                    {pref}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>Food Allergies or Restrictions</Text>
            <View style={styles.wrapRow}>
              {["Dairy", "Nuts", "Gluten", "Shellfish", "Soy", "Eggs"].map((allergy) => {
                const selected = allergies.includes(allergy);
                return (
                  <TouchableOpacity
                    key={allergy}
                    onPress={() => toggleAllergy(allergy)}
                    style={[
                      styles.eqChip,
                      {
                        backgroundColor: selected ? theme.warning + "20" : theme.card,
                        borderColor: selected ? theme.warning : theme.cardBorder
                      }
                    ]}
                  >
                    <Ionicons
                      name={selected ? "alert-circle" : "add-circle-outline"}
                      size={16}
                      color={selected ? theme.warning : theme.textMuted}
                    />
                    <Text style={[styles.eqText, { color: selected ? theme.warning : theme.textPrimary }]}>
                      {allergy}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.navRow}>
              <Button title="Back" variant="outline" onPress={() => setStep(3)} style={{ flex: 1, marginRight: 6 }} />
              <Button
                title="Complete Setup"
                loading={loading}
                onPress={handleFinish}
                style={{ flex: 1, marginLeft: 6 }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40
  },
  stepHeader: {
    marginBottom: 20
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8
  },
  progressBar: {
    flexDirection: "row",
    gap: 6
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3
  },
  subheading: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 8
  },
  inputBox: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
    justifyContent: "center"
  },
  input: {
    fontSize: 15,
    fontWeight: "600"
  },
  row: {
    flexDirection: "row",
    marginBottom: 8
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center"
  },
  choiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10
  },
  choiceCard: {
    flex: 1,
    minWidth: 95,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    alignItems: "center",
    gap: 6
  },
  choiceText: {
    fontSize: 12,
    fontWeight: "700"
  },
  choiceList: {
    gap: 8,
    marginBottom: 10
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5
  },
  listCardText: {
    fontSize: 15,
    fontWeight: "700"
  },
  locationCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 8,
    marginHorizontal: 4
  },
  locationText: {
    fontSize: 14,
    fontWeight: "700"
  },
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14
  },
  eqChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1
  },
  eqText: {
    fontSize: 13,
    fontWeight: "600"
  },
  navRow: {
    flexDirection: "row",
    marginTop: 20
  }
});
