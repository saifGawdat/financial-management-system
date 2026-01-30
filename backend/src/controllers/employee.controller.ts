import { Request, Response, NextFunction } from "express";
import { EmployeeService } from "../services/employee.service";

export class EmployeeController {
  private employeeService = new EmployeeService();

  getEmployees = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { page, limit } = req.query;
      const result = await this.employeeService.getAll(
        req.userId!,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 10,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getActiveEmployees = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const employees = await this.employeeService.getActive(req.userId!);
      res.json(employees);
    } catch (error) {
      next(error);
    }
  };

  getEmployeeById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const employee = await this.employeeService.getById(
        req.userId!,
        req.params.id as string,
      );
      res.json(employee);
    } catch (error) {
      next(error);
    }
  };

  createEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const employee = await this.employeeService.create(req.userId!, req.body);
      res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  };

  updateEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const employee = await this.employeeService.update(
        req.userId!,
        req.params.id as string,
        req.body,
      );
      res.json(employee);
    } catch (error) {
      next(error);
    }
  };

  deleteEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.employeeService.delete(req.userId!, req.params.id as string);
      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  addTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const transaction = await this.employeeService.addTransaction(
        req.userId!,
        req.body,
      );
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  };

  getTransactionsByMonth = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { month, year } = req.params;
      const transactions = await this.employeeService.getTransactions(
        req.userId!,
        parseInt(month as string),
        parseInt(year as string),
      );
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  };

  deleteTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.employeeService.deleteTransaction(
        req.userId!,
        req.params.id as string,
      );
      res.json({ message: "Adjustment deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}
