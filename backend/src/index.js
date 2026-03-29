import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes.js";


dotenv.config();

const app = express();

app.use(express.json());

app.get("/",(req,res) => {
    res.send("hello guys welcome to leetlab");    
})

app.use("/api/v1/auth",authRoutes)

app.listen(process.env.PORT, () => {
    console.log("server is running on the port 8080");
    
})