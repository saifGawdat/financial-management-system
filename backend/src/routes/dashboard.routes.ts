import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();
const dashboardController = new DashboardController();

router.get("/stats", auth, dashboardController.getStats);
router.get("/chart-data", auth, dashboardController.getChartData);
router.get("/recent", auth, dashboardController.getRecentTransactions);

export default router;
