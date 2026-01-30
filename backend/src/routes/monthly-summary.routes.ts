import { Router } from "express";
import { MonthlySummaryController } from "../controllers/monthly-summary.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();
const monthlySummaryController = new MonthlySummaryController();

router.get("/", auth, monthlySummaryController.getAllMonthlySummaries);
router.get("/:month/:year", auth, monthlySummaryController.getMonthlySummary);
router.post(
  "/recalculate/:month/:year",
  auth,
  monthlySummaryController.recalculateMonthlySummary,
);

export default router;
