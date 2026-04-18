import { db } from "../libs/db.js";
import { getLanguageName, pollBatchResults, submitBatch } from "../libs/judge0.libs.js";

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

        // 2. Prepare and send batch to Judge0
        const submissions = stdin.map((input) => ({
            source_code,
            language_id,
            stdin: input,
        }));
        
        const submitResponse = await submitBatch(submissions);
        const tokens = submitResponse.map((res) => res.token);

        // 3. Poll Judge0 until all executions are complete
        const results = await pollBatchResults(tokens);
        console.log("Result-----", results);

        let allPassed = true;

        // 4. Grade the results
        const detailedResults = results.map((result, i) => {
            const stdout = result.stdout?.trim();
            const expected_output = expected_outputs[i]?.trim();
            const passed = stdout === expected_output;
            
            if (!passed) {
                allPassed = false;
            }
            
            return {
                testcase: i + 1,
                passed,
                stdout,
                expected: expected_output,
                stderr: result.stderr || null,
                compileOutput: result.compile_output || null,
                status: result.status.description,
                memory: result.memory ? `${result.memory} KB` : undefined,
                time: result.time ? `${result.time} s` : undefined,
            };
        });       
        
        // 5. Save the Master Submission
        const submission = await db.submission.create({
            data: {
                userId,
                problemId,
                sourceCode: source_code,
                language: getLanguageName(language_id),
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

        // 6. Mark Problem as Solved (Only triggers if 100% of test cases passed)
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

        // 7. Save Individual Test Case Results
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

        // 8. Fetch the final package to send to the frontend
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