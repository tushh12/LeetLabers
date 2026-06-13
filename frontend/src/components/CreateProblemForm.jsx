import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Code2,
  FileText,
  Lightbulb,
  CheckCircle2,
  Tags,
  Sliders,
  Settings,
  HelpCircle,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Fixed internal tracking schema using an object layer for stable field array management
const formValidationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  tags: z.array(
    z.object({
      value: z.string().min(1, "Tag token cannot be empty"),
    })
  ).min(1, "At least one tag is required"),
  constraints: z.string().min(1, "Constraints are required"),
  hints: z.string().optional(),
  editorial: z.string().optional(),
  testcases: z.array(
    z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
    })
  ).min(1, "At least one test case is required"),
  examples: z.object({
    JAVASCRIPT: z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().optional(),
    }),
    PYTHON: z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().optional(),
    }),
    JAVA: z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().optional(),
    }),
  }),
  codeSnippets: z.object({
    JAVASCRIPT: z.string().min(1, "JavaScript snippet is required"),
    PYTHON: z.string().min(1, "Python snippet is required"),
    JAVA: z.string().min(1, "Java solution is required"),
  }),
  referenceSolutions: z.object({
    JAVASCRIPT: z.string().min(1, "JavaScript solution is required"),
    PYTHON: z.string().min(1, "Python solution is required"),
    JAVA: z.string().min(1, "Java solution is required"),
  }),
  // ✅ NEW: Added driverCode to validation schema
  driverCode: z.object({
    JAVASCRIPT: z.string().min(1, "JavaScript driver is required"),
    PYTHON: z.string().min(1, "Python driver is required"),
    JAVA: z.string().min(1, "Java driver is required"),
  }),
});

const CreateProblemForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Tab controllers to compress form layout into a single-page view
  const [activeMetaTab, setActiveMetaTab] = useState("description");
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("code");
  const [activeLang, setActiveLang] = useState("JAVASCRIPT");
  const [activeEditorPane, setActiveEditorPane] = useState("snippet");

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formValidationSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "EASY",
      testcases: [{ input: "", output: "" }],
      tags: [{ value: "ARRAYS" }],
      examples: {
        JAVASCRIPT: { input: "", output: "", explanation: "" },
        PYTHON: { input: "", output: "", explanation: "" },
        JAVA: { input: "", output: "", explanation: "" },
      },
      codeSnippets: {
        JAVASCRIPT: "function solution() {\n  // Write your code here\n}",
        PYTHON: "def solution():\n    # Write your code here\n    pass",
        JAVA: "public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}",
      },
      referenceSolutions: {
        JAVASCRIPT: "// Add your reference solution here",
        PYTHON: "# Add your reference solution here",
        JAVA: "// Add your reference solution here",
      },
      // ✅ NEW: Added default values for the driver code
      driverCode: {
        JAVASCRIPT: "// --- HIDDEN DRIVER CODE ---\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif(input){\n    // Parse and log execution here\n}",
        PYTHON: "# --- HIDDEN DRIVER CODE ---\nimport sys\n# Parse and print execution here",
        JAVA: "// --- HIDDEN JAVA DRIVER CODE ---\n// Parse scanner inputs and execute solution method here",
      },
    },
  });

  const { fields: testCaseFields, append: appendTestCase, remove: removeTestCase } = useFieldArray({
    control,
    name: "testcases",
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: "tags",
  });

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);

      const optimizedPayload = {
        ...values,
        tags: values.tags.map((t) => t.value.trim().toUpperCase()).filter(Boolean),
      };
      
      const res = await axiosInstance.post("/problems/create-problem", optimizedPayload);
      toast.success(res.data.message || "Problem indexed successfull! ⚡");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Compilation submission crashed. Check field formatting rules.");
    } finally {
      setIsLoading(false);
    }
  };

 return (
    <div className="w-full min-h-screen bg-gray-950 text-gray-200 flex flex-col overflow-x-hidden">
      <div className="w-full max-w-[1600px] mx-auto p-4 flex flex-col h-screen overflow-hidden">
        
        {/* Dashboard Sticky Ribbon Control Header */}
        <div className="flex justify-between items-center bg-gray-900 border border-gray-800 px-6 py-3 rounded-xl mb-4 shadow-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 border border-primary/20 text-primary rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Create Problem</h2>
              <p className="text-[10px] text-gray-400 font-medium">Design structured code parameters inside single workspace frame matrix elements</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="btn btn-primary btn-sm px-6 font-bold text-white rounded-lg gap-2"
          >
            {isLoading ? <span className="loading loading-spinner loading-xs"></span> : <CheckCircle2 className="w-4 h-4" />}
            Publish Problem
          </button>
        </div>

        {/* CORE WORKSPACE FRAME GRID SPLIT */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden h-full pb-4">
          
          {/* LEFT COLUMN */}
          <div className="w-full lg:w-[38%] bg-gray-900/40 border border-gray-800/80 rounded-xl flex flex-col overflow-hidden h-full">
            
            {/* Identity Fields Input Space */}
            <div className="p-4 border-b border-gray-800 space-y-4 bg-gray-950/40">
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Problem Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Target Sum Range"
                    className={`input input-sm input-bordered w-full bg-gray-950 border-gray-800 text-sm focus:border-primary rounded-lg text-white ${errors.title ? 'border-error' : ''}`}
                    {...register("title")}
                  />
                  {errors.title && <span className="text-[10px] text-error font-medium">{errors.title.message}</span>}
                </div>
                
                <div className="w-[120px] flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Difficulty</label>
                  <select
                    className="select select-sm select-bordered bg-gray-950 border-gray-800 text-xs text-gray-300 rounded-lg focus:border-primary"
                    {...register("difficulty")}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              {/* Managed Tags Token Row Drawer */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase flex items-center gap-1">
                    <Tags className="w-3 h-3 text-primary" /> Relational Tag Anchors
                  </label>
                  <button
                    type="button"
                    onClick={() => appendTag({ value: "" })}
                    className="text-[10px] text-primary hover:underline flex items-center font-bold bg-primary/5 px-2 py-0.5 rounded border border-primary/10"
                  >
                    + Add Token
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-[55px] overflow-y-auto p-1 bg-gray-950/60 border border-gray-800/60 rounded-lg min-h-[38px]">
                  {tagFields.map((field, index) => (
                    <div key={field.id} className="flex items-center bg-gray-900 border border-gray-800 rounded-md px-1.5 py-0.5 gap-1">
                      <input
                        type="text"
                        className="bg-transparent text-[11px] font-medium text-white outline-none w-16 uppercase"
                        placeholder="Tag"
                        {...register(`tags.${index}.value`)}
                      />
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        disabled={tagFields.length === 1}
                        className="text-gray-500 hover:text-red-400 disabled:opacity-30 text-xs font-bold pl-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {errors.tags && <span className="text-[10px] text-error font-medium">{errors.tags.message || errors.tags?.[0]?.value?.message}</span>}
              </div>
            </div>

            {/* Sub-Tab Selector Ribbon for Large Texts */}
            <div className="bg-gray-900 border-b border-gray-800 flex items-center px-1 flex-shrink-0">
              {[
                { id: "description", label: "Description", icon: FileText },
                { id: "constraints", label: "Constraints", icon: Sliders },
                { id: "hints", label: "Hints / Tips", icon: HelpCircle },
                { id: "editorial", label: "Editorial", icon: Lightbulb },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveMetaTab(tab.id)}
                    className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                      activeMetaTab === tab.id
                        ? "border-primary text-white bg-gray-950/40"
                        : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Textarea Viewport Panel Container */}
            <div className="flex-1 p-4 bg-gray-950/20 overflow-hidden relative">
              <div className="h-full w-full relative">
                <textarea
                  className={`textarea textarea-bordered w-full h-full bg-gray-950 font-sans text-xs text-gray-200 p-4 border-gray-800/80 rounded-xl resize-none focus:border-primary leading-relaxed ${
                    activeMetaTab === "description" ? "block" : "hidden"
                  }`}
                  placeholder="Compose runtime assertion description parameters here..."
                  {...register("description")}
                />
                <textarea
                  className={`textarea textarea-bordered w-full h-full bg-gray-950 font-mono text-xs text-gray-200 p-4 border-gray-800 rounded-xl resize-none focus:border-primary leading-relaxed ${
                    activeMetaTab === "constraints" ? "block" : "hidden"
                  }`}
                  placeholder="e.g., 1 <= nums.length <= 10^5"
                  {...register("constraints")}
                />
                <textarea
                  className={`textarea textarea-bordered w-full h-full bg-gray-950 font-sans text-xs text-gray-200 p-4 border-gray-800 rounded-xl resize-none focus:border-primary leading-relaxed ${
                    activeMetaTab === "hints" ? "block" : "hidden"
                  }`}
                  placeholder="Provide micro conceptual pointer insights if index parameters require clarification..."
                  {...register("hints")}
                />
                <textarea
                  className={`textarea textarea-bordered w-full h-full bg-gray-950 font-sans text-xs text-gray-200 p-4 border-gray-800 rounded-xl resize-none focus:border-primary leading-relaxed ${
                    activeMetaTab === "editorial" ? "block" : "hidden"
                  }`}
                  placeholder="Outline reference mathematical runtime metrics analyses proofs..."
                  {...register("editorial")}
                />
              </div>
              
              {errors[activeMetaTab] && (
                <div className="absolute bottom-6 right-6 bg-red-950/80 border border-red-900 px-3 py-1.5 rounded-lg text-[10px] text-red-400 font-medium">
                  {errors[activeMetaTab]?.message}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full lg:w-[62%] bg-gray-900/40 border border-gray-800/80 rounded-xl flex flex-col overflow-hidden h-full">
            
            {/* Master Viewport Switcher Module */}
            <div className="bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setActiveWorkspaceTab("code")}
                  className={`px-4 py-2.5 text-xs font-black tracking-wide flex items-center gap-1.5 border-b-2 transition-all ${
                    activeWorkspaceTab === "code" ? "border-primary text-white bg-gray-950/40" : "border-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <Code2 className="w-4 h-4 text-primary" /> Multi-Language Sandbox
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWorkspaceTab("testcases")}
                  className={`px-4 py-2.5 text-xs font-black tracking-wide flex items-center gap-1.5 border-b-2 transition-all ${
                    activeWorkspaceTab === "testcases" ? "border-primary text-white bg-gray-950/40" : "border-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-success" /> Global Test Cases Matrix ({testCaseFields.length})
                </button>
              </div>
            </div>

            {/* VIEWPORT BODY A: Language Code Snippets Engine */}
            {activeWorkspaceTab === "code" && (
              <div className="flex-1 flex flex-col overflow-hidden h-full">
                
                {/* Language Selection Ribbon & Sub Panel View Switchers */}
                <div className="bg-gray-950 border-b border-gray-800/80 px-4 py-2 flex justify-between items-center flex-shrink-0">
                  <div className="flex gap-1 bg-gray-900 p-0.5 rounded-lg border border-gray-800">
                    {["JAVASCRIPT", "PYTHON", "JAVA"].map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveLang(lang)}
                        className={`px-3 py-1 text-[10px] font-black tracking-wide rounded-md transition-all ${
                          activeLang === lang ? "bg-primary text-white shadow-md" : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 bg-gray-900 p-0.5 rounded-lg border border-gray-800">
                    {[
                      { id: "snippet", label: "Starter Snippet" },
                      { id: "reference", label: "Reference Solution" },
                      { id: "driver", label: "Hidden Driver" }, // ✅ NEW: The new Driver Code Tab
                      { id: "example", label: "Example Data Struct" },
                    ].map((pane) => (
                      <button
                        key={pane.id}
                        type="button"
                        onClick={() => setActiveEditorPane(pane.id)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                          activeEditorPane === pane.id ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-400"
                        }`}
                      >
                        {pane.label}
                    </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Workspace Switchboard */}
                <div className="flex-1 overflow-hidden relative bg-gray-950">
                  
                  {/* 1. Starter Template Monaco Editor */}
                  {activeEditorPane === "snippet" && (
                    <div className="w-full h-full">
                      <Controller
                        name={`codeSnippets.${activeLang}`}
                        control={control}
                        render={({ field }) => (
                          <Editor
                            height="100%"
                            language={activeLang === "JAVASCRIPT" ? "javascript" : activeLang.toLowerCase()}
                            theme="vs-dark"
                            value={field.value}
                            onChange={field.onChange}
                            options={{ minimap: { enabled: false }, fontSize: 13, automaticLayout: true }}
                          />
                        )}
                      />
                    </div>
                  )}

                  {/* 2. Reference Solution Monaco Editor */}
                  {activeEditorPane === "reference" && (
                    <div className="w-full h-full">
                      <Controller
                        name={`referenceSolutions.${activeLang}`}
                        control={control}
                        render={({ field }) => (
                          <Editor
                            height="100%"
                            language={activeLang === "JAVASCRIPT" ? "javascript" : activeLang.toLowerCase()}
                            theme="vs-dark"
                            value={field.value}
                            onChange={field.onChange}
                            options={{ minimap: { enabled: false }, fontSize: 13, automaticLayout: true }}
                          />
                        )}
                      />
                    </div>
                  )}

                  {/* ✅ NEW 3. Hidden Driver Code Monaco Editor */}
                  {activeEditorPane === "driver" && (
                    <div className="w-full h-full">
                      <Controller
                        name={`driverCode.${activeLang}`}
                        control={control}
                        render={({ field }) => (
                          <Editor
                            height="100%"
                            language={activeLang === "JAVASCRIPT" ? "javascript" : activeLang.toLowerCase()}
                            theme="vs-dark"
                            value={field.value}
                            onChange={field.onChange}
                            options={{ minimap: { enabled: false }, fontSize: 13, automaticLayout: true }}
                          />
                        )}
                      />
                    </div>
                  )}

                  {/* 4. Structural IO Sub-Form Card */}
                  {activeEditorPane === "example" && (
                    <div className="w-full h-full p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950 overflow-y-auto">
                      <div className="flex flex-col gap-1.5 h-full min-h-[120px]">
                        <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Example Input Stream</label>
                        <textarea
                          className="textarea textarea-bordered flex-1 bg-gray-900 border-gray-800 font-mono text-xs text-green-400 p-3 rounded-xl resize-none"
                          placeholder="e.g., nums = [2,7], target = 9"
                          {...register(`examples.${activeLang}.input`)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 h-full min-h-[120px]">
                        <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Expected Output Stream</label>
                        <textarea
                          className="textarea textarea-bordered flex-1 bg-gray-900 border-gray-800 font-mono text-xs text-green-400 p-3 rounded-xl resize-none"
                          placeholder="e.g., [0,1]"
                          {...register(`examples.${activeLang}.output`)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 md:col-span-2 h-full min-h-[100px]">
                        <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Conceptual Explanation (Optional)</label>
                        <textarea
                          className="textarea textarea-bordered flex-1 bg-gray-900 border-gray-800 text-xs text-gray-300 p-3 rounded-xl resize-none"
                          placeholder="Provide details about array element position iterations context maps..."
                          {...register(`examples.${activeLang}.explanation`)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEWPORT BOX B: Global Test Cases Matrix Layout Grid */}
            {activeWorkspaceTab === "testcases" && (
              <div className="flex-1 flex flex-col overflow-hidden h-full p-4 bg-gray-950">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-3 flex-shrink-0">
                  <span className="text-xs text-gray-400 font-mono">Assign underlying programmatic evaluations array assertions below</span>
                  <button
                    type="button"
                    onClick={() => appendTestCase({ input: "", output: "" })}
                    className="btn btn-xs btn-primary font-bold text-white rounded px-3"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Append Testcase
                  </button>
                </div>

                {/* Scrollable Test Cases Deck with custom fixed aspect wrappers */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {testCaseFields.map((field, index) => (
                    <div key={field.id} className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-3 flex flex-col md:flex-row gap-3 items-start relative group">
                      <div className="text-[10px] font-mono font-black text-gray-500 bg-gray-950 px-2 py-1 border border-gray-800 rounded-md">
                        #{index + 1}
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                        <div className="flex flex-col gap-1">
                          <textarea
                            rows={2}
                            placeholder="Standard Input Array Buffer"
                            className="textarea textarea-bordered bg-gray-950 border-gray-800/80 font-mono text-xs text-slate-300 rounded-lg p-2 resize-none"
                            {...register(`testcases.${index}.input`)}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <textarea
                            rows={2}
                            placeholder="Expected Standard Output Stream"
                            className="textarea textarea-bordered bg-gray-950 border-gray-800/80 font-mono text-xs text-slate-300 rounded-lg p-2 resize-none"
                            {...register(`testcases.${index}.output`)}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeTestCase(index)}
                        disabled={testCaseFields.length === 1}
                        className="btn btn-square btn-xs btn-ghost text-gray-500 hover:text-red-400 self-center disabled:opacity-30 flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateProblemForm;