import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();
const expenseController = new ExpenseController();

router.post("/", auth, expenseController.addExpense);
router.get("/", auth, expenseController.getExpenses);
router.delete("/:id", auth, expenseController.deleteExpense);

export default router;
