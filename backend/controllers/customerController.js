const Customer = require("../models/Customers");
const Income = require("../models/Income");
const { calculateMonthlySummary } = require("./monthlySummaryController");

// Add customer
exports.addCustomer = async (req, res) => {
  try {
    const { name, brandName, phoneNumber, monthlyAmount } = req.body;

    const customer = new Customer({
      user: req.userId,
      name,
      brandName,
      phoneNumber,
      monthlyAmount,
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all customers for user with payment status for a specific month/year
exports.getCustomers = async (req, res) => {
  try {
    const { month, year } = req.query;
    const customers = await Customer.find({ user: req.userId }).sort({
      createdAt: -1,
    });

    if (!month || !year) {
      return res.json(customers);
    }

    // Find all income records for these customers in the given month/year
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(
      parseInt(year),
      parseInt(month),
      0,
      23,
      59,
      59,
      999
    );

    const payments = await Income.find({
      user: req.userId,
      customer: { $in: customers.map((c) => c._id) },
      date: { $gte: startDate, $lte: endDate },
    });

    // Map payment info to customers
    const customerWithStatus = customers.map((customer) => {
      const payment = payments.find(
        (p) => p.customer.toString() === customer._id.toString()
      );
      return {
        ...customer.toObject(),
        isPaid: !!payment,
        paymentId: payment ? payment._id : null,
      };
    });

    res.json(customerWithStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Mark customer as paid for a specific month
exports.payCustomer = async (req, res) => {
  try {
    const { month, year } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    if (customer.user.toString() !== req.userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

    // Define the payment date (default to 1st of the month if not current month/year)
    const now = new Date();
    let paymentDate;
    if (
      now.getMonth() + 1 === parseInt(month) &&
      now.getFullYear() === parseInt(year)
    ) {
      paymentDate = now;
    } else {
      paymentDate = new Date(parseInt(year), parseInt(month) - 1, 15); // Middle of the month
    }

    // Update lastPaidDate only if it's more recent than the current one
    if (!customer.lastPaidDate || paymentDate > customer.lastPaidDate) {
      customer.lastPaidDate = paymentDate;
      await customer.save();
    }

    // Create Income record linked to customer
    const income = new Income({
      user: req.userId,
      customer: customer._id,
      title: `Monthly payment from ${customer.name}${
        customer.brandName ? ` (${customer.brandName})` : ""
      }`,
      amount: customer.monthlyAmount,
      category: "customer payment",
      date: paymentDate,
      description: `Monthly payment for ${month}/${year}`,
    });

    await income.save();

    // Trigger summary recalculation
    await calculateMonthlySummary(req.userId, parseInt(month), parseInt(year));

    res.json({ message: "Payment processed successfully", customer, income });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Undo payment (Mark as unpaid)
exports.unpayCustomer = async (req, res) => {
  try {
    const { month, year } = req.body;
    const customerId = req.params.id;

    // Find the income record for this customer in this month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(
      parseInt(year),
      parseInt(month),
      0,
      23,
      59,
      59,
      999
    );

    const income = await Income.findOne({
      user: req.userId,
      customer: customerId,
      date: { $gte: startDate, $lte: endDate },
    });

    if (!income) {
      return res.status(404).json({ error: "Payment record not found" });
    }

    await Income.findByIdAndDelete(income._id);

    // Recalculate summary
    await calculateMonthlySummary(req.userId, parseInt(month), parseInt(year));

    // Optional: Update lastPaidDate by finding the next most recent payment
    const lastPayment = await Income.findOne({
      user: req.userId,
      customer: customerId,
    }).sort({ date: -1 });

    const customer = await Customer.findById(customerId);
    customer.lastPaidDate = lastPayment ? lastPayment.date : null;
    await customer.save();

    res.json({ message: "Payment reversed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    if (customer.user.toString() !== req.userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
