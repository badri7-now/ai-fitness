import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { localDB, Profile } from "../config/db";
import { calculateCalories } from "../services/calorieCalculator";

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const db = localDB.get();
    const profile = db.profiles.find((p) => p.user_id === userId);

    if (!profile) {
      res.status(404).json({ success: false, message: "Profile not found." });
      return;
    }

    const caloriePlan = calculateCalories(
      profile.age,
      profile.gender,
      profile.height,
      profile.weight,
      profile.activity_level,
      profile.fitness_goal
    );

    res.json({
      success: true,
      data: {
        profile,
        caloriePlan
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching profile." });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const db = localDB.get();
    const index = db.profiles.findIndex((p) => p.user_id === userId);

    if (index === -1) {
      res.status(404).json({ success: false, message: "Profile not found." });
      return;
    }

    const current = db.profiles[index];
    const {
      name,
      age,
      gender,
      height,
      weight,
      fitness_level,
      activity_level,
      fitness_goal,
      workout_preference,
      food_preference,
      allergies
    } = req.body;

    const updated: Profile = {
      ...current,
      name: name !== undefined ? name : current.name,
      age: age !== undefined ? Number(age) : current.age,
      gender: gender !== undefined ? gender : current.gender,
      height: height !== undefined ? Number(height) : current.height,
      weight: weight !== undefined ? Number(weight) : current.weight,
      fitness_level: fitness_level || current.fitness_level,
      activity_level: activity_level || current.activity_level,
      fitness_goal: fitness_goal || current.fitness_goal,
      workout_preference: workout_preference || current.workout_preference,
      food_preference: food_preference || current.food_preference,
      allergies: allergies !== undefined ? allergies : current.allergies,
      updated_at: new Date().toISOString()
    };

    db.profiles[index] = updated;

    // Also update current progress weight if provided
    if (weight !== undefined) {
      const today = new Date().toISOString().split("T")[0];
      const todayProgress = db.progress.find(
        (pr) => pr.user_id === userId && pr.date === today
      );
      if (todayProgress) {
        todayProgress.weight = Number(weight);
      }
    }

    localDB.save();

    const caloriePlan = calculateCalories(
      updated.age,
      updated.gender,
      updated.height,
      updated.weight,
      updated.activity_level,
      updated.fitness_goal
    );

    res.json({
      success: true,
      message: "Profile updated successfully!",
      data: {
        profile: updated,
        caloriePlan
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating profile." });
  }
};
