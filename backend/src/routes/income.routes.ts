import { Router } from "express";
import { IncomeController } from "../controllers/income.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();
const incomeController = new IncomeController();

router.post("/", auth, incomeController.addIncome);
router.get("/", auth, incomeController.getIncomes);
router.delete("/:id", auth, incomeController.deleteIncome);

export default router;
