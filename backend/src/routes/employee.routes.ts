import { Router } from "express";
import { EmployeeController } from "../controllers/employee.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();
const employeeController = new EmployeeController();

router.get("/", auth, employeeController.getEmployees);
router.get("/active", auth, employeeController.getActiveEmployees);
router.get("/:id", auth, employeeController.getEmployeeById);
router.post("/", auth, employeeController.createEmployee);
router.put("/:id", auth, employeeController.updateEmployee);
router.delete("/:id", auth, employeeController.deleteEmployee);

router.post("/transactions", auth, employeeController.addTransaction);
router.get(
  "/transactions/:month/:year",
  auth,
  employeeController.getTransactionsByMonth,
);
router.delete("/transactions/:id", auth, employeeController.deleteTransaction);

export default router;
