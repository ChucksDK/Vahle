'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RegisterFormProps {
  onToggleMode?: () => void;
  showToggle?: boolean;
}

export default function RegisterForm({ onToggleMode, showToggle = true }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Adgangskoderne er ikke ens');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Adgangskoden skal være mindst 6 tegn');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await signUp(email, password);
    
    if (signUpError) {
      setError(signUpError);
    } else {
      setSuccess('Konto oprettet! Tjek din email for at bekræfte din konto.');
    }
    
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Opret konto</h2>
        <p className="mt-2 text-sm text-gray-600">
          Opret din RSS Sales Intelligence konto
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            {success}
          </div>
        )}
        
        <div>
          <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="din@email.dk"
          />
        </div>
        
        <div>
          <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
            Adgangskode
          </label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Mindst 6 tegn"
          />
        </div>
        
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
            Bekræft adgangskode
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Gentag din adgangskode"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Opretter konto...' : 'Opret konto'}
        </button>
      </form>
      
      {showToggle && onToggleMode && (
        <p className="text-center text-sm text-gray-600">
          Har du allerede en konto?{' '}
          <button
            onClick={onToggleMode}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Log ind
          </button>
        </p>
      )}
    </div>
  );
}