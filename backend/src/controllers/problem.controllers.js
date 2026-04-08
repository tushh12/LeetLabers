import {db} from "../libs/db.js"
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.libs.js";


export const createProblem = async (req,res) => {
  const {title,description,difficulty,tags,examples,constraints,
    testcases,codeSnippets,referenceSolutions} = req.body;

    try {
        for(const [language,solutionCode] of Object.entries(referenceSolutions)){
            const languageId = getJudge0LanguageId(language);
            if(!languageId){
                return res.status(400).json({error :`Language ${language} is not supported`});
            }
        const submissons = testcases.map(({input,output}) => ({
            source_code:solutionCode,
            language_id:languageId,
            stdin:input,
            expected_output:output,
        }))
        const submissonsResults = await submitBatch(submissons);
        const tokens = submissonsResults.map((res) => res.token);
        const results = await pollBatchResults(tokens);
        for(let i=0;i<results.length;i++){
            const result = results[i];
            console.log("RESULT",result);
            if(result.status.id !== 3){
                return res.status(400).json({
                    error:`Testcase ${i+1} failed for language ${language}`,
                });
            }
        }
    }
    const newProblem = await db.Problem.create({
        data:{
           title,
           description,
           difficulty,
           tags,
           examples,
           constraints,
           testcases,
           codeSnippets,
           referenceSolutions,
           userId: req.user.id, 
        },
    });
    return res.status(201).json({
        sucess:true,
        message:"Problem created successfully",
        problem: newProblem,
    })
   } catch(error){
    console.log(error);
    return res.status(500).json({
        error:"error while creating problem"
    });    
   }

};
export const getAllProblem = async (req,res) => {
     try {
        const problems = await db.Problem.findMany({
            include : {
                solvedBy:{
                    where:{
                        userId:req.user.id
                    }
                }
            }
        });
        if(!problems){
            res.status(404).json({
                message:"No problems found"
            })
        }
        res.status(200).json({
            sucess:true,
            message:"All Problem fetched successfully",
            problem:problems
        })
     } catch (error) {
        console.error(error);
        // why we here have to put return here 
        return res.status(500).json({
            error:"Error while fetching problem"
        })        
     }
};
export const getProblemByid = async (req,res) => {
     const {id} = req.params;
     try {
        const problem = await db.Problem.findUnique({
            where:{
                id,
            },
        });
        if(!problem){
            return res.status(403).json({error:"problem not found."});
        }
        return res.status(200).json({
            sucess:true,
            message:"get problem by id",
            problem
        })
     } catch (error) {
        console.log("error-",error);        
        return res.status(500).json({            
            error:"Error while getting problem by id"
        })
     }
};
export const updateProblem = async (req,res) => {
    const {id} = req.params;
    const {
        title,description,difficulty,tags,examples,constraints,testcases,codeSnippets,referenceSolutions
    }  = req.body;
    try {
       for(const [language,solutionCode] of Object.entries(referenceSolutions)){
        const languageId = getJudge0LanguageId(language);
        if(!languageId){
            return res.status(400).json({
                error:`Language ${language} is not supported`
            });
        }
        const submissions = testcases.map(({input,output}) => ({
            source_code:solutionCode,
            language_id:languageId,
            stdin:input,
            expected_output:output
       }))
       const submissonsResults = await submitBatch(submissions);
       const tokens = submissonsResults.map((res) => res.tokens);
       const results = await pollBatchResults(tokens);
       for(let i=0;i<results.length;i++){
        const result = results[i];
        console.log("Result-",result);
        if(result.status.id !== 3){
            return res.status(400).json({
                error:`Testcase ${i+1} failed for language ${language}`,
            });
        }        
       }        
    }
    const updatedProblem = await db.Problem.update({
        where:{
           id:id
        },
        data:{
             title,
           description,
           difficulty,
           tags,
           examples,
           constraints,
           testcases,
           codeSnippets,
           referenceSolutions,
           userId: req.user.id, 
           problemId:req.Problem.id,
        }
    });
    return res.status(200).json({
        sucess:true,
        message:"Problem created successfully",
        problem:updatedProblem,
    })
   } catch (error) {
        console.log(error);
        return res.status(500).json({
            error:"error while creating problem"
        })        
    }
};
export const deleteProblem = async(req,res) => {
    const {id} = req.params;
    try {
        const problem = await db.Problem.findUnique({
            where:{
                id,
            }
        })
        if(!problem){
            return res.status(404).json({
                error:"Problem not found"
            })
        }
        await db.Problem.delete({
            where:{
                id
            }
        })
        res.status(200).json({
            sucess:true,
            message:"Problem deleted Successfully",
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({
            error:"Error while deleting the problem"
        });        
    }
};
export const getAllProblemSolvedByUser = async (req,res) => {
    try {
        const problems = await db.Problem.findMany({
            where:{
                solvedBy:{
                    some:{
                    userId:req.user.id
                    }
                }
            },
            include:{
                solvedBy:{
                    where:{
                        userId:req.user.id
                    }
                }
            }
        })
        return res.status(200).json({
            success:true,
            message:"Problems fetched successfully",
            problems
        })
    } catch(error){
        console.error("Error fetching problems",error);
        res.status(500).json({
            error:"failed to fetch problems"
        })
    }
}; 