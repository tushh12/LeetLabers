import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { Link } from "react-router-dom";


export default function SignUp() {
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  const { signup,isLoading,error} = useAuthStore();

  const handleSignup = async(e) => {
    e.preventDefault();
    await signup(name , email, password);
  };
  return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 border border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
              {error}
          </div>
          )}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-1 text-sm">Name</label>
              <input
                type="text"
                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                />
            </div>
            <div>
            <label className="block text-gray-400 mb-1 text-sm">Email</label>
            <input 
               type="email"
               className="w-full bg-gray-900 border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
               />
            </div>
             <div>
            <label className="block text-gray-400 mb-1 text-sm">Password</label>
            <input 
               type="password"
               className="w-full bg-gray-900 border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
               />
            </div>
          <button 
             type="submit"
             disabled={isLoading}
             className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-2 px-4 rounded transition-colors"
             >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
             </button>
          </form>
          <p className="text-gray-400 text-sm text-center mt-6">
            Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Log in</Link>
          </p>
          </div>
        </div>
  )
}