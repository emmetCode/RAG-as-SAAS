'use client';

import React, { useState, ChangeEvent, FormEvent } from "react";

type Role = "NORMALUSER" | "ADMIN" | "COMPANYMEMBER";

interface RegisterForm {
  email: string;
  username: string;
  password: string;
  role: Role;
}

const roles: { value: Role; label: string }[] = [
  { value: "NORMALUSER", label: "Normal User" },
  { value: "COMPANYMEMBER", label: "Company Member" },
  { value: "ADMIN", label: "Admin" },
];

const Register: React.FC = () => {
  const [form, setForm] = useState<RegisterForm>({
    email: "",
    username: "",
    password: "",
    role: "NORMALUSER",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      console.log("Submitting register form:", form); // Debug log outgoing data

      const res = await fetch("http://localhost:8001/api/v1/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      console.log("Backend response:", data); // Debug backend response

      if (!res.ok) {
        setError(data?.message || "Failed to register");
      } else {
        setMessage(
          data?.message || "Registered successfully! Please verify your email."
        );
        setForm({ email: "", username: "", password: "", role: "NORMALUSER" });
      }
    } catch  {
   
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <br />
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="username">Username</label>
          <br />
          <input
            id="username"
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <br />
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="role">Role</label>
          <br />
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Register;
