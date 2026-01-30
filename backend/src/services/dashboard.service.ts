import { Income } from "../models/Income";
import { Expense } from "../models/Expense";
import { Employee } from "../models/Employee";
import { ExpenseCategory } from "../models/ExpenseCategory";
import { EmployeeTransaction } from "../models/EmployeeTransaction";

export class DashboardService {
  async getStats(userId: string, month?: number, year?: number): Promise<any> {
    const query: any = { user: userId };

    if (month && year) {
      const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
      query.date = { $gte: startDate, $lte: endDate };
    }

    const incomes = await Income.find(query);
    const expenses = await Expense.find(query);

    let totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    if (month && year) {
      const categories = await ExpenseCategory.find({
        user: userId,
        month,
        year,
      });
      totalExpense += categories.reduce((sum, cat) => sum + cat.amount, 0);

      const employees = await Employee.find({ user: userId, isActive: true });
      const transactions = await EmployeeTransaction.find({
        user: userId,
        month,
        year,
      });

      const totalSalaries =
        employees.reduce((sum, emp) => sum + emp.salary, 0) +
        transactions
          .filter((t) => t.type === "BONUS")
          .reduce((sum, t) => sum + t.amount, 0) -
        transactions
          .filter((t) => t.type === "DEDUCTION")
          .reduce((sum, t) => sum + t.amount, 0);

      totalExpense += totalSalaries;
    }

    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const balance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      balance,
      incomeCount: incomes.length,
      expenseCount: expenses.length,
    };
  }

  async getChartData(
    userId: string,
    month?: number,
    year?: number,
  ): Promise<any> {
    if (month && year) {
      return this.getMonthlyChartData(userId, month, year);
    } else {
      return this.getAllTimeChartData(userId);
    }
  }

  private async getMonthlyChartData(
    userId: string,
    month: number,
    year: number,
  ): Promise<any> {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const incomes = await Income.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const expenses = await Expense.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Daily timeline data
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyTimelineData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dateStr = currentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const dayIncomes = incomes.filter(
        (inc) => new Date(inc.date).getDate() === day,
      );
      const dayExpenses = expenses.filter(
        (exp) => new Date(exp.date).getDate() === day,
      );

      dailyTimelineData.push({
        date: dateStr,
        income: dayIncomes.reduce((sum, inc) => sum + inc.amount, 0),
        expense: dayExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      });
    }

    // Bar chart for last 6 months
    const startOf6Months = new Date(year, month - 6, 1);
    const sixMonthIncomes = await Income.find({
      user: userId,
      date: { $gte: startOf6Months, $lte: endDate },
    });
    const sixMonthExpenses = await Expense.find({
      user: userId,
      date: { $gte: startOf6Months, $lte: endDate },
    });

    const monthlyData: any = {};
    for (let i = 0; i < 6; i++) {
      const d = new Date(year, month - 1 - i, 1);
      const mStr = d.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      monthlyData[mStr] = {
        month: mStr,
        income: 0,
        expense: 0,
        sortKey: d.getTime(),
      };
    }

    sixMonthIncomes.forEach((inc) => {
      const mStr = new Date(inc.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (monthlyData[mStr]) monthlyData[mStr].income += inc.amount;
    });
    sixMonthExpenses.forEach((exp) => {
      const mStr = new Date(exp.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (monthlyData[mStr]) monthlyData[mStr].expense += exp.amount;
    });

    const barChartData = Object.values(monthlyData).sort(
      (a: any, b: any) => a.sortKey - b.sortKey,
    );

    // Pie chart
    const expenseCategories = await ExpenseCategory.find({
      user: userId,
      month,
      year,
    });
    const employees = await Employee.find({ user: userId, isActive: true });
    const transactions = await EmployeeTransaction.find({
      user: userId,
      month,
      year,
    });

    const pieDataMap: any = {};

    const salaryTotal =
      employees.reduce((sum, emp) => sum + emp.salary, 0) +
      transactions
        .filter((t) => t.type === "BONUS")
        .reduce((sum, t) => sum + t.amount, 0) -
      transactions
        .filter((t) => t.type === "DEDUCTION")
        .reduce((sum, t) => sum + t.amount, 0);

    if (salaryTotal > 0) {
      pieDataMap["Salaries (Net)"] = salaryTotal;
    }

    expenseCategories.forEach((cat) => {
      pieDataMap[cat.category] = (pieDataMap[cat.category] || 0) + cat.amount;
    });

    expenses.forEach((exp) => {
      pieDataMap[exp.category] = (pieDataMap[exp.category] || 0) + exp.amount;
    });

    const pieChartData = Object.keys(pieDataMap)
      .map((name) => ({ name, value: pieDataMap[name] }))
      .filter((item) => item.value > 0);

    return { barChartData, pieChartData, lineChartData: dailyTimelineData };
  }

  private async getAllTimeChartData(userId: string): Promise<any> {
    const incomes = await Income.find({ user: userId }).sort({ date: 1 });
    const expenses = await Expense.find({ user: userId }).sort({ date: 1 });

    const monthlyData: any = {};
    incomes.forEach((income) => {
      const month = new Date(income.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expense: 0 };
      }
      monthlyData[month].income += income.amount;
    });

    expenses.forEach((expense) => {
      const month = new Date(expense.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expense: 0 };
      }
      monthlyData[month].expense += expense.amount;
    });

    const barChartData = Object.values(monthlyData);

    const categoryData: any = {};
    expenses.forEach((expense) => {
      if (!categoryData[expense.category]) {
        categoryData[expense.category] = 0;
      }
      categoryData[expense.category] += expense.amount;
    });

    const pieChartData = Object.keys(categoryData).map((category) => ({
      name: category,
      value: categoryData[category],
    }));

    const timelineData = [...incomes, ...expenses]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reduce((acc: any[], item) => {
        const date = new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const existingEntry = acc.find((entry) => entry.date === date);

        const isIncome = "customer" in item; // Income has customer field

        if (existingEntry) {
          if (isIncome) {
            existingEntry.income += item.amount;
          } else {
            existingEntry.expense += item.amount;
          }
        } else {
          acc.push({
            date,
            income: isIncome ? item.amount : 0,
            expense: isIncome ? 0 : item.amount,
          });
        }
        return acc;
      }, []);

    return { barChartData, pieChartData, lineChartData: timelineData };
  }

  async getRecentTransactions(
    userId: string,
    month?: number,
    year?: number,
  ): Promise<any[]> {
    const query: any = { user: userId };

    if (month && year) {
      const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
      query.date = { $gte: startDate, $lte: endDate };
    }

    const incomes = await Income.find(query).sort({ createdAt: -1 }).limit(10);
    const expenses = await Expense.find(query)
      .sort({ createdAt: -1 })
      .limit(10);

    const transactions = [
      ...incomes.map((income) => ({ ...income.toObject(), type: "income" })),
      ...expenses.map((expense) => ({
        ...expense.toObject(),
        type: "expense",
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    return transactions;
  }
}
