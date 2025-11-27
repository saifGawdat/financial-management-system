import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import API from "../../api/axios";
import {
  IoAddCircleOutline,
  IoStorefrontOutline,
  IoTrashOutline,
  IoPencilOutline,
} from "react-icons/io5";

const Warehouse = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    description: "",
  });

  const fetchWarehouses = async () => {
    try {
      const res = await API.get("/warehouse");
      setWarehouses(res.data);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        // Update existing warehouse
        await API.put(`/warehouse/${editingId}`, formData);
      } else {
        // Add new warehouse
        await API.post("/warehouse", formData);
      }
      setIsModalOpen(false);
      setEditMode(false);
      setEditingId(null);
      setFormData({
        name: "",
        location: "",
        capacity: "",
        description: "",
      });
      fetchWarehouses();
    } catch (error) {
      console.error("Error saving warehouse:", error);
    }
  };

  const handleEdit = (warehouse) => {
    setEditMode(true);
    setEditingId(warehouse._id);
    setFormData({
      name: warehouse.name,
      location: warehouse.location,
      capacity: warehouse.capacity,
      description: warehouse.description || "",
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditMode(false);
    setEditingId(null);
    setFormData({
      name: "",
      location: "",
      capacity: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this warehouse?")) {
      try {
        await API.delete(`/warehouse/${id}`);
        fetchWarehouses();
      } catch (error) {
        console.error("Error deleting warehouse:", error);
      }
    }
  };

  const totalCapacity = warehouses.reduce(
    (sum, warehouse) => sum + warehouse.capacity,
    0
  );

  return (
    <DashboardLayout>
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Warehouse Management
            </h1>
            <p className="text-gray-600 mt-1">
              Total Warehouses:{" "}
              <span className="text-purple-600 font-bold text-xl">
                {warehouses.length}
              </span>{" "}
              | Total Capacity:{" "}
              <span className="text-purple-600 font-bold text-xl">
                {totalCapacity.toLocaleString()}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <IoAddCircleOutline size={20} />
              Add Warehouse
            </Button>
          </div>
        </div>

        <Card>
          {warehouses.length === 0 ? (
            <div className="text-center py-12">
              <IoStorefrontOutline
                size={64}
                className="mx-auto text-gray-300 mb-4"
              />
              <p className="text-gray-500 text-lg">No warehouses yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Click "Add Warehouse" to create your first warehouse
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {warehouses.map((warehouse) => (
                <div
                  key={warehouse._id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <IoStorefrontOutline
                          size={24}
                          className="text-purple-600"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {warehouse.name}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          📍 {warehouse.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(warehouse)}
                        className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                        title="Edit warehouse"
                      >
                        <IoPencilOutline size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(warehouse._id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Delete warehouse"
                      >
                        <IoTrashOutline size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Capacity:</span>
                      <span className="font-bold text-purple-600">
                        {warehouse.capacity.toLocaleString()}
                      </span>
                    </div>
                    {warehouse.items && warehouse.items.length > 0 && (
                      <div className="mt-2">
                        <span className="text-gray-600 text-sm">Items:</span>
                        <span className="font-semibold text-gray-700 ml-2">
                          {warehouse.items.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {warehouse.createdAt && (
                    <div className="mt-3 text-xs text-gray-400">
                      Added:{" "}
                      {new Date(warehouse.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editMode ? "Edit Warehouse" : "Add New Warehouse"}
        >
          <form onSubmit={handleSubmit}>
            <Input
              label="Warehouse Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Main Storage"
              required
            />
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Building A, Floor 2"
              required
            />
            <Input
              label="Capacity"
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g., 1000"
              required
            />
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add notes about this warehouse..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                rows="3"
              />
            </div>
            <Button type="submit" className="w-full">
              {editMode ? "Update Warehouse" : "Add Warehouse"}
            </Button>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Warehouse;
