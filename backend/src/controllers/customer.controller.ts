import { Request, Response, NextFunction } from "express";
import { CustomerService } from "../services/customer.service";

export class CustomerController {
  private customerService = new CustomerService();

  addCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const customer = await this.customerService.create(req.userId!, req.body);
      res.status(201).json(customer);
    } catch (error) {
      next(error);
    }
  };

  getCustomers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { month, year, page, limit } = req.query;
      const result = await this.customerService.getAll(
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

  payCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.customerService.pay(
        req.userId!,
        req.params.id as string,
        req.body,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  unpayCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.customerService.unpay(
        req.userId!,
        req.params.id as string,
        req.body,
      );
      res.json({ message: "Payment reversed successfully" });
    } catch (error) {
      next(error);
    }
  };

  updateCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const customer = await this.customerService.update(
        req.userId!,
        req.params.id as string,
        req.body,
      );
      res.json(customer);
    } catch (error) {
      next(error);
    }
  };

  deleteCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.customerService.delete(req.userId!, req.params.id as string);
      res.json({ message: "Customer removed successfully" });
    } catch (error) {
      next(error);
    }
  };
}
