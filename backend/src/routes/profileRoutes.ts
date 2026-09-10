import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { getProfile, updateProfile } from "../controllers/profileController";

const router = Router();

router.use(authenticateToken);

router.get("/", getProfile);
router.put("/", updateProfile);
router.post("/", updateProfile);

export default router;
