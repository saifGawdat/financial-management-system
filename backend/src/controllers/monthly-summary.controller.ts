import { Request, Response, NextFunction } from "express";
import { MonthlySummaryService } from "../services/monthly-summary.service";

export class MonthlySummaryController {
  private monthlySummaryService = new MonthlySummaryService();

  getMonthlySummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { month, year } = req.params;
      const summary = await this.monthlySummaryService.get(
        req.userId!,
        parseInt(month as string),
        parseInt(year as string),
      );
      res.json(summary);
    } catch (error) {
      next(error);
    }
  };

  getAllMonthlySummaries = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const summaries = await this.monthlySummaryService.getAll(req.userId!);
      res.json(summaries);
    } catch (error) {
      next(error);
    }
  };

  recalculateMonthlySummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { month, year } = req.params;
      const summary = await this.monthlySummaryService.recalculate(
        req.userId!,
        parseInt(month as string),
        parseInt(year as string),
      );
      res.json(summary);
    } catch (error) {
      next(error);
    }
  };
}
