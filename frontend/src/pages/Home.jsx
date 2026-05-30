import  { useEffect } from "react";
import { useProblemStore } from "../store/problemStore";
import { useAuthStore } from "../store/authStore";
import { useNavigate,Link } from "react-router-dom";
import { Loader ,LogOut,Plus,Terminal,Shield} from "lucide-react";
import ProblemsTable from "../components/ProblemsTable";
import PlaylistsList  from "../components/PlayList";
const HomePage = () => {
  const { getAllProblems, problems, isProblemsLoading } = useProblemStore();
  const {authUser,logout} = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    getAllProblems();
  }, [getAllProblems]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  }

  if (isProblemsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  // Ensure problems is always treated as an array, even if the store gets corrupted
  const safeProblems = Array.isArray(problems) ? problems : [];

  return (
   <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col relative overflow-hidden">
    {/* Premium Glassmorphic Control bar navarbar */}
    <header className="w-full bg-gray-900/60 backdrop-blur-md border-b border-gray-800/80 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
    {/* Brand Core Asset */}
    <div className="flex items-center gap-2">
      <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 text-primary">
      <Terminal className="w-5 h-5"/>
      </div>
      <Link to="/" className="text-xl font-black tracking-wider text-white">
       LEET <span className="text-primary">LAB</span>
      </Link>
    </div>
    {/* Dynamic Action Center */}
    <div className="flex items-center gap-4">
    {/* User identity info badge */}
    <div className="hidden sm:flex items-center gap-2 bg-gray-950/80 border border-gray-800/80 px-3.5 py-1.5 rounded-xl text-xs font-mono">
    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
    <span className="text-gray-300 font-medium">{authUser?.name || "Developer"}</span>
    {authUser?.role === "ADMIN" && (
      <span className="badge badge-primary badge-xs py-2 font-bold px-1.5 flex items-center gap-0.5 text-[9px]">
        <Shield className="w-2.5 h-2.5"/> ADMIN
      </span>
    )}
    </div>
    {/* Exculisve admin control trigger : only mounts if user is authenticated as Admin */}
    {authUser?.role === "ADMIN" && (
      <Link 
         to="/create"
         className="btn btn-sm btn-primary bg-primary hover:bg-primary-focus text-white border-none font-bold rounded-xl flex items-center gap-1 shadow-lg shadow-primary/10"
         >
          <Plus className="w-4 h-4"/>
          <span className="hidden md:inline text-x5">Create Problem</span>
         </Link>
    )}
    {/* Secure Ejection Trigger */}
    <button 
      onClick={handleLogout}
      className="btn btn-sm btn-ghost hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-transparent hover:border-red-500/10 rounded-xl flex items-center gap-1.5 transition-all duration-200"
      >
        <LogOut className="w-4 h-4"/>
        <span className="hidden md:inline text-xs font-bold">Logout</span>
      </button>
    </div>
    </header>
    {/* Main Panel Background Presentation Layout */}
    <main className="flex-1 flex flex-col items-center pt-12 px-4 z-10 w-full max-w-7xl mx-auto">
      {/* Background ambient neon blur */}
      <div className="absolute top-24 left-1/4 w-96 h-96 bg-primary opacity-10 blur-[120px] rounded-full pointer-events-none">
      </div>
      <div className="text-center max-w-2xl mb-2">
        <h1 className="text-4xl font-black tracking-tight text-white mb-4">
          Sharpen Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-priamry to-blue-400">Execution Velocity</span>
        </h1>
        <p className="text-gray-400 font-medium text-sm leading-relaxed">
          Select a target compilation below to draft implementations , pass complex automated assertions , and optimize algo runtimes.
        </p>
      </div>

      <div className="w-full mb-6">
        <PlaylistsList/>
      </div>

      {/* Problems Grid Module */}
      <div className="w-full mt-4">
        {safeProblems.length > 0 ? (
          <ProblemsTable problems={safeProblems}/>
        ) : (
          <div className="mt-12 text-center border border-gray-800 border-dashed rounded-2xl bg-gray-900/20 p-12 max-w-md mx-auto">
            <p className="text-sm font-semibold text-gray-400">No active challenges available</p>
          <p className="text-xs text-gray-500 mt-1">Initialize compilation indexes from the console container above.</p>
          </div>
        )}
        </div>
    </main>
   </div>
  );
};
export default HomePage;