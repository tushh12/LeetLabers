import { db } from "../libs/db.js";
import axios from "axios";

const mapLanguageIdToJDoodle = (idOrName) => {
    const map = {
        'javascript': { language: 'nodejs', versionIndex: '0', name: 'JavaScript' },
        'python': { language: 'python3', versionIndex: '3', name: 'Python' },
        'cpp': { language: 'cpp17', versionIndex: '0', name: 'C++' },
        'java': { language: 'java', versionIndex: '3', name: 'Java' },
        
        63: { language: 'nodejs', versionIndex: '0', name: 'JavaScript' }, 
        71: { language: 'python3', versionIndex: '3', name: 'Python' },     
        54: { language: 'cpp17', versionIndex: '0', name: 'C++' },         
        62: { language: 'java', versionIndex: '3', name: 'Java' }          
    };
    return map[String(idOrName).toLowerCase()] || null;
};

export const executeCode = async (req, res) => {
    try {
        const { source_code, language_id, stdin, expected_outputs, problemId } = req.body;
        const userId = req.user.id;

        if (
            !Array.isArray(stdin) || stdin.length === 0 ||
            !Array.isArray(expected_outputs) || expected_outputs.length !== stdin.length
        ) {
            return res.status(400).json({ error: "Invalid or missing test cases" });
        }

        const jdoodleConfig = mapLanguageIdToJDoodle(language_id);
        if (!jdoodleConfig) {
            return res.status(400).json({ error: "Unsupported language ID" });
        }

        // ✅ NEW: Fetch the problem from the DB to get the specific driver code!
        const problem = await db.Problem.findUnique({
            where: { id: problemId }
        });

        if (!problem) {
            return res.status(404).json({ error: "Problem not found in database" });
        }

        const clientId = process.env.JDOODLE_CLIENT_ID;
        const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

        // ✅ NEW: Get the driver code dynamically and stitch it!
        // We use the language_id string (e.g. 'javascript') to pull the correct hidden driver
        const langKey = String(language_id).toLowerCase();
        const specificDriverCode = problem.driverCode[langKey] || ""; 
        const finalScript = `${source_code}\n\n${specificDriverCode}`;

        const executionPromises = stdin.map(async (input) => {
            try {
                const response = await axios.post('https://api.jdoodle.com/v1/execute', {
                    script: finalScript, // ✅ NEW: Sending the combined dynamic script!
                    language: jdoodleConfig.language,
                    versionIndex: jdoodleConfig.versionIndex,
                    stdin: input,
                    clientId: clientId,
                    clientSecret: clientSecret
                }, { timeout: 10000 }); 

                return { success: true, data: response.data };
            } catch (error) {
                return { success: false, error: "Time Limit Exceeded" };
            }
        });
        
        const results = await Promise.all(executionPromises);
        let allPassed = true;

        const detailedResults = results.map((resultObj, i) => {
            const expected_output = (expected_outputs[i] || "").trim();

            if (!resultObj.success) {
                allPassed = false;
                return {
                    testcase: i + 1, passed: false, stdout: null,
                    expected: expected_output, stderr: resultObj.error,
                    compileOutput: null, status: "Time Limit Exceeded",
                    memory: undefined, time: undefined,
                };
            }

            const data = resultObj.data;
            const stdout = (data.output || "").trim(); 
            const passed = stdout === expected_output;
            
            if (!passed) allPassed = false;
            
            return {
                testcase: i + 1, passed, stdout, expected: expected_output,
                stderr: passed ? null : (data.error || null), 
                compileOutput: null, status: passed ? "Accepted" : "Wrong Answer",
                memory: data.memory ? `${data.memory} KB` : undefined,
                time: data.cpuTime ? `${data.cpuTime} s` : undefined,
            };
        });       
        
        const submission = await db.submission.create({
            data: {
                userId, problemId,
                sourceCode: source_code,
                language: jdoodleConfig.name, 
                stdin: stdin.join("\n"),
                stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
                status: allPassed ? "Accepted" : "Failed",
                stderr: detailedResults.some((r) => r.stderr) ? JSON.stringify(detailedResults.map((r) => r.stderr)) : null,
                compileOutput: detailedResults.some((r) => r.compileOutput) ? JSON.stringify(detailedResults.map((r) => r.compileOutput)) : null,
                time: detailedResults.some((r) => r.time) ? JSON.stringify(detailedResults.map((r) => r.time)) : null,
            },
        });

        if (allPassed) {
            await db.problemSolved.upsert({
                where: { userId_problemId: { userId: userId, problemId: problemId } },
                update: {}, 
                create: { userId: userId, problemId: problemId }
            });
        }

        const testCaseResults = detailedResults.map((result) => ({
            submissionId: submission.id,
            testcase: result.testcase, passed: result.passed,
            stdout: result.stdout, expected: result.expected,
            stderr: result.stderr, compileOutput: result.compileOutput,
            status: result.status, memory: result.memory, time: result.time,
        }));

        await db.testCaseResult.createMany({ data: testCaseResults });

        const submissionWithTestCases = await db.submission.findUnique({
            where: { id: submission.id },
            include: { testCases: true },
        });

        res.status(200).json({
            success: true,
            message: "Code Executed Successfully!",
            submission: submissionWithTestCases
        });        

    } catch (error) {
        console.error("Error executing code:", error.message);
        res.status(500).json({ error: "Failed to execute code" });
    }
};