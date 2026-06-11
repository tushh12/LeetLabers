import {Routes,Route,Navigate} from "react-router-dom";
import  {useEffect} from "react";


import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx"
import CreateProblem from "./pages/CreateProblem.jsx"
import WorkSpace from "./pages/Workspace.jsx"
import SignUp from "./pages/SignUp.jsx"
import { useAuthStore } from "./store/useAuthStore.js";
import {  Loader } from "lucide-react";





function App() {
  const {authUser,checkAuth,isCheckingAuth} = useAuthStore();

  useEffect(() => {
    checkAuth();
  },[checkAuth])

if(isCheckingAuth && !authUser){
  return (
    <div className="flex items-center justify-center h-screen ">
      <Loader className="size-20 animate-spin"/>
    </div>
  );
}
 return (
  <div className="flex flex-col  justify-start">
    <Routes>
    {/* Public Access Portals */}
    <Route path="/login" element={!authUser ? <Login/> : <Navigate to="/"/>}/>
    <Route path="/signup" element={!authUser ? <SignUp/> : <Navigate to="/"/>}/>

    <Route path="/" element={authUser ? <Home/> : <Navigate to="/login"/>}/>
    <Route path="/problem/:id" element={authUser ? <WorkSpace/> : <Navigate to="/login"/>}/>
    <Route path="/create" element={authUser ? <CreateProblem/>: <Navigate to="/login"/>}/>

    </Routes>
  </div>
 )
}
export default App;