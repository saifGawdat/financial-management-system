import { Request, Response, NextFunction } from "express";
import { IncomeService } from "../services/income.service";

export class IncomeController {
  private incomeService = new IncomeService();

  addIncome = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const income = await this.incomeService.create(req.userId!, req.body);
      res.status(201).json(income);
    } catch (error) {
      next(error);
    }
  };

  getIncomes = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { month, year, page, limit } = req.query;
      const result = await this.incomeService.getAll(
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

  deleteIncome = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.incomeService.delete(req.userId!, req.params.id as string);
      res.json({ message: "Income deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}
