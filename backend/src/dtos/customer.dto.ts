export interface CreateCustomerDTO {
  name: string;
  brandName?: string;
  phoneNumber: string;
  monthlyAmount: number;
  paymentDeadline?: Date;
}

export interface UpdateCustomerDTO {
  name?: string;
  brandName?: string;
  phoneNumber?: string;
  monthlyAmount?: number;
  paymentDeadline?: Date;
}

export interface PayCustomerDTO {
  month: number;
  year: number;
}

export interface CustomerQueryDTO {
  month?: string;
  year?: string;
  page?: string;
  limit?: string;
}
