/* eslint-disable react-refresh/only-export-components */
import { createContext , useState , useEffect } from "react";

export const AuthContext = createContext();

export default function AuthProvider({children})  {
    const [token,setToken] = useState(localStorage.getItem('token') || null);

    useEffect(() => {
        if(token){
            localStorage.setItem('token',token);
        } else {
            localStorage.removeItem('token');
        }
    },[token]);
    const login = (newToken) => {
        setToken(newToken);
    };
    const logout = () => {
        setToken(null);
    };
    return (
        <AuthContext value={{token,login,logout}}>
            {children}
        </AuthContext>
    )

}