import { db } from "../libs/db.js";
import { validateSolutionsAgainstTestcases } from "../services/compiler.service.js";

// --- CONTROLLERS ---

export const createProblem = async (req, res) => {
    const {
        title, description, difficulty, tags, examples, constraints,
        testcases, codeSnippets, referenceSolutions, driverCode // ✅ NEW: Added driverCode
    } = req.body;

    try {
        // ✅ NEW: Pass driverCode to the validation function
        await validateSolutionsAgainstTestcases(referenceSolutions, driverCode, testcases);

        const newProblem = await db.Problem.create({
            data: {
                title, description, difficulty, tags, examples, constraints,
                testcases, codeSnippets, referenceSolutions, 
                driverCode, // ✅ NEW: Save it to the database
                userId: req.user.id,
            },
        });

        return res.status(201).json({
            success: true, 
            message: "Problem created and verified successfully! ⚡",
            problem: newProblem,
        });

    } catch (error) {
        if (error.status === 400) {
            return res.status(400).json({ error: error.message });
        }
        console.log("error----->", error.response ? error.response.data : error.message);
        return res.status(500).json({ error: "Internal server error while creating problem" });
    }
};

export const updateProblem = async (req, res) => {
    const { id } = req.params;
    const {
        title, description, difficulty, tags, examples, constraints, 
        testcases, codeSnippets, referenceSolutions, driverCode // ✅ NEW: Added driverCode
    } = req.body;

    try {
        // ✅ NEW: Pass driverCode to the validation function
        await validateSolutionsAgainstTestcases(referenceSolutions, driverCode, testcases);

        const updatedProblem = await db.Problem.update({
            where: { id: id },
            data: {
                title, description, difficulty, tags, examples, constraints,
                testcases, codeSnippets, referenceSolutions, 
                driverCode, // ✅ NEW: Save updated code to database
                userId: req.user.id,
            }
        });

        return res.status(200).json({
            success: true,
            message: "Problem updated successfully", 
            problem: updatedProblem,
        });

    } catch (error) {
        if (error.status === 400) {
            return res.status(400).json({ error: error.message });
        }
        console.log("error----->", error.response ? error.response.data : error.message);
        return res.status(500).json({ error: "Internal server error while updating problem" });
    }
};

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
            return res.status(404).json({ message: "No problems found" }); 
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