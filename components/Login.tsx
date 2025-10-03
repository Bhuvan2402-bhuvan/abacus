import React, { useState } from 'react';

interface LoginProps {
  onLogin: (user: string, pass: string) => void;
  error: string | null;
  title: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, error, title }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-2xl max-w-md w-full p-8 mx-auto"
      aria-labelledby="login-title"
    >
      <h2 id="login-title" className="text-2xl sm:text-3xl font-bold text-center text-amber-800 dark:text-amber-300 mb-6">
        {title}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            autoComplete="username"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center" role="alert">
            {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;