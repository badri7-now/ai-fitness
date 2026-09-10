import fs from "fs";
import path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at: string;
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
    availableTime?: number; // minutes
    daysPerWeek?: number;
    preferredType?: string;
    equipment?: string[];
  };
  food_preference: "Vegetarian" | "Non-Vegetarian" | "Vegan" | "Other";
  allergies: string[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  duration: number; // seconds
  completed: boolean;
}

export interface Workout {
  id: string;
  user_id: string;
  workout_name: string;
  date: string; // YYYY-MM-DD
  duration: number; // seconds
  completed: boolean;
  created_at: string;
  exercises?: WorkoutExercise[];
}

export interface NutritionItem {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  meal_type: "Breakfast" | "Lunch" | "Dinner" | "Snacks";
  meal_name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  completed: boolean;
}

export interface ProgressItem {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  steps: number;
  calories: number;
  workout_duration: number;
  created_at: string;
}

export interface PasswordReset {
  email: string;
  code: string;
  expires_at: number;
}

export interface DatabaseSchema {
  users: User[];
  profiles: Profile[];
  workouts: Workout[];
  workout_exercises: WorkoutExercise[];
  nutrition: NutritionItem[];
  progress: ProgressItem[];
  password_resets: PasswordReset[];
}

const DATA_DIR = path.join(__dirname, "../../data");
const DB_FILE = path.join(DATA_DIR, "fitness_db.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadLocalDB(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = {
      users: [],
      profiles: [],
      workouts: [],
      workout_exercises: [],
      nutrition: [],
      progress: [],
      password_resets: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    const initial: DatabaseSchema = {
      users: [],
      profiles: [],
      workouts: [],
      workout_exercises: [],
      nutrition: [],
      progress: [],
      password_resets: []
    };
    return initial;
  }
}

export function saveLocalDB(data: DatabaseSchema): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

let dbInstance: DatabaseSchema = loadLocalDB();

export const localDB = {
  get: (): DatabaseSchema => dbInstance,
  save: () => saveLocalDB(dbInstance),
  reload: () => {
    dbInstance = loadLocalDB();
  }
};

export const supabase: SupabaseClient | null =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;
