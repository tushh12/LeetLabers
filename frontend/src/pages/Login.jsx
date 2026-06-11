import { useState } from "react";
import {useAuthStore} from "../store/useAuthStore.js";
import  {useNavigate,Link}  from "react-router-dom";
import {Mail,Lock,LogIn} from "lucide-react"

export default function Login() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const {login,isLoading,error} = useAuthStore();

  const navigate = useNavigate();

  const handleLogin = async(e) => {
    e.preventDefault();

    const success = await login(email,password);
    if(success){
      navigate("/")
    }
  };
   return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 px-4">
    <div className="card w-full max-w-md bg-gray-900 border border-gray-800 shadow-2xl">
      <div className="card-body p-8">
      {/* Header*/}
      <div className="text-center mb-8">
      <h2 className="card-title text-3xl font-bold text-white justify-center gap-2 mb-2">
      <span className="text-blue-500">⚡</span> LeetLab
        </h2>
        <p className="text-gray-400 text-sm">Welcome back ! Ready to compile some code?</p>
      </div>
      {/*Error Message */}
      {error &&(
        <div className="alert alert-error bg-red-500/10 border border-red-500/30 text-red-400 text-sm py-3 rounded-lg mb-6">
          <span>{error}</span>
          </div>
      )}
      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        {/*email field */}
        <div className="form-control w-full">
          <label className="label pt-0">
            <span className="label-text font-semibold text-gray-300">Email Address</span>
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 w-5 h-5 text-gray-500"/>
            <input 
              type="email"
              placeholder="name@mail.com"
              className="input input-bordered w-full bg-gray-950 border-gray-800 focus:border-blue-500 text-white pl-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              />
          </div>
        </div>
        {/*Passwod field */}
        <div className="form-control w-full">
          <label className="label pt-0">
            <span className="label-text font-semibold text-gray-300">Passwords</span>
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 w-5 h-5 text-gray-500"/>
            <input
              type="password"
              placeholder="......"
              className="input input-bordered w-full bg-gray-950 border-gray-800 focus:border-blue-500 text-white pl-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              />
          </div>
        </div>
        {/* Action Button */}
        <div className="form-control pt-2">
          <button 
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full bg-blue-600 hover:bg-blue-700  text-white font-bold tracking-wide transition-all duration-200">
              {isLoading ? (
                <span className="Loading loading-spinner text-white"></span>
              ) : (
                <>
                <LogIn className ="w-5 h-5 mr-1"/>
                Sign In
                </>
              )}
            </button>
        </div>
      </form>
      {/* Footer link */}
      <div className="text-center mt-6 pt-4 border-t border-gray-800/60">
            <p className="text-gray-400 text-sm">
              Don't have an account?{""}
              <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create one now
              </Link>
            </p>
      </div>
      </div>      
      </div> 
    </div>
   )
}