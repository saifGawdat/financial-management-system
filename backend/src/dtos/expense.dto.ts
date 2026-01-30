export interface CreateExpenseDTO {
  title: string;
  amount: number;
  category: string;
  date?: Date;
  description?: string;
}

export interface ExpenseQueryDTO {
  month?: string;
  year?: string;
  page?: string;
  limit?: string;
}
