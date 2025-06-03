'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCompanyForm() {
  const [name, setName] = useState('');
  const [allowedEmails, setAllowedEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8001/api/v1/company/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 👈 Send cookies
        body: JSON.stringify({
          name,
          allowedEmails: allowedEmails
            .split(',')
            .map((email) => email.trim())
            .filter((email) => email.includes('@')),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Company creation failed');
      }

      setSuccessMsg('Company created successfully!');
      router.push('/'); // 👈 Redirect to homepage instead of /dashboard
    } catch  {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-12 bg-white rounded-2xl shadow-md border">
      <h2 className="text-2xl font-semibold mb-4">Register Your Company</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Company Name</label>
          <input
            type="text"
            className="w-full border rounded-md p-2 mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Allowed Emails (comma separated)</label>
          <input
            type="text"
            className="w-full border rounded-md p-2 mt-1"
            placeholder="admin@domain.com, user@domain.com"
            value={allowedEmails}
            onChange={(e) => setAllowedEmails(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Company'}
        </button>
      </form>
    </div>
  );
}
