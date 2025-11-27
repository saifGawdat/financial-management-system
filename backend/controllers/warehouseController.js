const Warehouse = require("../models/Warehouse");

exports.addWarehouse = async (req, res) => {
  try {
    const { name, location, capacity } = req.body;
    const warehouse = new Warehouse({
      name,
      location,
      capacity,
      user: req.userId,
    });
    await warehouse.save();
    res.status(201).json(warehouse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.json(warehouses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateWarehouse = async (req, res) => {
  try {
    const { name, location, capacity } = req.body;

    let warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({ error: "Warehouse not found" });
    }

    // Make sure user owns the warehouse
    if (warehouse.user.toString() !== req.userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

    // Update warehouse fields
    warehouse.name = name || warehouse.name;
    warehouse.location = location || warehouse.location;
    warehouse.capacity = capacity || warehouse.capacity;

    await warehouse.save();
    res.json(warehouse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({ error: "Warehouse not found" });
    }

    // Make sure user owns the warehouse
    if (warehouse.user.toString() !== req.userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

    await Warehouse.findByIdAndDelete(req.params.id);
    res.json({ message: "Warehouse deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
