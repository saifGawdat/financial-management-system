import { Request, Response, NextFunction } from "express";
import { ExpenseService } from "../services/expense.service";

export class ExpenseController {
  private expenseService = new ExpenseService();

  addExpense = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const expense = await this.expenseService.create(req.userId!, req.body);
      res.status(201).json(expense);
    } catch (error) {
      next(error);
    }
  };

  getExpenses = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { month, year, page, limit } = req.query;
      const result = await this.expenseService.getAll(
        req.userId!,
        month ? parseInt(month as string) : undefined,
        year ? parseInt(year as string) : undefined,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 10,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteExpense = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.expenseService.delete(req.userId!, req.params.id as string);
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}
