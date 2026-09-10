import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  chatWithCoach,
  generateWorkoutEndpoint,
  generateNutritionEndpoint
} from "../controllers/aiController";

const router = Router();

router.use(authenticateToken);

router.post("/coach", chatWithCoach);
router.post("/generate-workout", generateWorkoutEndpoint);
router.post("/generate-nutrition", generateNutritionEndpoint);

export default router;
