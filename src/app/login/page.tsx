'use client';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            RSS Sales Intelligence
          </h1>
          <p className="text-gray-600">
            AI-powered RSS feed reader for Vahle Denmark
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">
              Authentication system is active but login form components need to be restored.
            </p>
            <div className="border-t pt-6">
              <p className="text-sm text-gray-500">
                For now, you can bypass authentication by temporarily disabling it in the code.
              </p>
              <a 
                href="/" 
                className="mt-4 inline-block text-blue-600 hover:text-blue-800 underline"
              >
                Try main app anyway
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}