export interface CaloriePlan {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  waterGoalLiters: number;
  waterGoalGlasses: number;
  note: string;
}

export function calculateCalories(
  age: number = 25,
  gender: string = "Male",
  heightCm: number = 175,
  weightKg: number = 70,
  activityLevel: string = "Moderate",
  goal: string = "General Fitness"
): CaloriePlan {
  // Mifflin-St Jeor Equation
  // BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (years) + s
  // s = +5 for male, -161 for female
  const isFemale = gender.toLowerCase().includes("fem") || gender.toLowerCase().includes("wom");
  const s = isFemale ? -161 : 5;

  let bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + s);
  if (bmr < 1000) bmr = 1200;

  // Activity Multiplier
  let multiplier = 1.375; // light-moderate default
  const act = (activityLevel || "").toLowerCase();
  if (act.includes("sedentary") || act.includes("low")) {
    multiplier = 1.2;
  } else if (act.includes("moderate") || act.includes("light")) {
    multiplier = 1.4;
  } else if (act.includes("active") || act.includes("high")) {
    multiplier = 1.65;
  } else if (act.includes("athlete") || act.includes("very")) {
    multiplier = 1.85;
  }

  const tdee = Math.round(bmr * multiplier);

  // Goal adjustment
  let targetCalories = tdee;
  const g = (goal || "").toLowerCase();
  if (g.includes("loss")) {
    targetCalories = Math.max(1200, Math.round(tdee * 0.8)); // 20% deficit
  } else if (g.includes("muscle") || g.includes("gain") || g.includes("strength")) {
    targetCalories = Math.round(tdee * 1.15); // 15% surplus
  } else if (g.includes("endurance")) {
    targetCalories = Math.round(tdee * 1.05);
  } else {
    targetCalories = tdee; // maintain
  }

  // Macronutrient breakdown (Macro distribution)
  // Protein: ~2.0g per kg for muscle gain/loss, ~1.6g for maintain
  let proteinFactor = 1.8;
  if (g.includes("muscle") || g.includes("strength")) proteinFactor = 2.2;
  if (g.includes("loss")) proteinFactor = 2.0;

  const proteinGrams = Math.round(weightKg * proteinFactor);
  const proteinCalories = proteinGrams * 4;

  // Fats: ~25-30% of target calories
  const fatsCalories = targetCalories * 0.25;
  const fatsGrams = Math.round(fatsCalories / 9);

  // Carbs: Remaining calories
  const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatsCalories));
  const carbsGrams = Math.round(remainingCalories / 4);

  // Water goal: ~35ml per kg of body weight
  const waterLiters = Number(((weightKg * 0.035) + 0.5).toFixed(1)); // +0.5L for workout hydration
  const waterGlasses = Math.round((waterLiters * 1000) / 250); // 250ml glasses

  return {
    bmr,
    tdee,
    targetCalories,
    proteinGrams,
    carbsGrams,
    fatsGrams,
    waterGoalLiters: waterLiters,
    waterGoalGlasses: waterGlasses,
    note: "Values are scientific estimates based on the Mifflin-St Jeor formula and serve as general wellness guidance."
  };
}
