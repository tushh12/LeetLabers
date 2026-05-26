import {create} from "zustand"
import axios from "axios"

const API_URL="http://localhost:8080/api/v1/auth";

export const useAuthStore = create((set) => ({
        token:localStorage.getItem('token') || null,
        isLoading:false,
        error:null,
    signup: async(name,email,password) => {
        set({isLoading:true , error:null});
        try {
            const response = await axios.post(`${API_URL}/register`, {name,email,password});
            const token = response.data.token;

            localStorage.setItem("token",token);
            set({token:token , isLoading:false});
            return true;
        } catch(error){
            set({
                error:error.response?.data?.error || "Signup failed.",
                isLoading:false
            });
            return false;
        }
    },
    login:async(email,password) => {
        set({isLoading:true,error:null});
        try {
            const response = await axios.post(`${API_URL}/login`,{email,password});
            const token =  response.data.token;

            localStorage.setItem('token',token);
            set({token:token,isLoading:false});
            return true;
        } catch(error){
            set({
                error:error.response?.data?.error || "Login failed . Check credentials",
                isLoading:false
            });
            return false;
        }
    },
    logout: () => {
        localStorage.removeItem('token');
        set({token:null})
    }
}));