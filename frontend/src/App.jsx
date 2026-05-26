import {Routes,Route,Navigate} from "react-router-dom";

import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx"
import CreateProblem from "./pages/CreateProblem.jsx"
import WorkSpace from "./pages/Workspace.jsx"
import SignUp from "./pages/SignUp.jsx";
import { useAuthStore } from "./store/authStore.js";
 // import SignUp from "./pages/SignUp.jsx"

function App() {
  const token = useAuthStore((state) => state.token);
  return (
    <div className="min-h-screen bg-gray-900 text-white front-sans">
      <Routes>
        {/*Public Route */}
        <Route path="/login" element={!token ? <Login/> : <Navigate to="/" />} />
        <Route path="/signup" element={!token ? <SignUp/> : <Navigate to="/" />}/>

        {/*Protected Routes */}
        <Route path="/" element={token ? <Home/> : <Navigate to="/" />}/>
        <Route path="/problem/:id" element={token ? <WorkSpace/> : <Navigate to="/login" />} />
        <Route path="/create" element={token ? <CreateProblem/> : <Navigate to="/login"/>}/>

      </Routes>
    </div>
  )
}
export default App;