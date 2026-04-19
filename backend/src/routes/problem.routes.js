import express from 'express';
import { authMiddleware, checkAdmin } from "../middleware/auth.middeware.js"
import { createProblem, deleteProblem, getAllProblem, getAllProblemSolvedByUser, getProblemByid, updateProblem } from '../controllers/problem.controllers.js';


const problemRoutes = express.Router();

problemRoutes.post("/create-problem" , authMiddleware,checkAdmin , createProblem)

problemRoutes.get("/get-all-problems" , authMiddleware , getAllProblem);

problemRoutes.get("/get-problem/:id" , authMiddleware , getProblemByid);


problemRoutes.put("/update-problem/:id" , authMiddleware , checkAdmin , updateProblem)


problemRoutes.delete("/delete-problem/:id" , authMiddleware , checkAdmin , deleteProblem)

problemRoutes.get("/get-solved-problems" , authMiddleware , getAllProblemsSolvedByUser);

export default problemRoutes;