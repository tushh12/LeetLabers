import { db } from "../libs/db.js";
import axios from "axios"; // Make sure you ran `npm install axios`

// 1. JDoodle Language Mapper (Replaces getJudge0LanguageId)
const mapLanguageToJDoodle = (lang) => {
    const map = {
        'javascript': { language: 'nodejs', versionIndex: '0' },
        'python': { language: 'python3', versionIndex: '3' },
        'cpp': { language: 'cpp17', versionIndex: '0' },
        'java': { language: 'java', versionIndex: '3' }
    };
    return map[lang.toLowerCase()] || null;
};

export const createProblem = async (req, res) => {
    const {
        title, description, difficulty, tags, examples, constraints,
        testcases, codeSnippets, referenceSolutions
    } = req.body;

    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

    try {
        // --- JDOODLE EXECUTION BLOCK ---
        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
            const jdoodleConfig = mapLanguageToJDoodle(language);
            
            if (!jdoodleConfig) {
                return res.status(400).json({ error: `Language ${language} is not supported` });
            }

            const executionPromises = testcases.map((testcase) => {
                return axios.post('https://api.jdoodle.com/v1/execute', {
                    script: solutionCode,
                    language: jdoodleConfig.language,
                    versionIndex: jdoodleConfig.versionIndex,
                    stdin: testcase.input,
                    clientId: clientId,
                    clientSecret: clientSecret
                }, { timeout: 10000 }); // 10-second safety kill switch
            });

            const results = await Promise.all(executionPromises);

            for (let i = 0; i < results.length; i++) {
                const actualOutput = (results[i].data.output || '').trim();
                const expectedOutput = (testcases[i].output || '').trim();

                console.log(`Testcase ${i + 1} -> Expected: "${expectedOutput}", Actual: "${actualOutput}"`);

                if (actualOutput !== expectedOutput) {
                    return res.status(400).json({
                        error: `Testcase ${i + 1} failed for language ${language}. Expected: ${expectedOutput}, Got: ${actualOutput}`
                    });
                }
            }
        }
        // --- END JDOODLE BLOCK ---

        const newProblem = await db.Problem.create({
            data: {
                title, description, difficulty, tags, examples, constraints,
                testcases, codeSnippets, referenceSolutions,
                userId: req.user.id,
            },
        });

        return res.status(201).json({
            sucess: true,
            message: "Problem created successfully",
            problem: newProblem,
        });
    } catch (error) {
        console.log("error----->", error.response ? error.response.data : error.message);
        return res.status(500).json({
            error: "error while creating problem"
        });
    }
};

export const updateProblem = async (req, res) => {
    const { id } = req.params;
    const {
        title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions
    } = req.body;

    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

    try {
        // --- JDOODLE EXECUTION BLOCK ---
        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
            const jdoodleConfig = mapLanguageToJDoodle(language);
            
            if (!jdoodleConfig) {
                return res.status(400).json({ error: `Language ${language} is not supported` });
            }

            const executionPromises = testcases.map((testcase) => {
                return axios.post('https://api.jdoodle.com/v1/execute', {
                    script: solutionCode,
                    language: jdoodleConfig.language,
                    versionIndex: jdoodleConfig.versionIndex,
                    stdin: testcase.input,
                    clientId: clientId,
                    clientSecret: clientSecret
                }, { timeout: 10000 }); 
            });

            const results = await Promise.all(executionPromises);

            for (let i = 0; i < results.length; i++) {
                const actualOutput = (results[i].data.output || '').trim();
                const expectedOutput = (testcases[i].output || '').trim();

                if (actualOutput !== expectedOutput) {
                    return res.status(400).json({
                        error: `Testcase ${i + 1} failed for language ${language}. Expected: ${expectedOutput}, Got: ${actualOutput}`
                    });
                }
            }
        }
        // --- END JDOODLE BLOCK ---

        const updatedProblem = await db.Problem.update({
            where: { id: id },
            data: {
                title, description, difficulty, tags, examples, constraints,
                testcases, codeSnippets, referenceSolutions,
                userId: req.user.id,
                // problemId: req.Problem.id, <-- Note: I left this from your original code, but ensure 'req.Problem' exists!
            }
        });

        return res.status(200).json({
            sucess: true,
            message: "Problem updated successfully", // fixed typo from created to updated
            problem: updatedProblem,
        });
    } catch (error) {
        console.log("error----->", error.response ? error.response.data : error.message);
        return res.status(500).json({
            error: "error while updating problem"
        });
    }
};

// --- DB ONLY CONTROLLERS (NO CHANGES MADE BELOW HERE) ---

export const getAllProblem = async (req, res) => {
    try {
        const problems = await db.Problem.findMany({
            include: {
                solvedBy: {
                    where: { userId: req.user.id }
                }
            }
        });
        if (!problems) {
            return res.status(404).json({ message: "No problems found" }); // Added return here so it doesn't crash
        }
        return res.status(200).json({
            sucess: true,
            message: "All Problem fetched successfully",
            problem: problems
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error while fetching problem" });
    }
};

export const getProblemByid = async (req, res) => {
    const { id } = req.params;
    try {
        const problem = await db.Problem.findUnique({
            where: { id },
        });
        if (!problem) {
            return res.status(403).json({ error: "problem not found." });
        }
        return res.status(200).json({
            sucess: true,
            message: "get problem by id",
            problem
        });
    } catch (error) {
        console.log("error-", error);
        return res.status(500).json({ error: "Error while getting problem by id" });
    }
};

export const deleteProblem = async (req, res) => {
    const { id } = req.params;
    try {
        const problem = await db.Problem.findUnique({
            where: { id },
        });
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }
        await db.Problem.delete({
            where: { id }
        });
        return res.status(200).json({
            sucess: true,
            message: "Problem deleted Successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error while deleting the problem" });
    }
};

export const getAllProblemSolvedByUser = async (req, res) => {
    try {
        const problems = await db.Problem.findMany({
            where: {
                solvedBy: {
                    some: { userId: req.user.id }
                }
            },
            include: {
                solvedBy: {
                    where: { userId: req.user.id }
                }
            }
        });
        return res.status(200).json({
            success: true,
            message: "Problems fetched successfully",
            problems
        });
    } catch (error) {
        console.error("Error fetching problems", error);
        return res.status(500).json({ error: "failed to fetch problems" });
    }
};