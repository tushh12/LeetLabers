import { create } from "zustand";
import {toast} from "react-hot-toast"
import { axiosInstance } from "../lib/axios.js";

export const useProblemStore = create((set) => ({
    problems: [], 
    problem: null,
    solvedProblems:[],
    isProblemsLoading:false,
    isProblemLoading:false,
    getAllProblems : async() => {
        try {
            set({isProblemLoading : true});
            const res = await axiosInstance.get("/problems/get-all-problems");
            set({problems:res.data.problems});
        } catch(error){
            console.log("Error getting all problems",error);
            toast.error("Error in getting problems");            
        } finally{
            set({isProblemLoading:false});
        }
    },
    getProblemById: async(id) => {
        try {
            set({isProblemLoading:true});
            const res = await axiosInstance.get(`/probelems/get-problems/${id}`);
            set({ problem: res.data.problem});
        } catch(error){
            console.log("Error getting problem by id",error);
            toast.error("Error in getting problem");            
        } finally {
            set({isProblemLoading:false});
        }
    },
    getSolvedProblemByUser: async () => {
        try {
            const res = await axiosInstance.get("problems/get-solved-problem");
            set({solvedProblems:res.data.problems})
        } catch(error){
            console.log("Error getting solved problems",error);
            toast.error("Error getting solved problems");
        }
    }


}))