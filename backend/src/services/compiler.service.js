import axios from "axios";
const mapLanguageToJDoodle = (lang) => {
    const map = {
        'javascript': { language: 'nodejs', versionIndex: '4' }, 
        'python': { language: 'python3', versionIndex: '4' },    
        'cpp': { language: 'cpp17', versionIndex: '1' },         
        'java': { language: 'java', versionIndex: '4' }          
    };
    return map[lang.toLowerCase()] || null;
};

// ✅ NEW: Added driverCode as the 2nd parameter
export const validateSolutionsAgainstTestcases = async (referenceSolutions, driverCode, testcases) => {
    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("JDoodle API credentials are missing from .env");
    }

    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
        const jdoodleConfig = mapLanguageToJDoodle(language);

        if (!jdoodleConfig) {
            throw { status: 400, message: `Language ${language} is not supported` };
        }

        // ✅ NEW: Grab the matching driver code and stitch it to the reference solution
        const specificDriver = driverCode[language] || "";
        const finalScriptToTest = `${solutionCode}\n\n${specificDriver}`;

        for (let i = 0; i < testcases.length; i++) {
            const testcase = testcases[i]; 

            const response = await axios.post('https://api.jdoodle.com/v1/execute', {
                script: finalScriptToTest, // ✅ NEW: Test the combined script
                language: jdoodleConfig.language,
                versionIndex: jdoodleConfig.versionIndex,
                stdin: testcase.input,
                clientId: clientId,
                clientSecret: clientSecret
            }, { timeout: 20000 });

            const actualOutput = (response.data.output || '').trim();
            const expectedOutput = (testcase.output || '').trim();

            console.log(`[JDoodle] Lang: ${language} | Testcase ${i + 1} -> Expected: "${expectedOutput}", Actual: "${actualOutput}"`);

            if (actualOutput !== expectedOutput) {
                throw {
                    status: 400,
                    message: `Testcase ${i + 1} failed for language ${language}. Expected: ${expectedOutput}, Got: ${actualOutput}`
                };
            }
        }
    }
    return true;
};