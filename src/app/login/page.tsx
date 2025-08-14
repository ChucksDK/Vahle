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
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Authentication System
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Login functionality is being restored
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md">
              ✅ Page is now loading correctly!
            </div>
            
            <div className="space-y-2">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email (Demo)
                </label>
                <input
                  id="email"
                  type="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="din@email.dk"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password (Demo)
                </label>
                <input
                  id="password"
                  type="password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Din adgangskode"
                />
              </div>
              
              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Demo Login Form (Working!)
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              The form is displaying correctly now!<br/>
              Authentication functionality will be restored next.
            </p>
            <a 
              href="/" 
              className="mt-2 inline-block text-blue-600 hover:text-blue-800 underline"
            >
              Access Main App (No Login Required For Now)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}