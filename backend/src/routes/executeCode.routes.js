import express from "express";
import { authMiddleware } from "../middleware/auth.middeware.js";
import { executeCode } from "../controllers/executecontrollers.js";


const executionRoute = express.Router();


executionRoute.post("/" , authMiddleware , executeCode)



export default executionRoute;