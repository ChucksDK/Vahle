'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, updatePassword, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('De nye adgangskoder er ikke ens');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Den nye adgangskode skal være mindst 6 tegn');
      setLoading(false);
      return;
    }

    const { error: updateError } = await updatePassword(newPassword);
    
    if (updateError) {
      setError(updateError);
    } else {
      setSuccess('Adgangskode opdateret succesfuldt!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Brugerprofil</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Administrer din konto og indstillinger
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ← Tilbage til RSS
              </button>
            </div>

            {/* User Information */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Kontoinformation
              </h2>
              <div className="bg-gray-50 px-4 py-3 rounded-md">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Email: </span>
                  <span className="text-gray-900">{user.email}</span>
                </div>
                <div className="text-sm mt-1">
                  <span className="font-medium text-gray-700">Bruger ID: </span>
                  <span className="text-gray-900">{user.id}</span>
                </div>
              </div>
            </div>

            {/* Password Change Form */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Skift adgangskode
              </h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
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
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                    Ny adgangskode
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mindst 6 tegn"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700">
                    Bekræft ny adgangskode
                  </label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Gentag den nye adgangskode"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Opdaterer...' : 'Opdater adgangskode'}
                </button>
              </form>
            </div>

            {/* Sign Out */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Log ud
              </h2>
              <button
                onClick={handleSignOut}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Log ud af konto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}