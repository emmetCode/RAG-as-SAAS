"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterSuperAdmin() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const registerSuperAdmin = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8001/api/v1/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          username,
          password,
          role: "SUPERADMIN",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Super admin registration failed");

      setMessage("Super Admin registered successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/superadminlogin");
      }, 1500);
    } catch (err) {
      setError(err.message || "Error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-md border">
      <h2 className="text-2xl font-bold mb-4">Register Super Admin</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          registerSuperAdmin();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block font-medium">Super Admin Email</label>
          <input
            type="email"
            className="w-full border rounded-md p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium">Username</label>
          <input
            type="text"
            className="w-full border rounded-md p-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium">Password</label>
          <input
            type="password"
            className="w-full border rounded-md p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register Super Admin"}
        </button>
      </form>
      {message && <p className="text-green-600 mt-4">{message}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
