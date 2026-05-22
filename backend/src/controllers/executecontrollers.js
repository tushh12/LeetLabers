import { db } from "../libs/db.js";
import axios from "axios";

// 1. Language Bridge (Translates Judge0 IDs or Strings to JDoodle format)
const mapLanguageIdToJDoodle = (idOrName) => {
    const map = {
        // If frontend sends strings
        'javascript': { language: 'nodejs', versionIndex: '0', name: 'JavaScript' },
        'python': { language: 'python3', versionIndex: '3', name: 'Python' },
        'cpp': { language: 'cpp17', versionIndex: '0', name: 'C++' },
        'java': { language: 'java', versionIndex: '3', name: 'Java' },
        
        // If frontend sends Judge0 IDs
        63: { language: 'nodejs', versionIndex: '0', name: 'JavaScript' }, // JS
        71: { language: 'python3', versionIndex: '3', name: 'Python' },     // Python
        54: { language: 'cpp17', versionIndex: '0', name: 'C++' },         // C++
        62: { language: 'java', versionIndex: '3', name: 'Java' }          // Java
    };
    return map[String(idOrName).toLowerCase()] || null;
};

export const executeCode = async (req, res) => {
    try {
        const { source_code, language_id, stdin, expected_outputs, problemId } = req.body;
        const userId = req.user.id;

        // 1. Validation: Ensure test cases exist and align
        if (
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length
        ) {
            return res.status(400).json({ error: "Invalid or missing test cases" });
        }

        const jdoodleConfig = mapLanguageIdToJDoodle(language_id);
        if (!jdoodleConfig) {
            return res.status(400).json({ error: "Unsupported language ID" });
        }

        const clientId = process.env.JDOODLE_CLIENT_ID;
        const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

        // 2. Prepare and send batch to JDoodle (with Infinite Loop Protection)
        const executionPromises = stdin.map(async (input) => {
            try {
                const response = await axios.post('https://api.jdoodle.com/v1/execute', {
                    script: source_code,
                    language: jdoodleConfig.language,
                    versionIndex: jdoodleConfig.versionIndex,
                    stdin: input,
                    clientId: clientId,
                    clientSecret: clientSecret
                }, { timeout: 10000 }); // 10-second kill switch

                return { success: true, data: response.data };
            } catch (error) {
                // If it times out or fails, catch it so Promise.all doesn't explode
                return { success: false, error: "Time Limit Exceeded" };
            }
        });
        
        const results = await Promise.all(executionPromises);
        let allPassed = true;

        // 3. Grade the results
        const detailedResults = results.map((resultObj, i) => {
            const expected_output = (expected_outputs[i] || "").trim();

            // Handle Timeouts or Execution Failures
            if (!resultObj.success) {
                allPassed = false;
                return {
                    testcase: i + 1,
                    passed: false,
                    stdout: null,
                    expected: expected_output,
                    stderr: resultObj.error,
                    compileOutput: null,
                    status: "Time Limit Exceeded",
                    memory: undefined,
                    time: undefined,
                };
            }

            // Handle Successful Executions
            const data = resultObj.data;
            const stdout = (data.output || "").trim(); 
            const passed = stdout === expected_output;
            
            if (!passed) {
                allPassed = false;
            }
            
            return {
                testcase: i + 1,
                passed,
                stdout,
                expected: expected_output,
                // JDoodle mixes stderr and compile errors into the 'output' field if the code crashes
                stderr: passed ? null : (data.error || null), 
                compileOutput: null, 
                status: passed ? "Accepted" : "Wrong Answer",
                memory: data.memory ? `${data.memory} KB` : undefined,
                time: data.cpuTime ? `${data.cpuTime} s` : undefined,
            };
        });       
        
        // 4. Save the Master Submission
        const submission = await db.submission.create({
            data: {
                userId,
                problemId,
                sourceCode: source_code,
                language: jdoodleConfig.name, // Saved cleanly as "JavaScript", "Python", etc.
                stdin: stdin.join("\n"),
                stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
                status: allPassed ? "Accepted" : "Failed",
                stderr: detailedResults.some((r) => r.stderr)
                    ? JSON.stringify(detailedResults.map((r) => r.stderr))
                    : null,
                compileOutput: detailedResults.some((r) => r.compileOutput)
                    ? JSON.stringify(detailedResults.map((r) => r.compileOutput))
                    : null,
                time: detailedResults.some((r) => r.time)
                    ? JSON.stringify(detailedResults.map((r) => r.time))
                    : null,
            },
        });

        // 5. Mark Problem as Solved (Only triggers if 100% of test cases passed)
        if (allPassed) {
            await db.problemSolved.upsert({
                where: {
                    userId_problemId: {
                        userId: userId,
                        problemId: problemId,
                    },
                },
                update: {}, // If it's already solved, do nothing
                create: {
                    userId: userId,
                    problemId: problemId,
                }
            });
        }

        // 6. Save Individual Test Case Results
        const testCaseResults = detailedResults.map((result) => ({
            submissionId: submission.id,
            testcase: result.testcase, 
            passed: result.passed,
            stdout: result.stdout,
            expected: result.expected,
            stderr: result.stderr,
            compileOutput: result.compileOutput,
            status: result.status,
            memory: result.memory,
            time: result.time,
        }));

        await db.testCaseResult.createMany({
            data: testCaseResults,
        });

        // 7. Fetch the final package to send to the frontend
        const submissionWithTestCases = await db.submission.findUnique({
            where: {
                id: submission.id
            },
            include: {
                testCases: true, 
            },
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