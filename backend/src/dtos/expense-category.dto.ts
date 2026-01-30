export interface CreateExpenseCategoryDTO {
  category: string;
  amount: number;
  month: number;
  year: number;
  description?: string;
}

export interface UpdateExpenseCategoryDTO {
  category?: string;
  amount?: number;
  month?: number;
  year?: number;
  description?: string;
}

export interface ExpenseCategoryQueryDTO {
  month?: string;
  year?: string;
}
