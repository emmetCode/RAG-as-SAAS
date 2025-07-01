"use client";

import React, { useState } from "react";

export default function RegisterCompanyAdminEmail() {
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const registerCompanyAdminEmail = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8001/api/v1/registerCompanyAdminEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ allowedEmails: adminEmail }),


      });

console.log("Sending email:", adminEmail);

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to register company admin email");

      setMessage("Company admin email registered successfully!");
      // Optionally redirect somewhere else here
    } catch (err) {
      setError(err.message || "Error occurred while adding company admin email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-md border">
      <h2 className="text-2xl font-bold mb-4">Register Company Admin Email</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          registerCompanyAdminEmail();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block font-medium">Company Admin Email</label>
          <input
            type="email"
            className="w-full border rounded-md p-2"
            placeholder="admin@company.com"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
          disabled={loading}
        >
          {loading ? "Registering..." : "Add Company Admin Email"}
        </button>
      </form>
      {message && <p className="text-green-600 mt-4">{message}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
