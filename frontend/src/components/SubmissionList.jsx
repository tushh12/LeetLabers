import { useEffect } from "react";
import { useSubmissionStore } from "../store/useSubmissionStore.js"

export default function SubmissionList({ problemId }) {
    const { submissions, isLoading, getSubmissionForProblem, setCurrentSubmission } = useSubmissionStore();

    // Fetch the history when this tab opens
    useEffect(() => {
        if (problemId) {
            getSubmissionForProblem(problemId);
        }
    }, [problemId, getSubmissionForProblem]);

    if (isLoading) {
        return <div className="p-4 text-gray-400">Loading submissions...</div>;
    }

    if (!submissions || submissions.length === 0) {
        return <div className="p-4 text-gray-400">No submissions yet. Run your code to see results here!</div>;
    }

    return (
        <div className="w-full text-sm">
            {/* Table Header */}
            <div className="flex bg-gray-800 text-gray-400 p-3 font-semibold rounded-t-md">
                <div className="w-1/3">Time Submitted</div>
                <div className="w-1/4">Status</div>
                <div className="w-1/4">Language</div>
            </div>

            {/* Submissions List */}
            <div className="flex flex-col">
                {submissions.map((sub) => (
                    <div 
                        key={sub.id} 
                        onClick={() => setCurrentSubmission(sub)}
                        className="flex border-b border-gray-700 p-3 hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                        {/* Format the date nicely */}
                        <div className="w-1/3 text-gray-300">
                            {new Date(sub.createdAt).toLocaleString()}
                        </div>
                        
                        {/* Color code Accepted vs Failed */}
                        <div className={`w-1/4 font-bold ${sub.status === "Accepted" ? "text-green-500" : "text-red-500"}`}>
                            {sub.status}
                        </div>
                        
                        <div className="w-1/4 text-gray-300">
                            {sub.language}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}