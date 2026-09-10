import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest } from "../middleware/auth";
import { localDB, NutritionItem } from "../config/db";
import { generateRecommendedMeals } from "../services/nutritionGenerator";
import { calculateCalories } from "../services/calorieCalculator";

export const getNutrition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const dateQuery = (req.query.date as string) || new Date().toISOString().split("T")[0];
    const db = localDB.get();

    let dayMeals = db.nutrition.filter(
      (n) => n.user_id === userId && n.date === dateQuery
    );

    // If no meals for this day, auto-generate recommended meal plan for the user
    if (dayMeals.length === 0) {
      const profile = db.profiles.find((p) => p.user_id === userId);
      const foodPref = profile?.food_preference || "Non-Vegetarian";
      const goal = profile?.fitness_goal || "General Fitness";
      const allergies = profile?.allergies || [];

      const caloriePlan = calculateCalories(
        profile?.age,
        profile?.gender,
        profile?.height,
        profile?.weight,
        profile?.activity_level,
        profile?.fitness_goal
      );

      const generated = generateRecommendedMeals(
        caloriePlan.targetCalories,
        foodPref,
        goal,
        allergies
      );

      for (const item of generated) {
        const newMeal: NutritionItem = {
          id: uuidv4(),
          user_id: userId!,
          date: dateQuery,
          meal_type: item.meal_type as any,
          meal_name: item.meal_name,
          calories: item.calories,
          protein: item.protein,
          carbohydrates: item.carbohydrates,
          fats: item.fats,
          completed: false
        };
        db.nutrition.push(newMeal);
        dayMeals.push(newMeal);
      }
      localDB.save();
    }

    const profile = db.profiles.find((p) => p.user_id === userId);
    const caloriePlan = calculateCalories(
      profile?.age,
      profile?.gender,
      profile?.height,
      profile?.weight,
      profile?.activity_level,
      profile?.fitness_goal
    );

    const consumed = dayMeals
      .filter((m) => m.completed)
      .reduce(
        (acc, m) => ({
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
          carbs: acc.carbs + m.carbohydrates,
          fats: acc.fats + m.fats
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );

    res.json({
      success: true,
      date: dateQuery,
      targets: caloriePlan,
      consumed,
      meals: dayMeals,
      disclaimer: "Nutrition recommendations are general wellness guidance and are not medical advice."
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching nutrition plan." });
  }
};

export const addNutritionItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { date, meal_type, meal_name, calories, protein, carbohydrates, fats } = req.body;

    if (!meal_name || !meal_type) {
      res.status(400).json({ success: false, message: "Meal name and type are required." });
      return;
    }

    const db = localDB.get();
    const newMeal: NutritionItem = {
      id: uuidv4(),
      user_id: userId!,
      date: date || new Date().toISOString().split("T")[0],
      meal_type,
      meal_name,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbohydrates: Number(carbohydrates) || 0,
      fats: Number(fats) || 0,
      completed: true
    };

    db.nutrition.push(newMeal);
    localDB.save();

    res.status(201).json({
      success: true,
      message: "Meal item logged!",
      data: newMeal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding nutrition item." });
  }
};

export const toggleMealCompleted = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const db = localDB.get();

    const meal = db.nutrition.find((n) => n.id === id && n.user_id === userId);
    if (!meal) {
      res.status(404).json({ success: false, message: "Meal item not found." });
      return;
    }

    meal.completed = !meal.completed;
    localDB.save();

    res.json({
      success: true,
      message: `Meal marked as ${meal.completed ? "completed" : "pending"}.`,
      data: meal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating meal status." });
  }
};
