import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getNutrition,
  addNutritionItem,
  toggleMealCompleted
} from "../controllers/nutritionController";

const router = Router();

router.use(authenticateToken);

router.get("/", getNutrition);
router.post("/", addNutritionItem);
router.put("/:id/toggle", toggleMealCompleted);

export default router;
