import  { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  Play, FileText, MessageSquare, Lightbulb, Bookmark, Share2,
  ChevronRight, Code2, Users, ThumbsUp, Home, 
  TerminalSquare, CheckCircle2, ChevronDown
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Split from "react-split"; // ✅ NEW: Import for draggable panes

// Stores & Components
import { useProblemStore } from "../store/useProblemStore";
import { useExecutionStore } from "../store/useExecutionStore";
import { useSubmissionStore } from "../store/useSubmissionStore";
import Submission from "../components/Submission";
import SubmissionsList from "../components/SubmissionList";

const ProblemPage = () => {
  const { id } = useParams();
  
  // -- Stores --
  const { getProblemById, problem, isProblemLoading } = useProblemStore();
  const {
    submission: submissions, 
    isLoading: isSubmissionsLoading,
    getSubmissionForProblem,
    getSubmissionCountForProblem,
    submissionCount,
  } = useSubmissionStore();

const { executeCode, executionResult, isExecuting } = useExecutionStore();

  // -- Local State --
  const [code, setCode] = useState("");
  const [initializedProblemId, setInitializedProblemId] = useState(null);
  
  const [activeTab, setActiveTab] = useState("description"); 
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const [activeConsoleTab, setActiveConsoleTab] = useState("testcases"); 
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);

  // Initialize code during render phase
  if (problem && initializedProblemId !== id) {
setCode(problem.codeSnippets?.[selectedLanguage] || executionResult?.sourceCode || "");
    setInitializedProblemId(id);
  }

  // -- Effects --
  useEffect(() => {
    getProblemById(id);
    getSubmissionCountForProblem(id);
  }, [id, getProblemById, getSubmissionCountForProblem]); 

  useEffect(() => {
    if (activeTab === "submissions" && id) {
      getSubmissionForProblem(id);
    }
  }, [activeTab, id, getSubmissionForProblem]); 

  // -- Handlers --
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    setCode(problem.codeSnippets?.[lang] || "");
  };

 const handleRunCode = async (e) => {
    e.preventDefault();
    setActiveConsoleTab("result"); 
    try {
      const stdin = problem.testcases.map((tc) => tc.input);
      const expected_outputs = problem.testcases.map((tc) => tc.output);
      
      await executeCode({
        source_code: code,           
        language_id: selectedLanguage, // ✅ Changed to match backend
        stdin: stdin,
        expected_outputs: expected_outputs,
        problemId: id                  // ✅ Changed to match backend
      });
      
    } catch (error) {
      console.log("Error executing code", error);
    }
  };
  if (isProblemLoading || !problem) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-300">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/70 font-semibold tracking-wide">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // -- Left Panel Renderer --
  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <div className="prose max-w-none text-sm text-base-content pb-10">
            <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
            
            {/* ✅ FIXED: DaisyUI Badge used for difficulty so text is always visible */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`badge badge-outline font-bold ${
                problem.difficulty === 'EASY' ? 'badge-success' : 
                problem.difficulty === 'MEDIUM' ? 'badge-warning' : 'badge-error'
              }`}>
                {problem.difficulty}
              </div>
            </div>

            <div className="whitespace-pre-wrap leading-relaxed mb-8">{problem.description}</div>

            {problem.examples && (
              <div className="mb-8 flex flex-col gap-4">
                {Object.entries(problem.examples).map(([lang, example], idx) => (
                  <div key={lang}>
                    <p className="font-bold mb-2">Example {idx + 1}:</p>
                    <div className="bg-base-200 border-l-2 border-primary p-4 rounded-r-lg font-mono text-sm leading-relaxed text-base-content/80">
                      <div><span className="text-base-content/50">Input: </span>{example.input}</div>
                      <div><span className="text-base-content/50">Output: </span>{example.output}</div>
                      {example.explanation && (
                        <div className="mt-2"><span className="text-base-content/50">Explanation: </span>{example.explanation}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {problem.constraints && (
              <div>
                <h3 className="font-bold mb-2">Constraints:</h3>
                <ul className="list-disc list-inside bg-base-200 p-4 rounded-lg font-mono text-sm text-base-content/80">
                  {problem.constraints.split('\n').map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>
        );
      case "submissions":
        return <SubmissionsList submissions={submissions} isLoading={isSubmissionsLoading} />;
      case "discussion":
        return <div className="text-center text-base-content/50 py-10">No discussions yet</div>;
      case "hints":
        return problem?.hints ? (
          <div className="bg-base-200 p-5 rounded-lg text-base-content/80 whitespace-pre-wrap leading-relaxed">{problem.hints}</div>
        ) : <div className="text-center text-base-content/50 py-10">No hints available</div>;
      default:
        return null;
    }
  };

  return (
    // MASTER CONTAINER: Fixed full screen, using DaisyUI base-300 for the background
    <div className="flex flex-col h-screen w-full bg-base-300 text-base-content font-sans overflow-hidden">
      
      {/* 🟢 TOP NAVBAR */}
      <nav className="h-[50px] bg-base-100 border-b border-base-300 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to={"/"} className="text-base-content/70 hover:text-primary transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{problem.title}</span>
            <div className="hidden md:flex items-center gap-3 ml-2 text-xs font-medium text-base-content/50">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {submissionCount}</span>
              <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> 95%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsBookmarked(!isBookmarked)} className={`p-1.5 rounded hover:bg-base-200 transition-colors ${isBookmarked ? "text-primary" : "text-base-content/50"}`}>
            <Bookmark className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded text-base-content/50 hover:bg-base-200 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* 🟢 MAIN SPLIT WORKSPACE - HORIZONTAL (Left vs Right) */}
      <Split 
        sizes={[45, 55]} 
        minSize={300} 
        gutterSize={8}
        className="flex-1 flex min-h-0 w-full p-2"
      >
        
        {/* --- LEFT PANEL: Problem Description --- */}
        <div className="flex flex-col bg-base-100 rounded-lg overflow-hidden shadow-lg h-full">
          <div className="flex bg-base-200 border-b border-base-300 shrink-0 pt-1 px-2 gap-1">
            {[
              { id: "description", icon: FileText, label: "Description" },
              { id: "submissions", icon: Code2, label: "Submissions" },
              { id: "discussion", icon: MessageSquare, label: "Discussion" },
              { id: "hints", icon: Lightbulb, label: "Hints" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-xs font-medium flex items-center gap-1.5 transition-colors rounded-t-md ${
                  activeTab === tab.id ? "bg-base-100 text-base-content" : "text-base-content/60 hover:text-base-content hover:bg-base-200"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {renderTabContent()}
          </div>
        </div>

        {/* --- RIGHT PANEL: VERTICAL SPLIT (Editor vs Console) --- */}
        <Split 
          direction="vertical"
          sizes={[60, 40]}
          minSize={150}
          gutterSize={8}
          className="flex flex-col h-full w-full"
        >
          
          {/* 💻 TOP ROW: CODE EDITOR */}
          <div className="flex flex-col bg-base-100 rounded-lg overflow-hidden shadow-lg h-full">
            <div className="h-10 bg-base-200 border-b border-base-300 flex items-center justify-between px-3 shrink-0">
              <div className="relative group">
                <select
                  className="appearance-none bg-base-300 hover:bg-base-200 text-xs font-medium pl-3 pr-8 py-1.5 rounded cursor-pointer outline-none transition-colors"
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                >
                  {Object.keys(problem.codeSnippets || {}).map((lang) => (
                    <option key={lang} value={lang}>
                      {lang === 'javascript' ? 'JavaScript' : lang === 'python' ? 'Python 3' : lang === 'java' ? 'Java' : lang.toUpperCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/50 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex-1 min-h-0 pt-2">
              <Editor
                height="100%"
                language={selectedLanguage.toLowerCase() === 'python' ? 'python' : selectedLanguage.toLowerCase()}
                theme="vs-dark" // Keep this vs-dark so the code colors pop
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineHeight: 21,
                  padding: { top: 8 },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* 🖥️ BOTTOM ROW: CONSOLE */}
          <div className="flex flex-col bg-base-100 rounded-lg overflow-hidden shadow-lg h-full">
            <div className="flex bg-base-200 border-b border-base-300 shrink-0 pt-1 px-2 gap-1">
              <button 
                onClick={() => setActiveConsoleTab("testcases")}
                className={`px-4 py-2 text-xs font-medium flex items-center gap-2 transition-colors rounded-t-md ${
                  activeConsoleTab === 'testcases' ? 'bg-base-100 text-base-content' : 'text-base-content/60 hover:bg-base-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Testcases
              </button>
              <button 
                onClick={() => setActiveConsoleTab("result")}
                className={`px-4 py-2 text-xs font-medium flex items-center gap-2 transition-colors rounded-t-md ${
                  activeConsoleTab === 'result' ? 'bg-base-100 text-success' : 'text-base-content/60 hover:bg-base-200'
                }`}
              >
                <TerminalSquare className="w-3.5 h-3.5" /> Test Result
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeConsoleTab === "testcases" && (
                <div className="flex flex-col h-full gap-4">
                  <div className="flex gap-2">
                    {problem.testcases.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestCaseIndex(idx)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                          activeTestCaseIndex === idx ? 'bg-base-300 text-base-content' : 'bg-transparent text-base-content/50 hover:bg-base-200'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {problem.testcases.length > 0 && (
                    <div className="flex flex-col gap-4 mt-1">
                      <div>
                        <div className="text-xs font-medium text-base-content/50 mb-1.5">Input</div>
                        <div className="bg-base-200 px-3 py-2.5 rounded-lg font-mono text-sm whitespace-pre-wrap">
                          {problem.testcases[activeTestCaseIndex].input}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-base-content/50 mb-1.5">Expected Output</div>
                        <div className="bg-base-200 px-3 py-2.5 rounded-lg font-mono text-sm whitespace-pre-wrap">
                          {problem.testcases[activeTestCaseIndex].output}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeConsoleTab === "result" && (
                <div className="flex flex-col h-full">
                  {isExecuting ? (
                    <div className="flex items-center gap-3 text-base-content/70 text-sm font-medium pt-2">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                      Evaluating on JDoodle...
                    </div>
                  ) : executionResult ? (
                    <div className="animate-in fade-in duration-300">
                      <Submission submission={executionResult} />
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-base-content/50 pt-2">
                      You must run your code first.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ACTION FOOTER BAR */}
            <div className="h-14 bg-base-200 border-t border-base-300 flex items-center justify-between px-4 shrink-0">
              <div className="text-xs text-base-content/50 font-medium flex items-center gap-2">
                Console <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunCode}
                  disabled={isExecuting}
                  className="btn btn-sm btn-ghost bg-base-300 hover:bg-base-100"
                >
                  {isExecuting ? <span className="loading loading-spinner loading-xs"></span> : <Play className="w-3.5 h-3.5 fill-current" />}
                  Run
                </button>
                <button className="btn btn-sm btn-success text-white">
                  Submit
                </button>
              </div>
            </div>

          </div>
        </Split>
      </Split>
    </div>
  );
};

export default ProblemPage;