export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  username: string;
  age: number;
  gender: string;
  height: number; // in cm
  weight: number; // in kg
  fitness_level: "Beginner" | "Intermediate" | "Advanced";
  activity_level: string;
  fitness_goal: "Weight Loss" | "Muscle Gain" | "Strength" | "Improve Endurance" | "General Fitness" | "Maintain Weight";
  workout_preference: {
    location?: "Home" | "Gym";
    availableTime?: number;
    daysPerWeek?: number;
    preferredType?: string;
    equipment?: string[];
  };
  food_preference: "Vegetarian" | "Non-Vegetarian" | "Vegan" | "Other";
  allergies: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CaloriePlan {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  waterGoalLiters: number;
  waterGoalGlasses: number;
  note?: string;
}

export interface WorkoutExercise {
  id?: string;
  workout_id?: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  duration?: number;
  completed: boolean;
  instructions?: string;
  rest_time_seconds?: number;
}

export interface Workout {
  id: string;
  user_id?: string;
  workout_name: string;
  date: string;
  duration: number; // in seconds
  completed: boolean;
  created_at?: string;
  exercises?: WorkoutExercise[];
  isOffline?: boolean;
}

export interface NutritionItem {
  id: string;
  user_id?: string;
  date: string;
  meal_type: "Breakfast" | "Lunch" | "Dinner" | "Snacks";
  meal_name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  completed: boolean;
}

export interface ProgressSummary {
  totalWorkouts: number;
  totalMinutes: number;
  totalCaloriesBurned: number;
  avgSteps: number;
  currentWeight: number;
}

export interface WeeklyCalendarDay {
  day: string;
  date: string;
  completed: boolean;
  isToday: boolean;
}

export interface ProgressRecord {
  id: string;
  date: string;
  weight: number;
  steps: number;
  calories: number;
  workout_duration: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
