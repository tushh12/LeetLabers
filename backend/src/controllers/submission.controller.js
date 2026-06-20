import {db} from "../libs/db.js"



export const getAllSubmission = async(req,res) => {
    try {
        const userId = req.user.id;

        // ✅ FIX 2: db.submission (singular) to match Prisma Schema
        const submissions = await db.submission.findMany({
            where:{
                userId:userId
            }
        })
        res.status(200).json({
            success:true,
            message:"Submissions fetched successfully",
            submissions
        })
    } catch (error) {
        console.error("fetch Submissions error",error);
        res.status(500).json({error:"failed to fetch submissions"})
    }
}

export const getSubmissonsForProblem = async(req,res) => {
    try {
        const userId = req.user.id;
        const problemId = req.params.problemId;

        // ✅ FIX 3: db.submission (singular) to match Prisma Schema
        const submissions = await db.submission.findMany({
            where:{
                userId:userId,
                problemId:problemId
            }
        })
        res.status(200).json({
            success:true,
            message:"Submissions fetched successfully",
            submissions
        })
    } catch(error){
            console.error("fetch submissions error",error);
            res.status(500).json({error:"failed to fetch submissions"})
    }
}

export const getAllTheSubmissionsForProblem = async(req,res) => {
    try {
        const problemId = req.params.problemId;
        const submissionCount = await db.submission.count({
            where:{
                problemId:problemId
            }
        })
        res.status(200).json({
            success:true,
            message:"Submissions fetched successfully",
            count:submissionCount
        })
    } catch(error){
        console.error("fetched submissions error",error);
        res.status(500).json({error:"failed to fetch submissions "})
    }
}