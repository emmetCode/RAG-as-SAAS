"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const { identifier, password } = formData;

      const loginPayload = identifier.includes("@")
        ? { email: identifier, password }
        : { username: identifier, password };

      const res = await fetch("http://localhost:8001/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Send cookies with request
        body: JSON.stringify(loginPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Assuming backend returns logged-in user info in data.user
      const user = data.data?.user;

      if (!user) {
        throw new Error("User info missing from login response");
      }

      // Redirect logic based on role and companyId
      if (user.role === "ADMIN" && !user.companyId) {
        router.push("/create-company");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Email or Username
        </label>
        <input
          type="text"
          name="identifier"
          value={formData.identifier}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring focus:ring-blue-400 mb-4"
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring focus:ring-blue-400 mb-4"
        />

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
