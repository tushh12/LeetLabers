import  { useState, useMemo } from "react";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";
import { Bookmark, PencilIcon, TrashIcon, Plus } from "lucide-react";
import { useActions } from "../store/useActions";
import { usePlaylistStore } from "../store/usePlaylistStore";
import AddToPlaylistModal from "./AddToPlaylist";
import CreatePlaylistModal from "./CreatePlaylistModal";

const ProblemsTable = ({ problems }) => {
  const { authUser } = useAuthStore();
  const { onDeleteProblem } = useActions();
  const { createPlaylist } = usePlaylistStore();
  
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [selectedTag, setSelectedTag] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState(null);

  // Extract all unique tags dynamically from matching problem properties
  const allTags = useMemo(() => {
    if (!Array.isArray(problems)) return [];
    const tagsSet = new Set();
    problems.forEach((p) => p.tags?.forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [problems]);

  const difficulties = ["EASY", "MEDIUM", "HARD"];

  // Core filtration logic engine
  const filteredProblems = useMemo(() => {
    return (problems || [])
      .filter((problem) =>
        problem.title.toLowerCase().includes(search.toLowerCase())
      )
      .filter((problem) =>
        difficulty === "ALL" ? true : problem.difficulty === difficulty
      )
      .filter((problem) =>
        selectedTag === "ALL" ? true : problem.tags?.includes(selectedTag)
      );
  }, [problems, search, difficulty, selectedTag]);

  // Pagination bounds logic
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage) || 1;
  const paginatedProblems = useMemo(() => {
    return filteredProblems.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredProblems, currentPage]);

  const handleDelete = (id) => {
    onDeleteProblem(id);
  };

  const handleCreatePlaylist = async (data) => {
    await createPlaylist(data);
  };

  const handleAddToPlaylist = (problemId) => {
    setSelectedProblemId(problemId);
    setIsAddToPlaylistModalOpen(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 z-10 px-2 pb-12">
      {/* Table Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white tracking-wide">Problems Set</h2>
        <button
          className="btn btn-primary gap-2 rounded-xl text-white font-bold text-sm"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>

      {/* Dropdown Filters Toolbar */}
      <div className="flex flex-wrap md:flex-nowrap justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search challenge by title..."
          className="input input-bordered w-full md:w-1/3 bg-gray-900 border-gray-800 focus:border-primary text-white rounded-xl text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-3 w-full md:w-auto justify-end">
          <select
            className="select select-bordered bg-gray-900 border-gray-800 rounded-xl text-sm"
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setCurrentPage(1); }}
          >
            <option value="ALL">All Difficulties</option>
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {diff.charAt(0) + diff.slice(1).toLowerCase()}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered bg-gray-900 border-gray-800 rounded-xl text-sm"
            value={selectedTag}
            onChange={(e) => { setSelectedTag(e.target.value); setCurrentPage(1); }}
          >
            <option value="ALL">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Presentation Grid Wrapper */}
      <div className="overflow-x-auto rounded-xl border border-gray-800/60 shadow-xl bg-gray-900/40 backdrop-blur-sm">
        <table className="table  w-full text-left">
          <thead>
            <tr className="bg-gray-950 text-gray-400 border-b border-gray-800 text-xs tracking-wider uppercase">
              <th className="py-4 px-6 font-semibold">Status</th>
              <th className="py-4 px-6 font-semibold">Title</th>
              <th className="py-4 px-6 font-semibold">Tags</th>
              <th className="py-4 px-6 font-semibold">Difficulty</th>
              <th className="py-4 px-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40 text-gray-300">
            {paginatedProblems.length > 0 ? (
              paginatedProblems.map((problem) => {
                const isSolved = problem.solvedBy?.some(
                  (user) => user.userId === authUser?.id
                ) || false;

                return (
                  <tr key={problem.id} className="even:bg-gray-900/40 transition-hover:bg-gray-800/20 transit-colors">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={isSolved}
                        readOnly
                    className="checkbox checkbox-primary checkbox-sm border-gray-700 pointer-events-none"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <Link to={`/problem/${problem.id}`} className="font-semibold text-white hover:text-primary transition-colors">
                        {problem.title}
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {(problem.tags || []).map((tag, idx) => (
                          <span
                            key={idx}
                            className="badge badge-outline border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase rounded-md px-2 py-0.5 bg-amber-500/5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`badge font-bold text-[10px] text-white border-none rounded-md px-2.5 py-1 ${
                          problem.difficulty === "EASY"
                            ? "bg-green-600/20 text-green-400"
                            : problem.difficulty === "MEDIUM"
                            ? "bg-yellow-600/20 text-yellow-400"
                            : "bg-red-600/20 text-red-400"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex gap-2 items-center justify-end">
                        {authUser?.role === "ADMIN" && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleDelete(problem.id)}
                              className="btn btn-square btn-sm btn-error bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white transition-all rounded-lg"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                            <button disabled className="btn btn-square btn-sm bg-gray-800 border-gray-700 rounded-lg">
                              <PencilIcon className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        )}
                        <button
                          className="btn btn-sm btn-outline border-gray-800 hover:border-primary text-gray-400 hover:text-white bg-gray-950/40 rounded-lg text-xs font-semibold gap-1.5"
                          onClick={() => handleAddToPlaylist(problem.id)}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500 font-medium">
                  No matching target compile records discovered.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Footer */}
      <div className="flex justify-center mt-6 items-center gap-1">
        <button
          className="btn btn-sm bg-gray-900 border-gray-800 text-gray-400 hover:text-white rounded-xl"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Prev
        </button>
        <span className="text-xs font-mono text-gray-500 px-4">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-sm bg-gray-900 border-gray-800 text-gray-400 hover:text-white rounded-xl"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>

      {/* Dynamic Modals Mount */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePlaylist}
      />
      
      <AddToPlaylistModal
        isOpen={isAddToPlaylistModalOpen}
        onClose={() => setIsAddToPlaylistModalOpen(false)}
        problemId={selectedProblemId}
      />
    </div>
  );
};

export default ProblemsTable;