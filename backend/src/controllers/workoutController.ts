import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest } from "../middleware/auth";
import { localDB, Workout, WorkoutExercise, ProgressItem } from "../config/db";

export const getWorkouts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const db = localDB.get();

    const userWorkouts = db.workouts
      .filter((w) => w.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const result = userWorkouts.map((w) => {
      const exercises = db.workout_exercises.filter((e) => e.workout_id === w.id);
      return {
        ...w,
        exercises
      };
    });

    res.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving workouts." });
  }
};

export const getWorkoutById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const db = localDB.get();

    const workout = db.workouts.find((w) => w.id === id && w.user_id === userId);
    if (!workout) {
      res.status(404).json({ success: false, message: "Workout not found." });
      return;
    }

    const exercises = db.workout_exercises.filter((e) => e.workout_id === workout.id);

    res.json({
      success: true,
      data: {
        ...workout,
        exercises
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving workout." });
  }
};

export const createWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const {
      id,
      workout_name,
      date,
      duration, // in seconds
      completed,
      exercises
    } = req.body;

    if (!workout_name) {
      res.status(400).json({ success: false, message: "Workout name is required." });
      return;
    }

    const db = localDB.get();
    const workoutId = id || uuidv4();
    const workoutDate = date || new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    // Check duplicate
    const existing = db.workouts.find((w) => w.id === workoutId);
    if (existing) {
      res.json({
        success: true,
        message: "Workout already recorded.",
        data: existing
      });
      return;
    }

    const newWorkout: Workout = {
      id: workoutId,
      user_id: userId,
      workout_name,
      date: workoutDate,
      duration: duration || 0,
      completed: completed !== undefined ? completed : true,
      created_at: now
    };

    db.workouts.push(newWorkout);

    const savedExercises: WorkoutExercise[] = [];
    if (Array.isArray(exercises)) {
      for (const ex of exercises) {
        const exItem: WorkoutExercise = {
          id: ex.id || uuidv4(),
          workout_id: workoutId,
          exercise_name: ex.exercise_name || "Exercise",
          sets: Number(ex.sets) || 1,
          reps: Number(ex.reps) || 10,
          weight: Number(ex.weight) || 0,
          duration: Number(ex.duration) || 0,
          completed: ex.completed !== undefined ? ex.completed : true
        };
        db.workout_exercises.push(exItem);
        savedExercises.push(exItem);
      }
    }

    // Auto-update or insert into Progress for today
    const estimatedCaloriesBurned = Math.round(((duration || 1200) / 60) * 7.5); // ~7.5 kcal/min average
    let dayProgress = db.progress.find((p) => p.user_id === userId && p.date === workoutDate);
    if (dayProgress) {
      dayProgress.calories += estimatedCaloriesBurned;
      dayProgress.workout_duration += Math.round((duration || 0) / 60);
    } else {
      const profile = db.profiles.find((pr) => pr.user_id === userId);
      const newProgress: ProgressItem = {
        id: uuidv4(),
        user_id: userId,
        date: workoutDate,
        weight: profile ? profile.weight : 70,
        steps: 4000,
        calories: estimatedCaloriesBurned,
        workout_duration: Math.round((duration || 0) / 60),
        created_at: now
      };
      db.progress.push(newProgress);
    }

    localDB.save();

    res.status(201).json({
      success: true,
      message: "Workout logged successfully!",
      data: {
        ...newWorkout,
        exercises: savedExercises
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving workout." });
  }
};

export const syncOfflineWorkouts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const { workouts } = req.body;
    if (!Array.isArray(workouts) || workouts.length === 0) {
      res.json({ success: true, syncedCount: 0, message: "No workouts to sync." });
      return;
    }

    const db = localDB.get();
    let addedCount = 0;
    let duplicateCount = 0;

    for (const item of workouts) {
      const workoutId = item.id || uuidv4();
      const existing = db.workouts.find(
        (w) => w.id === workoutId || (w.user_id === userId && w.date === item.date && w.workout_name === item.workout_name && Math.abs(w.duration - item.duration) < 5)
      );

      if (existing) {
        duplicateCount++;
        continue;
      }

      const newWorkout: Workout = {
        id: workoutId,
        user_id: userId,
        workout_name: item.workout_name || "Completed Workout",
        date: item.date || new Date().toISOString().split("T")[0],
        duration: item.duration || 0,
        completed: true,
        created_at: item.created_at || new Date().toISOString()
      };
      db.workouts.push(newWorkout);

      if (Array.isArray(item.exercises)) {
        for (const ex of item.exercises) {
          db.workout_exercises.push({
            id: ex.id || uuidv4(),
            workout_id: workoutId,
            exercise_name: ex.exercise_name || "Exercise",
            sets: Number(ex.sets) || 1,
            reps: Number(ex.reps) || 10,
            weight: Number(ex.weight) || 0,
            duration: Number(ex.duration) || 0,
            completed: true
          });
        }
      }

      addedCount++;
    }

    localDB.save();

    res.json({
      success: true,
      message: `Offline synchronization complete. Synced: ${addedCount}, Duplicates ignored: ${duplicateCount}.`,
      syncedCount: addedCount,
      duplicateCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Sync failed." });
  }
};
