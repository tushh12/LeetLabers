import express from "express"
import {authMiddleware} from "../middleware/auth.middeware.js"
import {getAllSubmission,getAllTheSubmissionsForProblem,getSubmissonsForProblem} from "../controllers/submission.controller.js"

const submissionRoutes = express.Router()


submissionRoutes.get("/get-all-submissions" , authMiddleware , getAllSubmission);
submissionRoutes.get("/get-submission/:problemId" , authMiddleware , getSubmissonsForProblem)

submissionRoutes.get("/get-submissions-count/:problemId" , authMiddleware , getAllTheSubmissionsForProblem)


export default submissionRoutes;