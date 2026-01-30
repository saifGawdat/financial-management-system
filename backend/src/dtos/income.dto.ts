export interface CreateIncomeDTO {
  title: string;
  amount: number;
  category: string;
  date?: Date;
  description?: string;
  customer?: string;
}

export interface IncomeQueryDTO {
  month?: string;
  year?: string;
  page?: string;
  limit?: string;
}
