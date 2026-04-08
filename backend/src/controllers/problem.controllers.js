import {db} from "../libs/db.js"
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.libs.js";


export const createProblem = async (req,res) => {
  const {title,description,difficulty,tags,examples,constraints,
    testcases,codeSnippets,referenceSolutions} = req.body;

    try {
        for(const [language,solutionCode] of Object.entries(referenceSolutions)){
            const languageId = getJudge0LanguageId(language);
            if(!languageId)
                return res.status(400).json({error :`Language ${language} is not supported`});
        
        const submissons = testcases.map(({input,output}) => ({
            source_code:solutionCode,
            language_id:languageId,
            stdin:input,
            expected_output:output,
        }))
        const submissonsResults = await submitBatch(submissons);
        const tokens = submissonsResults.map((res) => res.tokens);
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
    const newProblem = await db.problem.create({
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
        message:"Message created successfully",
        problem: newProblem,
    })
   } catch(error){
    console.log(error);
    return res.status(500).json({
        error:"error while creating problem"
    });    
   }

}
export const getAllProblem = async (req,res) => {
     try {
        const problems = await db.problem.findMany({
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