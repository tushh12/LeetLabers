import {db} from "../libs/db.js"
import { getJudge0LanguageId, submitBatch } from "../libs/judge0.libs.js";


export const createProblem = async (req,res) => {
  const {title,description,difficulty,tags,examples,constraints,
    testcases,codeSnippets,referenceSolutions} = req.body;

    try {
        for(const [language,solutionCode] of Object.entries(referenceSolutions)){
            const languageId = getJudge0LanguageId(language);
            if(!languageId)
                return res.status(400).json({error :`Language ${language} is not supported`});
        }
        const submissons = testcases.map(({input,output}) => ({
            source_code:solutionCode,
            languageId:languageId,
            stdin:input,
            expected_output:output,
        }))
        const submissonsResults = await submitBatch(submissons);
        const token = submissonsResults.map((res) => res.token);
        const result = await pollBatchResults(token);
        for(let i=0;i<result.length;i++){
            const result = result[i];
            console.log("RESULT",result);
            if(result.status.id !== 3){
                return res.status(400).json({
                    error:`Testcase ${i+1} failed for language ${language}`,
                });
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