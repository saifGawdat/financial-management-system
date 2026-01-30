import { Customer, ICustomer } from "../models/Customer";
import { Income } from "../models/Income";
import {
  CreateCustomerDTO,
  UpdateCustomerDTO,
  PayCustomerDTO,
} from "../dtos/customer.dto";
import { PaginatedResponseDTO } from "../dtos/pagination.dto";
import { NotFoundError, UnauthorizedError } from "../errors";
import { MonthlySummaryService } from "./monthly-summary.service";

export class CustomerService {
  private monthlySummaryService = new MonthlySummaryService();

  async create(userId: string, data: CreateCustomerDTO): Promise<ICustomer> {
    const customer = new Customer({
      user: userId,
      name: data.name,
      brandName: data.brandName,
      phoneNumber: data.phoneNumber,
      monthlyAmount: data.monthlyAmount,
      paymentDeadline: data.paymentDeadline,
    });

    await customer.save();
    return customer;
  }

  async getAll(
    userId: string,
    month?: number,
    year?: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponseDTO<any>> {
    const validatedPage = page < 1 ? 1 : page;
    const validatedLimit = limit < 1 ? 10 : limit > 100 ? 100 : limit;
    const skip = (validatedPage - 1) * validatedLimit;

    const totalItems = await Customer.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalItems / validatedLimit);

    const customers = await Customer.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(validatedLimit)
      .lean();

    if (!month || !year) {
      return {
        data: customers,
        pagination: {
          currentPage: validatedPage,
          totalPages,
          totalItems,
          itemsPerPage: validatedLimit,
          hasNextPage: validatedPage < totalPages,
          hasPreviousPage: validatedPage > 1,
        },
      };
    }

    // Find payment records for the specified month/year
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const payments = await Income.find({
      user: userId,
      customer: { $in: customers.map((c: any) => c._id) },
      date: { $gte: startDate, $lte: endDate },
    });

    const customersWithStatus = customers.map((customer: any) => {
      const payment = payments.find(
        (p) => p.customer?.toString() === customer._id.toString(),
      );
      return {
        ...customer,
        isPaid: !!payment,
        paymentId: payment ? payment._id : null,
      };
    });

    return {
      data: customersWithStatus,
      pagination: {
        currentPage: validatedPage,
        totalPages,
        totalItems,
        itemsPerPage: validatedLimit,
        hasNextPage: validatedPage < totalPages,
        hasPreviousPage: validatedPage > 1,
      },
    };
  }

  async pay(
    userId: string,
    customerId: string,
    data: PayCustomerDTO,
  ): Promise<any> {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    if (customer.user.toString() !== userId) {
      throw new UnauthorizedError("Not authorized");
    }

    const now = new Date();
    let paymentDate: Date;

    if (now.getMonth() + 1 === data.month && now.getFullYear() === data.year) {
      paymentDate = now;
    } else {
      paymentDate = new Date(data.year, data.month - 1, 15);
    }

    if (!customer.lastPaidDate || paymentDate > customer.lastPaidDate) {
      customer.lastPaidDate = paymentDate;
      await customer.save();
    }

    const income = new Income({
      user: userId,
      customer: customer._id,
      title: `Monthly payment from ${customer.name}${customer.brandName ? ` (${customer.brandName})` : ""}`,
      amount: customer.monthlyAmount,
      category: "customer payment",
      date: paymentDate,
      description: `Monthly payment for ${data.month}/${data.year}`,
    });

    await income.save();
    await this.monthlySummaryService.calculate(userId, data.month, data.year);

    return { message: "Payment processed successfully", customer, income };
  }

  async unpay(
    userId: string,
    customerId: string,
    data: PayCustomerDTO,
  ): Promise<void> {
    const startDate = new Date(
      Date.UTC(data.year, data.month - 1, 1, 0, 0, 0, 0),
    );
    const endDate = new Date(
      Date.UTC(data.year, data.month, 0, 23, 59, 59, 999),
    );

    const income = await Income.findOne({
      user: userId,
      customer: customerId,
      date: { $gte: startDate, $lte: endDate },
    });

    if (!income) {
      throw new NotFoundError("Payment record not found");
    }

    await Income.findByIdAndDelete(income._id);
    await this.monthlySummaryService.calculate(userId, data.month, data.year);

    const lastPayment = await Income.findOne({
      user: userId,
      customer: customerId,
    }).sort({
      date: -1,
    });

    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.lastPaidDate = lastPayment ? lastPayment.date : undefined;
      await customer.save();
    }
  }

  async update(
    userId: string,
    customerId: string,
    data: UpdateCustomerDTO,
  ): Promise<ICustomer> {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    if (customer.user.toString() !== userId) {
      throw new UnauthorizedError("Not authorized");
    }

    if (data.name !== undefined) customer.name = data.name;
    if (data.brandName !== undefined) customer.brandName = data.brandName;
    if (data.phoneNumber !== undefined) customer.phoneNumber = data.phoneNumber;
    if (data.monthlyAmount !== undefined)
      customer.monthlyAmount = data.monthlyAmount;
    if (data.paymentDeadline !== undefined)
      customer.paymentDeadline = data.paymentDeadline;

    await customer.save();
    return customer;
  }

  async delete(userId: string, customerId: string): Promise<void> {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    if (customer.user.toString() !== userId) {
      throw new UnauthorizedError("Not authorized");
    }

    await Customer.findByIdAndDelete(customerId);
  }
}
