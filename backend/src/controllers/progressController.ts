import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest } from "../middleware/auth";
import { localDB, ProgressItem } from "../config/db";

export const getProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const timeframe = (req.query.timeframe as string) || "week"; // "week" or "month"
    const db = localDB.get();

    const profile = db.profiles.find((p) => p.user_id === userId);
    const userWorkouts = db.workouts.filter((w) => w.user_id === userId && w.completed);
    let userProgress = db.progress
      .filter((p) => p.user_id === userId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Build 7 days for weekly calendar (Mon - Sun)
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyCalendar = weekDays.map((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateStr = d.toISOString().split("T")[0];
      const hasWorkout = userWorkouts.some((w) => w.date === dateStr);
      return {
        day: dayName,
        date: dateStr,
        completed: hasWorkout,
        isToday: dateStr === today.toISOString().split("T")[0]
      };
    });

    // If user has few progress records, populate reasonable baseline data
    if (userProgress.length === 0) {
      const baseWeight = profile?.weight || 70;
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const hasWorkout = userWorkouts.some((w) => w.date === dateStr);
        const record: ProgressItem = {
          id: uuidv4(),
          user_id: userId!,
          date: dateStr,
          weight: Number((baseWeight - (6 - i) * 0.1).toFixed(1)),
          steps: 5000 + Math.floor(Math.random() * 4000),
          calories: hasWorkout ? 450 + Math.floor(Math.random() * 200) : 150,
          workout_duration: hasWorkout ? 40 : 0,
          created_at: new Date().toISOString()
        };
        db.progress.push(record);
        userProgress.push(record);
      }
      localDB.save();
    }

    const filtered =
      timeframe === "week"
        ? userProgress.slice(-7)
        : userProgress.slice(-30);

    const totalWorkouts = userWorkouts.length;
    const totalMinutes = userWorkouts.reduce((acc, w) => acc + Math.round(w.duration / 60), 0);
    const totalCaloriesBurned = userProgress.reduce((acc, p) => acc + (p.calories || 0), 0);
    const avgSteps = Math.round(
      userProgress.reduce((acc, p) => acc + (p.steps || 0), 0) / (userProgress.length || 1)
    );

    res.json({
      success: true,
      timeframe,
      summary: {
        totalWorkouts,
        totalMinutes,
        totalCaloriesBurned,
        avgSteps,
        currentWeight: profile?.weight || 70
      },
      weeklyCalendar,
      history: filtered
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving progress records." });
  }
};

export const logProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { date, weight, steps, calories, workout_duration } = req.body;
    const recordDate = date || new Date().toISOString().split("T")[0];
    const db = localDB.get();

    let record = db.progress.find((p) => p.user_id === userId && p.date === recordDate);

    if (record) {
      if (weight !== undefined) record.weight = Number(weight);
      if (steps !== undefined) record.steps = Number(steps);
      if (calories !== undefined) record.calories = Number(calories);
      if (workout_duration !== undefined) record.workout_duration = Number(workout_duration);
    } else {
      record = {
        id: uuidv4(),
        user_id: userId!,
        date: recordDate,
        weight: Number(weight) || 70,
        steps: Number(steps) || 0,
        calories: Number(calories) || 0,
        workout_duration: Number(workout_duration) || 0,
        created_at: new Date().toISOString()
      };
      db.progress.push(record);
    }

    if (weight !== undefined) {
      const profile = db.profiles.find((p) => p.user_id === userId);
      if (profile) {
        profile.weight = Number(weight);
      }
    }

    localDB.save();

    res.json({
      success: true,
      message: "Progress record saved.",
      data: record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error logging progress." });
  }
};
