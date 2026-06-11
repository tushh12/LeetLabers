import {create} from "zustand"
import { axiosInstance } from "../lib/axios"

export const useAuthStore = create((set) => ({
    authUser:null,
    isLoading:false,
    isCheckingAuth:true,
    error:null,

    checkAuth: async() => {
        set({isCheckingAuth:true})
        try {
            const res = await axiosInstance.get("/auth/check");
            set({authUser:res.data.user});
            console.log("checkauth response",res.data);            
        } catch (error) {
            console.log("Error checking auth --->",error);            
            set({authUser:null , isCheckingAuth:false});
        } finally {
            set({isCheckingAuth:false})
        }
    },
    signup: async(name,email,password) => {
        set({isLoading:true,error:null});
        try {
            const response = await axiosInstance.post("/auth/register",{name,email,password});
            set({authUser:response.data.user , isLoading:false});
            return true;
        } catch (error) {
            set({
                error:error.response?.data?.error ||  "Signup failed",
                isLoading:false
            });
         return false;  
        }
    },
    login:async(email,password) => {
        set({isLoading:true,error:null});
        try {
            const response = await axiosInstance.post("/auth/login",{email,password});
            set({authUser:response.data.user ,isLoading:false});
            return true;
        } catch(error){
            set({
                error:error.response?.data?.error || "Login failed .Check credentails",
                isLoading:false
            });
            return false;
        }
    },
    logout: async () => {
        try{
            await axiosInstance.post("/auth/logout");
            set({authUser:null});
        } catch(error){
            console.error("Logout execution errror",error);
        }
    },
    
}))