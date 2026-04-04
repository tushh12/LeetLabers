import axios from "axios"

export const getJudge0LanguageId = (language) => {
    const languageMap = {
        "PYTHON":71,
        "JAVA":62,
        "JAVASCRIPT":63,
    }
    return languageMap[language.toUpperCase()];
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve,ms))
export const pollBatchResults = async(tokens) => {
    let attempts = 0;
    let maximumattempts = 20;
    while(attempts < maximumattempts){
        const {data} = await axios.get(`${process.env.JUDGE0_API_URI}/submissions/batch`,{
            params:{
                tokens:tokens.join(","),
                base64_encoded:false,
            }
        })
        const results = data.submissions;
        const isAllDone = results.every(
            (result) => result.status.id !== 1 && result.status.id !== 2
        )
        if(isAllDone) return results
        await sleep(1000) //  1 second
        attempts++;
    }
    throw new Error ("judge0 took long to respond")
}
export const submitBatch = async (submissions)=> {
    const {data} = await axios.post(`${process.env.JUDGE0_API_URI}/submissions/batch?base64_encoded=false`,{
        submissions
    })
    console.log("submission result",data);
    return data     
}
export function getLanguageName(languageId) {
    const LANGUAGE_NAMES = {
        74:"TypeScript",
        63:"JavaScript",
        71:"Python",
        62:"Java",
    }
    return LANGUAGE_NAMES[languageId] || "Unknown"
}
