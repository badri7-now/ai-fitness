import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { localDB } from "../config/db";
import { askFitAICoach, generatePersonalizedWorkout } from "../services/aiCoachService";
import { generateRecommendedMeals } from "../services/nutritionGenerator";
import { calculateCalories } from "../services/calorieCalculator";

export const chatWithCoach = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ success: false, message: "Please provide a message." });
      return;
    }

    const db = localDB.get();
    const profile = db.profiles.find((p) => p.user_id === userId);
    const recentWorkouts = db.workouts.filter((w) => w.user_id === userId).slice(-5);

    const reply = await askFitAICoach(message, profile, recentWorkouts);

    res.json({
      success: true,
      data: {
        reply,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "AI Coach unavailable at the moment." });
  }
};

export const generateWorkoutEndpoint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const db = localDB.get();
    const profile = db.profiles.find((p) => p.user_id === userId);

    const workout = generatePersonalizedWorkout(profile);

    res.json({
      success: true,
      data: workout
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generating workout." });
  }
};

export const generateNutritionEndpoint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const db = localDB.get();
    const profile = db.profiles.find((p) => p.user_id === userId);

    const caloriePlan = calculateCalories(
      profile?.age,
      profile?.gender,
      profile?.height,
      profile?.weight,
      profile?.activity_level,
      profile?.fitness_goal
    );

    const meals = generateRecommendedMeals(
      caloriePlan.targetCalories,
      profile?.food_preference,
      profile?.fitness_goal,
      profile?.allergies
    );

    res.json({
      success: true,
      data: {
        targets: caloriePlan,
        meals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generating nutrition plan." });
  }
};
