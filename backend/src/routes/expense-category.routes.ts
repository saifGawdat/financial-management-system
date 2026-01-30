import { Router } from "express";
import { ExpenseCategoryController } from "../controllers/expense-category.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();
const expenseCategoryController = new ExpenseCategoryController();

router.get("/", auth, expenseCategoryController.getExpenseCategories);
router.get(
  "/breakdown/:month/:year",
  auth,
  expenseCategoryController.getMonthlyExpenseBreakdown,
);
router.get("/unique", auth, expenseCategoryController.getUniqueCategories);
router.post("/", auth, expenseCategoryController.createExpenseCategory);
router.put("/:id", auth, expenseCategoryController.updateExpenseCategory);
router.delete("/:id", auth, expenseCategoryController.deleteExpenseCategory);

export default router;
