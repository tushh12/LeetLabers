import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast"

export const useSubmissionStore = create((set) => ({
    isLoading: false,
    submissions: [], // This holds the array of all past submissions
    currentSubmission: null, // This holds the details of a single clicked/recent submission
    submissionCount: null,

    getAllSubmissions: async () => {
        try {
            set({ isLoading: true });
            const res = await axiosInstance.get("/submission/get-all-submissions");
            // ✅ FIX: Use 'submissions' (plural) to match backend response and initial state
            set({ submissions: res.data.submissions }); 
        } catch(error){
            console.log("Error getting all submissions", error);
            toast.error("Error getting all submissions");            
        } finally {
            set({ isLoading: false });
        }
    },

    getSubmissionForProblem: async (problemId) => {
        try {
            set({ isLoading: true });
            // ✅ FIX: Added leading slash "/"
            const res = await axiosInstance.get(`/submission/get-submission/${problemId}`);
            // ✅ FIX: Use 'submissions' (plural) 
            set({ submissions: res.data.submissions });
        } catch(error){
            console.log("Error getting submission for problem", error);
            toast.error("Error getting submissions for problem");
        } finally {
            set({ isLoading: false });
        }
    },

    getSubmissionCountForProblem: async (problemId) => {
        try {
            const res = await axiosInstance.get(`/submission/get-submissions-count/${problemId}`);
            set({ submissionCount: res.data.count });
        } catch(error){
            console.log("Error getting submissions count for the problem ", error);
            toast.error("Error getting submission count for problem");            
        }
    }, 

    // ✅ NEW: Call this right after your execution API returns success!
    setCurrentSubmission: (submissionData) => set({ currentSubmission: submissionData })
}));