import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { getProgress, logProgress } from "../controllers/progressController";

const router = Router();

router.use(authenticateToken);

router.get("/", getProgress);
router.post("/", logProgress);

export default router;
