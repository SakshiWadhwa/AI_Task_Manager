import { useState } from 'react';
import { useRouter } from 'next/router';
import { loginUser } from '../services/authService';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Handle form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Attempt login
      const response = await loginUser(email, password);

      // Redirect on successful login
      if (response) {
        router.push('/dashboard'); // Redirect to dashboard or home
      }
    } catch (err) {
      // Show error message if login fails
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200">
      <div className="bg-white p-8 rounded shadow-lg w-80">
        <h2 className="text-2xl mb-4 text-center">Login</h2>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-600" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-2"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-600" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-2"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-sm">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-500 hover:underline">
              Sign up
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
