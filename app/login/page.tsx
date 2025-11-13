'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.post<{ access: string; refresh: string }>(
        '/api/login/',
        { email, password }
      );
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);

      router.push('/dashboard');
    } catch (err: any) {
      let message = 'Login failed.';

      console.log(err);

      if (err?.response?.data) {
        // DRF usually sends {"non_field_errors": ["..."]}
        if (Array.isArray(err.response.data.non_field_errors)) {
          message = err.response.data.non_field_errors.join(' ');
        } else if (typeof err.response.data.detail === 'string') {
          message = err.response.data.detail;
        }
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold mb-6 text-center text-black">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded placeholder-gray-500 text-black"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded placeholder-gray-500 text-black"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      </form>
    </div>
  );
}
