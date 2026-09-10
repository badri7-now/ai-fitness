import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  syncOfflineWorkouts
} from "../controllers/workoutController";

const router = Router();

router.use(authenticateToken);

router.get("/", getWorkouts);
router.get("/:id", getWorkoutById);
router.post("/", createWorkout);
router.post("/sync", syncOfflineWorkouts);

export default router;
