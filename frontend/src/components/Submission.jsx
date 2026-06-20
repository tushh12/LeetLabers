import { useSubmissionStore } from "../store/useSubmissionStore";

// ✅ Added 'submissionProp' so the Bottom Console can pass the immediate execution result
export default function Submission({ submissionProp }) {
    const { currentSubmission, setCurrentSubmission } = useSubmissionStore();

    // ✅ Prioritize the prop (for the Console), fallback to the store (for the Left Panel)
    const activeData = submissionProp || currentSubmission;

    if (!activeData) {
        return <div className="p-4 text-gray-400">No submission selected.</div>;
    }

    const { status, language, sourceCode, createdAt, time, memory } = activeData;
    const isAccepted = status === "Accepted";

    return (
        <div className="flex flex-col w-full h-full p-4 overflow-y-auto text-sm">
            
            {/* ✅ Only show the "Back" button in the Left Panel, not in the Console */}
            {!submissionProp && (
                <button 
                    onClick={() => setCurrentSubmission(null)}
                    className="text-gray-400 hover:text-white self-start mb-4 flex items-center transition-colors"
                >
                    &larr; All Submissions
                </button>
            )}

            <h2 className={`text-2xl font-bold mb-2 ${isAccepted ? 'text-green-500' : 'text-red-500'}`}>
                {status}
            </h2>
            
            <div className="flex flex-wrap gap-4 text-gray-400 mb-6 border-b border-gray-700 pb-4">
                {createdAt && <span>Submitted: {new Date(createdAt).toLocaleString()}</span>}
                <span>Language: <strong className="text-gray-200">{language}</strong></span>
                
                {time && time !== "null" && <span>Runtime: <strong className="text-gray-200">{time.replace(/[[\]"]/g, '')}</strong></span>}
                {memory && memory !== "null" && <span>Memory: <strong className="text-gray-200">{memory.replace(/[[\]"]/g, '')}</strong></span>}
            </div>

            <h3 className="text-lg font-semibold text-gray-200 mb-2">Submitted Code</h3>
            <div className="bg-[#1e1e1e] rounded-md p-4 overflow-x-auto border border-gray-700">
                <pre className="text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    <code>{sourceCode}</code>
                </pre>
            </div>
        </div>
    );
}