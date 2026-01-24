import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layouts/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <AuthLayout>
      <div className="">
        <h2 className="text-3xl font-bold text-gray-100 mb-2 text-center">
          Welcome Back
        </h2>
        <p className="text-gray-400 mb-6 text-center">
          Sign in to continue to your account
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link
            to="/signUp"
            className="text-blue-400 font-semibold hover:text-blue-300"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
