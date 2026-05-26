import {create} from "zustand";
import {axiosInstance} from "../lib/axios.js"
import {toast} from "react-hot-toast"


export const useExecutionStore = create((set) => ({
    isExecuting:false,
    executionResult:null,

    executeCode : async(payload) => {
        try {
            set({isExecuting:true});
            const res = await axiosInstance.post("/problems/execute",payload);

            set({executionResult:res.data.submissions});
            toast.success("Exection Complete");
            return res.data.submissions
        } catch(error){
            console.log("Error executing code",error);
            toast.error(error.response?.data?.error || "Execution failed");
            return null            
        } finally{
            set({isExecuting:false})
        }
    },
    clearResult: () => set({executionResult:null})
}))