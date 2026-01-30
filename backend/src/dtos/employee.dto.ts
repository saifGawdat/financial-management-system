import { TransactionType } from "../models/EmployeeTransaction";

export interface CreateEmployeeDTO {
  name: string;
  salary: number;
  jobTitle: string;
  phoneNumber?: string;
  dateJoined?: Date;
}

export interface UpdateEmployeeDTO {
  name?: string;
  salary?: number;
  jobTitle?: string;
  phoneNumber?: string;
  dateJoined?: Date;
  isActive?: boolean;
}

export interface CreateTransactionDTO {
  employeeId: string;
  type: TransactionType;
  amount: number;
  month: number;
  year: number;
  description?: string;
}

export interface EmployeeQueryDTO {
  page?: string;
  limit?: string;
}
